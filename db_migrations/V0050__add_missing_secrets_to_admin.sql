-- Добавляем MAAX_LIVE_CHAT_ID со значением из MAAX_CHAT_ID (как сейчас работает по коду — fallback на общий чат)
INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
SELECT 'MAAX_LIVE_CHAT_ID',
       COALESCE((SELECT value FROM app_secrets WHERE key = 'MAAX_CHAT_ID'), ''),
       'ID чата в Maax (Max) для сообщений из живого чата на сайте. Если пусто — используется MAAX_CHAT_ID (тот же чат, что и для заявок).',
       false,
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_secrets WHERE key = 'MAAX_LIVE_CHAT_ID');

-- SMTP-секреты для отправки email с заявками (отображаем в админке)
INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
SELECT 'SMTP_HOST', '', 'SMTP-сервер для отправки email (например smtp.yandex.ru).', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_secrets WHERE key = 'SMTP_HOST');

INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
SELECT 'SMTP_PORT', '', 'Порт SMTP-сервера (обычно 465 для SSL).', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_secrets WHERE key = 'SMTP_PORT');

INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
SELECT 'SMTP_USER', '', 'Логин (email) для авторизации на SMTP-сервере.', false, NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_secrets WHERE key = 'SMTP_USER');

INSERT INTO app_secrets (key, value, description, is_sensitive, updated_at)
SELECT 'SMTP_PASSWORD', '', 'Пароль (или пароль приложения) для SMTP-сервера.', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_secrets WHERE key = 'SMTP_PASSWORD');
