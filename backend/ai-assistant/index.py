import json
import os
import urllib.request
import urllib.error
import psycopg2
from datetime import datetime, timezone

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

SYSTEM_PROMPT = """Ты — профессиональный копирайтер и контент-менеджер для IT-компании "Аплинк-IT" (г. Воронеж).
Компания занимается: IT-аутсорсингом, видеонаблюдением, IP-телефонией, сетевой инфраструктурой, обслуживанием серверов.
Пиши на русском языке. Тон: профессиональный, конкретный, без воды и шаблонных фраз.
Отвечай ТОЛЬКО запрошенным контентом — без вступлений, пояснений и комментариев после текста."""


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def verify_token(token: str) -> bool:
    if not token:
        return False
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT s.expires_at FROM cms_admin_sessions s
            JOIN cms_admin_users u ON u.id = s.user_id
            WHERE s.token = %s AND u.is_active = true
        """, (token,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return False
        expires_at = row[0]
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at > now
    except Exception:
        return False


def call_claude(prompt: str, ctx: str = "") -> str:
    # Используем встроенный API ключ платформы poehali.dev
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        raise ValueError('AI недоступен: ключ не настроен в платформе')

    user_message = prompt
    if ctx:
        user_message = f"Контекст страницы/раздела:\n{ctx}\n\nЗадача:\n{prompt}"

    payload = {
        'model': 'claude-3-5-haiku-20241022',
        'max_tokens': 1024,
        'system': SYSTEM_PROMPT,
        'messages': [{'role': 'user', 'content': user_message}],
    }

    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=json.dumps(payload).encode(),
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        method='POST',
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read())
        return data['content'][0]['text']


def handler(event: dict, context) -> dict:
    """ИИ-ассистент для генерации контента в админке сайта"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token') or ''

    if not verify_token(token):
        return {
            'statusCode': 401,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'}, ensure_ascii=False),
        }

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    prompt = body.get('prompt', '').strip()
    ctx = body.get('context', '').strip()
    field_hint = body.get('field_hint', '').strip()

    if not prompt:
        return {
            'statusCode': 400,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите prompt'}, ensure_ascii=False),
        }

    if field_hint:
        prompt = f"Напиши {field_hint}. {prompt}"

    try:
        result = call_claude(prompt, ctx)
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'result': result}, ensure_ascii=False),
        }
    except ValueError as e:
        return {
            'statusCode': 503,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return {
            'statusCode': 502,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'AI API error: {e.code}', 'detail': err_body}, ensure_ascii=False),
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
