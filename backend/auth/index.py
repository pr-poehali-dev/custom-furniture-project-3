"""Авторизация администратора: вход по email/паролю, возврат JWT-токена."""
import json
import os
import hmac
import hashlib
import base64
import time
import psycopg2


def make_token(email: str) -> str:
    secret = os.environ["ADMIN_SECRET_KEY"]
    payload = base64.b64encode(json.dumps({"email": email, "exp": int(time.time()) + 86400 * 30}).encode()).decode()
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


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


def check_password(plain: str, stored_hash: str) -> bool:
    import bcrypt
    return bcrypt.checkpw(plain.encode(), stored_hash.encode())


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "")
    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "")

    if method == "POST" and action == "login":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        schema = os.environ["MAIN_DB_SCHEMA"]
        cur.execute(f"SELECT password_hash FROM {schema}.admin_users WHERE email = '{email}'")
        row = cur.fetchone()
        conn.close()

        if not row or not check_password(password, row[0]):
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный логин или пароль"})}

        token = make_token(email)
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": token})}

    if method == "POST" and action == "verify":
        token = body.get("token", "")
        if verify_token(token):
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Unauthorized"})}

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Unknown action"})}