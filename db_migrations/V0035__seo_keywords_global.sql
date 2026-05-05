-- Семантическое ядро: глобальные запросы (главная)
INSERT INTO t_p79235343_uplink_clone_website.cms_seo_keywords
  (keyword, page_slug, page_type, priority, search_volume_hint, is_active, sort_order)
VALUES
  ('IT-аутсорсинг Саратов', NULL, 'global', 'high', 'высокая', true, 1),
  ('обслуживание компьютеров Саратов', NULL, 'global', 'high', 'высокая', true, 2),
  ('системный администратор Саратов', NULL, 'global', 'high', 'высокая', true, 3),
  ('приходящий системный администратор Саратов', NULL, 'global', 'high', 'высокая', true, 4),
  ('IT компания Саратов', NULL, 'global', 'high', 'средняя', true, 5),
  ('IT поддержка бизнеса Саратов', NULL, 'global', 'high', 'средняя', true, 6),
  ('компьютерная помощь бизнесу Саратов', NULL, 'global', 'medium', 'средняя', true, 7),
  ('вызов системного администратора Саратов', NULL, 'global', 'medium', 'средняя', true, 8),
  ('IT услуги для малого бизнеса Саратов', NULL, 'global', 'medium', 'средняя', true, 9),
  ('техническое обслуживание компьютеров Саратов', NULL, 'global', 'medium', 'средняя', true, 10),
  ('аутсорсинг системного администрирования Саратов', NULL, 'global', 'low', 'низкая', true, 11),
  ('обслуживание IT инфраструктуры Саратов', NULL, 'global', 'low', 'низкая', true, 12)
ON CONFLICT DO NOTHING;