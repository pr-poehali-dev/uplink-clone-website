import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const MEDIA_API_URL = "https://functions.poehali.dev/7b8eeca6-27a6-4c07-b7c7-9d4679b0a5bc";

interface MediaFile {
  key: string;
  url: string;
  size: number;
  last_modified: string;
  name: string;
}

interface MediaTabProps {
  password: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch { return ""; }
}

export function MediaTab({ password }: MediaTabProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${MEDIA_API_URL}?password=${encodeURIComponent(password)}`);
      const data = await r.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      setFiles(data.files ?? []);
    } catch {
      setError("Ошибка загрузки файлов");
    }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const r = await fetch(MEDIA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upload", password, file_base64: base64, file_name: file.name, folder: "media" }),
      });
      const data = await r.json();
      if (data.error) { setUploadError(data.error); }
      else { await load(); }
    } catch {
      setUploadError("Ошибка при загрузке");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Удалить файл? Это действие нельзя отменить.")) return;
    setDeleting(key);
    try {
      await fetch(MEDIA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", password, key }),
      });
      setFiles(prev => prev.filter(f => f.key !== key));
    } catch {
      // ignore
    }
    setDeleting(null);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const isImage = (name: string) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white font-['Oswald']">Медиабиблиотека</h2>
          <p className="text-gray-400 text-sm mt-0.5">{files.length} файлов в папке media/</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
          >
            <Icon name="RefreshCw" size={14} className={loading ? "animate-spin" : ""} />
            Обновить
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            {uploading ? (
              <><div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />Загрузка...</>
            ) : (
              <><Icon name="Upload" size={14} />Загрузить файл</>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{uploadError}</div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="glass-card neon-border rounded-2xl p-4">
        <div className="flex items-start gap-3 text-sm">
          <Icon name="Info" size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-400">
            Загружайте изображения для использования на сайте. Нажмите на URL чтобы скопировать ссылку и вставить в любое поле редактирования.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Icon name="Image" size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Файлов пока нет. Загрузите первый!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map(file => (
            <div key={file.key} className="glass-card border border-white/10 rounded-xl overflow-hidden group relative">
              {/* Preview */}
              <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                {isImage(file.name) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <Icon name="FileText" size={32} />
                    <span className="text-xs">{file.name.split(".").pop()?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs text-white truncate font-medium" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmtSize(file.size)} · {fmtDate(file.last_modified)}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  onClick={() => handleCopy(file.url)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    copied === file.url ? "bg-green-500/30 text-green-400 border border-green-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                  }`}
                >
                  <Icon name={copied === file.url ? "Check" : "Copy"} size={12} />
                  {copied === file.url ? "Скопировано!" : "Копировать URL"}
                </button>
                <button
                  onClick={() => handleDelete(file.key)}
                  disabled={deleting === file.key}
                  className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Icon name={deleting === file.key ? "Loader" : "Trash2"} size={12} className={deleting === file.key ? "animate-spin" : ""} />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
