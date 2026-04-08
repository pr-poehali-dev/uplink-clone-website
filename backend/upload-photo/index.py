"""
Загрузка фото сотрудника в S3.
POST / — { "file_base64": "...", "file_name": "photo.jpg", "password": "..." }
Возвращает { "url": "https://cdn...." }
"""
import base64
import json
import os
import uuid
import psycopg2
import boto3


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def check_auth(password):
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("SELECT value FROM cms_settings WHERE key = 'admin_password'")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row and row[0] == password


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")

    if not check_auth(body.get("password", "")):
        return err("Неверный пароль", 401)

    file_base64 = body.get("file_base64", "")
    file_name = body.get("file_name", "photo.jpg")

    ext = file_name.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return err("Разрешены только JPG, PNG, WEBP")

    file_data = base64.b64decode(file_base64)
    if len(file_data) > MAX_SIZE_BYTES:
        return err("Файл слишком большой (макс. 5 МБ)")

    content_type_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    content_type = content_type_map[ext]

    key = f"team/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=file_data, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
    return ok({"url": cdn_url})
