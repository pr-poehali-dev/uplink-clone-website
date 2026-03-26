import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта на email через SMTP reg.ru"""

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
        return {"statusCode": 400, "headers": cors_headers, "body": {"error": "Invalid JSON"}}

    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    email = body.get("email", "").strip()
    service = body.get("service", "").strip()
    message = body.get("message", "").strip()
    source = body.get("source", "Не указан").strip()

    if not name or not phone:
        return {"statusCode": 400, "headers": cors_headers, "body": {"error": "Имя и телефон обязательны"}}

    smtp_host = os.environ["SMTP_HOST"]
    smtp_port = int(os.environ["SMTP_PORT"])
    smtp_user = os.environ["SMTP_USER"]
    smtp_password = os.environ["SMTP_PASSWORD"]
    recipient = os.environ["RECIPIENT_EMAIL"]

    subject = f"Новая заявка с сайта — {source}"

    email_row = f"""<tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">✉️ Email</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;"><a href="mailto:{email}" style="color: #00d4ff; text-decoration: none;">{email}</a></td>
    </tr>""" if email else ""

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
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;">{service if service else "Не выбрана"}</td>
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
    msg["Subject"] = subject
    msg["From"] = f"Аплинк-IT <{smtp_user}>"
    msg["To"] = recipient
    msg.attach(MIMEText(html, "html", "utf-8"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_host, smtp_port, context=ctx) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, recipient, msg.as_string())

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": {"ok": True},
    }
