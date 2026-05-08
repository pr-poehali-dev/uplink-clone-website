CREATE TABLE IF NOT EXISTS element_animations (
  id SERIAL PRIMARY KEY,
  elem_id VARCHAR(128) NOT NULL UNIQUE,
  section_id VARCHAR(64),
  elem_type VARCHAR(32) NOT NULL DEFAULT 'card',
  label VARCHAR(128),
  hover_anim VARCHAR(64) DEFAULT 'inherit',
  scroll_anim VARCHAR(64) DEFAULT 'inherit',
  anim_speed VARCHAR(32) DEFAULT 'inherit',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);