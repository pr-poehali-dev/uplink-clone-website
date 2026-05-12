-- Добавляем поле hover_anims (массив) в element_animations
-- Мигрируем старое hover_anim -> hover_anims[0] если не 'inherit'
ALTER TABLE t_p79235343_uplink_clone_website.element_animations
  ADD COLUMN IF NOT EXISTS hover_anims TEXT[] NOT NULL DEFAULT '{}';

-- Мигрируем существующие данные: если hover_anim != 'inherit' — кладём его в массив
UPDATE t_p79235343_uplink_clone_website.element_animations
  SET hover_anims = ARRAY[hover_anim]
  WHERE hover_anim != 'inherit' AND hover_anim IS NOT NULL AND hover_anim != '';
