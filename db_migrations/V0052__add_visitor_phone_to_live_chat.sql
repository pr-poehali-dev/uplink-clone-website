-- Телефон посетителя живого чата (обязательное поле формы)
ALTER TABLE t_p79235343_uplink_clone_website.live_chat_sessions
  ADD COLUMN IF NOT EXISTS visitor_phone VARCHAR(32);
