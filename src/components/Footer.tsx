import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CmsSettings } from "@/hooks/useCmsContent";

interface FooterProps {
  onContactClick: () => void;
  settings?: CmsSettings;
}

export default function Footer({ onContactClick, settings }: FooterProps) {
  const phone = settings?.phone ?? "8 (986) 986-01-36";
  const phoneHref = settings?.phone_href ?? "tel:+79869860136";
  const email = settings?.email_support ?? "support@uplink-it.ru";
  const address = settings?.address ?? "Саратов, Россия";
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchor = (anchor: string) => {
    const id = anchor.replace("#", "");
    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/${anchor}`);
    }
  };

  const navItems = [
    { label: "Главная", anchor: "#home" },
    { label: "Услуги", anchor: "#services" },
    { label: "О компании", anchor: "#about" },
    { label: "Проекты", anchor: "#projects" },
    { label: "Тарифы", anchor: "#pricing" },
    { label: "Контакты", anchor: "#contacts" },
  ];

  const serviceItems = [
    { label: "IT-аутсорсинг для бизнеса", slug: "it-outsourcing" },
    { label: "Администрирование серверов", slug: "server-administration" },
    { label: "Поддержка IT-инфраструктуры", slug: "it-infrastructure" },
    { label: "Монтаж ЛВС / СКС", slug: "lan-installation" },
    { label: "Видеонаблюдение под ключ", slug: "video-surveillance" },
    { label: "IP-телефония (FreePBX, ВАТС)", slug: "ip-telephony" },
  ];

  return (
    <footer className="bg-[#060a12] border-t border-cyan-500/10 pt-14 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <button
              onClick={() => handleAnchor("#home")}
              className="flex items-center gap-3 mb-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Icon name="Wifi" size={20} className="text-[#080c14]" />
              </div>
              <div>
                <div className="font-bold text-white font-['Oswald'] tracking-wide">
                  ИТК <span className="text-cyan-400">Аплинк-IT</span>
                </div>
                <div className="text-xs text-gray-500">IT-услуги для вашего бизнеса</div>
              </div>
            </button>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              IT-аутсорсинг и обслуживание IT-инфраструктуры в Саратове с 2015 года. Работаем по всему Саратову и Саратовской области.
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/uplinkit"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                title="Telegram"
              >
                <Icon name="Send" size={16} />
              </a>
              <a
                href={phoneHref}
                className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                title="Позвонить"
              >
                <Icon name="Phone" size={16} />
              </a>
              <a
                href={`mailto:${email}`}
                className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                title="Email"
              >
                <Icon name="Mail" size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold font-['Oswald'] mb-4 text-lg">Услуги</h4>
            <ul className="space-y-2.5">
              {serviceItems.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="text-gray-500 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="ChevronRight" size={12} className="text-cyan-500/50" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold font-['Oswald'] mb-4 text-lg">Навигация</h4>
            <ul className="space-y-2.5">
              {navItems.map(({ label, anchor }) => (
                <li key={label}>
                  <button
                    onClick={() => handleAnchor(anchor)}
                    className="text-gray-500 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="ChevronRight" size={12} className="text-cyan-500/50" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold font-['Oswald'] mb-4 text-lg">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Icon name="Phone" size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <a href={phoneHref} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Mail" size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="MapPin" size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Clock" size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">Поддержка 24/7</span>
              </li>
            </ul>
            <button
              onClick={onContactClick}
              className="btn-neon px-5 py-2.5 rounded-xl text-sm font-semibold mt-5 w-full"
            >
              Оставить заявку
            </button>
          </div>
        </div>

        <div className="border-t border-cyan-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">
            © 2024 ИТК Аплинк-IT. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-gray-700 text-xs">
              Лицензионная IT-деятельность · ИНН указан в договоре
            </p>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-cyan-400 text-xs transition-colors whitespace-nowrap"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
