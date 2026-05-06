CREATE TABLE cms_calc_sliders (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  key VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  suffix VARCHAR(32) NOT NULL DEFAULT 'шт.',
  price_key VARCHAR(64) NOT NULL,
  price_default INTEGER NOT NULL DEFAULT 500,
  min_val INTEGER NOT NULL DEFAULT 0,
  max_val INTEGER NOT NULL DEFAULT 50,
  default_val INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cms_calc_sliders (sort_order, key, label, suffix, price_key, price_default, min_val, max_val, default_val, is_active) VALUES
  (1, 'pc', 'Количество ПК / ноутбуков', 'шт.', 'price_per_pc', 500, 1, 50, 5, true),
  (2, 'servers', 'Количество серверов', 'шт.', 'price_per_server', 2500, 0, 10, 0, true),
  (3, 'visits', 'Выездов специалиста в месяц', 'выезд.', 'price_per_visit', 1500, 0, 20, 1, true);
