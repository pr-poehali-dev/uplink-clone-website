import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  onContactClick: () => void;
}

const navLinks = [
  { label: "Главная", href: "#home" },
  { label: "Услуги", href: "#services" },
  { label: "О компании", href: "#about" },
  { label: "Проекты", href: "#projects" },
  { label: "Цены", href: "#pricing" },
  { label: "Контакты", href: "#contacts" },
];

export default function Header({ onContactClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080c14]/95 backdrop-blur-md shadow-lg shadow-cyan-500/10 border-b border-cyan-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <a
          href="#home"
          onClick={() => handleNav("#home")}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all duration-300">
            <Icon name="Wifi" size={22} className="text-[#080c14]" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none text-white font-['Oswald'] tracking-wide">
              ИТК <span className="text-cyan-400">Аплинк-IT</span>
            </div>
            <div className="text-xs text-gray-400 leading-none mt-0.5">
              IT-услуги для вашего бизнеса
            </div>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
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
          <a
            href="tel:+78007079303"
            className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            <Icon name="Phone" size={16} className="text-cyan-400" />8 (986)
            986-01-36
          </a>
          <button
            onClick={onContactClick}
            className="btn-neon px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Связаться
          </button>
        </div>

        <button
          className="lg:hidden text-gray-300 hover:text-cyan-400 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "X" : "Menu"} size={26} />
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-[#080c14]/98 backdrop-blur-md border-t border-cyan-500/10 px-4 py-4">
          {navLinks.map((l) => (
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
              href="tel:+78007079303"
              className="flex items-center gap-2 text-cyan-400 text-sm font-medium"
            >
              <Icon name="Phone" size={16} />8 (986) 986-01-36
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
