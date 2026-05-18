-- Добавляем пункт "Услуги" в nav_items если его нет
INSERT INTO cms_nav_items (label, href, type, sort_order, is_visible)
SELECT 'Услуги', '/services', 'internal', 2, true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_nav_items WHERE label = 'Услуги' OR href = '/services' OR href = '/#services'
);

-- Сдвигаем остальные пункты начиная с sort_order=2 на +1 (кроме только что добавленного)
UPDATE cms_nav_items SET sort_order = sort_order + 1
WHERE sort_order >= 2 AND label != 'Услуги' AND href != '/services';
