INSERT INTO t_p79235343_uplink_clone_website.cms_settings (key, value, label) VALUES
('design_accent_color', '#00d4ff', 'Дизайн: основной акцентный цвет'),
('design_accent_color_light', '#0284c7', 'Дизайн: акцентный цвет (светлая тема)'),
('design_font_heading', 'Oswald', 'Дизайн: шрифт заголовков'),
('design_font_body', 'Golos Text', 'Дизайн: шрифт основного текста'),
('design_animations_enabled', 'true', 'Дизайн: анимации включены'),
('design_float_btn_visible', 'true', 'Дизайн: плавающая кнопка видна'),
('design_float_btn_emoji', '💬', 'Дизайн: эмодзи плавающей кнопки')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label;