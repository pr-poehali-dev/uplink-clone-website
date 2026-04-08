import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const sections = [
  {
    title: "1. Общие положения",
    content: `Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей сайта ИТК Аплинк-IT (uplink-it.ru).

Используя сайт, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны с её условиями — пожалуйста, покиньте сайт.

Оператор персональных данных: ИТК Аплинк-IT, г. Саратов, Россия. Email: support@uplink-it.ru, тел.: 8 (986) 986-01-36.`,
  },
  {
    title: "2. Какие данные мы собираем",
    content: `При использовании сайта и заполнении форм обратной связи мы можем собирать следующие данные:

• Имя и фамилия
• Номер телефона
• Адрес электронной почты
• Название и сфера деятельности компании
• Техническая информация: IP-адрес, тип браузера, страницы посещений, время визита

Данные передаются исключительно добровольно — при заполнении форм на сайте.`,
  },
  {
    title: "3. Цели обработки данных",
    content: `Собранные данные используются исключительно в следующих целях:

• Обработка заявок и обратная связь с клиентами
• Заключение и исполнение договоров на оказание IT-услуг
• Улучшение качества обслуживания и работы сайта
• Информирование о новых услугах (только с вашего согласия)
• Соблюдение требований законодательства РФ`,
  },
  {
    title: "4. Файлы cookie",
    content: `Сайт использует файлы cookie — небольшие текстовые файлы, которые сохраняются в вашем браузере. Cookie помогают:

• Запомнить ваши предпочтения при повторных визитах
• Ускорить загрузку страниц за счёт локального кэширования
• Анализировать посещаемость для улучшения сайта

Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу некоторых функций сайта. Нажав кнопку «Принять» в баннере, вы даёте согласие на использование cookie.`,
  },
  {
    title: "5. Передача данных третьим лицам",
    content: `Мы не продаём, не передаём и не раскрываем ваши персональные данные третьим лицам без вашего согласия, за исключением случаев:

• Требований законодательства РФ и обоснованных запросов государственных органов
• Необходимости для исполнения заключённого с вами договора
• Защиты прав и законных интересов компании

Для технического обеспечения работы сайта могут использоваться сторонние сервисы (хостинг, аналитика), которые обрабатывают данные в соответствии со своими политиками конфиденциальности.`,
  },
  {
    title: "6. Хранение и защита данных",
    content: `Ваши данные хранятся на защищённых серверах с использованием современных методов шифрования. Мы принимаем необходимые технические и организационные меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.

Данные хранятся не дольше, чем это необходимо для целей их сбора, либо в соответствии со сроками, установленными законодательством РФ.`,
  },
  {
    title: "7. Ваши права",
    content: `В соответствии с Федеральным законом № 152-ФЗ «О персональных данных» вы имеете право:

• Получить информацию об обработке ваших персональных данных
• Потребовать уточнения, блокирования или уничтожения данных
• Отозвать согласие на обработку персональных данных в любой момент
• Обжаловать действия оператора в Роскомнадзоре

Для реализации прав обратитесь к нам по email: support@uplink-it.ru`,
  },
  {
    title: "8. Изменения в Политике",
    content: `Мы оставляем за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна на данной странице. При существенных изменениях мы уведомим вас через сайт.

Дата последнего обновления: апрель 2025 года.`,
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14]">
      {/* Шапка */}
      <div className="bg-[#060a12] border-b border-cyan-500/10">
        <div className="container mx-auto px-4 py-5 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            На главную
          </Link>
          <span className="text-gray-700">·</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Icon name="Wifi" size={14} className="text-[#080c14]" />
            </div>
            <span className="text-white font-bold font-['Oswald'] tracking-wide text-sm">
              ИТК <span className="text-cyan-400">Аплинк-IT</span>
            </span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 py-14 max-w-3xl">
        {/* Заголовок */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <Icon name="Shield" size={12} />
            Юридический документ
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-['Oswald'] mb-3">
            Политика <span className="text-cyan-400">конфиденциальности</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Последнее обновление: апрель 2025 года · Действует для сайта ИТК Аплинк-IT
          </p>
        </div>

        {/* Разделы */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-white/8 bg-white/2 px-6 py-5"
            >
              <h2 className="text-white font-semibold font-['Oswald'] text-lg mb-3">
                {section.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Контакт */}
        <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="Mail" size={16} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm mb-1">Остались вопросы?</p>
            <p className="text-gray-400 text-sm">
              Напишите нам на{" "}
              <a
                href="mailto:support@uplink-it.ru"
                className="text-cyan-400 hover:underline"
              >
                support@uplink-it.ru
              </a>{" "}
              — ответим в течение рабочего дня.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
