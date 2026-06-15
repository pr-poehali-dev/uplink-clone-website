import Icon from "@/components/ui/icon";

interface ChatSettings {
  welcome_text: string;
  services: string;
  header_title: string;
  header_subtitle: string;
  inactivity_minutes: string;
}

interface ChatSettingsTabProps {
  settings: ChatSettings;
  loadingSettings: boolean;
  savingSettings: boolean;
  settingsSaved: boolean;
  webhookStatus: string | null;
  registeringWebhook: boolean;
  onSettingsChange: (s: ChatSettings) => void;
  onSaveSettings: () => void;
  onRegisterWebhook: () => void;
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
};

export function ChatSettingsTab({
  settings,
  loadingSettings,
  savingSettings,
  settingsSaved,
  webhookStatus,
  registeringWebhook,
  onSettingsChange,
  onSaveSettings,
  onRegisterWebhook,
}: ChatSettingsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl flex flex-col gap-6">

        {/* Вебхук MAX */}
        <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Icon name="Zap" size={16} /> Подключение MAX
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Регистрирует вебхук в боте MAX. Без этого ответы из MAX не доставляются клиентам.
            Нужно выполнить один раз после смены URL функции.
          </p>
          <button
            onClick={onRegisterWebhook}
            disabled={registeringWebhook}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "rgba(6,182,212,0.2)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.3)" }}
          >
            <Icon name="Zap" size={14} />
            {registeringWebhook ? "Регистрация..." : "Зарегистрировать вебхук"}
          </button>
          {webhookStatus && (
            <p className={`text-sm mt-3 px-3 py-2 rounded-lg ${webhookStatus.startsWith("✅") ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}>
              {webhookStatus}
            </p>
          )}
        </div>

        {/* Текст виджета */}
        {loadingSettings ? (
          <p className="text-gray-400 text-sm">Загрузка настроек...</p>
        ) : (
          <>
            <div className="rounded-2xl p-5 border border-white/10 bg-white/5 flex flex-col gap-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Icon name="MessageCircle" size={16} /> Виджет чата
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Заголовок</label>
                <input
                  value={settings.header_title}
                  onChange={e => onSettingsChange({ ...settings, header_title: e.target.value })}
                  className="rounded-xl px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Подзаголовок</label>
                <input
                  value={settings.header_subtitle}
                  onChange={e => onSettingsChange({ ...settings, header_subtitle: e.target.value })}
                  className="rounded-xl px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Приветственное сообщение</label>
                <textarea
                  rows={3}
                  value={settings.welcome_text}
                  onChange={e => onSettingsChange({ ...settings, welcome_text: e.target.value })}
                  className="rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  Список услуг <span className="text-gray-600">(каждая с новой строки или через запятую)</span>
                </label>
                <textarea
                  rows={6}
                  value={settings.services.split(",").join("\n")}
                  onChange={e => onSettingsChange({
                    ...settings,
                    services: e.target.value.split("\n").map(v => v.trim()).filter(Boolean).join(","),
                  })}
                  className="rounded-xl px-3 py-2 text-sm outline-none resize-none font-mono"
                  style={inputStyle}
                  placeholder={"IT-аутсорсинг\nВидеонаблюдение\nДругой вопрос"}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">
                  Сброс чата при бездействии <span className="text-gray-600">(минут)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={settings.inactivity_minutes}
                  onChange={e => onSettingsChange({ ...settings, inactivity_minutes: e.target.value })}
                  className="rounded-xl px-3 py-2 text-sm outline-none w-32"
                  style={inputStyle}
                />
                <p className="text-xs text-gray-600">
                  Если клиент молчит дольше этого времени — чат на сайте сбрасывается к форме обращения.
                </p>
              </div>
            </div>

            <button
              onClick={onSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 w-fit"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Icon name={settingsSaved ? "Check" : "Save"} size={15} />
              {settingsSaved ? "Сохранено!" : savingSettings ? "Сохранение..." : "Сохранить настройки"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}