import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import Calculator from "@/components/Calculator";
import VideoSurveillanceCalculator from "@/components/VideoSurveillanceCalculator";
import { CmsCalcOption, CmsCalcSlider, CmsVideoCameraType, CmsVideoEquipment, CmsVideoCalcSlider, CmsSettings } from "@/hooks/useCmsContent";

export type CalcModalType = "it" | "video";

interface CalculatorModalProps {
  open: boolean;
  type: CalcModalType;
  onClose: () => void;
  onContactClick: (source: string, payload?: string) => void;
  calcSettings?: Record<string, string>;
  calcOptions?: CmsCalcOption[];
  calcSliders?: CmsCalcSlider[];
  videoCameras?: CmsVideoCameraType[];
  videoEquipment?: CmsVideoEquipment[];
  videoCalcSliders?: CmsVideoCalcSlider[];
  settings?: CmsSettings;
}

export default function CalculatorModal({
  open, type, onClose, onContactClick,
  calcSettings, calcOptions, calcSliders,
  videoCameras, videoEquipment, videoCalcSliders, settings,
}: CalculatorModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const isIT = type === "it";

  const handleContact = (source: string, payload?: string) => {
    onContactClick(source, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — использует CSS-переменные темы */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(var(--neon-blue-rgb), 0.12)" }}
            >
              <Icon name={isIT ? "Calculator" : "Camera"} size={17} className="text-[var(--neon-blue)]" />
            </div>
            <div>
              <h2 className="font-bold font-['Oswald'] text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
                {isIT
                  ? (calcSettings?.title || "Калькулятор IT-аутсорсинга")
                  : (settings?.video_calc_title || "Калькулятор монтажа видеонаблюдения")
                }
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ориентировочный расчёт стоимости</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
            style={{ background: "var(--range-track)", color: "var(--text-muted)" }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5">
          {isIT ? (
            <Calculator
              calcSettings={calcSettings}
              calcOptions={calcOptions}
              calcSliders={calcSliders}
              onContactClick={handleContact}
              compact
            />
          ) : (
            <VideoSurveillanceCalculator
              videoCameras={videoCameras}
              videoEquipment={videoEquipment}
              videoCalcSliders={videoCalcSliders}
              settings={settings}
              onContactClick={handleContact}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}