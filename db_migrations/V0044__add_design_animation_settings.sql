INSERT INTO cms_settings (key, value, label) VALUES
  ('design_scroll_animation', 'fade-up', 'Анимация прокрутки'),
  ('design_hover_cards', 'lift', 'Анимация карточек при наведении'),
  ('design_hover_buttons', 'glow', 'Анимация кнопок при наведении'),
  ('design_hover_menu', 'underline', 'Анимация пунктов меню'),
  ('design_modal_animation', 'scale-in', 'Анимация модальных окон'),
  ('design_anim_speed', 'normal', 'Скорость анимаций'),
  ('design_bg_effect', 'grid', 'Эффект фона'),
  ('design_btn_style', 'rounded', 'Стиль кнопок'),
  ('design_card_style', 'glass', 'Стиль карточек'),
  ('design_shadow_style', 'neon', 'Стиль теней')
ON CONFLICT (key) DO NOTHING;