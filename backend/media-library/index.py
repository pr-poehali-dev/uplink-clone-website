"""
Медиабиблиотека: листинг, загрузка и удаление файлов из S3.
GET  /         — список всех файлов (требует ?password=...)
POST /upload   — загрузка файла { action:"upload", password, file_base64, file_name, folder:"media" }
POST /delete   — удаление файла { action:"delete", password, key }
"""
import base64
import json
import os
import uuid
import psycopg2
import boto3


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "svg", "pdf"}
MAX_SIZE_BYTES = 10 * 1024 * 1024


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


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


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            return err("Invalid JSON")

    # GET — список файлов
    if method == "GET":
        qs = event.get("queryStringParameters") or {}
        password = qs.get("password", "")
        if not check_auth(password):
            return err("Неверный пароль", 401)

        s3 = get_s3()
        result = s3.list_objects_v2(Bucket="files", Prefix="media/")
        files = []
        project_id = os.environ["AWS_ACCESS_KEY_ID"]
        for obj in result.get("Contents", []):
            key = obj["Key"]
            cdn_url = f"https://cdn.poehali.dev/projects/{project_id}/files/{key}"
            files.append({
                "key": key,
                "url": cdn_url,
                "size": obj["Size"],
                "last_modified": obj["LastModified"].isoformat() if obj.get("LastModified") else "",
                "name": key.split("/")[-1],
            })
        files.sort(key=lambda x: x["last_modified"], reverse=True)
        return ok({"files": files})

    if method != "POST":
        return err("Method not allowed", 405)

    action = body.get("action", "")

    if not check_auth(body.get("password", "")):
        return err("Неверный пароль", 401)

    # POST upload — загрузка файла
    if action == "upload":
        file_base64 = body.get("file_base64", "")
        file_name = body.get("file_name", "file.jpg")
        folder = body.get("folder", "media")

        ext = file_name.rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return err(f"Разрешены только: {', '.join(ALLOWED_EXTENSIONS).upper()}")

        try:
            file_data = base64.b64decode(file_base64)
        except Exception:
            return err("Ошибка декодирования файла")

        if len(file_data) > MAX_SIZE_BYTES:
            return err("Файл слишком большой (макс. 10 МБ)")

        content_type_map = {
            "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "png": "image/png", "webp": "image/webp",
            "gif": "image/gif", "svg": "image/svg+xml", "pdf": "application/pdf",
        }
        content_type = content_type_map.get(ext, "application/octet-stream")

        safe_name = file_name.rsplit(".", 1)[0]
        safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in safe_name)[:40]
        key = f"{folder}/{safe_name}_{uuid.uuid4().hex[:8]}.{ext}"

        s3 = get_s3()
        s3.put_object(Bucket="files", Key=key, Body=file_data, ContentType=content_type)

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
        return ok({"url": cdn_url, "key": key})

    # POST delete — удаление файла
    if action == "delete":
        key = body.get("key", "")
        if not key or not key.startswith("media/"):
            return err("Можно удалять только файлы из папки media/")

        s3 = get_s3()
        s3.delete_object(Bucket="files", Key=key)
        return ok({"ok": True})

    return err("Unknown action", 404)
