-- Таблица семантического ядра (ключевые слова для SEO)
CREATE TABLE IF NOT EXISTS cms_seo_keywords (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  page_slug VARCHAR(100),              -- к какой странице/услуге относится (NULL = глобальный)
  page_type VARCHAR(50) DEFAULT 'global', -- 'global', 'service', 'page'
  priority VARCHAR(20) DEFAULT 'medium',  -- 'high', 'medium', 'low'
  search_volume_hint VARCHAR(50),      -- подсказка по частотности: 'высокая', 'средняя', 'низкая'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  sort_order INT DEFAULT 0
);

-- Таблица SEO-аудита страниц (кэш результатов анализа)
CREATE TABLE IF NOT EXISTS cms_seo_audit (
  id SERIAL PRIMARY KEY,
  page_slug VARCHAR(100) NOT NULL,
  page_type VARCHAR(50) NOT NULL,      -- 'service', 'page'
  page_title VARCHAR(255),
  seo_score INT DEFAULT 0,             -- оценка 0-100
  issues JSONB DEFAULT '[]',           -- список проблем
  recommendations JSONB DEFAULT '[]',  -- рекомендации
  audited_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_keywords_page_slug ON cms_seo_keywords(page_slug);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_page_type ON cms_seo_keywords(page_type);
CREATE INDEX IF NOT EXISTS idx_seo_audit_page_slug ON cms_seo_audit(page_slug);
