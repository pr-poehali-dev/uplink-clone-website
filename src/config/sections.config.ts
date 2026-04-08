/**
 * Единый конфиг секций сайта.
 *
 * Чтобы добавить новый блок на сайт и сразу в админку:
 * 1. Добавь запись в SECTIONS_META с ключом, лейблом и описанием
 * 2. Добавь ключ в SECTIONS_ORDER в нужную позицию
 * 3. В src/pages/Index.tsx добавь компонент в sectionMap по тому же ключу
 * 4. Всё — блок автоматически появится в разделе «Секции» панели управления
 */

export interface SectionMeta {
  label: string;
  desc: string;
}

export const SECTIONS_META: Record<string, SectionMeta> = {
  hero:       { label: "Главный экран",  desc: "Заголовок, описание, кнопки CTA" },
  services:   { label: "Услуги",         desc: "Карточки с перечнем услуг" },
  whyus:      { label: "Почему мы",      desc: "Преимущества и статистика" },
  pricing:    { label: "Тарифы",         desc: "Тарифные планы с ценами" },
  quickorder: { label: "Быстрый заказ",  desc: "Аккордеон с шагами заказа" },
  projects:   { label: "Проекты",        desc: "Кейсы и реализованные проекты" },
  team:       { label: "Наша команда",   desc: "История компании, подход и состав команды" },
  contacts:   { label: "Контакты",       desc: "Телефон, email, адрес" },
  faq:        { label: "FAQ",            desc: "Часто задаваемые вопросы и ответы" },
};

export const SECTIONS_ORDER = Object.keys(SECTIONS_META);