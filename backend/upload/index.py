"""Загрузка изображений для проектов в S3-хранилище."""
import json
import os
import base64
import hmac
import hashlib
import time
import uuid
import boto3


def verify_token(token: str) -> bool:
    try:
        secret = os.environ["ADMIN_SECRET_KEY"]
        payload, sig = token.rsplit(".", 1)
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return False
        data = json.loads(base64.b64decode(payload).decode())
        return data["exp"] > time.time()
    except Exception:
        return False


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")
    if not verify_token(token):
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Unauthorized"})}

    body = json.loads(event.get("body") or "{}")
    file_data = body.get("file")
    content_type = body.get("content_type", "image/jpeg")

    if not file_data:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "No file provided"})}

    image_data = base64.b64decode(file_data)
    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    key = f"projects/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=key, Body=image_data, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"url": cdn_url})}
