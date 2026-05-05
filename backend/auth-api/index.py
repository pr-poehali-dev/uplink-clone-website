import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta, timezone

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

ROLE_PERMISSIONS = {
    'owner': [
        'pages.view', 'pages.edit', 'pages.publish', 'pages.create', 'pages.delete',
        'media.manage', 'leads.view', 'settings.edit', 'users.manage',
        'analytics.view', 'secrets.manage', 'ai.use', 'history.view', 'history.rollback',
        'design.edit', 'calculator.edit', 'services.edit', 'plans.edit',
        'nav.edit', 'faq.edit', 'team.edit', 'projects.edit', 'pricing.edit',
    ],
    'editor': [
        'pages.view', 'pages.edit', 'pages.publish',
        'media.manage', 'leads.view', 'settings.edit',
        'analytics.view', 'ai.use', 'history.view',
        'design.edit', 'calculator.edit', 'services.edit', 'plans.edit',
        'nav.edit', 'faq.edit', 'team.edit', 'projects.edit', 'pricing.edit',
    ],
    'viewer': [
        'pages.view', 'leads.view', 'history.view',
    ],
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str),
    }


def get_user_by_token(conn, token: str):
    """Получить пользователя по токену сессии"""
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.username, u.display_name, u.role, u.is_active,
               s.expires_at
        FROM cms_admin_sessions s
        JOIN cms_admin_users u ON u.id = s.user_id
        WHERE s.token = %s
    """, (token,))
    row = cur.fetchone()
    if not row:
        return None
    user_id, username, display_name, role, is_active, expires_at = row
    if not is_active:
        return None
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        return None
    cur.execute("SELECT permission, granted FROM cms_admin_permissions WHERE user_id = %s", (user_id,))
    overrides = {r[0]: r[1] for r in cur.fetchall()}
    base_perms = set(ROLE_PERMISSIONS.get(role, []))
    for perm, granted in overrides.items():
        if granted:
            base_perms.add(perm)
        else:
            base_perms.discard(perm)
    return {
        'id': user_id, 'username': username, 'display_name': display_name,
        'role': role, 'permissions': list(base_perms),
    }


def action_check_setup(body: dict) -> dict:
    """Проверить, нужна ли первоначальная настройка пароля для логина"""
    username = (body.get('username') or '').strip().lower()
    if not username:
        return resp(400, {'error': 'Укажите логин'})
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, is_active FROM cms_admin_users WHERE username = %s", (username,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return resp(200, {'setup_required': False, 'exists': False})
    user_id, pw_hash, is_active = row
    if not is_active:
        return resp(403, {'error': 'Аккаунт отключён'})
    return resp(200, {'setup_required': pw_hash == 'setup_required', 'user_id': user_id if pw_hash == 'setup_required' else None, 'exists': True})


def action_login(body: dict, ip: str, ua: str) -> dict:
    """Вход по логину и паролю, возвращает токен"""
    username = (body.get('username') or '').strip().lower()
    password = body.get('password', '')
    if not username:
        return resp(400, {'error': 'Укажите логин'})
    if not password:
        return resp(400, {'error': 'Укажите пароль'})
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, password_hash, role, is_active, display_name
        FROM cms_admin_users WHERE username = %s
    """, (username,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return resp(401, {'error': 'Неверный логин или пароль'})
    user_id, pw_hash, role, is_active, display_name = row
    if not is_active:
        conn.close()
        return resp(403, {'error': 'Аккаунт отключён'})
    if pw_hash == 'setup_required':
        if password == 'setup_required':
            conn.close()
            return resp(200, {'setup_required': True, 'user_id': user_id})
        conn.close()
        return resp(401, {'error': 'Требуется начальная настройка'})
    if hash_password(password) != pw_hash:
        conn.close()
        return resp(401, {'error': 'Неверный логин или пароль'})
    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=30)
    cur.execute("""
        INSERT INTO cms_admin_sessions (user_id, token, expires_at, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, token, expires, ip[:50] if ip else None, ua[:500] if ua else None))
    cur.execute("UPDATE cms_admin_users SET last_login_at = NOW() WHERE id = %s", (user_id,))
    conn.commit()
    cur.execute("SELECT permission, granted FROM cms_admin_permissions WHERE user_id = %s", (user_id,))
    overrides = {r[0]: r[1] for r in cur.fetchall()}
    base_perms = set(ROLE_PERMISSIONS.get(role, []))
    for perm, granted in overrides.items():
        if granted:
            base_perms.add(perm)
        else:
            base_perms.discard(perm)
    conn.close()
    return resp(200, {
        'token': token,
        'user': {'id': user_id, 'username': username, 'display_name': display_name, 'role': role, 'permissions': list(base_perms)},
    })


def action_logout(token: str) -> dict:
    """Выход — удаляем сессию"""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE cms_admin_sessions SET expires_at = NOW() WHERE token = %s", (token,))
    conn.commit()
    conn.close()
    return resp(200, {'ok': True})


def action_me(token: str) -> dict:
    """Получить текущего пользователя по токену"""
    conn = get_db()
    user = get_user_by_token(conn, token)
    conn.close()
    if not user:
        return resp(401, {'error': 'Сессия не найдена или истекла'})
    return resp(200, {'user': user})


def action_setup_password(body: dict) -> dict:
    """Установить пароль для владельца при первом входе (setup_required)"""
    user_id = body.get('user_id')
    new_password = body.get('new_password', '')
    if not user_id or len(new_password) < 6:
        return resp(400, {'error': 'Пароль должен быть минимум 6 символов'})
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM cms_admin_users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    if not row or row[0] != 'setup_required':
        conn.close()
        return resp(403, {'error': 'Нет доступа'})
    cur.execute("UPDATE cms_admin_users SET password_hash = %s WHERE id = %s",
                (hash_password(new_password), user_id))
    conn.commit()
    conn.close()
    return resp(200, {'ok': True})


def action_list_users(token: str) -> dict:
    """Список всех пользователей (только owner)"""
    conn = get_db()
    user = get_user_by_token(conn, token)
    if not user or 'users.manage' not in user['permissions']:
        conn.close()
        return resp(403, {'error': 'Нет доступа'})
    cur = conn.cursor()
    cur.execute("""
        SELECT id, username, display_name, role, is_active, created_at, last_login_at
        FROM cms_admin_users ORDER BY created_at
    """)
    rows = cur.fetchall()
    users = []
    for r in rows:
        cur.execute("SELECT permission, granted FROM cms_admin_permissions WHERE user_id = %s", (r[0],))
        perms = {p[0]: p[1] for p in cur.fetchall()}
        users.append({
            'id': r[0], 'username': r[1], 'display_name': r[2], 'role': r[3],
            'is_active': r[4], 'created_at': str(r[5]), 'last_login_at': str(r[6]) if r[6] else None,
            'permission_overrides': perms,
        })
    conn.close()
    return resp(200, {'users': users, 'role_permissions': ROLE_PERMISSIONS})


def action_create_user(token: str, body: dict) -> dict:
    """Создать нового пользователя"""
    conn = get_db()
    user = get_user_by_token(conn, token)
    if not user or 'users.manage' not in user['permissions']:
        conn.close()
        return resp(403, {'error': 'Нет доступа'})
    username = (body.get('username') or '').strip().lower()
    display_name = (body.get('display_name') or username).strip()
    password = body.get('password', '')
    role = body.get('role', 'editor')
    if not username or len(password) < 6:
        conn.close()
        return resp(400, {'error': 'Укажите логин и пароль (минимум 6 символов)'})
    if role not in ROLE_PERMISSIONS:
        conn.close()
        return resp(400, {'error': 'Неверная роль'})
    if role == 'owner' and user['role'] != 'owner':
        conn.close()
        return resp(403, {'error': 'Только владелец может создавать владельцев'})
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO cms_admin_users (username, display_name, password_hash, role, created_by_id)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (username, display_name, hash_password(password), role, user['id']))
        new_id = cur.fetchone()[0]
        perms = body.get('permission_overrides', {})
        for perm, granted in perms.items():
            cur.execute("""
                INSERT INTO cms_admin_permissions (user_id, permission, granted)
                VALUES (%s, %s, %s) ON CONFLICT (user_id, permission) DO UPDATE SET granted = EXCLUDED.granted
            """, (new_id, perm, granted))
        conn.commit()
    except Exception as e:
        conn.close()
        return resp(400, {'error': f'Логин уже занят: {str(e)}'})
    conn.close()
    return resp(200, {'ok': True, 'id': new_id})


def action_update_user(token: str, body: dict) -> dict:
    """Обновить пользователя (роль, права, активность, пароль)"""
    conn = get_db()
    user = get_user_by_token(conn, token)
    if not user or 'users.manage' not in user['permissions']:
        conn.close()
        return resp(403, {'error': 'Нет доступа'})
    target_id = body.get('id')
    if not target_id:
        conn.close()
        return resp(400, {'error': 'Укажите id пользователя'})
    cur = conn.cursor()
    cur.execute("SELECT role FROM cms_admin_users WHERE id = %s", (target_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return resp(404, {'error': 'Пользователь не найден'})
    if row[0] == 'owner' and user['role'] != 'owner':
        conn.close()
        return resp(403, {'error': 'Нельзя редактировать владельца'})
    updates = []
    params = []
    if 'display_name' in body:
        updates.append("display_name = %s")
        params.append(body['display_name'])
    if 'role' in body:
        role = body['role']
        if role not in ROLE_PERMISSIONS:
            conn.close()
            return resp(400, {'error': 'Неверная роль'})
        if role == 'owner' and user['role'] != 'owner':
            conn.close()
            return resp(403, {'error': 'Нельзя назначить роль владельца'})
        updates.append("role = %s")
        params.append(role)
    if 'is_active' in body:
        updates.append("is_active = %s")
        params.append(body['is_active'])
    if 'password' in body:
        if len(body['password']) < 6:
            conn.close()
            return resp(400, {'error': 'Пароль минимум 6 символов'})
        updates.append("password_hash = %s")
        params.append(hash_password(body['password']))
    if updates:
        params.append(target_id)
        cur.execute(f"UPDATE cms_admin_users SET {', '.join(updates)} WHERE id = %s", params)
    if 'permission_overrides' in body:
        cur.execute("UPDATE cms_admin_permissions SET granted = false WHERE user_id = %s", (target_id,))
        for perm, granted in body['permission_overrides'].items():
            cur.execute("""
                INSERT INTO cms_admin_permissions (user_id, permission, granted)
                VALUES (%s, %s, %s) ON CONFLICT (user_id, permission) DO UPDATE SET granted = EXCLUDED.granted
            """, (target_id, perm, granted))
    conn.commit()
    conn.close()
    return resp(200, {'ok': True})


def action_deactivate_user(token: str, body: dict) -> dict:
    """Деактивировать пользователя"""
    conn = get_db()
    user = get_user_by_token(conn, token)
    if not user or 'users.manage' not in user['permissions']:
        conn.close()
        return resp(403, {'error': 'Нет доступа'})
    target_id = body.get('id')
    if not target_id or target_id == user['id']:
        conn.close()
        return resp(400, {'error': 'Нельзя деактивировать себя'})
    cur = conn.cursor()
    cur.execute("SELECT role FROM cms_admin_users WHERE id = %s", (target_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return resp(404, {'error': 'Не найден'})
    if row[0] == 'owner' and user['role'] != 'owner':
        conn.close()
        return resp(403, {'error': 'Нельзя деактивировать владельца'})
    cur.execute("UPDATE cms_admin_users SET is_active = false WHERE id = %s", (target_id,))
    cur.execute("UPDATE cms_admin_sessions SET expires_at = NOW() WHERE user_id = %s", (target_id,))
    conn.commit()
    conn.close()
    return resp(200, {'ok': True})


def handler(event: dict, context) -> dict:
    """Auth API — управление пользователями и сессиями админки"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token') or body.get('token') or ''
    ip = (event.get('requestContext') or {}).get('identity', {}).get('sourceIp', '')
    ua = headers.get('User-Agent') or headers.get('user-agent') or ''

    action = body.get('action') or (event.get('queryStringParameters') or {}).get('action', '')

    if method == 'GET' and not action:
        action = 'me'

    if action == 'check_setup':
        return action_check_setup(body)
    elif action == 'login':
        return action_login(body, ip, ua)
    elif action == 'logout':
        return action_logout(token)
    elif action == 'me':
        return action_me(token)
    elif action == 'setup_password':
        return action_setup_password(body)
    elif action == 'list_users':
        return action_list_users(token)
    elif action == 'create_user':
        return action_create_user(token, body)
    elif action == 'update_user':
        return action_update_user(token, body)
    elif action == 'deactivate_user':
        return action_deactivate_user(token, body)
    else:
        return resp(400, {'error': f'Неизвестный action: {action}'})