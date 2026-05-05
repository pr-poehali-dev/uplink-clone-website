import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const AI_API_URL = "https://functions.poehali.dev/36130e85-398c-433c-b81f-a2bc9055bb59";

interface AiAssistantProps {
  token: string;
  fieldHint?: string;
  context?: string;
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function AiAssistantButton({ token, fieldHint, context, onResult, placeholder, className = "" }: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ prompt: prompt.trim(), field_hint: fieldHint, context }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Ошибка ИИ"); return; }
      onResult(data.result);
      setOpen(false);
      setPrompt("");
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
    if (e.key === "Escape") setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        title="ИИ-ассистент"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 ${className}`}
      >
        <Icon name="Sparkles" size={12} />
        ИИ
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
      <div className="flex items-center gap-2">
        <Icon name="Sparkles" size={14} className="text-purple-400 flex-shrink-0" />
        <span className="text-purple-400 text-xs font-medium">ИИ-ассистент</span>
        {fieldHint && <span className="text-gray-600 text-xs">· {fieldHint}</span>}
        <button onClick={() => setOpen(false)} className="ml-auto text-gray-600 hover:text-gray-400 transition-colors">
          <Icon name="X" size={12} />
        </button>
      </div>
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Опиши что нужно написать... (Ctrl+Enter — отправить)"}
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <><div className="w-3 h-3 border border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />Генерирую...</>
          ) : (
            <><Icon name="Sparkles" size={12} />Написать</>
          )}
        </button>
        <span className="text-gray-700 text-xs">Ctrl+Enter</span>
      </div>
    </div>
  );
}

// Обёртка для поля ввода — показывает кнопку ИИ рядом с label
interface AiFieldWrapperProps {
  label: string;
  token: string;
  fieldHint?: string;
  context?: string;
  onResult: (text: string) => void;
  children: React.ReactNode;
}

export function AiFieldWrapper({ label, token, fieldHint, context, onResult, children }: AiFieldWrapperProps) {
  const [showAi, setShowAi] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-gray-400 text-xs">{label}</label>
        {token && (
          <button
            type="button"
            onClick={() => setShowAi(!showAi)}
            className={`flex items-center gap-1 text-xs transition-all ${showAi ? "text-purple-400" : "text-gray-600 hover:text-purple-400"}`}
          >
            <Icon name="Sparkles" size={10} />
            ИИ
          </button>
        )}
      </div>
      {children}
      {showAi && (
        <AiAssistantButton
          token={token}
          fieldHint={fieldHint}
          context={context}
          onResult={(text) => { onResult(text); setShowAi(false); }}
        />
      )}
    </div>
  );
}
