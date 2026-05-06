CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.live_chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    is_closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS t_p79235343_uplink_clone_website.live_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES t_p79235343_uplink_clone_website.live_chat_sessions(session_id),
    sender VARCHAR(16) NOT NULL CHECK (sender IN ('visitor', 'operator')),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_session_id ON t_p79235343_uplink_clone_website.live_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sessions_last_message ON t_p79235343_uplink_clone_website.live_chat_sessions(last_message_at DESC);