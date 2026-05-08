INSERT INTO cms_settings (key, value, label)
VALUES (
  'site_meta_description',
  'Комплексное IT-обслуживание бизнеса в Саратове. Реагирование от 15 минут. Обслуживание ПК, серверов, ЛВС, видеонаблюдение, IP-телефония. Бесплатный IT-аудит. Звоните: 8 (845) 239-77-38.',
  'Описание сайта (meta description)'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;