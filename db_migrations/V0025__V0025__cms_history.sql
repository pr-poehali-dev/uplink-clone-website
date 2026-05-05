CREATE TABLE t_p79235343_uplink_clone_website.cms_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p79235343_uplink_clone_website.cms_admin_users(id),
  username VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  snapshot JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cms_history_created_at ON t_p79235343_uplink_clone_website.cms_history(created_at DESC);
CREATE INDEX idx_cms_history_entity ON t_p79235343_uplink_clone_website.cms_history(entity_type, entity_id);