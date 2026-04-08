"""
CMS API — чтение и запись контента сайта.
Роутинг через поле action в теле POST-запроса.
GET / — получить весь контент.
POST / — action: save_settings | save_password | save_service | save_plan | save_project | save_team
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def err(msg, code=400):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_all_content(conn):
    cur = conn.cursor()

    cur.execute("SELECT key, value FROM cms_settings ORDER BY id")
    settings = {row[0]: row[1] for row in cur.fetchall()}

    cur.execute("SELECT id, sort_order, icon, title, description, accent, is_active FROM cms_services ORDER BY sort_order")
    services_rows = cur.fetchall()
    services = []
    for s in services_rows:
        cur.execute("SELECT id, sort_order, item_text FROM cms_service_items WHERE service_id = %s ORDER BY sort_order" % s[0])
        items = [{"id": r[0], "sort_order": r[1], "item_text": r[2]} for r in cur.fetchall()]
        services.append({"id": s[0], "sort_order": s[1], "icon": s[2], "title": s[3], "description": s[4], "accent": s[5], "is_active": s[6], "items": items})

    cur.execute("SELECT id, sort_order, name, price, badge, description, color, border_class, btn_class, is_highlighted, is_active FROM cms_plans ORDER BY sort_order")
    plans_rows = cur.fetchall()
    plans = []
    for p in plans_rows:
        cur.execute("SELECT id, sort_order, feature_text FROM cms_plan_features WHERE plan_id = %s ORDER BY sort_order" % p[0])
        features = [{"id": r[0], "sort_order": r[1], "feature_text": r[2]} for r in cur.fetchall()]
        plans.append({"id": p[0], "sort_order": p[1], "name": p[2], "price": p[3], "badge": p[4], "description": p[5], "color": p[6], "border_class": p[7], "btn_class": p[8], "is_highlighted": p[9], "is_active": p[10], "features": features})

    cur.execute("SELECT id, sort_order, client, category, description, result, accent, is_active FROM cms_projects ORDER BY sort_order")
    projects_rows = cur.fetchall()
    projects = []
    for pr in projects_rows:
        cur.execute("SELECT id, sort_order, label, value FROM cms_project_metrics WHERE project_id = %s ORDER BY sort_order" % pr[0])
        metrics = [{"id": r[0], "sort_order": r[1], "label": r[2], "value": r[3]} for r in cur.fetchall()]
        projects.append({"id": pr[0], "sort_order": pr[1], "client": pr[2], "category": pr[3], "description": pr[4], "result": pr[5], "accent": pr[6], "is_active": pr[7], "metrics": metrics})

    cur.execute("SELECT id, sort_order, name, position, experience, photo_url, is_active FROM cms_team ORDER BY sort_order")
    team = [{"id": r[0], "sort_order": r[1], "name": r[2], "position": r[3], "experience": r[4], "photo_url": r[5], "is_active": r[6]} for r in cur.fetchall()]

    cur.close()
    return {"settings": settings, "services": services, "plans": plans, "projects": projects, "team": team}


def check_auth(body, conn):
    password = body.get("password", "")
    cur = conn.cursor()
    cur.execute("SELECT value FROM cms_settings WHERE key = 'admin_password'")
    row = cur.fetchone()
    cur.close()
    return row and row[0] == password


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

    conn = get_conn()

    try:
        # GET — весь контент
        if method == "GET":
            data = get_all_content(conn)
            return ok(data)

        if method != "POST":
            return err("Method not allowed", 405)

        action = body.get("action", "")

        # Проверка пароля (для всех POST-действий)
        if not check_auth(body, conn):
            return err("Неверный пароль", 401)

        # --- save_settings ---
        if action == "save_settings":
            updates = body.get("updates", {})
            cur = conn.cursor()
            for key, value in updates.items():
                if key == "admin_password":
                    continue
                cur.execute("UPDATE cms_settings SET value = '%s', updated_at = NOW() WHERE key = '%s'" % (
                    str(value).replace("'", "''"), key.replace("'", "''")))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_password ---
        if action == "save_password":
            new_password = body.get("new_password", "").strip()
            if len(new_password) < 6:
                return err("Пароль должен быть не менее 6 символов")
            cur = conn.cursor()
            cur.execute("UPDATE cms_settings SET value = '%s', updated_at = NOW() WHERE key = 'admin_password'" % new_password.replace("'", "''"))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_service ---
        if action == "save_service":
            service = body.get("service", {})
            sid = service.get("id")
            cur = conn.cursor()
            if sid:
                cur.execute(
                    "UPDATE cms_services SET icon='%s', title='%s', description='%s', accent='%s', is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        service.get("icon", "").replace("'", "''"),
                        service.get("title", "").replace("'", "''"),
                        service.get("description", "").replace("'", "''"),
                        service.get("accent", "").replace("'", "''"),
                        "true" if service.get("is_active", True) else "false",
                        int(service.get("sort_order", 0)),
                        int(sid)
                    )
                )
                cur.execute("SELECT id FROM cms_service_items WHERE service_id = %s ORDER BY sort_order" % int(sid))
                existing_ids = [r[0] for r in cur.fetchall()]
                items = service.get("items", [])
                for i, item in enumerate(items):
                    item_id = item.get("id")
                    text = item.get("item_text", "").replace("'", "''")
                    if item_id and item_id in existing_ids:
                        cur.execute("UPDATE cms_service_items SET item_text='%s', sort_order=%s WHERE id=%s" % (text, i + 1, int(item_id)))
                        existing_ids.remove(item_id)
                    else:
                        cur.execute("INSERT INTO cms_service_items (service_id, sort_order, item_text) VALUES (%s, %s, '%s')" % (int(sid), i + 1, text))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_service_items SET item_text='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_plan ---
        if action == "save_plan":
            plan = body.get("plan", {})
            pid = plan.get("id")
            cur = conn.cursor()
            if pid:
                badge_val = "NULL" if not plan.get("badge") else "'%s'" % plan["badge"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_plans SET name='%s', price='%s', badge=%s, description='%s', color='%s', border_class='%s', btn_class='%s', is_highlighted=%s, is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        plan.get("name", "").replace("'", "''"),
                        plan.get("price", "").replace("'", "''"),
                        badge_val,
                        plan.get("description", "").replace("'", "''"),
                        plan.get("color", "").replace("'", "''"),
                        plan.get("border_class", "").replace("'", "''"),
                        plan.get("btn_class", "").replace("'", "''"),
                        "true" if plan.get("is_highlighted") else "false",
                        "true" if plan.get("is_active", True) else "false",
                        int(plan.get("sort_order", 0)),
                        int(pid)
                    )
                )
                cur.execute("SELECT id FROM cms_plan_features WHERE plan_id = %s ORDER BY sort_order" % int(pid))
                existing_ids = [r[0] for r in cur.fetchall()]
                features = plan.get("features", [])
                for i, feat in enumerate(features):
                    feat_id = feat.get("id")
                    text = feat.get("feature_text", "").replace("'", "''")
                    if feat_id and feat_id in existing_ids:
                        cur.execute("UPDATE cms_plan_features SET feature_text='%s', sort_order=%s WHERE id=%s" % (text, i + 1, int(feat_id)))
                        existing_ids.remove(feat_id)
                    else:
                        cur.execute("INSERT INTO cms_plan_features (plan_id, sort_order, feature_text) VALUES (%s, %s, '%s')" % (int(pid), i + 1, text))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_plan_features SET feature_text='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_project ---
        if action == "save_project":
            project = body.get("project", {})
            prid = project.get("id")
            cur = conn.cursor()
            if prid:
                result_val = "NULL" if not project.get("result") else "'%s'" % project["result"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_projects SET client='%s', category='%s', description='%s', result=%s, accent='%s', is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        project.get("client", "").replace("'", "''"),
                        project.get("category", "").replace("'", "''"),
                        project.get("description", "").replace("'", "''"),
                        result_val,
                        project.get("accent", "").replace("'", "''"),
                        "true" if project.get("is_active", True) else "false",
                        int(project.get("sort_order", 0)),
                        int(prid)
                    )
                )
                cur.execute("SELECT id FROM cms_project_metrics WHERE project_id = %s ORDER BY sort_order" % int(prid))
                existing_ids = [r[0] for r in cur.fetchall()]
                metrics = project.get("metrics", [])
                for i, m in enumerate(metrics):
                    mid = m.get("id")
                    lbl = m.get("label", "").replace("'", "''")
                    val = m.get("value", "").replace("'", "''")
                    if mid and mid in existing_ids:
                        cur.execute("UPDATE cms_project_metrics SET label='%s', value='%s', sort_order=%s WHERE id=%s" % (lbl, val, i + 1, int(mid)))
                        existing_ids.remove(mid)
                    else:
                        cur.execute("INSERT INTO cms_project_metrics (project_id, sort_order, label, value) VALUES (%s, %s, '%s', '%s')" % (int(prid), i + 1, lbl, val))
                for eid in existing_ids:
                    cur.execute("UPDATE cms_project_metrics SET label='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_team ---
        if action == "save_team":
            member = body.get("member", {})
            mid = member.get("id")
            cur = conn.cursor()
            if mid:
                exp_val = "NULL" if not member.get("experience") else "'%s'" % member["experience"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_team SET name='%s', position='%s', experience=%s, is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        member.get("name", "").replace("'", "''"),
                        member.get("position", "").replace("'", "''"),
                        exp_val,
                        "true" if member.get("is_active", True) else "false",
                        int(member.get("sort_order", 0)),
                        int(mid)
                    )
                )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        return err("Unknown action", 404)

    finally:
        conn.close()
