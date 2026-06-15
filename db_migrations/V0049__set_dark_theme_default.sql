-- Тёмная тема по умолчанию
UPDATE cms_settings SET value = 'dark', updated_at = NOW() WHERE key = 'default_theme';
INSERT INTO cms_settings (key, value, label, updated_at)
SELECT 'default_theme', 'dark', '', NOW()
WHERE NOT EXISTS (SELECT 1 FROM cms_settings WHERE key = 'default_theme');
