CREATE TABLE t_p79235343_uplink_clone_website.cms_admin_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79235343_uplink_clone_website.cms_admin_users(id),
  permission VARCHAR(100) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, permission)
);

CREATE TABLE t_p79235343_uplink_clone_website.cms_admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p79235343_uplink_clone_website.cms_admin_users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT
);

CREATE INDEX idx_cms_admin_sessions_token ON t_p79235343_uplink_clone_website.cms_admin_sessions(token);