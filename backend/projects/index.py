"""CRUD для проектов портфолио: получение, добавление, редактирование, удаление."""
import json
import os
import hmac
import hashlib
import base64
import time
import psycopg2


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


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "")
    schema = os.environ["MAIN_DB_SCHEMA"]

    # GET — публичный список проектов
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, style, type, year, img_url FROM {schema}.projects ORDER BY sort_order, id")
        rows = cur.fetchall()
        conn.close()
        projects = [{"id": r[0], "title": r[1], "style": r[2], "type": r[3], "year": r[4], "img": r[5]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(projects, ensure_ascii=False)}

    # Все остальные методы требуют авторизации
    token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")
    if not verify_token(token):
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Unauthorized"})}

    body = json.loads(event.get("body") or "{}")
    path = event.get("path", "")

    # POST — создать проект
    if method == "POST":
        title = body.get("title", "").replace("'", "''")
        style = body.get("style", "").replace("'", "''")
        ptype = body.get("type", "").replace("'", "''")
        year = body.get("year", "").replace("'", "''")
        img_url = body.get("img_url", "").replace("'", "''")
        sort_order = int(body.get("sort_order", 0))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {schema}.projects (title, style, type, year, img_url, sort_order) "
            f"VALUES ('{title}', '{style}', '{ptype}', '{year}', '{img_url}', {sort_order}) RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id})}

    # PUT — обновить проект
    if method == "PUT":
        parts = path.rstrip("/").split("/")
        project_id = int(parts[-1])
        title = body.get("title", "").replace("'", "''")
        style = body.get("style", "").replace("'", "''")
        ptype = body.get("type", "").replace("'", "''")
        year = body.get("year", "").replace("'", "''")
        img_url = body.get("img_url", "").replace("'", "''")
        sort_order = int(body.get("sort_order", 0))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {schema}.projects SET title='{title}', style='{style}', type='{ptype}', "
            f"year='{year}', img_url='{img_url}', sort_order={sort_order} WHERE id={project_id}"
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # DELETE — удалить проект
    if method == "DELETE":
        parts = path.rstrip("/").split("/")
        project_id = int(parts[-1])
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {schema}.projects WHERE id={project_id}")
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
