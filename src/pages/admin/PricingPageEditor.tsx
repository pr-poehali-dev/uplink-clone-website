import { SaveButton, SaveFn } from "./AdminShared";
import Icon from "@/components/ui/icon";
import { cls } from "./pricing-shared";

interface PageSettings {
  pricing_page_title: string;
  pricing_page_city: string;
  pricing_page_badge: string;
  pricing_page_subtitle: string;
  pricing_info_text: string;
  pricing_cta_text: string;
}

interface Props {
  pageSettings: PageSettings;
  saving: boolean;
  onChangeSettings: (settings: PageSettings) => void;
  onSave: () => void;
}

export function PricingPageEditor({ pageSettings, saving, onChangeSettings, onSave }: Props) {
  const set = (key: keyof PageSettings, value: string) =>
    onChangeSettings({ ...pageSettings, [key]: value });

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-cyan-400" />
          Hero-блок страницы
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={cls.label}>Бейдж над заголовком</label>
            <input
              value={pageSettings.pricing_page_badge}
              onChange={(e) => set("pricing_page_badge", e.target.value)}
              className={cls.input}
            />
          </div>
          <div>
            <label className={cls.label}>Заголовок страницы</label>
            <input
              value={pageSettings.pricing_page_title}
              onChange={(e) => set("pricing_page_title", e.target.value)}
              className={cls.input}
            />
          </div>
          <div>
            <label className={cls.label}>Город (выделяется цветом)</label>
            <input
              value={pageSettings.pricing_page_city}
              onChange={(e) => set("pricing_page_city", e.target.value)}
              placeholder="в Воронеже"
              className={cls.input}
            />
          </div>
          <div className="col-span-2">
            <label className={cls.label}>Подзаголовок</label>
            <textarea
              value={pageSettings.pricing_page_subtitle}
              onChange={(e) => set("pricing_page_subtitle", e.target.value)}
              rows={2}
              className={cls.textarea}
            />
          </div>
        </div>
      </div>

      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="Info" size={16} className="text-cyan-400" />
          Блок «Как формируется цена»
        </h3>
        <div>
          <label className={cls.label}>Текст блока</label>
          <textarea
            value={pageSettings.pricing_info_text}
            onChange={(e) => set("pricing_info_text", e.target.value)}
            rows={3}
            className={cls.textarea}
          />
        </div>
      </div>

      <div className="glass-card neon-border rounded-2xl p-5 space-y-4">
        <h3 className="text-white font-bold font-['Oswald'] text-base flex items-center gap-2">
          <Icon name="MousePointerClick" size={16} className="text-cyan-400" />
          CTA в боковой панели
        </h3>
        <div>
          <label className={cls.label}>Текст над кнопкой</label>
          <textarea
            value={pageSettings.pricing_cta_text}
            onChange={(e) => set("pricing_cta_text", e.target.value)}
            rows={2}
            className={cls.textarea}
          />
        </div>
      </div>

      <SaveButton onClick={onSave} saving={saving} />
    </div>
  );
}
