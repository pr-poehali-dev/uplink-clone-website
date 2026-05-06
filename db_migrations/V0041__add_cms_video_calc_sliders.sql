CREATE TABLE cms_video_calc_sliders (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  key VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  suffix VARCHAR(32) NOT NULL DEFAULT 'шт.',
  price_per_unit INTEGER NOT NULL DEFAULT 0,
  min_val INTEGER NOT NULL DEFAULT 0,
  max_val INTEGER NOT NULL DEFAULT 100,
  default_val INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cms_video_calc_sliders (sort_order, key, label, suffix, price_per_unit, min_val, max_val, default_val, is_active) VALUES
  (1, 'cable', 'Длина кабельной трассы', 'м', 80, 10, 500, 50, true);
