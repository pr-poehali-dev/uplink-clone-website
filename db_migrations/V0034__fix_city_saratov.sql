-- Исправляем город в прайсе: Воронеж → Саратов
UPDATE t_p79235343_uplink_clone_website.cms_settings
SET value = 'в Саратове'
WHERE key = 'pricing_page_city';

-- Обновляем подзаголовок прайса с городом
UPDATE t_p79235343_uplink_clone_website.cms_settings
SET value = 'Фиксированные цены на IT-услуги в Саратове без скрытых доплат. Точную стоимость под ваши задачи рассчитаем на бесплатной консультации или после IT-аудита.'
WHERE key = 'pricing_page_subtitle';