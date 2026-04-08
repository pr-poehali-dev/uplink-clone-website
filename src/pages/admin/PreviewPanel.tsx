import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Device = "desktop" | "tablet" | "mobile";

const DEVICES: { id: Device; label: string; icon: string; width: string; frameWidth: number }[] = [
  { id: "desktop", label: "Десктоп", icon: "Monitor",    width: "100%",  frameWidth: 0 },
  { id: "tablet",  label: "Планшет", icon: "Tablet",     width: "768px", frameWidth: 768 },
  { id: "mobile",  label: "Телефон", icon: "Smartphone", width: "390px", frameWidth: 390 },
];

export function PreviewPanel({ onClose }: { onClose: () => void }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const current = DEVICES.find((d) => d.id === device)!;

  return (
    <div className="fixed inset-0 z-50 bg-[#060a12] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0f1a] flex-shrink-0">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          <Icon name="ChevronLeft" size={16} />
          Назад
        </button>

        <div className="w-px h-4 bg-white/10" />

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              title={d.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === d.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon name={d.icon as "Monitor"} size={14} />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>

        {/* Width badge */}
        <span className="text-gray-600 text-xs font-mono">
          {device === "desktop" ? "100%" : `${current.frameWidth}px`}
        </span>

        <div className="flex-1" />

        {/* Reload */}
        <button
          onClick={reload}
          className="text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
          title="Обновить"
        >
          <Icon name="RefreshCw" size={15} />
        </button>

        {/* Open in new tab */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
          title="Открыть в новой вкладке"
        >
          <Icon name="ExternalLink" size={15} />
        </a>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#060a12] flex items-start justify-center py-4 px-4">
        <div
          className="relative transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50"
          style={{
            width: device === "desktop" ? "100%" : `${current.frameWidth}px`,
            minHeight: "calc(100vh - 80px)",
            maxWidth: "100%",
          }}
        >
          {/* Mobile notch decoration */}
          {device === "mobile" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#060a12] rounded-b-xl z-10" />
          )}

          <iframe
            key={reloadKey}
            ref={iframeRef}
            src="/"
            title="Предпросмотр сайта"
            className="w-full border-0"
            style={{ height: "calc(100vh - 100px)", minHeight: 600 }}
          />
        </div>
      </div>
    </div>
  );
}
