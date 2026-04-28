import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { CmsSettings, CmsService } from "@/hooks/useCmsContent";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  onContactClick: () => void;
  settings?: CmsSettings;
  services?: CmsService[];
}

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Главная", href: "/" },
  { label: "О компании", href: "/#about" },
  { label: "Проекты", href: "/#projects" },
  { label: "Цены", href: "/#pricing" },
  { label: "Контакты", href: "/#contacts" },
];

export default function Header({ onContactClick, settings, services }: HeaderProps) {
  const phone = settings?.phone ?? "8 (986) 986-01-36";
  const phoneHref = settings?.phone_href ?? "tel:+79869860136";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const themeToggleEnabled = settings?.theme_toggle_enabled !== "false";
  const activeServices = (services || []).filter((s) => s.is_active && s.slug);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    setMobileServicesOpen(false);
    if (href.startsWith("/#")) {
      const anchor = href.slice(2);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 50);
      } else {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080c14]/95 backdrop-blur-md shadow-lg shadow-cyan-500/10 border-b border-cyan-500/10"
          : "bg-transparent"
      }`}
      itemScope
      itemType="https://schema.org/Organization"
    >
      <meta itemProp="name" content="ИТК Аплинк-IT" />
      <meta itemProp="url" content="https://uplink-it.ru" />
      <meta itemProp="description" content="IT-аутсорсинг и обслуживание IT-инфраструктуры для бизнеса в Саратове" />
      <link itemProp="sameAs" href="https://uplink-it.ru" />
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <button
          onClick={() => handleNav("/")}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all duration-300">
            <Icon name="Wifi" size={22} className="text-[#080c14]" />
          </div>
          <div className="text-left">
            <div className="font-bold text-lg leading-none text-white font-['Oswald'] tracking-wide">
              ИТК <span className="text-cyan-400">Аплинк-IT</span>
            </div>
            <div className="text-xs text-gray-400 leading-none mt-0.5">
              IT-услуги для вашего бизнеса
            </div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => handleNav("/")}
            className="px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors duration-200 rounded-lg hover:bg-cyan-500/5 font-medium"
          >
            Главная
          </button>

          {/* Услуги — выпадающее меню */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setServicesOpen((p) => !p)}
              className={`px-4 py-2 text-sm transition-colors duration-200 rounded-lg hover:bg-cyan-500/5 font-medium flex items-center gap-1 ${
                servicesOpen || location.pathname.startsWith("/services")
                  ? "text-cyan-400"
                  : "text-gray-300 hover:text-cyan-400"
              }`}
            >
              Услуги
              <Icon
                name="ChevronDown"
                size={14}
                className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 glass-card neon-border rounded-2xl p-2 shadow-2xl shadow-cyan-500/10 z-50">
                <Link
                  to="/services"
                  onClick={() => setServicesOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-cyan-500/10 transition-colors group border-b border-cyan-500/10 mb-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Icon name="LayoutGrid" size={16} className="text-[#080c14]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      Все услуги
                    </div>
                    <div className="text-xs text-gray-500">Полный каталог направлений</div>
                  </div>
                </Link>
                {activeServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cyan-500/10 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.accent || "from-cyan-400 to-blue-500"} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={s.icon as "Monitor"} size={16} className="text-[#080c14]" fallback="Settings" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {s.title}
                      </div>
                      {s.short_desc && (
                        <div className="text-xs text-gray-500 truncate">{s.short_desc}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors duration-200 rounded-lg hover:bg-cyan-500/5 font-medium"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {themeToggleEnabled && (
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20"
            >
              <Icon name={theme === "dark" ? "Sun" : "Moon"} size={18} />
            </button>
          )}
          <a
            href={phoneHref}
            className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium"
            itemProp="telephone"
          >
            <Icon name="Phone" size={16} className="text-cyan-400" />
            {phone}
          </a>
          <button
            onClick={onContactClick}
            className="btn-neon px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Связаться
          </button>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {themeToggleEnabled && (
            <button
              onClick={toggleTheme}
              className="text-gray-300 hover:text-cyan-400 transition-colors p-2"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              <Icon name={theme === "dark" ? "Sun" : "Moon"} size={20} />
            </button>
          )}
          <a
            href={phoneHref}
            className="flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200"
          >
            <Icon name="Phone" size={16} />
            Позвонить
          </a>
          <button
            className="text-gray-300 hover:text-cyan-400 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={26} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[#080c14]/98 backdrop-blur-md border-t border-cyan-500/10 px-4 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <button
            onClick={() => handleNav("/")}
            className="block w-full text-left py-3 text-gray-300 hover:text-cyan-400 border-b border-gray-800/50 transition-colors text-sm font-medium"
          >
            Главная
          </button>

          {/* Mobile: Услуги аккордеон */}
          <div className="border-b border-gray-800/50">
            <button
              onClick={() => setMobileServicesOpen((p) => !p)}
              className="w-full flex items-center justify-between py-3 text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              Услуги
              <Icon name="ChevronDown" size={16} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileServicesOpen && (
              <div className="pb-2 pl-3 space-y-1">
                <Link
                  to="/services"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-cyan-400 font-semibold"
                >
                  → Все услуги
                </Link>
                {activeServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-sm text-gray-400 hover:text-cyan-400"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l.href)}
              className="block w-full text-left py-3 text-gray-300 hover:text-cyan-400 border-b border-gray-800/50 transition-colors text-sm font-medium"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <a
              href={phoneHref}
              className="flex items-center gap-2 text-cyan-400 text-sm font-medium"
            >
              <Icon name="Phone" size={16} />
              {phone}
            </a>
            <button
              onClick={() => {
                setMenuOpen(false);
                onContactClick();
              }}
              className="btn-neon px-5 py-2.5 rounded-lg text-sm font-semibold mt-1"
            >
              Связаться с нами
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
