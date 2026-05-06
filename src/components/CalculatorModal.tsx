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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0d1420] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Icon name={isIT ? "Calculator" : "Camera"} size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold font-['Oswald'] text-lg leading-tight">
                {isIT
                  ? (calcSettings?.title || "Калькулятор IT-аутсорсинга")
                  : (settings?.video_calc_title || "Калькулятор монтажа видеонаблюдения")
                }
              </h2>
              <p className="text-gray-500 text-xs">Ориентировочный расчёт стоимости</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={16} className="text-gray-400" />
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
