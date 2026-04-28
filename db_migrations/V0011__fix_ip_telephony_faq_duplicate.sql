-- Исправляем дубликат FAQ у IP-телефонии (удаляем id=22 с sort_order=3, который дублирует id=14)
UPDATE cms_service_faq SET question = '[удалено]', answer = '[удалено]' WHERE id = 22;
-- Сдвигаем sort_order у id=23 (FreePBX вопрос) на 3
UPDATE cms_service_faq SET sort_order = 3 WHERE id = 23;
