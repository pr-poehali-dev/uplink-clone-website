"""
Sitemap XML — динамически генерирует sitemap.xml на основе актуальных данных из БД.
GET / — возвращает sitemap.xml со всеми публичными страницами сайта.
"""
import os
import psycopg2
from datetime import datetime


SITE_URL = "https://uplink-it.ru"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def url_entry(loc: str, lastmod: str = None, changefreq: str = "weekly", priority: str = "0.8") -> str:
    parts = [f"  <url>", f"    <loc>{loc}</loc>"]
    if lastmod:
        parts.append(f"    <lastmod>{lastmod}</lastmod>")
    parts.append(f"    <changefreq>{changefreq}</changefreq>")
    parts.append(f"    <priority>{priority}</priority>")
    parts.append(f"  </url>")
    return "\n".join(parts)


def handler(event: dict, context) -> dict:
    """Генерирует sitemap.xml с актуальными страницами из БД."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    today = datetime.utcnow().strftime("%Y-%m-%d")

    conn = get_conn()
    cur = conn.cursor()

    entries = []

    # Главная страница
    entries.append(url_entry(f"{SITE_URL}/", today, "daily", "1.0"))

    # Страница прайса
    entries.append(url_entry(f"{SITE_URL}/pricing", today, "weekly", "0.9"))

    # Политика конфиденциальности
    entries.append(url_entry(f"{SITE_URL}/privacy", today, "monthly", "0.3"))

    # Страницы услуг — только активные и видимые
    cur.execute("""
        SELECT slug, updated_at
        FROM cms_services
        WHERE is_active = true
          AND page_visible = true
          AND slug IS NOT NULL
          AND slug != ''
        ORDER BY sort_order
    """)
    for row in cur.fetchall():
        slug = row[0]
        updated = row[1].strftime("%Y-%m-%d") if row[1] else today
        entries.append(url_entry(f"{SITE_URL}/services/{slug}", updated, "weekly", "0.9"))

    cur.close()
    conn.close()

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n'
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n'
    xml += "\n".join(entries)
    xml += "\n</urlset>"

    return {
        "statusCode": 200,
        "headers": {
            **CORS,
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
        "body": xml,
    }
