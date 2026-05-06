"""
Live Chat API: управление сессиями и сообщениями чата на сайте.
GET  /?action=poll&session_id=... — получить новые сообщения (polling)
POST /?action=send — отправить сообщение от посетителя или оператора
POST /?action=webhook — вебхук от бота MAX (ответ оператора)
GET  /?action=sessions — список сессий для админки
GET  /?action=history&session_id=... — история сообщений сессии
POST /?action=close&session_id=... — закрыть сессию
POST /?action=register_webhook — зарегистрировать вебхук в MAX
"""
import json
import os
import re
import urllib.request
import urllib.error
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


def send_maax(api_key: str, chat_id: str, text: str, reply_to_mid: str = "") -> str:
    """Отправляет сообщение в MAX, возвращает mid отправленного сообщения."""
    url = f"https://platform-api.max.ru/messages?chat_id={chat_id}"
    payload_dict: dict = {"text": text}
    if reply_to_mid:
        payload_dict["reply_to"] = {"mid": reply_to_mid}
    payload = json.dumps(payload_dict).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_body = resp.read().decode("utf-8")
            data = json.loads(resp_body)
            mid = data.get("message", {}).get("mid") or data.get("mid") or ""
            print(f"[MAAX] sent ok, mid={mid}")
            return mid
    except Exception as e:
        print(f"[MAAX] error: {e}")
        return ""


def make_session_id(ip: str) -> str:
    salt = str(time.time())
    return hashlib.sha256(f"{ip}{salt}".encode()).hexdigest()[:32]


def ok(body: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def check_admin(cur, token: str) -> bool:
    if not token:
        return False
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cms_admin_sessions WHERE token = %s AND expires_at > NOW()", (token,))
    return cur.fetchone()[0] > 0


def handler(event: dict, context) -> dict:
    """Обработчик live-чата: получение/отправка сообщений и вебхук MAX."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "poll")
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")
    headers = event.get("headers") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # === ВЕБХУК ОТ MAX ===
        if action == "webhook":
            body = json.loads(event.get("body") or "{}")
            print(f"[WEBHOOK] body: {json.dumps(body)[:800]}")

            message = body.get("message") or {}
            text = (message.get("text") or message.get("body") or "").strip()
            sender_info = message.get("sender") or body.get("sender") or {}
            is_bot = sender_info.get("is_bot", False)

            if is_bot or not text:
                return ok({"ok": True})

            # Пробуем найти сессию по reply_to.mid — самый точный способ
            session_id = None
            reply_to = message.get("reply_to") or {}
            reply_mid = reply_to.get("mid") or reply_to.get("message_id") or ""

            if reply_mid:
                cur.execute(
                    f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE maax_message_id = %s LIMIT 1",
                    (reply_mid,),
                )
                row = cur.fetchone()
                if row:
                    session_id = row[0]
                    print(f"[WEBHOOK] routed by reply_to mid={reply_mid} -> session={session_id}")

            # Fallback: ищем по тегу #session_XXXXXXXX в тексте
            if not session_id:
                match = re.search(r"#session_([a-f0-9]{8})", text)
                if match:
                    prefix = match.group(1)
                    cur.execute(
                        f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE session_id LIKE %s AND is_closed = FALSE LIMIT 1",
                        (prefix + "%",),
                    )
                    row = cur.fetchone()
                    if row:
                        session_id = row[0]
                        text = re.sub(r"\s*#session_[a-f0-9]{8}", "", text).strip()
                        print(f"[WEBHOOK] routed by tag -> session={session_id}")

            # Последний fallback: самая свежая незакрытая сессия
            if not session_id:
                cur.execute(
                    f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE is_closed = FALSE ORDER BY last_message_at DESC LIMIT 1"
                )
                row = cur.fetchone()
                if row:
                    session_id = row[0]
                    print(f"[WEBHOOK] fallback to latest session={session_id}")

            if not session_id:
                return ok({"ok": True})

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

        # === РЕГИСТРАЦИЯ ВЕБХУКА В MAX ===
        if action == "register_webhook":
            token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
            if not check_admin(cur, token):
                return err("Unauthorized", 401)

            secrets = get_secrets()
            api_key = secrets.get("MAAX_API_KEY") or os.environ.get("MAAX_API_KEY", "")
            if not api_key:
                return err("MAAX_API_KEY not configured")

            body_data = json.loads(event.get("body") or "{}")
            webhook_url = body_data.get("webhook_url", "")
            if not webhook_url:
                return err("webhook_url required")

            payload = json.dumps({"url": webhook_url, "update_types": ["message_created"]}).encode("utf-8")
            req = urllib.request.Request(
                "https://platform-api.max.ru/subscriptions",
                data=payload,
                headers={"Content-Type": "application/json", "Authorization": api_key},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_body = resp.read().decode("utf-8")
                    print(f"[WEBHOOK_REG] status={resp.status} body={resp_body}")
                    return ok({"ok": True, "status": resp.status, "response": resp_body})
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8")
                print(f"[WEBHOOK_REG] HTTPError {e.code}: {err_body}")
                return err(f"MAX API error {e.code}: {err_body}", 502)

        # === СПИСОК СЕССИЙ ===
        if action == "sessions":
            token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
            if not check_admin(cur, token):
                return err("Unauthorized", 401)

            cur.execute(f"""
                SELECT s.session_id, s.visitor_name, s.visitor_email, s.created_at, s.last_message_at, s.is_closed, s.service_topic,
                    (SELECT COUNT(*) FROM {SCHEMA}.live_chat_messages m WHERE m.session_id = s.session_id AND m.is_read = FALSE AND m.sender = 'visitor') as unread
                FROM {SCHEMA}.live_chat_sessions s
                ORDER BY s.last_message_at DESC
                LIMIT 100
            """)
            rows = cur.fetchall()
            sessions = [
                {
                    "session_id": r[0], "visitor_name": r[1], "visitor_email": r[2],
                    "created_at": str(r[3]), "last_message_at": str(r[4]),
                    "is_closed": r[5], "service_topic": r[6], "unread": r[7]
                }
                for r in rows
            ]
            return ok({"sessions": sessions})

        # === ИСТОРИЯ СЕССИИ ===
        if action == "history":
            token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""
            session_id = params.get("session_id", "")
            if not check_admin(cur, token):
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

        # === ОТПРАВКА СООБЩЕНИЯ ===
        if action == "send" and method == "POST":
            body = json.loads(event.get("body") or "{}")
            text = (body.get("text") or "").strip()
            session_id = body.get("session_id") or ""
            visitor_name = (body.get("name") or "Посетитель").strip()
            visitor_email = (body.get("email") or "").strip()
            service_topic = (body.get("service_topic") or "").strip()
            is_operator = body.get("sender") == "operator"

            if not text:
                return err("text required")

            # Ответ оператора из админки
            if is_operator:
                if not session_id:
                    return err("session_id required for operator")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.live_chat_messages (session_id, sender, text) VALUES (%s, 'operator', %s)",
                    (session_id, text),
                )
                cur.execute(
                    f"UPDATE {SCHEMA}.live_chat_sessions SET last_message_at = NOW() WHERE session_id = %s",
                    (session_id,),
                )
                conn.commit()
                return ok({"ok": True, "session_id": session_id})

            # Сообщение от посетителя — проверяем существование сессии
            if session_id:
                cur.execute(f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE session_id = %s", (session_id,))
                if not cur.fetchone():
                    session_id = ""

            if not session_id:
                session_id = make_session_id(ip)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.live_chat_sessions (session_id, visitor_name, visitor_email, service_topic) VALUES (%s, %s, %s, %s)",
                    (session_id, visitor_name, visitor_email, service_topic or None),
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

            # Отправляем в MAX и сохраняем mid для маршрутизации ответов
            secrets = get_secrets()
            api_key = secrets.get("MAAX_API_KEY") or os.environ.get("MAAX_API_KEY", "")
            chat_id = secrets.get("MAAX_LIVE_CHAT_ID") or os.environ.get("MAAX_LIVE_CHAT_ID", "")

            if api_key and chat_id:
                topic_line = f"[{service_topic}] " if service_topic else ""
                notify = f"💬 {topic_line}{visitor_name}:\n{text}"
                mid = send_maax(api_key, chat_id, notify)
                # Сохраняем mid первого сообщения сессии — по нему будем маршрутизировать ответы
                if mid:
                    cur.execute(
                        f"UPDATE {SCHEMA}.live_chat_sessions SET maax_message_id = %s WHERE session_id = %s AND maax_message_id IS NULL",
                        (mid, session_id),
                    )
                    conn.commit()

            return ok({"ok": True, "session_id": session_id})

        # === POLLING ===
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
