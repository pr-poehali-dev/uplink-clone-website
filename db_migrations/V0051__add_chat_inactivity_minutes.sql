-- Время бездействия клиента (минуты) до сброса живого чата
INSERT INTO live_chat_settings (key, value, updated_at)
SELECT 'inactivity_minutes', '10', NOW()
WHERE NOT EXISTS (SELECT 1 FROM live_chat_settings WHERE key = 'inactivity_minutes');
