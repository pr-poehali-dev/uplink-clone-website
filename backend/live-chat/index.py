"""
Live Chat API — каждый клиент получает отдельный чат MAX.
Архитектура:
  - При первом сообщении клиента создаём приватный чат MAX (или отправляем в групповой с жёсткой привязкой по maax_chat_id)
  - Вебхук от MAX фильтрует ПО chat_id — только сообщения из чата этой сессии
  - Никаких fallback на "последнюю сессию" — только строгое соответствие

Эндпоинты:
  GET  ?action=poll&session_id=...        — polling новых сообщений для клиента
  POST ?action=send                       — сообщение от клиента или оператора из админки
  POST ?action=webhook                    — вебхук MAX (ответы операторов)
  GET  ?action=sessions                   — список сессий (админка)
  GET  ?action=history&session_id=...     — история сессии (админка)
  POST ?action=close&session_id=...       — закрыть сессию
  POST ?action=delete&session_id=...      — удалить сессию (админка)
  GET  ?action=settings                   — получить настройки виджета
  POST ?action=settings                   — сохранить настройки виджета (админка)
  POST ?action=register_webhook           — зарегистрировать вебхук в MAX (админка)
"""
import json
import os
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

MAAX_API = "https://platform-api.max.ru"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_secrets_from_db(cur) -> dict:
    try:
        cur.execute(f"SELECT key, value FROM {SCHEMA}.app_secrets WHERE value != ''")
        return {r[0]: r[1] for r in cur.fetchall()}
    except Exception:
        return {}


def maax_request(api_key: str, method: str, path: str, payload: dict = None) -> dict:
    """Выполняет запрос к MAX Bot API."""
    url = f"{MAAX_API}{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Authorization": api_key},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"[MAAX] {method} {path} -> HTTP {e.code}: {body}")
        return {"error": body, "status": e.code}
    except Exception as e:
        print(f"[MAAX] {method} {path} -> exception: {e}")
        return {"error": str(e)}


def notify_new_session(api_key: str, notify_chat_id: str, session_id: str, visitor_name: str, service_topic: str, first_message: str) -> None:
    """
    Отправляет уведомление о новом клиенте в групповой чат MAX.
    Содержит короткий ID сессии и инструкцию — чтобы ответить, нужно написать:
      /reply XXXXXXXX текст ответа
    """
    short_id = session_id[:8]
    topic_line = f"[{service_topic}] " if service_topic else ""
    text = (
        f"🆕 {topic_line}{visitor_name} #{short_id}\n"
        f"✉️ {first_message}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"Чтобы ответить этому клиенту:\n"
        f"/reply {short_id} ваш ответ"
    )
    resp = maax_request(api_key, "POST", f"/messages?chat_id={notify_chat_id}", {"text": text})
    print(f"[MAAX] notify new session #{short_id} -> {resp}")


def send_to_maax_chat(api_key: str, chat_id: str, text: str) -> str:
    """Отправляет сообщение в конкретный чат MAX. Возвращает mid."""
    resp = maax_request(api_key, "POST", f"/messages?chat_id={chat_id}", {"text": text})
    mid = (resp.get("message") or {}).get("mid") or resp.get("mid") or ""
    print(f"[MAAX] send to chat {chat_id} -> mid={mid}")
    return mid


def ok(body: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(body, ensure_ascii=False)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def check_admin(cur, token: str) -> bool:
    if not token:
        return False
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cms_admin_sessions WHERE token = %s AND expires_at > NOW()", (token,))
    return cur.fetchone()[0] > 0


def make_session_id(ip: str) -> str:
    return hashlib.sha256(f"{ip}{time.time()}".encode()).hexdigest()[:32]


def handler(event: dict, context) -> dict:
    """Главный обработчик live-чата."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "poll")
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    conn = get_conn()
    cur = conn.cursor()

    try:
        secrets = get_secrets_from_db(cur)
        api_key = secrets.get("MAAX_API_KEY") or os.environ.get("MAAX_API_KEY", "")
        # MAAX_LIVE_CHAT_ID — групповой чат куда бот шлёт уведомления о новых клиентах
        notify_chat_id = secrets.get("MAAX_LIVE_CHAT_ID") or os.environ.get("MAAX_LIVE_CHAT_ID", "")

        # ================================================================
        # ПУБЛИЧНЫЕ НАСТРОЙКИ (без авторизации — нужны виджету на сайте)
        # ================================================================
        if action == "settings" and method == "GET":
            cur.execute(f"SELECT key, value FROM {SCHEMA}.live_chat_settings")
            settings = {r[0]: r[1] for r in cur.fetchall()}
            return ok({"settings": settings})

        # ================================================================
        # ВЕБХУК ОТ MAX
        # ================================================================
        if action == "webhook":
            body = json.loads(event.get("body") or "{}")
            print(f"[WEBHOOK] raw: {json.dumps(body)[:1000]}")

            update_type = body.get("update_type") or ""
            message = body.get("message") or {}

            # Извлекаем текст (MAX кладёт текст в message.body.text)
            msg_body = message.get("body") or {}
            if isinstance(msg_body, dict):
                text = (msg_body.get("text") or "").strip()
            else:
                text = str(msg_body).strip()

            sender_info = message.get("sender") or {}
            is_bot = sender_info.get("is_bot", False)

            # Игнорируем сообщения от ботов и пустые
            if is_bot or not text:
                print(f"[WEBHOOK] skip: is_bot={is_bot} text={repr(text)}")
                return ok({"ok": True})

            print(f"[WEBHOOK] text={repr(text)}")

            # Единственный поддерживаемый формат ответа из MAX:
            #   /reply XXXXXXXX текст ответа
            # где XXXXXXXX — первые 8 символов session_id
            import re as _re
            m = _re.match(r'^/reply\s+([a-f0-9]{8})\s+([\s\S]+)$', text.strip(), _re.IGNORECASE)
            if not m:
                print(f"[WEBHOOK] not a /reply command, ignoring")
                return ok({"ok": True})

            short_id = m.group(1).lower()
            reply_text = m.group(2).strip()

            cur.execute(
                f"SELECT session_id FROM {SCHEMA}.live_chat_sessions WHERE session_id LIKE %s AND is_closed = FALSE LIMIT 1",
                (short_id + "%",),
            )
            row = cur.fetchone()
            if not row:
                print(f"[WEBHOOK] no open session for short_id={short_id}")
                return ok({"ok": True})

            session_id = row[0]
            text = reply_text
            print(f"[WEBHOOK] /reply routed short_id={short_id} -> session={session_id}")

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

        # ================================================================
        # ОТПРАВКА СООБЩЕНИЯ (клиент или оператор из админки)
        # ================================================================
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

            # --- Оператор отвечает из админки ---
            if is_operator:
                if not check_admin(cur, token):
                    return err("Unauthorized", 401)
                if not session_id:
                    return err("session_id required")

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

            # --- Клиент пишет с сайта ---
            maax_chat_id = None

            if session_id:
                cur.execute(
                    f"SELECT session_id, maax_chat_id FROM {SCHEMA}.live_chat_sessions WHERE session_id = %s",
                    (session_id,),
                )
                row = cur.fetchone()
                if not row:
                    session_id = ""
                else:
                    maax_chat_id = row[1]

            # Новая сессия
            if not session_id:
                session_id = make_session_id(ip)
                cur.execute(
                    f"INSERT INTO {SCHEMA}.live_chat_sessions (session_id, visitor_name, visitor_email, service_topic) VALUES (%s, %s, %s, %s)",
                    (session_id, visitor_name, visitor_email, service_topic or None),
                )
                conn.commit()

                # Отправляем уведомление в MAX с инструкцией /reply XXXXXXXX
                if api_key and notify_chat_id:
                    notify_new_session(api_key, notify_chat_id, session_id, visitor_name, service_topic, text)
                    cur.execute(
                        f"UPDATE {SCHEMA}.live_chat_sessions SET maax_chat_id = %s WHERE session_id = %s",
                        (notify_chat_id, session_id),
                    )
                    conn.commit()

            # Сохраняем сообщение
            cur.execute(
                f"INSERT INTO {SCHEMA}.live_chat_messages (session_id, sender, text) VALUES (%s, 'visitor', %s)",
                (session_id, text),
            )
            cur.execute(
                f"UPDATE {SCHEMA}.live_chat_sessions SET last_message_at = NOW(), visitor_name = %s WHERE session_id = %s",
                (visitor_name, session_id),
            )
            conn.commit()

            # Последующие сообщения того же клиента — шлём в MAX как доп. информацию
            if api_key and notify_chat_id and session_id not in ("",):
                cur.execute(
                    f"SELECT COUNT(*) FROM {SCHEMA}.live_chat_messages WHERE session_id = %s AND sender = 'visitor'",
                    (session_id,),
                )
                msg_count = cur.fetchone()[0]
                if msg_count > 1:
                    short_id = session_id[:8]
                    send_to_maax_chat(api_key, notify_chat_id, f"✉️ [{short_id}] {visitor_name}: {text}")

            return ok({"ok": True, "session_id": session_id})

        # ================================================================
        # POLLING (клиент ждёт ответа)
        # ================================================================
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
            return ok({"messages": msgs, "is_closed": row[0] if row else True})

        # ================================================================
        # ADMIN: СПИСОК СЕССИЙ
        # ================================================================
        if action == "sessions":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)

            cur.execute(f"""
                SELECT s.session_id, s.visitor_name, s.visitor_email, s.created_at,
                       s.last_message_at, s.is_closed, s.service_topic, s.maax_chat_id,
                    (SELECT COUNT(*) FROM {SCHEMA}.live_chat_messages m
                     WHERE m.session_id = s.session_id AND m.is_read = FALSE AND m.sender = 'visitor') as unread
                FROM {SCHEMA}.live_chat_sessions s
                ORDER BY s.last_message_at DESC
                LIMIT 200
            """)
            rows = cur.fetchall()
            sessions = [
                {
                    "session_id": r[0], "visitor_name": r[1], "visitor_email": r[2],
                    "created_at": str(r[3]), "last_message_at": str(r[4]),
                    "is_closed": r[5], "service_topic": r[6], "maax_chat_id": r[7], "unread": r[8]
                }
                for r in rows
            ]
            return ok({"sessions": sessions})

        # ================================================================
        # ADMIN: ИСТОРИЯ СЕССИИ
        # ================================================================
        if action == "history":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)
            session_id = params.get("session_id", "")
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

        # ================================================================
        # ADMIN: ЗАКРЫТЬ СЕССИЮ
        # ================================================================
        if action == "close":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)
            session_id = params.get("session_id") or (json.loads(event.get("body") or "{}")).get("session_id", "")
            if not session_id:
                return err("session_id required")
            cur.execute(f"UPDATE {SCHEMA}.live_chat_sessions SET is_closed = TRUE WHERE session_id = %s", (session_id,))
            conn.commit()
            return ok({"ok": True})

        # ================================================================
        # ADMIN: УДАЛИТЬ СЕССИЮ
        # ================================================================
        if action == "delete":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)
            session_id = (json.loads(event.get("body") or "{}")).get("session_id", "") or params.get("session_id", "")
            if not session_id:
                return err("session_id required")
            cur.execute(f"DELETE FROM {SCHEMA}.live_chat_messages WHERE session_id = %s", (session_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.live_chat_sessions WHERE session_id = %s", (session_id,))
            conn.commit()
            return ok({"ok": True})

        # ================================================================
        # ADMIN: НАСТРОЙКИ ВИДЖЕТА
        # ================================================================
        if action == "settings" and method == "POST":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)
            body = json.loads(event.get("body") or "{}")
            settings = body.get("settings") or {}
            for key, value in settings.items():
                if key in ("welcome_text", "services", "header_title", "header_subtitle"):
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.live_chat_settings (key, value, updated_at)
                        VALUES (%s, %s, NOW())
                        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
                    """, (key, str(value)))
            conn.commit()
            return ok({"ok": True})

        # ================================================================
        # ADMIN: РЕГИСТРАЦИЯ ВЕБХУКА В MAX
        # ================================================================
        if action == "register_webhook":
            if not check_admin(cur, token):
                return err("Unauthorized", 401)
            if not api_key:
                return err("MAAX_API_KEY not configured")

            body_data = json.loads(event.get("body") or "{}")
            webhook_url = body_data.get("webhook_url", "")
            if not webhook_url:
                return err("webhook_url required")

            resp = maax_request(api_key, "POST", "/subscriptions", {
                "url": webhook_url,
                "update_types": ["message_created"]
            })
            if "error" in resp:
                return err(f"MAX API error: {resp['error']}", 502)
            return ok({"ok": True, "response": resp})

        return err("Unknown action")

    finally:
        cur.close()
        conn.close()