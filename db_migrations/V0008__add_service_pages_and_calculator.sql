ALTER TABLE cms_services 
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
  ADD COLUMN IF NOT EXISTS short_desc TEXT,
  ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS full_description TEXT,
  ADD COLUMN IF NOT EXISTS price_from VARCHAR(100),
  ADD COLUMN IF NOT EXISTS for_whom TEXT,
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_services_slug ON cms_services(slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS cms_service_benefits (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES cms_services(id),
  sort_order INT NOT NULL DEFAULT 0,
  icon VARCHAR(50) DEFAULT 'Check',
  title VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS cms_service_steps (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES cms_services(id),
  sort_order INT NOT NULL DEFAULT 0,
  step_title VARCHAR(255) NOT NULL,
  step_description TEXT
);

CREATE TABLE IF NOT EXISTS cms_service_faq (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES cms_services(id),
  sort_order INT NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_calc_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_calc_options (
  id SERIAL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  key VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL DEFAULT 0,
  icon VARCHAR(50) DEFAULT 'Check',
  is_active BOOLEAN DEFAULT TRUE
);

UPDATE cms_services SET slug = 'it-outsourcing' WHERE title ILIKE '%аутсорсинг%' AND slug IS NULL;
UPDATE cms_services SET slug = 'server-administration' WHERE title ILIKE '%сервер%' AND slug IS NULL;
UPDATE cms_services SET slug = 'it-infrastructure' WHERE title ILIKE '%инфраструктур%' AND slug IS NULL;
UPDATE cms_services SET slug = 'video-surveillance' WHERE title ILIKE '%видеонаблюдение%' AND slug IS NULL;
UPDATE cms_services SET slug = 'lan-installation' WHERE (title ILIKE '%ЛВС%' OR title ILIKE '%СКС%') AND slug IS NULL;
UPDATE cms_services SET slug = 'ip-telephony' WHERE title ILIKE '%телефония%' AND slug IS NULL;

INSERT INTO cms_calc_settings (key, value, label) VALUES
  ('title', 'Калькулятор IT-аутсорсинга', 'Заголовок калькулятора'),
  ('subtitle', 'Рассчитайте ориентировочную стоимость обслуживания за 30 секунд', 'Подзаголовок'),
  ('base_price', '3000', 'Базовая стоимость в месяц (₽)'),
  ('price_per_pc', '500', 'Цена за 1 ПК (₽)'),
  ('price_per_server', '2500', 'Цена за 1 сервер (₽)'),
  ('price_per_visit', '1500', 'Цена за 1 выезд в месяц (₽)'),
  ('response_4h_multiplier', '1.0', 'Коэффициент: реакция до 4 часов'),
  ('response_2h_multiplier', '1.25', 'Коэффициент: реакция до 2 часов'),
  ('response_1h_multiplier', '1.5', 'Коэффициент: реакция до 1 часа'),
  ('discount_label', 'IT-аутсорсинг дешевле штатного сисадмина до 40%', 'Поясняющий текст'),
  ('cta_text', 'Получить точный расчёт', 'Текст кнопки'),
  ('min_pc', '1', 'Минимум ПК'),
  ('max_pc', '50', 'Максимум ПК'),
  ('min_servers', '0', 'Минимум серверов'),
  ('max_servers', '10', 'Максимум серверов'),
  ('min_visits', '0', 'Минимум выездов'),
  ('max_visits', '20', 'Максимум выездов')
ON CONFLICT (key) DO NOTHING;

INSERT INTO cms_calc_options (sort_order, key, label, description, price, icon) VALUES
  (1, 'antivirus', 'Антивирусная защита', 'Установка и обслуживание антивируса', 1500, 'Shield'),
  (2, 'backup', 'Резервное копирование', 'Настройка и контроль бэкапов', 2000, 'HardDrive'),
  (3, 'monitoring', 'Мониторинг 24/7', 'Круглосуточное наблюдение за инфраструктурой', 3000, 'Activity'),
  (4, 'security', 'Информационная безопасность', 'Аудит и настройка защиты данных', 2500, 'Lock'),
  (5, 'priority', 'Приоритетная горячая линия', 'Выделенная линия поддержки', 2000, 'PhoneCall')
ON CONFLICT (key) DO NOTHING;

INSERT INTO cms_settings (key, value, label) VALUES
  ('default_theme', 'dark', 'Тема по умолчанию (dark/light)'),
  ('theme_toggle_enabled', 'true', 'Показывать переключатель темы')
ON CONFLICT (key) DO NOTHING;
