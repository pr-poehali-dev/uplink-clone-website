"""
CMS API — чтение и запись контента сайта.
GET / — получить весь контент.
POST / — action: save_settings | save_password | save_service | ... (см. код)
Авторизация: password (legacy) или X-Admin-Token header.
"""
import json
import os
import psycopg2
from datetime import datetime, timezone


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_all_content(conn):
    cur = conn.cursor()

    cur.execute("SELECT key, value FROM cms_settings ORDER BY id")
    settings = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT id, sort_order, icon, title, description, accent, is_active, slug, short_desc, hero_title, hero_subtitle, full_description, price_from, for_whom, seo_title, seo_description, page_visible FROM cms_services ORDER BY sort_order")
    services_rows = cur.fetchall()
    services = []
    for s in services_rows:
        cur.execute("SELECT id, sort_order, item_text FROM cms_service_items WHERE service_id = %s ORDER BY sort_order" % s[0])
        items = [{"id": r[0], "sort_order": r[1], "item_text": r[2]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, icon, title, description FROM cms_service_benefits WHERE service_id = %s ORDER BY sort_order" % s[0])
        benefits = [{"id": r[0], "sort_order": r[1], "icon": r[2], "title": r[3], "description": r[4]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, step_title, step_description FROM cms_service_steps WHERE service_id = %s ORDER BY sort_order" % s[0])
        steps = [{"id": r[0], "sort_order": r[1], "step_title": r[2], "step_description": r[3]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, question, answer FROM cms_service_faq WHERE service_id = %s ORDER BY sort_order" % s[0])
        sfaq = [{"id": r[0], "sort_order": r[1], "question": r[2], "answer": r[3]} for r in cur.fetchall()]
        services.append({
            "id": s[0], "sort_order": s[1], "icon": s[2], "title": s[3], "description": s[4],
            "accent": s[5], "is_active": s[6], "slug": s[7], "short_desc": s[8],
            "hero_title": s[9], "hero_subtitle": s[10], "full_description": s[11],
            "price_from": s[12], "for_whom": s[13], "seo_title": s[14], "seo_description": s[15],
            "page_visible": s[16] if s[16] is not None else True,
            "items": items, "benefits": benefits, "steps": steps, "faq": sfaq
        })

    cur.execute("SELECT id, sort_order, name, price, badge, description, color, border_class, btn_class, is_highlighted, is_active FROM cms_plans ORDER BY sort_order")
    plans_rows = cur.fetchall()
    plans = []
    for p in plans_rows:
        cur.execute("SELECT id, sort_order, feature_text FROM cms_plan_features WHERE plan_id = %s ORDER BY sort_order" % p[0])
        features = [{"id": r[0], "sort_order": r[1], "feature_text": r[2]} for r in cur.fetchall()]
        plans.append({"id": p[0], "sort_order": p[1], "name": p[2], "price": p[3], "badge": p[4], "description": p[5], "color": p[6], "border_class": p[7], "btn_class": p[8], "is_highlighted": p[9], "is_active": p[10], "features": features})

    cur.execute("SELECT id, sort_order, client, category, description, result, accent, is_active FROM cms_projects ORDER BY sort_order")
    projects_rows = cur.fetchall()
    projects = []
    for pr in projects_rows:
        cur.execute("SELECT id, sort_order, label, value FROM cms_project_metrics WHERE project_id = %s ORDER BY sort_order" % pr[0])
        metrics = [{"id": r[0], "sort_order": r[1], "label": r[2], "value": r[3]} for r in cur.fetchall()]
        projects.append({"id": pr[0], "sort_order": pr[1], "client": pr[2], "category": pr[3], "description": pr[4], "result": pr[5], "accent": pr[6], "is_active": pr[7], "metrics": metrics})

    cur.execute("SELECT id, sort_order, name, position, experience, photo_url, is_active FROM cms_team ORDER BY sort_order")
    team = [{"id": r[0], "sort_order": r[1], "name": r[2], "position": r[3], "experience": r[4], "photo_url": r[5], "is_active": r[6]} for r in cur.fetchall()]

    cur.execute("SELECT id, sort_order, question, answer, is_active FROM cms_faq ORDER BY sort_order")
    faq = [{"id": r[0], "sort_order": r[1], "question": r[2], "answer": r[3], "is_active": r[4]} for r in cur.fetchall()]

    cur.execute("SELECT key, value, label FROM cms_calc_settings ORDER BY id")
    calc_settings = {r[0]: r[1] for r in cur.fetchall()}

    cur.execute("SELECT id, sort_order, key, label, description, price, icon, is_active FROM cms_calc_options ORDER BY sort_order")
    calc_options = [{"id": r[0], "sort_order": r[1], "key": r[2], "label": r[3], "description": r[4], "price": r[5], "icon": r[6], "is_active": r[7]} for r in cur.fetchall()]

    cur.execute("SELECT id, sort_order, icon, title, description, is_active FROM cms_whyus_cards ORDER BY sort_order")
    whyus_cards = [{"id": r[0], "sort_order": r[1], "icon": r[2], "title": r[3], "description": r[4], "is_active": r[5]} for r in cur.fetchall()]

    cur.execute("SELECT id, sort_order, icon, title, description, is_active FROM cms_quickorder_steps ORDER BY sort_order")
    quickorder_steps = [{"id": r[0], "sort_order": r[1], "icon": r[2], "title": r[3], "description": r[4], "is_active": r[5]} for r in cur.fetchall()]

    cur.execute("SELECT id, category_slug, category_title, category_icon, category_accent, name, price, description, sort_order, is_active FROM cms_pricing_items ORDER BY category_slug, sort_order")
    pricing_items = [{"id": r[0], "category_slug": r[1], "category_title": r[2], "category_icon": r[3], "category_accent": r[4], "name": r[5], "price": r[6], "description": r[7], "sort_order": r[8], "is_active": r[9]} for r in cur.fetchall()]

    cur.execute("SELECT id, label, href, type, sort_order, is_visible FROM cms_nav_items ORDER BY sort_order")
    nav_items = [{"id": r[0], "label": r[1], "href": r[2], "type": r[3], "sort_order": r[4], "is_visible": r[5]} for r in cur.fetchall()]

    cur.execute("SELECT id, label, price, icon, sort_order, is_active, min_val, max_val FROM cms_video_camera_types ORDER BY sort_order")
    video_cameras = [{"id": r[0], "label": r[1], "price": r[2], "icon": r[3], "sort_order": r[4], "is_active": r[5], "min_val": r[6], "max_val": r[7]} for r in cur.fetchall()]

    cur.execute("SELECT id, label, price, icon, default_checked, sort_order, is_active FROM cms_video_equipment ORDER BY sort_order")
    video_equipment = [{"id": r[0], "label": r[1], "price": r[2], "icon": r[3], "default_checked": r[4], "sort_order": r[5], "is_active": r[6]} for r in cur.fetchall()]

    cur.execute("SELECT id, sort_order, key, label, suffix, price_key, price_default, min_val, max_val, default_val, is_active FROM cms_calc_sliders ORDER BY sort_order")
    calc_sliders = [{"id": r[0], "sort_order": r[1], "key": r[2], "label": r[3], "suffix": r[4], "price_key": r[5], "price_default": r[6], "min_val": r[7], "max_val": r[8], "default_val": r[9], "is_active": r[10]} for r in cur.fetchall()]

    cur.execute("SELECT id, sort_order, key, label, suffix, price_per_unit, min_val, max_val, default_val, is_active FROM cms_video_calc_sliders ORDER BY sort_order")
    video_calc_sliders = [{"id": r[0], "sort_order": r[1], "key": r[2], "label": r[3], "suffix": r[4], "price_per_unit": r[5], "min_val": r[6], "max_val": r[7], "default_val": r[8], "is_active": r[9]} for r in cur.fetchall()]

    cur.execute("SELECT id, route, title, seo_title, seo_description, og_title, og_description, og_image_url, is_active, is_published, metrika_counter FROM cms_pages ORDER BY id")
    pages = [{"id": r[0], "route": r[1], "title": r[2], "seo_title": r[3], "seo_description": r[4], "og_title": r[5], "og_description": r[6], "og_image_url": r[7], "is_active": r[8], "is_published": r[9] if r[9] is not None else True, "metrika_counter": r[10]} for r in cur.fetchall()]

    cur.execute("SELECT section_id, page, label, scroll_anim, hover_cards, hover_buttons, anim_speed FROM section_animations ORDER BY id")
    section_animations = [{"section_id": r[0], "page": r[1], "label": r[2], "scroll_anim": r[3] or "inherit", "hover_cards": r[4] or "inherit", "hover_buttons": r[5] or "inherit", "anim_speed": r[6] or "inherit"} for r in cur.fetchall()]

    cur.execute("SELECT elem_id, section_id, elem_type, label, hover_anim, scroll_anim, anim_speed, hover_anims FROM element_animations")
    element_animations = [{"elem_id": r[0], "section_id": r[1], "elem_type": r[2], "label": r[3] or r[0], "hover_anim": r[4] or "inherit", "scroll_anim": r[5] or "inherit", "anim_speed": r[6] or "inherit", "hover_anims": r[7] or []} for r in cur.fetchall()]

    cur.close()
    return {
        "settings": settings, "services": services, "plans": plans,
        "projects": projects, "team": team, "faq": faq,
        "calc_settings": calc_settings, "calc_options": calc_options,
        "calc_sliders": calc_sliders,
        "whyus_cards": whyus_cards, "quickorder_steps": quickorder_steps,
        "pricing_items": pricing_items, "nav_items": nav_items,
        "video_cameras": video_cameras, "video_equipment": video_equipment,
        "video_calc_sliders": video_calc_sliders,
        "pages": pages,
        "section_animations": section_animations,
        "element_animations": element_animations,
    }


def esc(v):
    return str(v or "").replace("'", "''")


def check_auth(body, conn, token=None):
    """Проверка авторизации: по токену сессии (новый способ) или паролю (legacy)"""
    if token:
        cur = conn.cursor()
        cur.execute("""
            SELECT u.id, u.username, u.role, s.expires_at
            FROM cms_admin_sessions s
            JOIN cms_admin_users u ON u.id = s.user_id
            WHERE s.token = %s AND u.is_active = true
        """, (token,))
        row = cur.fetchone()
        cur.close()
        if not row:
            return False
        expires_at = row[3]
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at > now
    password = body.get("password", "")
    cur = conn.cursor()
    cur.execute("SELECT value FROM cms_settings WHERE key = 'admin_password'")
    row = cur.fetchone()
    cur.close()
    return row and row[0] == password


def get_token_user(conn, token):
    """Получить username пользователя по токену"""
    if not token:
        return None, None
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.username FROM cms_admin_sessions s
        JOIN cms_admin_users u ON u.id = s.user_id
        WHERE s.token = %s AND u.is_active = true
    """, (token,))
    row = cur.fetchone()
    cur.close()
    return (row[0], row[1]) if row else (None, None)


def save_history(conn, action, entity_type, entity_id, snapshot, description, user_id=None, username=None):
    """Сохранить снапшот в историю изменений"""
    try:
        cur = conn.cursor()
        snap_json = json.dumps(snapshot, ensure_ascii=False, default=str)
        uid_val = str(user_id) if user_id else "NULL"
        uname_val = ("'%s'" % str(username or "").replace("'", "''")) if username else "NULL"
        cur.execute(
            "INSERT INTO cms_history (user_id, username, action, entity_type, entity_id, snapshot, description) "
            "VALUES (%s, %s, '%s', '%s', '%s', '%s'::jsonb, '%s')" % (
                uid_val, uname_val,
                str(action).replace("'", "''"),
                str(entity_type).replace("'", "''"),
                str(entity_id or "").replace("'", "''"),
                snap_json.replace("'", "''"),
                str(description or "").replace("'", "''"),
            )
        )
        cur.close()
    except Exception:
        pass


# Маппинг action -> (таблица, человекочитаемое имя сущности)
# Используется для универсального снапшота ВСЕХ изменений и отката
HISTORY_TABLES = {
    "save_service":           ("cms_services", "Услуги"),
    "add_service":            ("cms_services", "Услуги"),
    "delete_service":         ("cms_services", "Услуги"),
    "save_plan":              ("cms_plans", "Тарифы"),
    "save_project":           ("cms_projects", "Проекты"),
    "save_team":              ("cms_team", "Команда"),
    "save_faq":               ("cms_faq", "FAQ"),
    "save_whyus_cards":       ("cms_whyus_cards", "Почему мы"),
    "save_quickorder_steps":  ("cms_quickorder_steps", "Быстрый заказ"),
    "save_pricing_items":     ("cms_pricing_items", "Прайс"),
    "save_nav_items":         ("cms_nav_items", "Навигация"),
    "save_calc_options":      ("cms_calc_options", "Калькулятор"),
    "save_calc_sliders":      ("cms_calc_sliders", "Калькулятор (слайдеры)"),
    "save_calc_settings":     ("cms_calc_settings", "Калькулятор (настройки)"),
    "save_video_cameras":     ("cms_video_camera_types", "Камеры"),
    "save_video_equipment":   ("cms_video_equipment", "Оборудование"),
    "save_video_calc_sliders": ("cms_video_calc_sliders", "Видеокалькулятор"),
}


def get_table_columns(conn, table):
    """Получить список колонок таблицы (кроме служебных)."""
    cur = conn.cursor()
    cur.execute(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_schema='public' AND table_name='%s' ORDER BY ordinal_position" % table.replace("'", "''")
    )
    cols = [r[0] for r in cur.fetchall()]
    cur.close()
    return cols


def snapshot_table(conn, table):
    """Снять полный снапшот таблицы (все строки как список словарей)."""
    try:
        cols = get_table_columns(conn, table)
        if not cols:
            return None
        cur = conn.cursor()
        cur.execute("SELECT %s FROM %s" % (", ".join(cols), table))
        rows = cur.fetchall()
        cur.close()
        return {"__table__": table, "__columns__": cols, "rows": [list(r) for r in rows]}
    except Exception:
        return None


def restore_table(conn, snapshot):
    """Восстановить таблицу из снапшота: очистить и залить строки обратно."""
    table = snapshot.get("__table__")
    cols = snapshot.get("__columns__") or []
    rows = snapshot.get("rows") or []
    if not table or not cols:
        return False
    cur = conn.cursor()
    cur.execute("DELETE FROM %s" % table)
    for row in rows:
        vals = []
        for v in row:
            if v is None:
                vals.append("NULL")
            elif isinstance(v, bool):
                vals.append("true" if v else "false")
            elif isinstance(v, (int, float)):
                vals.append(str(v))
            elif isinstance(v, (list, dict)):
                vals.append("'%s'" % json.dumps(v, ensure_ascii=False).replace("'", "''"))
            else:
                vals.append("'%s'" % str(v).replace("'", "''"))
        cur.execute("INSERT INTO %s (%s) OVERRIDING SYSTEM VALUE VALUES (%s)" % (
            table, ", ".join(cols), ", ".join(vals)))
    conn.commit()
    cur.close()
    return True


def log_change(conn, action, user_id, username):
    """Универсальное логирование: снимает снапшот таблицы ДО изменения.
    Вызывать ПЕРЕД выполнением UPDATE/INSERT/DELETE."""
    info = HISTORY_TABLES.get(action)
    if not info:
        return
    table, label = info
    snap = snapshot_table(conn, table)
    if snap is None:
        return
    save_history(conn, action, table, "all", snap, "Изменено: %s" % label, user_id, username)


def handler(event: dict, context) -> dict:
    """CMS API — управление контентом сайта"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            return err("Invalid JSON")

    headers = event.get("headers") or {}
    token = headers.get("X-Admin-Token") or headers.get("x-admin-token") or ""

    conn = get_conn()

    try:
        # GET — весь контент (публичный, без авторизации)
        if method == "GET":
            qs = event.get("queryStringParameters") or {}
            # История изменений
            if qs.get("action") == "get_history":
                if not check_auth({}, conn, token):
                    return err("Unauthorized", 401)
                cur = conn.cursor()
                entity_type = qs.get("entity_type", "")
                entity_id = qs.get("entity_id", "")
                if entity_type:
                    cur.execute(
                        "SELECT id, username, action, entity_type, entity_id, description, created_at "
                        "FROM cms_history WHERE entity_type='%s' AND entity_id='%s' ORDER BY created_at DESC LIMIT 30" % (
                            entity_type.replace("'","''"), entity_id.replace("'","''"))
                    )
                else:
                    cur.execute(
                        "SELECT id, username, action, entity_type, entity_id, description, created_at "
                        "FROM cms_history ORDER BY created_at DESC LIMIT 50"
                    )
                hist = [{"id": r[0], "username": r[1], "action": r[2], "entity_type": r[3], "entity_id": r[4],
                         "description": r[5], "created_at": r[6].isoformat() if r[6] else ""} for r in cur.fetchall()]
                cur.close()
                return ok({"history": hist})
            # Получить снапшот для отката
            if qs.get("action") == "get_snapshot":
                if not check_auth({}, conn, token):
                    return err("Unauthorized", 401)
                hist_id = qs.get("id")
                if not hist_id:
                    return err("Укажите id")
                cur = conn.cursor()
                cur.execute("SELECT snapshot, entity_type, entity_id, action, description, created_at FROM cms_history WHERE id=%s" % int(hist_id))
                row = cur.fetchone()
                cur.close()
                if not row:
                    return err("Запись не найдена", 404)
                return ok({"snapshot": row[0], "entity_type": row[1], "entity_id": row[2],
                           "action": row[3], "description": row[4], "created_at": str(row[5])})
            data = get_all_content(conn)
            return ok(data)

        if method != "POST":
            return err("Method not allowed", 405)

        action = body.get("action", "")

        # Проверка авторизации (токен или legacy пароль)
        if not check_auth(body, conn, token):
            return err("Неверный пароль или токен", 401)

        user_id, username = get_token_user(conn, token) if token else (None, body.get("_user", "admin"))

        # Универсальное логирование: снимаем снапшот таблицы ДО изменения
        # (для settings и pages история пишется отдельно ниже — со старым форматом)
        if action in HISTORY_TABLES:
            log_change(conn, action, user_id, username)
            conn.commit()

        # --- save_settings ---
        if action == "save_settings":
            updates = body.get("updates", {})
            cur = conn.cursor()
            cur.execute("SELECT key, value FROM cms_settings ORDER BY id")
            old_settings = {r[0]: r[1] for r in cur.fetchall()}
            for key, value in updates.items():
                if key == "admin_password":
                    continue
                cur.execute(
                    "INSERT INTO cms_settings (key, value, label, updated_at) VALUES ('%s', '%s', '', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()" % (
                        key.replace("'", "''"), str(value).replace("'", "''"))
                )
            conn.commit()
            save_history(conn, "save_settings", "settings", "all", old_settings,
                         "Изменены настройки: %s" % ", ".join(list(updates.keys())[:5]), user_id, username)
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_password ---
        if action == "save_password":
            new_password = body.get("new_password", "").strip()
            if len(new_password) < 6:
                return err("Пароль должен быть не менее 6 символов")
            cur = conn.cursor()
            cur.execute("UPDATE cms_settings SET value = '%s', updated_at = NOW() WHERE key = 'admin_password'" % new_password.replace("'", "''"))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_service ---
        if action == "save_service":
            service = body.get("service", {})
            sid = service.get("id")
            cur = conn.cursor()
            if sid:
                slug_val = "NULL" if not service.get("slug") else "'%s'" % esc(service.get("slug"))
                cur.execute(
                    "UPDATE cms_services SET icon='%s', title='%s', description='%s', accent='%s', is_active=%s, sort_order=%s, slug=%s, short_desc='%s', hero_title='%s', hero_subtitle='%s', full_description='%s', price_from='%s', for_whom='%s', seo_title='%s', seo_description='%s', page_visible=%s, updated_at=NOW() WHERE id=%s" % (
                        esc(service.get("icon")),
                        esc(service.get("title")),
                        esc(service.get("description")),
                        esc(service.get("accent")),
                        "true" if service.get("is_active", True) else "false",
                        int(service.get("sort_order", 0)),
                        slug_val,
                        esc(service.get("short_desc")),
                        esc(service.get("hero_title")),
                        esc(service.get("hero_subtitle")),
                        esc(service.get("full_description")),
                        esc(service.get("price_from")),
                        esc(service.get("for_whom")),
                        esc(service.get("seo_title")),
                        esc(service.get("seo_description")),
                        "true" if service.get("page_visible", True) else "false",
                        int(sid)
                    )
                )
                cur.execute("SELECT id FROM cms_service_items WHERE service_id = %s ORDER BY sort_order" % int(sid))
                existing_ids = [r[0] for r in cur.fetchall()]
                items = service.get("items", [])
                for i, item in enumerate(items):
                    item_id = item.get("id")
                    text = item.get("item_text", "").replace("'", "''")
                    if item_id and item_id in existing_ids:
                        cur.execute("UPDATE cms_service_items SET item_text='%s', sort_order=%s WHERE id=%s" % (text, i + 1, int(item_id)))
                        existing_ids.remove(item_id)
                    else:
                        cur.execute("INSERT INTO cms_service_items (service_id, sort_order, item_text) VALUES (%s, %s, '%s')" % (int(sid), i + 1, text))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_service_items SET item_text='[удалено]' WHERE id=%s" % int(eid))
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(sid or 0):
                    cur.execute("UPDATE cms_services SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_service ---
        if action == "add_service":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_services")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_services (icon, title, description, accent, is_active, sort_order) VALUES ('Settings', 'Новая услуга', 'Описание услуги', 'cyan', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_service ---
        if action == "delete_service":
            did = body.get("id")
            if did:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_service_items WHERE service_id=%s" % int(did))
                cur.execute("DELETE FROM cms_services WHERE id=%s" % int(did))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_plan ---
        if action == "save_plan":
            plan = body.get("plan", {})
            pid = plan.get("id")
            cur = conn.cursor()
            if pid:
                badge_val = "NULL" if not plan.get("badge") else "'%s'" % plan["badge"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_plans SET name='%s', price='%s', badge=%s, description='%s', color='%s', border_class='%s', btn_class='%s', is_highlighted=%s, is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        plan.get("name", "").replace("'", "''"),
                        plan.get("price", "").replace("'", "''"),
                        badge_val,
                        plan.get("description", "").replace("'", "''"),
                        plan.get("color", "").replace("'", "''"),
                        plan.get("border_class", "").replace("'", "''"),
                        plan.get("btn_class", "").replace("'", "''"),
                        "true" if plan.get("is_highlighted") else "false",
                        "true" if plan.get("is_active", True) else "false",
                        int(plan.get("sort_order", 0)),
                        int(pid)
                    )
                )
                cur.execute("SELECT id FROM cms_plan_features WHERE plan_id = %s ORDER BY sort_order" % int(pid))
                existing_ids = [r[0] for r in cur.fetchall()]
                features = plan.get("features", [])
                for i, feat in enumerate(features):
                    feat_id = feat.get("id")
                    text = feat.get("feature_text", "").replace("'", "''")
                    if feat_id and feat_id in existing_ids:
                        cur.execute("UPDATE cms_plan_features SET feature_text='%s', sort_order=%s WHERE id=%s" % (text, i + 1, int(feat_id)))
                        existing_ids.remove(feat_id)
                    else:
                        cur.execute("INSERT INTO cms_plan_features (plan_id, sort_order, feature_text) VALUES (%s, %s, '%s')" % (int(pid), i + 1, text))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_plan_features SET feature_text='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_project ---
        if action == "save_project":
            project = body.get("project", {})
            prid = project.get("id")
            cur = conn.cursor()
            if prid:
                result_val = "NULL" if not project.get("result") else "'%s'" % project["result"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_projects SET client='%s', category='%s', description='%s', result=%s, accent='%s', is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        project.get("client", "").replace("'", "''"),
                        project.get("category", "").replace("'", "''"),
                        project.get("description", "").replace("'", "''"),
                        result_val,
                        project.get("accent", "").replace("'", "''"),
                        "true" if project.get("is_active", True) else "false",
                        int(project.get("sort_order", 0)),
                        int(prid)
                    )
                )
                cur.execute("SELECT id FROM cms_project_metrics WHERE project_id = %s ORDER BY sort_order" % int(prid))
                existing_ids = [r[0] for r in cur.fetchall()]
                metrics = project.get("metrics", [])
                for i, m in enumerate(metrics):
                    mid = m.get("id")
                    lbl = m.get("label", "").replace("'", "''")
                    val = m.get("value", "").replace("'", "''")
                    if mid and mid in existing_ids:
                        cur.execute("UPDATE cms_project_metrics SET label='%s', value='%s', sort_order=%s WHERE id=%s" % (lbl, val, i + 1, int(mid)))
                        existing_ids.remove(mid)
                    else:
                        cur.execute("INSERT INTO cms_project_metrics (project_id, sort_order, label, value) VALUES (%s, %s, '%s', '%s')" % (int(prid), i + 1, lbl, val))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_project_metrics SET label='[удалено]' WHERE id=%s" % int(eid))
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(prid or 0):
                    cur.execute("UPDATE cms_projects SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_project ---
        if action == "add_project":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_projects")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_projects (client, category, description, result, accent, is_active, sort_order) VALUES ('Новый клиент', 'Категория', 'Описание проекта', NULL, 'cyan', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_project ---
        if action == "delete_project":
            did = body.get("id")
            if did:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_project_metrics WHERE project_id=%s" % int(did))
                cur.execute("DELETE FROM cms_projects WHERE id=%s" % int(did))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_team ---
        if action == "save_team":
            member = body.get("member", {})
            mid = member.get("id")
            cur = conn.cursor()
            if mid:
                exp_val = "NULL" if not member.get("experience") else "'%s'" % member["experience"].replace("'", "''")
                photo_val = "NULL" if not member.get("photo_url") else "'%s'" % member["photo_url"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_team SET name='%s', position='%s', experience=%s, photo_url=%s, is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        member.get("name", "").replace("'", "''"),
                        member.get("position", "").replace("'", "''"),
                        exp_val,
                        photo_val,
                        "true" if member.get("is_active", True) else "false",
                        int(member.get("sort_order", 0)),
                        int(mid)
                    )
                )
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(mid or 0):
                    cur.execute("UPDATE cms_team SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_team_member ---
        if action == "add_team_member":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_team")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_team (name, position, experience, photo_url, is_active, sort_order) VALUES ('Новый сотрудник', 'Должность', NULL, NULL, true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_team_member ---
        if action == "delete_team_member":
            mid = body.get("id")
            if mid:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_team WHERE id=%s" % int(mid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_faq ---
        if action == "save_faq":
            item = body.get("item", {})
            fid = item.get("id")
            cur = conn.cursor()
            if fid:
                cur.execute(
                    "UPDATE cms_faq SET question='%s', answer='%s', is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        item.get("question", "").replace("'", "''"),
                        item.get("answer", "").replace("'", "''"),
                        "true" if item.get("is_active", True) else "false",
                        int(item.get("sort_order", 0)),
                        int(fid)
                    )
                )
            for o in body.get("order", []):
                oid = o.get("id")
                osort = o.get("sort_order")
                if oid and osort and int(oid) != int(fid or 0):
                    cur.execute("UPDATE cms_faq SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_faq ---
        if action == "add_faq":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_faq")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_faq (question, answer, is_active, sort_order) VALUES ('Новый вопрос', 'Ответ на вопрос', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_faq ---
        if action == "delete_faq":
            fid = body.get("id")
            if fid:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_faq WHERE id=%s" % int(fid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_service_extras: benefits, steps, faq для услуги ---
        if action == "save_service_extras":
            sid = int(body.get("service_id", 0))
            if not sid:
                return err("service_id required")
            cur = conn.cursor()
            kind = body.get("kind")  # benefits | steps | faq
            items = body.get("items", [])

            if kind == "benefits":
                cur.execute("SELECT id FROM cms_service_benefits WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_benefits SET sort_order=%s, icon='%s', title='%s', description='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("icon", "Check")), esc(it.get("title")), esc(it.get("description")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_benefits (service_id, sort_order, icon, title, description) VALUES (%s, %s, '%s', '%s', '%s')" % (
                            sid, i + 1, esc(it.get("icon", "Check")), esc(it.get("title")), esc(it.get("description"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_benefits SET title='[удалено]' WHERE id=%s" % int(eid))

            elif kind == "steps":
                cur.execute("SELECT id FROM cms_service_steps WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_steps SET sort_order=%s, step_title='%s', step_description='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("step_title")), esc(it.get("step_description")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_steps (service_id, sort_order, step_title, step_description) VALUES (%s, %s, '%s', '%s')" % (
                            sid, i + 1, esc(it.get("step_title")), esc(it.get("step_description"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_steps SET step_title='[удалено]' WHERE id=%s" % int(eid))

            elif kind == "faq":
                cur.execute("SELECT id FROM cms_service_faq WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_faq SET sort_order=%s, question='%s', answer='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("question")), esc(it.get("answer")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_faq (service_id, sort_order, question, answer) VALUES (%s, %s, '%s', '%s')" % (
                            sid, i + 1, esc(it.get("question")), esc(it.get("answer"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_faq SET question='[удалено]' WHERE id=%s" % int(eid))

            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_calc_settings ---
        if action == "save_calc_settings":
            updates = body.get("updates", {})
            cur = conn.cursor()
            for key, value in updates.items():
                cur.execute(
                    "INSERT INTO cms_calc_settings (key, value, label, updated_at) VALUES ('%s', '%s', '', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()" % (
                        key.replace("'", "''"), str(value).replace("'", "''"))
                )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_calc_options ---
        if action == "save_calc_options":
            options = body.get("options", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_calc_options")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, o in enumerate(options):
                oid = o.get("id")
                if oid and oid in existing:
                    cur.execute("UPDATE cms_calc_options SET sort_order=%s, key='%s', label='%s', description='%s', price=%s, icon='%s', is_active=%s WHERE id=%s" % (
                        i + 1, esc(o.get("key")), esc(o.get("label")), esc(o.get("description")),
                        int(o.get("price", 0)), esc(o.get("icon", "Check")),
                        "true" if o.get("is_active", True) else "false", int(oid)))
                    kept.append(oid)
                else:
                    cur.execute("INSERT INTO cms_calc_options (sort_order, key, label, description, price, icon, is_active) VALUES (%s, '%s', '%s', '%s', %s, '%s', %s) ON CONFLICT (key) DO UPDATE SET label=EXCLUDED.label, description=EXCLUDED.description, price=EXCLUDED.price, icon=EXCLUDED.icon, sort_order=EXCLUDED.sort_order" % (
                        i + 1, esc(o.get("key", "opt_" + str(i))), esc(o.get("label")), esc(o.get("description")),
                        int(o.get("price", 0)), esc(o.get("icon", "Check")),
                        "true" if o.get("is_active", True) else "false"))
            for eid in existing:
                if eid not in kept:
                    cur.execute("UPDATE cms_calc_options SET is_active=false, label='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_calc_sliders ---
        if action == "save_calc_sliders":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_calc_sliders")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute(
                        "UPDATE cms_calc_sliders SET sort_order=%s, key='%s', label='%s', suffix='%s', price_key='%s', price_default=%s, min_val=%s, max_val=%s, default_val=%s, is_active=%s, updated_at=NOW() WHERE id=%s" % (
                            i + 1, esc(it.get("key")), esc(it.get("label")), esc(it.get("suffix", "шт.")),
                            esc(it.get("price_key")), int(it.get("price_default", 0)),
                            int(it.get("min_val", 0)), int(it.get("max_val", 50)), int(it.get("default_val", 0)),
                            "true" if it.get("is_active", True) else "false", int(iid)
                        )
                    )
                    kept.append(iid)
                else:
                    cur.execute(
                        "INSERT INTO cms_calc_sliders (sort_order, key, label, suffix, price_key, price_default, min_val, max_val, default_val, is_active) VALUES (%s,'%s','%s','%s','%s',%s,%s,%s,%s,%s) RETURNING id" % (
                            i + 1, esc(it.get("key", "slider_" + str(i))), esc(it.get("label")), esc(it.get("suffix", "шт.")),
                            esc(it.get("price_key", "price_per_item")), int(it.get("price_default", 0)),
                            int(it.get("min_val", 0)), int(it.get("max_val", 50)), int(it.get("default_val", 0)),
                            "true" if it.get("is_active", True) else "false"
                        )
                    )
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_calc_sliders WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- LEADS ----
        if action == "save_lead":
            lead = body.get("lead", {})
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO cms_leads (name, phone, email, service, message, source) VALUES ('%s','%s','%s','%s','%s','%s') RETURNING id" % (
                    esc(lead.get("name")), esc(lead.get("phone")), esc(lead.get("email")),
                    esc(lead.get("service")), esc(lead.get("message")), esc(lead.get("source")))
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        if action == "get_leads":
            cur = conn.cursor()
            cur.execute("SELECT id, name, phone, email, service, message, source, is_read, created_at FROM cms_leads ORDER BY created_at DESC LIMIT 500")
            leads = [{"id": r[0], "name": r[1], "phone": r[2], "email": r[3], "service": r[4], "message": r[5], "source": r[6], "is_read": r[7], "created_at": r[8].isoformat() if r[8] else ""} for r in cur.fetchall()]
            cur.close()
            return ok({"leads": leads})

        if action == "mark_lead_read":
            lid = body.get("id")
            if lid:
                cur = conn.cursor()
                cur.execute("UPDATE cms_leads SET is_read = true WHERE id = %s" % int(lid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        if action == "delete_lead":
            lid = body.get("id")
            if lid:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_leads WHERE id = %s" % int(lid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # ---- WHYUS CARDS ----
        if action == "save_whyus_cards":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_whyus_cards")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute("UPDATE cms_whyus_cards SET sort_order=%s, icon='%s', title='%s', description='%s', is_active=%s, updated_at=NOW() WHERE id=%s" % (
                        i+1, esc(it.get("icon","Check")), esc(it.get("title")), esc(it.get("description")),
                        "true" if it.get("is_active", True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_whyus_cards (sort_order, icon, title, description, is_active) VALUES (%s,'%s','%s','%s',%s) RETURNING id" % (
                        i+1, esc(it.get("icon","Check")), esc(it.get("title")), esc(it.get("description")),
                        "true" if it.get("is_active", True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_whyus_cards WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- QUICKORDER STEPS ----
        if action == "save_quickorder_steps":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_quickorder_steps")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute("UPDATE cms_quickorder_steps SET sort_order=%s, icon='%s', title='%s', description='%s', is_active=%s, updated_at=NOW() WHERE id=%s" % (
                        i+1, esc(it.get("icon","CheckCircle")), esc(it.get("title")), esc(it.get("description")),
                        "true" if it.get("is_active", True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_quickorder_steps (sort_order, icon, title, description, is_active) VALUES (%s,'%s','%s','%s',%s) RETURNING id" % (
                        i+1, esc(it.get("icon","CheckCircle")), esc(it.get("title")), esc(it.get("description")),
                        "true" if it.get("is_active", True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_quickorder_steps WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- PRICING ITEMS ----
        if action == "save_pricing_items":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_pricing_items")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                accent = esc(it.get("category_accent", "from-cyan-400 to-blue-500"))
                if iid and iid in existing:
                    cur.execute("UPDATE cms_pricing_items SET category_slug='%s', category_title='%s', category_icon='%s', category_accent='%s', name='%s', price='%s', description='%s', sort_order=%s, is_active=%s, updated_at=NOW() WHERE id=%s" % (
                        esc(it.get("category_slug")), esc(it.get("category_title")), esc(it.get("category_icon","Briefcase")),
                        accent, esc(it.get("name")), esc(it.get("price")), esc(it.get("description")),
                        int(it.get("sort_order", i+1)), "true" if it.get("is_active", True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_pricing_items (category_slug, category_title, category_icon, category_accent, name, price, description, sort_order, is_active) VALUES ('%s','%s','%s','%s','%s','%s','%s',%s,%s) RETURNING id" % (
                        esc(it.get("category_slug")), esc(it.get("category_title")), esc(it.get("category_icon","Briefcase")),
                        accent, esc(it.get("name")), esc(it.get("price")), esc(it.get("description")),
                        int(it.get("sort_order", i+1)), "true" if it.get("is_active", True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_pricing_items WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- NAV ITEMS ----
        if action == "save_nav_items":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_nav_items")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute("UPDATE cms_nav_items SET label='%s', href='%s', type='%s', sort_order=%s, is_visible=%s, updated_at=NOW() WHERE id=%s" % (
                        esc(it.get("label")), esc(it.get("href")), esc(it.get("type","anchor")),
                        i+1, "true" if it.get("is_visible", True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_nav_items (label, href, type, sort_order, is_visible) VALUES ('%s','%s','%s',%s,%s) RETURNING id" % (
                        esc(it.get("label")), esc(it.get("href")), esc(it.get("type","anchor")),
                        i+1, "true" if it.get("is_visible", True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_nav_items WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- VIDEO CALCULATOR ----
        if action == "save_video_cameras":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_video_camera_types")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                min_v = int(it.get("min_val", 0))
                max_v = int(it.get("max_val", 32))
                if iid and iid in existing:
                    cur.execute("UPDATE cms_video_camera_types SET label='%s', price=%s, icon='%s', sort_order=%s, is_active=%s, min_val=%s, max_val=%s WHERE id=%s" % (
                        esc(it.get("label")), int(it.get("price",0)), esc(it.get("icon","Camera")),
                        i+1, "true" if it.get("is_active", True) else "false", min_v, max_v, int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_video_camera_types (label, price, icon, sort_order, is_active, min_val, max_val) VALUES ('%s',%s,'%s',%s,%s,%s,%s) RETURNING id" % (
                        esc(it.get("label")), int(it.get("price",0)), esc(it.get("icon","Camera")),
                        i+1, "true" if it.get("is_active", True) else "false", min_v, max_v))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_video_camera_types WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        if action == "save_video_equipment":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_video_equipment")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute("UPDATE cms_video_equipment SET label='%s', price=%s, icon='%s', default_checked=%s, sort_order=%s, is_active=%s WHERE id=%s" % (
                        esc(it.get("label")), int(it.get("price",0)), esc(it.get("icon","Box")),
                        "true" if it.get("default_checked") else "false",
                        i+1, "true" if it.get("is_active", True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute("INSERT INTO cms_video_equipment (label, price, icon, default_checked, sort_order, is_active) VALUES ('%s',%s,'%s',%s,%s,%s) RETURNING id" % (
                        esc(it.get("label")), int(it.get("price",0)), esc(it.get("icon","Box")),
                        "true" if it.get("default_checked") else "false",
                        i+1, "true" if it.get("is_active", True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_video_equipment WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        if action == "save_video_calc_sliders":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id FROM cms_video_calc_sliders")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, it in enumerate(items):
                iid = it.get("id")
                if iid and iid in existing:
                    cur.execute(
                        "UPDATE cms_video_calc_sliders SET sort_order=%s, key='%s', label='%s', suffix='%s', price_per_unit=%s, min_val=%s, max_val=%s, default_val=%s, is_active=%s, updated_at=NOW() WHERE id=%s" % (
                            i+1, esc(it.get("key")), esc(it.get("label")), esc(it.get("suffix","шт.")),
                            int(it.get("price_per_unit",0)), int(it.get("min_val",0)), int(it.get("max_val",100)),
                            int(it.get("default_val",0)), "true" if it.get("is_active",True) else "false", int(iid)))
                    kept.append(iid)
                else:
                    cur.execute(
                        "INSERT INTO cms_video_calc_sliders (sort_order, key, label, suffix, price_per_unit, min_val, max_val, default_val, is_active) VALUES (%s,'%s','%s','%s',%s,%s,%s,%s,%s) RETURNING id" % (
                            i+1, esc(it.get("key","vslider_"+str(i))), esc(it.get("label")), esc(it.get("suffix","шт.")),
                            int(it.get("price_per_unit",0)), int(it.get("min_val",0)), int(it.get("max_val",100)),
                            int(it.get("default_val",0)), "true" if it.get("is_active",True) else "false"))
                    kept.append(cur.fetchone()[0])
            for eid in existing:
                if eid not in kept:
                    cur.execute("DELETE FROM cms_video_calc_sliders WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- PAGES SEO + published + metrika ----
        if action == "save_pages":
            items = body.get("items", [])
            cur = conn.cursor()
            cur.execute("SELECT id, title, seo_title, seo_description, og_title, og_description, og_image_url, is_active, is_published, metrika_counter FROM cms_pages ORDER BY id")
            old_pages = {r[0]: {"id": r[0], "title": r[1], "seo_title": r[2], "seo_description": r[3],
                                "og_title": r[4], "og_description": r[5], "og_image_url": r[6],
                                "is_active": r[7], "is_published": r[8], "metrika_counter": r[9]} for r in cur.fetchall()}
            for it in items:
                pid = it.get("id")
                if pid:
                    metrika_val = ("'%s'" % esc(it.get("metrika_counter", ""))) if it.get("metrika_counter") else "NULL"
                    cur.execute("UPDATE cms_pages SET title='%s', seo_title='%s', seo_description='%s', og_title='%s', og_description='%s', og_image_url='%s', is_active=%s, is_published=%s, metrika_counter=%s, updated_at=NOW() WHERE id=%s" % (
                        esc(it.get("title")), esc(it.get("seo_title")), esc(it.get("seo_description")),
                        esc(it.get("og_title")), esc(it.get("og_description")), esc(it.get("og_image_url")),
                        "true" if it.get("is_active", True) else "false",
                        "true" if it.get("is_published", True) else "false",
                        metrika_val, int(pid)))
            conn.commit()
            save_history(conn, "save_pages", "pages", "all", list(old_pages.values()), "Обновлены настройки страниц", user_id, username)
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- ELEMENT ANIMATIONS ----
        if action == "save_element_animation":
            item = body.get("item", {})
            eid = esc(item.get("elem_id", ""))
            if not eid:
                return err("elem_id required")
            # hover_anims — массив строк (мультиселект)
            hover_anims_raw = item.get("hover_anims", [])
            if not isinstance(hover_anims_raw, list):
                hover_anims_raw = [hover_anims_raw] if hover_anims_raw else []
            # Для обратной совместимости: если hover_anims пустой, читаем старое hover_anim
            if not hover_anims_raw and item.get("hover_anim") and item.get("hover_anim") != "inherit":
                hover_anims_raw = [item["hover_anim"]]
            hover_anims_literal = "ARRAY[%s]::TEXT[]" % ",".join(["'%s'" % esc(a) for a in hover_anims_raw]) if hover_anims_raw else "ARRAY[]::TEXT[]"
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO element_animations (elem_id, section_id, elem_type, label, hover_anim, scroll_anim, anim_speed, hover_anims, updated_at) "
                "VALUES ('%s', %s, '%s', '%s', '%s', '%s', '%s', %s, NOW()) "
                "ON CONFLICT (elem_id) DO UPDATE SET section_id=EXCLUDED.section_id, elem_type=EXCLUDED.elem_type, label=EXCLUDED.label, hover_anim=EXCLUDED.hover_anim, scroll_anim=EXCLUDED.scroll_anim, anim_speed=EXCLUDED.anim_speed, hover_anims=EXCLUDED.hover_anims, updated_at=NOW()" % (
                    eid,
                    ("'%s'" % esc(item.get("section_id", ""))) if item.get("section_id") else "NULL",
                    esc(item.get("elem_type", "card")),
                    esc(item.get("label", eid)),
                    esc(hover_anims_raw[0] if hover_anims_raw else "inherit"),
                    esc(item.get("scroll_anim", "inherit")),
                    esc(item.get("anim_speed", "inherit")),
                    hover_anims_literal,
                )
            )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        if action == "delete_element_animation":
            eid = esc(body.get("elem_id", ""))
            if eid:
                cur = conn.cursor()
                cur.execute("DELETE FROM element_animations WHERE elem_id='%s'" % eid)
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # ---- SECTION ANIMATIONS ----
        if action == "save_section_animations":
            items = body.get("items", [])
            cur = conn.cursor()
            for it in items:
                sid = esc(it.get("section_id", ""))
                if not sid:
                    continue
                cur.execute(
                    "UPDATE section_animations SET scroll_anim='%s', hover_cards='%s', hover_buttons='%s', anim_speed='%s', updated_at=NOW() WHERE section_id='%s'" % (
                        esc(it.get("scroll_anim", "inherit")),
                        esc(it.get("hover_cards", "inherit")),
                        esc(it.get("hover_buttons", "inherit")),
                        esc(it.get("anim_speed", "inherit")),
                        sid
                    )
                )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # ---- ROLLBACK ----
        if action == "rollback":
            hist_id = body.get("history_id")
            if not hist_id:
                return err("Укажите history_id")
            cur = conn.cursor()
            cur.execute("SELECT snapshot, entity_type, action FROM cms_history WHERE id=%s" % int(hist_id))
            row = cur.fetchone()
            if not row:
                cur.close()
                return err("Запись истории не найдена", 404)
            snapshot, entity_type, hist_action = row
            cur.close()
            # Откат настроек (старый формат: {key: value})
            if entity_type == "settings":
                cur = conn.cursor()
                for key, value in snapshot.items():
                    cur.execute("INSERT INTO cms_settings (key, value, label, updated_at) VALUES ('%s', '%s', '', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()" % (
                        esc(key), esc(str(value))))
                conn.commit()
                save_history(conn, "rollback", "settings", "all", snapshot, "Откат настроек к версии #%s" % hist_id, user_id, username)
                conn.commit()
                cur.close()
                return ok({"ok": True})
            # Откат страниц (старый формат: список dict)
            if entity_type == "pages":
                cur = conn.cursor()
                for p in snapshot:
                    metrika_val = ("'%s'" % esc(p.get("metrika_counter", ""))) if p.get("metrika_counter") else "NULL"
                    cur.execute("UPDATE cms_pages SET title='%s', seo_title='%s', seo_description='%s', og_title='%s', og_description='%s', og_image_url='%s', is_active=%s, is_published=%s, metrika_counter=%s, updated_at=NOW() WHERE id=%s" % (
                        esc(p.get("title")), esc(p.get("seo_title")), esc(p.get("seo_description")),
                        esc(p.get("og_title")), esc(p.get("og_description")), esc(p.get("og_image_url")),
                        "true" if p.get("is_active", True) else "false",
                        "true" if p.get("is_published", True) else "false",
                        metrika_val, int(p.get("id"))))
                conn.commit()
                save_history(conn, "rollback", "pages", "all", snapshot, "Откат страниц к версии #%s" % hist_id, user_id, username)
                conn.commit()
                cur.close()
                return ok({"ok": True})
            # Универсальный откат таблицы (новый формат: {__table__, __columns__, rows})
            if isinstance(snapshot, dict) and snapshot.get("__table__"):
                cur_snap = snapshot_table(conn, snapshot["__table__"])
                ok_restore = restore_table(conn, snapshot)
                if ok_restore:
                    if cur_snap:
                        save_history(conn, "rollback", snapshot["__table__"], "all", cur_snap, "Откат к версии #%s" % hist_id, user_id, username)
                        conn.commit()
                    return ok({"ok": True})
                return err("Не удалось восстановить данные", 500)
            return err("Тип '%s' не поддерживает откат через API" % entity_type, 400)

        return err("Unknown action", 404)

    finally:
        conn.close()