import Icon from "@/components/ui/icon";

export function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="btn-neon px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60">
      {saving ? (
        <><div className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />Сохранение...</>
      ) : (
        <><Icon name="Save" size={16} />Сохранить</>
      )}
    </button>
  );
}

// action — строка вида "save_settings", "save_service" и т.д.
// body — данные без поля action и password (они добавляются в Admin.tsx)
export type SaveFn = (action: string, body: object) => void;
