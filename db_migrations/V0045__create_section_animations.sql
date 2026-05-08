CREATE TABLE IF NOT EXISTS section_animations (
  id SERIAL PRIMARY KEY,
  section_id VARCHAR(64) NOT NULL UNIQUE,
  page VARCHAR(64) NOT NULL DEFAULT '/',
  label VARCHAR(128) NOT NULL,
  scroll_anim VARCHAR(64) DEFAULT 'inherit',
  hover_cards VARCHAR(64) DEFAULT 'inherit',
  hover_buttons VARCHAR(64) DEFAULT 'inherit',
  anim_speed VARCHAR(32) DEFAULT 'inherit',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO section_animations (section_id, page, label) VALUES
  ('home',        '/',               'Главный экран (Hero)'),
  ('services',    '/',               'Услуги'),
  ('whyus',       '/',               'Почему мы'),
  ('pricing',     '/',               'Тарифы'),
  ('quickorder',  '/',               'Быстрый заказ'),
  ('projects',    '/',               'Проекты'),
  ('team',        '/',               'О компании / Команда'),
  ('contacts',    '/',               'Контакты'),
  ('faq',         '/',               'FAQ'),
  ('pricing_hero','pricing',         'Прайс — шапка'),
  ('pricing_list','pricing',         'Прайс — список услуг'),
  ('pricing_cta', 'pricing',         'Прайс — призыв к действию'),
  ('svc_hero',    'services/:slug',  'Услуга — Hero'),
  ('svc_benefits','services/:slug',  'Услуга — Преимущества'),
  ('svc_steps',   'services/:slug',  'Услуга — Этапы работы'),
  ('svc_faq',     'services/:slug',  'Услуга — FAQ'),
  ('svc_cta',     'services/:slug',  'Услуга — CTA'),
  ('svc_other',   'services/:slug',  'Услуга — Другие услуги'),
  ('calculator',  'services/:slug',  'Калькулятор')
ON CONFLICT (section_id) DO NOTHING;