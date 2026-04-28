"""
Отправка заявки с сайта: email + Telegram + Maax (Max) уведомления.
POST / — принять заявку и разослать уведомления по всем каналам.
"""
import json
import os
import smtplib
import ssl
import urllib.request
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_telegram(token: str, chat_id: str, text: str):
    """Отправка сообщения в Telegram через Bot API."""
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def send_maax(api_key: str, chat_id: str, text: str):
    """Отправка сообщения через Maax (Max) Bot API."""
    url = "https://botapi.max.ru/messages"
    params = urllib.parse.urlencode({"access_token": api_key})
    payload = json.dumps({
        "recipient": {"chat_id": chat_id},
        "type": "bot_action",
        "payload": {
            "text": text,
        },
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{url}?{params}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception:
        return False


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта на email + Telegram + Maax уведомления."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Invalid JSON"})}

    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    email = body.get("email", "").strip()
    service = body.get("service", "").strip()
    message = body.get("message", "").strip()
    source = body.get("source", "Не указан").strip()

    if not name or not phone:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Имя и телефон обязательны"})}

    results = {"email": False, "telegram": False, "maax": False}

    # ── EMAIL ──────────────────────────────────────────────────────────
    try:
        smtp_host = os.environ["SMTP_HOST"]
        smtp_port = int(os.environ["SMTP_PORT"])
        smtp_user = os.environ["SMTP_USER"]
        smtp_password = os.environ["SMTP_PASSWORD"]
        recipient = os.environ["RECIPIENT_EMAIL"]

        email_row = f"""<tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">✉️ Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;"><a href="mailto:{email}" style="color: #00d4ff; text-decoration: none;">{email}</a></td>
        </tr>""" if email else ""

        service_str = service if service else "Не выбрана"
        message_row = f"""<tr>
            <td style="padding: 10px 0; color: #666; font-size: 14px; vertical-align: top;">💬 Комментарий</td>
            <td style="padding: 10px 0; color: #333; font-size: 14px;">{message}</td>
        </tr>""" if message else ""

        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="background: #0d1421; padding: 20px; border-radius: 8px 8px 0 0; border-bottom: 3px solid #00d4ff;">
            <h2 style="color: #00d4ff; margin: 0; font-size: 20px;">📩 Новая заявка с сайта</h2>
            <p style="color: #888; margin: 5px 0 0; font-size: 14px;">ИТК Аплинк-IT</p>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <strong style="color: #856404;">📍 Источник заявки:</strong>
              <span style="color: #856404; font-size: 16px; margin-left: 8px;">{source}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 140px; font-size: 14px;">👤 Имя</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-weight: bold; font-size: 14px;">{name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">📞 Телефон</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">
                  <a href="tel:{phone}" style="color: #00d4ff; font-weight: bold; text-decoration: none;">{phone}</a>
                </td>
              </tr>
              {email_row}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">🛠️ Услуга</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;">{service_str}</td>
              </tr>
              {message_row}
            </table>
            <div style="margin-top: 24px; padding: 16px; background: #e8f5ff; border-radius: 6px; text-align: center;">
              <a href="tel:{phone}" style="display: inline-block; background: #00d4ff; color: #080c14; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
                📞 Позвонить клиенту
              </a>
            </div>
          </div>
        </div>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Новая заявка с сайта — {source}"
        msg["From"] = f"Аплинк-IT <{smtp_user}>"
        msg["To"] = recipient
        msg.attach(MIMEText(html, "html", "utf-8"))

        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=ctx) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient, msg.as_string())
        results["email"] = True
    except Exception as e:
        results["email_error"] = str(e)

    # ── TELEGRAM ───────────────────────────────────────────────────────
    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    tg_chat = os.environ.get("TELEGRAM_CHAT_ID", "")
    if tg_token and tg_chat:
        lines = [
            "📩 <b>Новая заявка с сайта</b>",
            f"📍 Источник: {source}",
            "",
            f"👤 Имя: <b>{name}</b>",
            f"📞 Телефон: <b>{phone}</b>",
        ]
        if email:
            lines.append(f"✉️ Email: {email}")
        if service:
            lines.append(f"🛠️ Услуга: {service}")
        if message:
            lines.append(f"💬 Комментарий: {message}")
        lines.append(f"\n<a href='tel:{phone}'>📞 Позвонить клиенту</a>")
        tg_text = "\n".join(lines)
        results["telegram"] = send_telegram(tg_token, tg_chat, tg_text)

    # ── MAAX (MAX) ─────────────────────────────────────────────────────
    maax_key = os.environ.get("MAAX_API_KEY", "")
    maax_chat = os.environ.get("MAAX_CHAT_ID", "")
    if maax_key and maax_chat:
        lines = [
            "📩 Новая заявка с сайта ИТК Аплинк-IT",
            f"📍 Источник: {source}",
            "",
            f"👤 Имя: {name}",
            f"📞 Телефон: {phone}",
        ]
        if email:
            lines.append(f"✉️ Email: {email}")
        if service:
            lines.append(f"🛠️ Услуга: {service}")
        if message:
            lines.append(f"💬 Комментарий: {message}")
        maax_text = "\n".join(lines)
        results["maax"] = send_maax(maax_key, maax_chat, maax_text)

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"ok": True, "channels": results}),
    }
