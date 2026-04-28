CREATE TABLE app_secrets (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  is_sensitive BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_secrets (key, value, description, is_sensitive) VALUES
  ('TELEGRAM_BOT_TOKEN', '', 'Токен Telegram-бота. Получить у @BotFather в Telegram.', TRUE),
  ('TELEGRAM_CHAT_ID', '', 'ID чата/группы Telegram, куда приходят уведомления о заявках.', FALSE),
  ('TELEGRAM_THREAD_ID', '', 'ID темы (топика) в Telegram-группе. Оставь пустым, если темы не используются.', FALSE),
  ('MAAX_API_KEY', '', 'API-ключ мессенджера Maax (Max). Получить в кабинете https://maax.im', TRUE),
  ('MAAX_CHAT_ID', '', 'ID чата в Maax, куда приходят уведомления о заявках.', FALSE),
  ('RECIPIENT_EMAIL', '', 'Email адрес для получения заявок с сайта.', FALSE);
