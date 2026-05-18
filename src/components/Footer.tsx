import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CmsSettings, CmsNavItem, CmsService } from "@/hooks/useCmsContent";

interface FooterProps {
  onContactClick: () => void;
  settings?: CmsSettings;
  navItems?: CmsNavItem[];
  services?: CmsService[];
}

export default function Footer({ onContactClick, settings, navItems, services }: FooterProps) {
  const phone = settings?.phone ?? "8 (845) 239-77-38";
  const phoneHref = settings?.phone_href ?? "tel:+78452397738";
  const email = settings?.email_support ?? "support@uplink-it.ru";
  const address = settings?.address ?? "Саратов, Россия";
  const tgUrl = settings?.footer_tg_url ?? "https://t.me/uplinkit";
  const copyright = settings?.footer_copyright ?? "© 2025 ИТК Аплинк-IT. Все права защищены.";
  const description = settings?.footer_description ?? "IT-аутсорсинг и обслуживание IT-инфраструктуры в Саратове. Работаем по всему Саратову и Саратовской области.";
  const legal = settings?.footer_legal ?? "Лицензионная IT-деятельность · ИНН указан в договоре";
  const workHours = settings?.footer_work_hours ?? "Пн–Пт 9:00–18:00";
  const logoName = settings?.nav_logo_name || "ИТК Аплинк-IT";
  const logoSubtitle = settings?.nav_logo_subtitle || "IT-услуги для вашего бизнеса";
  const logoIcon = settings?.nav_logo_icon || "Wifi";

  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(href);
      }
    } else if (href === "/") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener noreferrer");
    } else {
      navigate(href);
    }
  };

  // Пункты меню из CMS — только видимые
  const cmsNavItems = (navItems ?? [])
    .filter((n) => n.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Услуги из CMS — только активные со slug
  const activeServices = (services ?? [])
    .filter((s) => s.is_active && s.slug)
    .slice(0, 6);

  // Разбиваем название логотипа на части для стилизации
  const renderLogoName = () => {
    const parts = logoName.split(" ");
    if (parts.length === 1) return <span className="text-cyan-400">{logoName}</span>;
    return (
      <>
        {parts.slice(0, -1).join(" ")}{" "}
        <span className="text-cyan-400">{parts[parts.length - 1]}</span>
      </>
    );
  };

  return (
    <footer className="bg-[#060a12] border-t border-cyan-500/10 pt-14 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Логотип и описание */}
          <div className="lg:col-span-1">
            <button
              onClick={() => handleNav("/")}
              className="flex items-center gap-3 mb-4 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Icon name={logoIcon as "Wifi"} size={20} className="text-[#080c14]" fallback="Wifi" />
              </div>
              <div>
                <div className="font-bold text-white font-['Oswald'] tracking-wide">
                  {renderLogoName()}
                </div>
                <div className="text-xs text-gray-500">{logoSubtitle}</div>
              </div>
            </button>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">{description}</p>
            <div className="flex gap-3">
              {tgUrl && (
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                  title="Telegram"
                >
                  <Icon name="Send" size={16} />
                </a>
              )}
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

          {/* Услуги из CMS */}
          <div>
            <h4 className="text-white font-bold font-['Oswald'] mb-4 text-lg">Услуги</h4>
            <ul className="space-y-2.5">
              {activeServices.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="hover-nav-item text-gray-500 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="ChevronRight" size={12} className="text-cyan-500/50" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Навигация из CMS */}
          <div>
            <h4 className="text-white font-bold font-['Oswald'] mb-4 text-lg">Навигация</h4>
            <ul className="space-y-2.5">
              {cmsNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.href)}
                    className="hover-nav-item text-gray-500 hover:text-cyan-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="ChevronRight" size={12} className="text-cyan-500/50" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
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
                <span className="text-gray-400 text-sm">{workHours}</span>
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
          <p className="text-gray-600 text-sm">{copyright}</p>
          <div className="flex items-center gap-4">
            <p className="text-gray-700 text-xs">{legal}</p>
            <Link
              to="/privacy"
              className="hover-nav-item text-gray-600 hover:text-cyan-400 text-xs transition-colors whitespace-nowrap"
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
