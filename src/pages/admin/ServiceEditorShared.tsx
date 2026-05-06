import { useState } from "react";
import Icon from "@/components/ui/icon";
import { AiAssistantButton } from "@/components/AiAssistant";

export function AiBtn({ token, fieldHint, context, onResult }: { token: string; fieldHint: string; context: string; onResult: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!token) return null;
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-400 transition-colors"
      >
        <Icon name="Sparkles" size={10} />ИИ
      </button>
    );
  }
  return (
    <AiAssistantButton
      token={token}
      fieldHint={fieldHint}
      context={context}
      onResult={(t) => { onResult(t); setOpen(false); }}
    />
  );
}

export function AiField({ label, token, fieldHint, context, onResult, children }: {
  label: string;
  token: string;
  fieldHint: string;
  context: string;
  onResult: (t: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-gray-400 text-xs">{label}</label>
        {token && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-400 transition-colors"
          >
            <Icon name="Sparkles" size={10} />ИИ
          </button>
        )}
      </div>
      {children}
      {open && (
        <AiAssistantButton
          token={token}
          fieldHint={fieldHint}
          context={context}
          onResult={(t) => { onResult(t); setOpen(false); }}
        />
      )}
    </div>
  );
}

export function Field({ label, children, placeholder: _ }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}
