ALTER TABLE t_p79235343_uplink_clone_website.live_chat_sessions
  ADD COLUMN IF NOT EXISTS service_topic VARCHAR(255),
  ADD COLUMN IF NOT EXISTS maax_message_id VARCHAR(128);