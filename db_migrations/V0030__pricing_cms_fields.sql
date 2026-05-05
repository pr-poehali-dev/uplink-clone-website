ALTER TABLE t_p79235343_uplink_clone_website.cms_pricing_items
  ADD COLUMN IF NOT EXISTS category_accent VARCHAR(100) NOT NULL DEFAULT 'from-cyan-400 to-blue-500';

UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-cyan-400 to-blue-500' WHERE category_slug = 'it-outsourcing';
UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-violet-400 to-purple-500' WHERE category_slug = 'server-administration';
UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-blue-400 to-indigo-500' WHERE category_slug = 'it-infrastructure';
UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-green-400 to-emerald-500' WHERE category_slug = 'video-surveillance';
UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-orange-400 to-amber-500' WHERE category_slug = 'lan-installation';
UPDATE t_p79235343_uplink_clone_website.cms_pricing_items SET category_accent = 'from-pink-400 to-rose-500' WHERE category_slug = 'ip-telephony';

INSERT INTO t_p79235343_uplink_clone_website.cms_settings (key, value, label) VALUES
  ('pricing_page_title', 'Прайс на IT-услуги', 'Прайс: заголовок страницы'),
  ('pricing_page_subtitle', 'Фиксированные цены без скрытых доплат. Точную стоимость под ваши задачи рассчитываем на бесплатной консультации.', 'Прайс: подзаголовок'),
  ('pricing_page_badge', 'Стоимость услуг', 'Прайс: бейдж над заголовком'),
  ('pricing_page_city', 'в Воронеже', 'Прайс: город в заголовке'),
  ('pricing_info_text', 'Цены указаны ориентировочно и зависят от объёма работ, сложности задачи и удалённости объекта. Точную стоимость рассчитываем после бесплатной консультации или выезда специалиста.', 'Прайс: текст блока «Как формируется цена»'),
  ('pricing_cta_text', 'Нужен индивидуальный расчёт или не нашли нужную услугу?', 'Прайс: текст CTA в боковой панели')
ON CONFLICT (key) DO NOTHING;