"""
Live Chat API: управление сессиями и сообщениями чата на сайте.
GET  /?action=poll&session_id=... — получить новые сообщения
POST /?action=send — отправить сообщение от посетителя
POST /?action=webhook — вебхук от бота MAX (ответ оператора)
GET  /?action=sessions — список всех сессий (для админки)
GET  /?action=history&session_id=... — история сообщений сессии
POST /?action=close&session_id=... — закрыть сессию
"""
import json
import os
import urllib.request
import urllib.parse
import psycopg2
import hashlib
import time


SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_secrets() -> dict:
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT key, value FROM {SCHEMA}.app_secrets WHERE value != ''")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {r[0]: r[1] for r in rows}
    except Exception:
        return {}


def send_maax(api_key: str, chat_id: str, text: str) -> bool:
    url = f"https://platform-api.max.ru/messages?chat_id={chat_id}"
    payload = json.dumps({"text": text}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[MAAX] error: {e}")
        return False


def make_session_id(ip: str) -> str:
    salt = str(time.time())
    return hashlib.sha256(f"{ip}{salt}".encode()).hexdigest()[:32]


def ok(body: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    """Обработчик live-чата: получение/отправка сообщений и вебхук MAX."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "poll")
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # === ВЕБХУК ОТ MAX (ответ оператора) ===
        if action == "webhook":
            body = json.loads(event.get("body") or "{}")
            update = body
            message = update.get("message") or {}
            text = message.get("text") or message.get("body") or ""
            sender_info = message.get("sender") or update.get("sender") or {}
            is_bot = sender_info.get("is_bot", False)

            if is_bot or not text:
                return ok({"ok": True})

            # Ищем активную сессию — последнюю незакрытую
            cur.execute(
                f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE is_closed = FALSE ORDER BY last_message_at DESC LIMIT 1"
            )
            row = cur.fetchone()
            if not row:
                return ok({"ok": True})

            session_id = row[0]
            cur.execute(
                f"INSERT INTO {SCHEMA}.live_chat_messages (session_id, sender, text) VALUES (%s, 'operator', %s)",
                (session_id, text),
            )
            cur.execute(
                f"UPDATE {SCHEMA}.live_chat_sessions SET last_message_at = NOW() WHERE session_id = %s",
                (session_id,),
            )
            conn.commit()
            return ok({"ok": True})

        # === СПИСОК СЕССИЙ (для админки) ===
        if action == "sessions":
            headers = event.get("headers") or {}
            token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
            if not token:
                return err("Unauthorized", 401)
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cms_admin_sessions WHERE token = %s AND expires_at > NOW()", (token,))
            if cur.fetchone()[0] == 0:
                return err("Unauthorized", 401)

            cur.execute(f"""
                SELECT s.session_id, s.visitor_name, s.visitor_email, s.created_at, s.last_message_at, s.is_closed,
                    (SELECT COUNT(*) FROM {SCHEMA}.live_chat_messages m WHERE m.session_id = s.session_id AND m.is_read = FALSE AND m.sender = 'visitor') as unread
                FROM {SCHEMA}.live_chat_sessions s
                ORDER BY s.last_message_at DESC
                LIMIT 100
            """)
            rows = cur.fetchall()
            sessions = []
            for r in rows:
                sessions.append({
                    "session_id": r[0], "visitor_name": r[1], "visitor_email": r[2],
                    "created_at": str(r[3]), "last_message_at": str(r[4]),
                    "is_closed": r[5], "unread": r[6]
                })
            return ok({"sessions": sessions})

        # === ИСТОРИЯ СЕССИИ ===
        if action == "history":
            headers = event.get("headers") or {}
            token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
            session_id = params.get("session_id", "")
            if not token:
                return err("Unauthorized", 401)
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cms_admin_sessions WHERE token = %s AND expires_at > NOW()", (token,))
            if cur.fetchone()[0] == 0:
                return err("Unauthorized", 401)
            if not session_id:
                return err("session_id required")

            cur.execute(f"""
                SELECT id, sender, text, created_at, is_read
                FROM {SCHEMA}.live_chat_messages WHERE session_id = %s ORDER BY created_at ASC
            """, (session_id,))
            msgs = [{"id": r[0], "sender": r[1], "text": r[2], "created_at": str(r[3]), "is_read": r[4]} for r in cur.fetchall()]

            cur.execute(
                f"UPDATE {SCHEMA}.live_chat_messages SET is_read = TRUE WHERE session_id = %s AND sender = 'visitor'",
                (session_id,)
            )
            conn.commit()
            return ok({"messages": msgs})

        # === ОТПРАВКА СООБЩЕНИЯ ПОСЕТИТЕЛЕМ ===
        if action == "send" and method == "POST":
            body = json.loads(event.get("body") or "{}")
            text = (body.get("text") or "").strip()
            session_id = body.get("session_id") or ""
            visitor_name = (body.get("name") or "Посетитель").strip()
            visitor_email = (body.get("email") or "").strip()

            if not text:
                return err("text required")

            if session_id:
                cur.execute(f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE session_id = %s", (session_id,))
                if not cur.fetchone():
                    session_id = ""

            if not session_id:
                session_id = make_session_id(ip)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.live_chat_sessions (session_id, visitor_name, visitor_email) VALUES (%s, %s, %s)",
                    (session_id, visitor_name, visitor_email),
                )

            cur.execute(
                f"INSERT INTO {SCHEMA}.live_chat_messages (session_id, sender, text) VALUES (%s, 'visitor', %s)",
                (session_id, text),
            )
            cur.execute(
                f"UPDATE {SCHEMA}.live_chat_sessions SET last_message_at = NOW(), visitor_name = %s, visitor_email = %s WHERE session_id = %s",
                (visitor_name, visitor_email, session_id),
            )
            conn.commit()

            secrets = get_secrets()
            api_key = secrets.get("MAAX_API_KEY") or os.environ.get("MAAX_API_KEY", "")
            chat_id = secrets.get("MAAX_LIVE_CHAT_ID") or os.environ.get("MAAX_LIVE_CHAT_ID", "")
            if api_key and chat_id:
                notify = f"💬 Сообщение от {visitor_name}:\n{text}\n\n#session_{session_id[:8]}"
                send_maax(api_key, chat_id, notify)

            return ok({"ok": True, "session_id": session_id})

        # === POLLING НОВЫХ СООБЩЕНИЙ ===
        if action == "poll":
            session_id = params.get("session_id", "")
            since_id = int(params.get("since_id", 0))
            if not session_id:
                return err("session_id required")

            cur.execute(f"""
                SELECT id, sender, text, created_at
                FROM {SCHEMA}.live_chat_messages
                WHERE session_id = %s AND id > %s AND sender = 'operator'
                ORDER BY created_at ASC
            """, (session_id, since_id))
            msgs = [{"id": r[0], "sender": r[1], "text": r[2], "created_at": str(r[3])} for r in cur.fetchall()]

            cur.execute(f"SELECT is_closed FROM {SCHEMA}.live_chat_sessions WHERE session_id = %s", (session_id,))
            row = cur.fetchone()
            is_closed = row[0] if row else True
            return ok({"messages": msgs, "is_closed": is_closed})

        # === ЗАКРЫТЬ СЕССИЮ ===
        if action == "close":
            session_id = params.get("session_id") or (json.loads(event.get("body") or "{}")).get("session_id", "")
            if not session_id:
                return err("session_id required")
            cur.execute(f"UPDATE {SCHEMA}.live_chat_sessions SET is_closed = TRUE WHERE session_id = %s", (session_id,))
            conn.commit()
            return ok({"ok": True})

        return err("Unknown action")

    finally:
        cur.close()
        conn.close()
