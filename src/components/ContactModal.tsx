import { useState } from "react";
import Icon from "@/components/ui/icon";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  "IT-аутсорсинг",
  "Администрирование серверов",
  "Монтаж ЛВС / СКС",
  "Видеонаблюдение",
  "IT-аудит инфраструктуры",
  "Информационная безопасность",
  "Вызов IT-специалиста",
  "Другое",
];

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  const handleClose = () => {
    setSent(false);
    setForm({ name: "", phone: "", email: "", service: "", message: "" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg glass-card rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
        <div className="p-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <Icon name="X" size={22} />
          </button>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
                <Icon name="Check" size={40} className="text-[#080c14]" />
              </div>
              <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-3">Заявка отправлена!</h3>
              <p className="text-gray-400 mb-6">
                Наш менеджер свяжется с вами в ближайшие 15 минут в рабочее время.
                Или позвоните нам: <a href="tel:+78007079303" className="text-cyan-400 hover:underline">8 (800) 707-93-03</a>
              </p>
              <button onClick={handleClose} className="btn-neon px-8 py-3 rounded-xl font-semibold">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-1">Получить консультацию</h3>
                <p className="text-gray-400 text-sm">Заполните форму — перезвоним за 15 минут</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1.5">Ваше имя *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван Иванов"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1.5">Телефон *</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+7 (999) 000-00-00"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@company.ru"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Интересующая услуга</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d1421] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option value="">Выберите услугу...</option>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">Комментарий</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Опишите вашу задачу..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={18} />
                      Отправить заявку
                    </>
                  )}
                </button>

                <p className="text-gray-600 text-xs text-center">
                  Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
