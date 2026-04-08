INSERT INTO t_p79235343_uplink_clone_website.cms_settings (key, value, label) VALUES
  ('section_team_visible', 'true', '')
ON CONFLICT (key) DO NOTHING;

UPDATE t_p79235343_uplink_clone_website.cms_settings SET value = 'hero,services,whyus,pricing,quickorder,projects,team,contacts' WHERE key = 'section_order';
