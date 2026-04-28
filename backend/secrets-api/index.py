"""
API для управления настройками и секретами сайта из админки.
GET / — список всех секретов (значения чувствительных скрыты)
GET /?reveal=1&key=KEY — получить конкретное значение
POST / — создать или обновить секрет
DELETE / — удалить секрет по ключу
"""
import json
import os
import psycopg2


ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def check_auth(event: dict) -> bool:
    token = event.get("headers", {}).get("X-Admin-Token", "")
    return not ADMIN_TOKEN or token == ADMIN_TOKEN


def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}


def err(code, msg):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Управление секретами сайта: получение, сохранение, удаление."""

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if not check_auth(event):
        return err(403, "Forbidden")

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET — список или конкретное значение
        if method == "GET":
            key = params.get("key", "")
            reveal = params.get("reveal", "") == "1"

            if key and reveal:
                cur.execute(
                    "SELECT key, value, description, is_sensitive, updated_at FROM app_secrets WHERE key = %s",
                    (key,)
                )
                row = cur.fetchone()
                if not row:
                    return err(404, "Секрет не найден")
                return ok({
                    "key": row[0],
                    "value": row[1],
                    "description": row[2],
                    "is_sensitive": row[3],
                    "updated_at": str(row[4]),
                })

            cur.execute(
                "SELECT key, value, description, is_sensitive, updated_at FROM app_secrets ORDER BY key"
            )
            rows = cur.fetchall()
            result = []
            for r in rows:
                is_sens = r[3]
                val = r[1]
                result.append({
                    "key": r[0],
                    "value": ("*" * min(len(val), 8) if is_sens and val else val),
                    "filled": bool(val),
                    "description": r[2],
                    "is_sensitive": is_sens,
                    "updated_at": str(r[4]),
                })
            return ok(result)

        # POST — создать или обновить
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            key = body.get("key", "").strip().upper()
            value = body.get("value", "").strip()
            description = body.get("description", "").strip()
            is_sensitive = body.get("is_sensitive", True)

            if not key:
                return err(400, "Поле key обязательно")

            cur.execute("""
                INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (key) DO UPDATE
                SET value = EXCLUDED.value,
                    description = CASE WHEN EXCLUDED.description != '' THEN EXCLUDED.description ELSE app_secrets.description END,
                    is_sensitive = EXCLUDED.is_sensitive,
                    updated_at = NOW()
            """, (key, value, description, is_sensitive))
            conn.commit()
            return ok({"ok": True, "key": key})

        # DELETE — удалить
        if method == "DELETE":
            body = json.loads(event.get("body") or "{}")
            key = body.get("key", "").strip().upper()
            if not key:
                return err(400, "Поле key обязательно")
            cur.execute("DELETE FROM app_secrets WHERE key = %s", (key,))
            conn.commit()
            return ok({"ok": True, "deleted": key})

        return err(405, "Method not allowed")

    finally:
        cur.close()
        conn.close()
