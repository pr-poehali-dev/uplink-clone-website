ALTER TABLE t_p79235343_uplink_clone_website.cms_video_camera_types
  ADD COLUMN IF NOT EXISTS min_val integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_val integer NOT NULL DEFAULT 32;