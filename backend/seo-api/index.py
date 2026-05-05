import json
import os
import urllib.request
import urllib.error
import psycopg2
from datetime import datetime, timezone

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

SEO_SYSTEM_PROMPT = """Ты — SEO-специалист и копирайтер для IT-компании "Аплинк-IT" (г. Воронеж).
Компания: IT-аутсорсинг, видеонаблюдение, IP-телефония, сетевая инфраструктура, обслуживание серверов.
Пиши на русском языке. Фокус: SEO-оптимизация для Яндекс и Google, продвижение в Воронеже и области.
Отвечай ТОЛЬКО запрошенным контентом — без вступлений и комментариев."""


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def verify_token(token: str) -> bool:
    if not token:
        return False
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT s.expires_at FROM cms_admin_sessions s
            JOIN cms_admin_users u ON u.id = s.user_id
            WHERE s.token = %s AND u.is_active = true
        """, (token,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return False
        expires_at = row[0]
        now = datetime.now(timezone.utc)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at > now
    except Exception:
        return False


def call_claude(prompt: str, max_tokens: int = 1500) -> str:
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        raise ValueError('AI недоступен: ключ не настроен')

    payload = {
        'model': 'claude-3-5-haiku-20241022',
        'max_tokens': max_tokens,
        'system': SEO_SYSTEM_PROMPT,
        'messages': [{'role': 'user', 'content': prompt}],
    }
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=json.dumps(payload).encode(),
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=55) as resp:
        data = json.loads(resp.read())
        return data['content'][0]['text']


def get_all_pages_data(cur) -> list:
    """Получить все страницы и услуги для аудита"""
    pages = []
    cur.execute("SELECT route, title, seo_title, seo_description, og_title, og_description FROM cms_pages WHERE is_active = true ORDER BY route")
    for row in cur.fetchall():
        pages.append({
            'type': 'page',
            'slug': row[0],
            'title': row[1],
            'seo_title': row[2],
            'seo_description': row[3],
            'og_title': row[4],
            'og_description': row[5],
        })

    cur.execute("""
        SELECT slug, title, seo_title, seo_description, hero_title, hero_subtitle, short_desc, full_description
        FROM cms_services WHERE is_active = true AND slug IS NOT NULL ORDER BY sort_order
    """)
    for row in cur.fetchall():
        pages.append({
            'type': 'service',
            'slug': row[0],
            'title': row[1],
            'seo_title': row[2],
            'seo_description': row[3],
            'hero_title': row[4],
            'hero_subtitle': row[5],
            'short_desc': row[6],
            'full_description': row[7],
        })
    return pages


def action_get_keywords(cur, body: dict) -> dict:
    """Получить ключевые слова (все или по странице)"""
    page_slug = body.get('page_slug')
    if page_slug:
        cur.execute("""
            SELECT id, keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order
            FROM cms_seo_keywords WHERE page_slug = %s ORDER BY sort_order, id
        """, (page_slug,))
    else:
        cur.execute("""
            SELECT id, keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order
            FROM cms_seo_keywords ORDER BY page_slug NULLS FIRST, sort_order, id
        """)
    rows = cur.fetchall()
    keywords = []
    for r in rows:
        keywords.append({
            'id': r[0], 'keyword': r[1], 'page_slug': r[2],
            'page_type': r[3], 'priority': r[4],
            'search_volume_hint': r[5], 'is_active': r[6], 'sort_order': r[7],
        })
    return {'keywords': keywords}


def action_save_keyword(conn, cur, body: dict) -> dict:
    """Сохранить ключевое слово (создать или обновить)"""
    kw_id = body.get('id')
    keyword = (body.get('keyword') or '').strip()
    page_slug = body.get('page_slug') or None
    page_type = body.get('page_type', 'global')
    priority = body.get('priority', 'medium')
    search_volume_hint = body.get('search_volume_hint') or None
    is_active = body.get('is_active', True)
    sort_order = body.get('sort_order', 0)

    if not keyword:
        return {'error': 'Пустое ключевое слово'}

    if kw_id:
        cur.execute("""
            UPDATE cms_seo_keywords SET keyword=%s, page_slug=%s, page_type=%s,
            priority=%s, search_volume_hint=%s, is_active=%s, sort_order=%s
            WHERE id=%s RETURNING id
        """, (keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order, kw_id))
    else:
        cur.execute("""
            INSERT INTO cms_seo_keywords (keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order))
    new_id = cur.fetchone()[0]
    conn.commit()
    return {'ok': True, 'id': new_id}


def action_delete_keyword(conn, cur, body: dict) -> dict:
    """Удалить ключевое слово"""
    kw_id = body.get('id')
    if not kw_id:
        return {'error': 'Не указан id'}
    cur.execute("DELETE FROM cms_seo_keywords WHERE id = %s", (kw_id,))
    conn.commit()
    return {'ok': True}


def action_generate_keywords(cur, body: dict) -> dict:
    """ИИ генерирует семантическое ядро для страницы или темы"""
    topic = body.get('topic', '').strip()
    page_slug = body.get('page_slug', '').strip()
    page_title = body.get('page_title', '').strip()

    if not topic and not page_title:
        return {'error': 'Укажите тему или страницу'}

    subject = page_title or topic
    prompt = f"""Сгенерируй семантическое ядро для продвижения страницы "{subject}" в Яндекс и Google по Воронежу и области.

Верни ТОЛЬКО JSON-массив без пояснений. Формат:
[
  {{"keyword": "ключевая фраза", "priority": "high|medium|low", "search_volume_hint": "высокая|средняя|низкая"}},
  ...
]

Требования:
- 20-25 ключевых фраз
- Включи: коммерческие запросы (купить/заказать/цена), информационные (что такое/как), геозапросы (Воронеж, Воронежская область)
- High priority: самые частотные и коммерческие
- Medium: средней частотности
- Low: длинные хвосты (long-tail)
- Фразы на русском языке, реалистичные для IT-бизнеса"""

    result_text = call_claude(prompt, max_tokens=2000)

    # Парсим JSON из ответа
    try:
        start = result_text.find('[')
        end = result_text.rfind(']') + 1
        keywords_data = json.loads(result_text[start:end])
    except Exception:
        keywords_data = []

    return {
        'ok': True,
        'keywords': keywords_data,
        'page_slug': page_slug or None,
    }


def action_bulk_save_keywords(conn, cur, body: dict) -> dict:
    """Массово сохранить ключевые слова из ИИ-генерации"""
    keywords = body.get('keywords', [])
    page_slug = body.get('page_slug') or None
    page_type = body.get('page_type', 'global' if not page_slug else 'service')

    if not keywords:
        return {'error': 'Нет ключевых слов'}

    inserted = 0
    for i, kw in enumerate(keywords):
        keyword = (kw.get('keyword') or '').strip()
        if not keyword:
            continue
        priority = kw.get('priority', 'medium')
        volume_hint = kw.get('search_volume_hint') or None
        cur.execute("""
            INSERT INTO cms_seo_keywords (keyword, page_slug, page_type, priority, search_volume_hint, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (keyword, page_slug, page_type, priority, volume_hint, i))
        inserted += 1

    conn.commit()
    return {'ok': True, 'inserted': inserted}


def action_audit_page(conn, cur, body: dict) -> dict:
    """ИИ анализирует SEO страницы/услуги и даёт оценку + рекомендации"""
    page_slug = body.get('page_slug', '').strip()
    page_type = body.get('page_type', 'service')

    if not page_slug:
        return {'error': 'Не указан page_slug'}

    # Получаем данные страницы
    if page_type == 'service':
        cur.execute("""
            SELECT title, seo_title, seo_description, hero_title, hero_subtitle, short_desc, full_description
            FROM cms_services WHERE slug = %s
        """, (page_slug,))
    else:
        cur.execute("""
            SELECT title, seo_title, seo_description, og_title, og_description, '', ''
            FROM cms_pages WHERE route = %s
        """, (page_slug,))

    row = cur.fetchone()
    if not row:
        return {'error': 'Страница не найдена'}

    title, seo_title, seo_desc, h1, h2, short_d, full_d = row

    # Получаем ключевые слова для этой страницы + глобальные
    cur.execute("""
        SELECT keyword FROM cms_seo_keywords
        WHERE (page_slug = %s OR page_slug IS NULL) AND is_active = true
        ORDER BY priority DESC, sort_order LIMIT 30
    """, (page_slug,))
    keywords = [r[0] for r in cur.fetchall()]

    kw_list = ', '.join(keywords[:20]) if keywords else 'ключевые слова не добавлены'

    prompt = f"""Проведи SEO-аудит страницы IT-компании "Аплинк-IT" (Воронеж).

Данные страницы:
- Название: {title}
- SEO Title: {seo_title or '(не заполнен)'}
- SEO Description: {seo_desc or '(не заполнен)'}
- H1 заголовок: {h1 or '(не заполнен)'}
- Подзаголовок: {h2 or '(не заполнен)'}
- Краткое описание: {short_d or '(не заполнено)'}
- Полный текст (первые 500 символов): {(full_d or '')[:500] or '(не заполнен)'}

Ключевые слова для продвижения: {kw_list}

Верни ТОЛЬКО JSON без пояснений. Формат:
{{
  "score": 75,
  "issues": [
    {{"type": "error|warning|info", "field": "seo_title", "text": "Описание проблемы"}},
    ...
  ],
  "recommendations": [
    {{"priority": "high|medium|low", "action": "Что конкретно сделать", "example": "Пример готового текста"}},
    ...
  ]
}}

Критерии оценки (score 0-100):
- SEO Title: 10-65 символов, содержит ключевые слова и город (20 баллов)
- SEO Description: 70-155 символов, содержит ключевые слова и CTA (20 баллов)
- H1: информативный, с ключевыми словами (20 баллов)
- Полный текст: объём > 500 символов, плотность ключей 1-3% (25 баллов)
- Краткое описание: заполнено (15 баллов)"""

    result_text = call_claude(prompt, max_tokens=2000)

    try:
        start = result_text.find('{')
        end = result_text.rfind('}') + 1
        audit_data = json.loads(result_text[start:end])
    except Exception:
        audit_data = {'score': 0, 'issues': [], 'recommendations': []}

    # Сохраняем результат аудита
    score = audit_data.get('score', 0)
    issues = json.dumps(audit_data.get('issues', []), ensure_ascii=False)
    recs = json.dumps(audit_data.get('recommendations', []), ensure_ascii=False)

    cur.execute("""
        INSERT INTO cms_seo_audit (page_slug, page_type, page_title, seo_score, issues, recommendations, audited_at)
        VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, NOW())
        ON CONFLICT (page_slug) DO UPDATE SET
            page_type=EXCLUDED.page_type, page_title=EXCLUDED.page_title,
            seo_score=EXCLUDED.seo_score, issues=EXCLUDED.issues,
            recommendations=EXCLUDED.recommendations, audited_at=NOW()
    """, (page_slug, page_type, title, score, issues, recs))
    conn.commit()

    return {
        'ok': True,
        'page_slug': page_slug,
        'page_title': title,
        'audit': audit_data,
        'keywords_used': keywords[:20],
    }


def action_mass_generate_seo(conn, cur, body: dict) -> dict:
    """Массовая генерация SEO title+description для всех услуг на основе ключевых слов"""
    target_slugs = body.get('slugs', [])  # если пусто — для всех

    # Получаем услуги
    if target_slugs:
        placeholders = ','.join(['%s'] * len(target_slugs))
        cur.execute(f"""
            SELECT id, slug, title, short_desc, hero_title, seo_title, seo_description
            FROM cms_services WHERE slug IN ({placeholders}) AND is_active = true
        """, target_slugs)
    else:
        cur.execute("""
            SELECT id, slug, title, short_desc, hero_title, seo_title, seo_description
            FROM cms_services WHERE is_active = true AND slug IS NOT NULL ORDER BY sort_order
        """)

    services = cur.fetchall()
    if not services:
        return {'error': 'Услуги не найдены'}

    # Глобальные ключевые слова
    cur.execute("""
        SELECT keyword FROM cms_seo_keywords
        WHERE page_slug IS NULL AND is_active = true
        ORDER BY priority DESC LIMIT 15
    """)
    global_kws = [r[0] for r in cur.fetchall()]

    results = []
    for svc in services:
        svc_id, slug, title, short_desc, hero_title, old_seo_title, old_seo_desc = svc

        # Ключевые слова для этой услуги
        cur.execute("""
            SELECT keyword FROM cms_seo_keywords
            WHERE page_slug = %s AND is_active = true
            ORDER BY priority DESC LIMIT 10
        """, (slug,))
        page_kws = [r[0] for r in cur.fetchall()]
        all_kws = (page_kws + global_kws)[:15]
        kw_str = ', '.join(all_kws) if all_kws else title

        prompt = f"""Напиши SEO title и description для услуги IT-компании.

Услуга: {title}
Описание: {short_desc or hero_title or ''}
Ключевые слова: {kw_str}

Верни ТОЛЬКО JSON:
{{"seo_title": "...", "seo_description": "..."}}

Требования:
- seo_title: 45-65 символов, включи название услуги + "Воронеж", используй ключевые слова
- seo_description: 130-155 символов, конкретные выгоды + призыв к действию + ключевые слова"""

        try:
            result_text = call_claude(prompt, max_tokens=300)
            start = result_text.find('{')
            end = result_text.rfind('}') + 1
            data = json.loads(result_text[start:end])
            new_title = data.get('seo_title', old_seo_title or '')
            new_desc = data.get('seo_description', old_seo_desc or '')
        except Exception:
            new_title = old_seo_title or ''
            new_desc = old_seo_desc or ''

        results.append({
            'id': svc_id,
            'slug': slug,
            'title': title,
            'seo_title': new_title,
            'seo_description': new_desc,
            'old_seo_title': old_seo_title,
            'old_seo_description': old_seo_desc,
        })

    return {'ok': True, 'results': results}


def action_apply_mass_seo(conn, cur, body: dict) -> dict:
    """Применить результаты массовой генерации"""
    items = body.get('items', [])
    if not items:
        return {'error': 'Нет данных для сохранения'}

    updated = 0
    for item in items:
        if not item.get('id'):
            continue
        cur.execute("""
            UPDATE cms_services SET seo_title = %s, seo_description = %s WHERE id = %s
        """, (item.get('seo_title', ''), item.get('seo_description', ''), item['id']))
        updated += 1

    conn.commit()
    return {'ok': True, 'updated': updated}


def action_get_audit_list(cur) -> dict:
    """Получить последние результаты аудита"""
    cur.execute("""
        SELECT page_slug, page_type, page_title, seo_score, issues, recommendations, audited_at
        FROM cms_seo_audit ORDER BY seo_score ASC, audited_at DESC
    """)
    rows = cur.fetchall()
    audits = []
    for r in rows:
        audits.append({
            'page_slug': r[0],
            'page_type': r[1],
            'page_title': r[2],
            'seo_score': r[3],
            'issues': r[4] if isinstance(r[4], list) else [],
            'recommendations': r[5] if isinstance(r[5], list) else [],
            'audited_at': r[6].isoformat() if r[6] else None,
        })
    return {'audits': audits}


ACTIONS = {
    'get_keywords': lambda conn, cur, body: action_get_keywords(cur, body),
    'save_keyword': action_save_keyword,
    'delete_keyword': action_delete_keyword,
    'generate_keywords': lambda conn, cur, body: action_generate_keywords(cur, body),
    'bulk_save_keywords': action_bulk_save_keywords,
    'audit_page': action_audit_page,
    'mass_generate_seo': action_mass_generate_seo,
    'apply_mass_seo': action_apply_mass_seo,
    'get_audit_list': lambda conn, cur, body: action_get_audit_list(cur),
}


def handler(event: dict, context) -> dict:
    """SEO API: управление семантическим ядром, аудит страниц, массовая ИИ-генерация"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token') or ''

    if not verify_token(token):
        return {
            'statusCode': 401,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'}, ensure_ascii=False),
        }

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    action = body.get('action', '')
    if not action:
        return {
            'statusCode': 400,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите action'}, ensure_ascii=False),
        }

    if action not in ACTIONS:
        return {
            'statusCode': 400,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Неизвестное действие: {action}'}, ensure_ascii=False),
        }

    conn = get_db()
    cur = conn.cursor()
    try:
        result = ACTIONS[action](conn, cur, body)
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False, default=str),
        }
    except Exception as e:
        conn.close()
        return {
            'statusCode': 500,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
        }
