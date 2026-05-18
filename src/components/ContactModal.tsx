import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useCmsContent } from "@/hooks/useCmsContent";

const SEND_EMAIL_URL = "https://functions.poehali.dev/97638ab8-62ea-4ada-8078-f5aa05a3f044";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  source?: string;
  prefillMessage?: string;
  prefillService?: string;
}

const services = [
  "IT-аутсорсинг",
  "Администрирование серверов",
  "Видеонаблюдение",
  "IT-аудит инфраструктуры",
  "IP-телефония (FreePBX)",
  "Вызов IT-специалиста",
  "Другое",
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);

  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ") " + d.slice(4, 7);
  if (d.length >= 7) result += "-" + d.slice(7, 9);
  if (d.length >= 9) result += "-" + d.slice(9, 11);
  return result;
}

function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11;
}

function isNameValid(name: string): boolean {
  return name.trim().length >= 2;
}

export default function ContactModal({ open, onClose, source = "Не указан", prefillMessage, prefillService }: ContactModalProps) {
  const { content } = useCmsContent();
  const phone = content?.settings?.phone ?? "8 (845) 239-77-38";
  const phoneHref = content?.settings?.phone_href ?? "tel:+78452397738";

  const [form, setForm] = useState({
    name: "",
    phone: "+7",
    email: "",
    service: prefillService || "",
    message: prefillMessage || "",
  });
  const [touched, setTouched] = useState({ name: false, phone: false });

  useEffect(() => {
    if (open) {
      setForm((p) => ({
        ...p,
        message: prefillMessage ?? p.message,
        service: prefillService ?? p.service,
      }));
      setTouched({ name: false, phone: false });
    }
  }, [open, prefillMessage, prefillService]);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.length < 2) {
      setForm({ ...form, phone: "+7" });
      return;
    }
    setForm({ ...form, phone: formatPhone(raw) });
  };

  const nameError = touched.name && !isNameValid(form.name);
  const phoneError = touched.phone && !isPhoneValid(form.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (!isNameValid(form.name) || !isPhoneValid(form.phone)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SEND_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Позвоните нам напрямую.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError("");
    setForm({ name: "", phone: "+7", email: "", service: "", message: "" });
    setTouched({ name: false, phone: false });
    onClose();
  };

  const inputBase = "w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-600 text-sm focus:outline-none transition-all";
  const inputNormal = `${inputBase} border-white/10 focus:border-cyan-500/50 focus:bg-cyan-500/5`;
  const inputError = `${inputBase} border-red-500/60 bg-red-500/5 focus:border-red-500/80`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg glass-card hover-card modal-anim rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
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
              <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-3">
                Заявка отправлена!
              </h3>
              <p className="text-gray-400 mb-6">
                Наш менеджер свяжется с вами в ближайшие 15 минут в рабочее время. Или позвоните нам:{" "}
                <a href={phoneHref} className="text-cyan-400 hover:underline">
                  {phone}
                </a>
              </p>
              <button onClick={handleClose} className="btn-neon hover-btn px-8 py-3 rounded-xl font-semibold">
                Закрыть
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white font-['Oswald'] mb-1">
                  Получить консультацию
                </h3>
                <p className="text-gray-400 text-sm">
                  Заполните форму — перезвоним за 15 минут
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1.5">
                      Ваше имя *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      placeholder="Иван Иванов"
                      className={nameError ? inputError : inputNormal}
                    />
                    {nameError && (
                      <p className="text-red-400 text-xs mt-1">Введите имя (минимум 2 символа)</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1.5">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                      placeholder="+7 (999) 000-00-00"
                      className={phoneError ? inputError : inputNormal}
                    />
                    {phoneError && (
                      <p className="text-red-400 text-xs mt-1">Введите полный номер (+7 и 10 цифр)</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@company.ru"
                    className={inputNormal}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Интересующая услуга
                  </label>
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
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Комментарий
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Опишите вашу задачу..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon hover-btn w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
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
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <a href="/privacy" className="text-cyan-500/70 hover:underline">
                    политикой конфиденциальности
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}