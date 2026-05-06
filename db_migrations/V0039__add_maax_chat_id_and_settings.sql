-- Добавляем maax_chat_id: каждая сессия клиента = отдельный чат MAX
ALTER TABLE t_p79235343_uplink_clone_website.live_chat_sessions
  ADD COLUMN IF NOT EXISTS maax_chat_id VARCHAR(128);

-- Таблица настроек виджета чата
CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.live_chat_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Значения по умолчанию
INSERT INTO t_p79235343_uplink_clone_website.live_chat_settings (key, value) VALUES
  ('welcome_text', 'Добро пожаловать! 👋 Команда «Аплинк-ИТ». Поможем с подбором видеонаблюдения и ИТ-обслуживания. Выберите, с чего начать наш диалог:'),
  ('services', 'IT-аутсорсинг,Видеонаблюдение,Администрирование серверов,Монтаж ЛВС / СКС,IP-телефония,Вызов IT-специалиста,Другой вопрос'),
  ('header_title', 'Аплинк-ИТ'),
  ('header_subtitle', 'Обычно отвечаем за несколько минут')
ON CONFLICT (key) DO NOTHING;