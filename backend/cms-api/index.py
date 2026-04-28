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

    cur.execute("SELECT id, sort_order, icon, title, description, accent, is_active, slug, short_desc, hero_title, hero_subtitle, full_description, price_from, for_whom, seo_title, seo_description FROM cms_services ORDER BY sort_order")
    services_rows = cur.fetchall()
    services = []
    for s in services_rows:
        cur.execute("SELECT id, sort_order, item_text FROM cms_service_items WHERE service_id = %s ORDER BY sort_order" % s[0])
        items = [{"id": r[0], "sort_order": r[1], "item_text": r[2]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, icon, title, description FROM cms_service_benefits WHERE service_id = %s ORDER BY sort_order" % s[0])
        benefits = [{"id": r[0], "sort_order": r[1], "icon": r[2], "title": r[3], "description": r[4]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, step_title, step_description FROM cms_service_steps WHERE service_id = %s ORDER BY sort_order" % s[0])
        steps = [{"id": r[0], "sort_order": r[1], "step_title": r[2], "step_description": r[3]} for r in cur.fetchall()]
        cur.execute("SELECT id, sort_order, question, answer FROM cms_service_faq WHERE service_id = %s ORDER BY sort_order" % s[0])
        sfaq = [{"id": r[0], "sort_order": r[1], "question": r[2], "answer": r[3]} for r in cur.fetchall()]
        services.append({
            "id": s[0], "sort_order": s[1], "icon": s[2], "title": s[3], "description": s[4],
            "accent": s[5], "is_active": s[6], "slug": s[7], "short_desc": s[8],
            "hero_title": s[9], "hero_subtitle": s[10], "full_description": s[11],
            "price_from": s[12], "for_whom": s[13], "seo_title": s[14], "seo_description": s[15],
            "items": items, "benefits": benefits, "steps": steps, "faq": sfaq
        })

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

    cur.execute("SELECT id, sort_order, question, answer, is_active FROM cms_faq ORDER BY sort_order")
    faq = [{"id": r[0], "sort_order": r[1], "question": r[2], "answer": r[3], "is_active": r[4]} for r in cur.fetchall()]

    cur.execute("SELECT key, value, label FROM cms_calc_settings ORDER BY id")
    calc_settings = {r[0]: r[1] for r in cur.fetchall()}

    cur.execute("SELECT id, sort_order, key, label, description, price, icon, is_active FROM cms_calc_options ORDER BY sort_order")
    calc_options = [{"id": r[0], "sort_order": r[1], "key": r[2], "label": r[3], "description": r[4], "price": r[5], "icon": r[6], "is_active": r[7]} for r in cur.fetchall()]

    cur.close()
    return {"settings": settings, "services": services, "plans": plans, "projects": projects, "team": team, "faq": faq, "calc_settings": calc_settings, "calc_options": calc_options}


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
                cur.execute(
                    "INSERT INTO cms_settings (key, value, label, updated_at) VALUES ('%s', '%s', '', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()" % (
                        key.replace("'", "''"), str(value).replace("'", "''"))
                )
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
                def esc(v):
                    return str(v or "").replace("'", "''")
                slug_val = "NULL" if not service.get("slug") else "'%s'" % esc(service.get("slug"))
                cur.execute(
                    "UPDATE cms_services SET icon='%s', title='%s', description='%s', accent='%s', is_active=%s, sort_order=%s, slug=%s, short_desc='%s', hero_title='%s', hero_subtitle='%s', full_description='%s', price_from='%s', for_whom='%s', seo_title='%s', seo_description='%s', updated_at=NOW() WHERE id=%s" % (
                        esc(service.get("icon")),
                        esc(service.get("title")),
                        esc(service.get("description")),
                        esc(service.get("accent")),
                        "true" if service.get("is_active", True) else "false",
                        int(service.get("sort_order", 0)),
                        slug_val,
                        esc(service.get("short_desc")),
                        esc(service.get("hero_title")),
                        esc(service.get("hero_subtitle")),
                        esc(service.get("full_description")),
                        esc(service.get("price_from")),
                        esc(service.get("for_whom")),
                        esc(service.get("seo_title")),
                        esc(service.get("seo_description")),
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
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(sid or 0):
                    cur.execute("UPDATE cms_services SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_service ---
        if action == "add_service":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_services")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_services (icon, title, description, accent, is_active, sort_order) VALUES ('Settings', 'Новая услуга', 'Описание услуги', 'cyan', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_service ---
        if action == "delete_service":
            did = body.get("id")
            if did:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_service_items WHERE service_id=%s" % int(did))
                cur.execute("DELETE FROM cms_services WHERE id=%s" % int(did))
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
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(prid or 0):
                    cur.execute("UPDATE cms_projects SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_project ---
        if action == "add_project":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_projects")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_projects (client, category, description, result, accent, is_active, sort_order) VALUES ('Новый клиент', 'Категория', 'Описание проекта', NULL, 'cyan', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_project ---
        if action == "delete_project":
            did = body.get("id")
            if did:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_project_metrics WHERE project_id=%s" % int(did))
                cur.execute("DELETE FROM cms_projects WHERE id=%s" % int(did))
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
                photo_val = "NULL" if not member.get("photo_url") else "'%s'" % member["photo_url"].replace("'", "''")
                cur.execute(
                    "UPDATE cms_team SET name='%s', position='%s', experience=%s, photo_url=%s, is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        member.get("name", "").replace("'", "''"),
                        member.get("position", "").replace("'", "''"),
                        exp_val,
                        photo_val,
                        "true" if member.get("is_active", True) else "false",
                        int(member.get("sort_order", 0)),
                        int(mid)
                    )
                )
            for item in body.get("order", []):
                oid = item.get("id")
                osort = item.get("sort_order")
                if oid and osort and int(oid) != int(mid or 0):
                    cur.execute("UPDATE cms_team SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_team_member ---
        if action == "add_team_member":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_team")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_team (name, position, experience, photo_url, is_active, sort_order) VALUES ('Новый сотрудник', 'Должность', NULL, NULL, true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_team_member ---
        if action == "delete_team_member":
            mid = body.get("id")
            if mid:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_team WHERE id=%s" % int(mid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_faq ---
        if action == "save_faq":
            item = body.get("item", {})
            fid = item.get("id")
            cur = conn.cursor()
            if fid:
                cur.execute(
                    "UPDATE cms_faq SET question='%s', answer='%s', is_active=%s, sort_order=%s, updated_at=NOW() WHERE id=%s" % (
                        item.get("question", "").replace("'", "''"),
                        item.get("answer", "").replace("'", "''"),
                        "true" if item.get("is_active", True) else "false",
                        int(item.get("sort_order", 0)),
                        int(fid)
                    )
                )
            for o in body.get("order", []):
                oid = o.get("id")
                osort = o.get("sort_order")
                if oid and osort and int(oid) != int(fid or 0):
                    cur.execute("UPDATE cms_faq SET sort_order=%s WHERE id=%s" % (int(osort), int(oid)))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- add_faq ---
        if action == "add_faq":
            cur = conn.cursor()
            cur.execute("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cms_faq")
            next_order = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO cms_faq (question, answer, is_active, sort_order) VALUES ('Новый вопрос', 'Ответ на вопрос', true, %s) RETURNING id" % int(next_order)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            return ok({"ok": True, "id": new_id})

        # --- delete_faq ---
        if action == "delete_faq":
            fid = body.get("id")
            if fid:
                cur = conn.cursor()
                cur.execute("DELETE FROM cms_faq WHERE id=%s" % int(fid))
                conn.commit()
                cur.close()
            return ok({"ok": True})

        # --- save_service_extras: benefits, steps, faq для услуги ---
        if action == "save_service_extras":
            sid = int(body.get("service_id", 0))
            if not sid:
                return err("service_id required")
            cur = conn.cursor()
            def esc(v):
                return str(v or "").replace("'", "''")

            kind = body.get("kind")  # benefits | steps | faq
            items = body.get("items", [])

            if kind == "benefits":
                cur.execute("SELECT id FROM cms_service_benefits WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_benefits SET sort_order=%s, icon='%s', title='%s', description='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("icon", "Check")), esc(it.get("title")), esc(it.get("description")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_benefits (service_id, sort_order, icon, title, description) VALUES (%s, %s, '%s', '%s', '%s')" % (
                            sid, i + 1, esc(it.get("icon", "Check")), esc(it.get("title")), esc(it.get("description"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_benefits SET title='[удалено]' WHERE id=%s" % int(eid))

            elif kind == "steps":
                cur.execute("SELECT id FROM cms_service_steps WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_steps SET sort_order=%s, step_title='%s', step_description='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("step_title")), esc(it.get("step_description")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_steps (service_id, sort_order, step_title, step_description) VALUES (%s, %s, '%s', '%s')" % (
                            sid, i + 1, esc(it.get("step_title")), esc(it.get("step_description"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_steps SET step_title='[удалено]' WHERE id=%s" % int(eid))

            elif kind == "faq":
                cur.execute("SELECT id FROM cms_service_faq WHERE service_id=%s" % sid)
                existing = [r[0] for r in cur.fetchall()]
                kept = []
                for i, it in enumerate(items):
                    iid = it.get("id")
                    if iid and iid in existing:
                        cur.execute("UPDATE cms_service_faq SET sort_order=%s, question='%s', answer='%s' WHERE id=%s" % (
                            i + 1, esc(it.get("question")), esc(it.get("answer")), int(iid)))
                        kept.append(iid)
                    else:
                        cur.execute("INSERT INTO cms_service_faq (service_id, sort_order, question, answer) VALUES (%s, %s, '%s', '%s')" % (
                            sid, i + 1, esc(it.get("question")), esc(it.get("answer"))))
                for eid in existing:
                    if eid not in kept:
                        cur.execute("UPDATE cms_service_faq SET question='[удалено]' WHERE id=%s" % int(eid))

            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_calc_settings ---
        if action == "save_calc_settings":
            updates = body.get("updates", {})
            cur = conn.cursor()
            for key, value in updates.items():
                cur.execute(
                    "INSERT INTO cms_calc_settings (key, value, label, updated_at) VALUES ('%s', '%s', '', NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()" % (
                        key.replace("'", "''"), str(value).replace("'", "''"))
                )
            conn.commit()
            cur.close()
            return ok({"ok": True})

        # --- save_calc_options ---
        if action == "save_calc_options":
            options = body.get("options", [])
            cur = conn.cursor()
            def esc(v):
                return str(v or "").replace("'", "''")
            cur.execute("SELECT id FROM cms_calc_options")
            existing = [r[0] for r in cur.fetchall()]
            kept = []
            for i, o in enumerate(options):
                oid = o.get("id")
                if oid and oid in existing:
                    cur.execute("UPDATE cms_calc_options SET sort_order=%s, key='%s', label='%s', description='%s', price=%s, icon='%s', is_active=%s WHERE id=%s" % (
                        i + 1, esc(o.get("key")), esc(o.get("label")), esc(o.get("description")),
                        int(o.get("price", 0)), esc(o.get("icon", "Check")),
                        "true" if o.get("is_active", True) else "false", int(oid)))
                    kept.append(oid)
                else:
                    cur.execute("INSERT INTO cms_calc_options (sort_order, key, label, description, price, icon, is_active) VALUES (%s, '%s', '%s', '%s', %s, '%s', %s) ON CONFLICT (key) DO UPDATE SET label=EXCLUDED.label, description=EXCLUDED.description, price=EXCLUDED.price, icon=EXCLUDED.icon, sort_order=EXCLUDED.sort_order" % (
                        i + 1, esc(o.get("key", "opt_" + str(i))), esc(o.get("label")), esc(o.get("description")),
                        int(o.get("price", 0)), esc(o.get("icon", "Check")),
                        "true" if o.get("is_active", True) else "false"))
            for eid in existing:
                if eid not in kept:
                    cur.execute("UPDATE cms_calc_options SET is_active=false, label='[удалено]' WHERE id=%s" % int(eid))
            conn.commit()
            cur.close()
            return ok({"ok": True})

        return err("Unknown action", 404)

    finally:
        conn.close()