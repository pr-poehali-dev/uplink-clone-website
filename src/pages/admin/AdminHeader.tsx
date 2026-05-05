import Icon from "@/components/ui/icon";
import { AdminUser } from "@/hooks/useAdminAuth";

interface AdminHeaderProps {
  saveMsg: string;
  sidebarCollapsed: boolean;
  user: AdminUser | null;
  onToggleSidebar: () => void;
  onOpenPreview: () => void;
  onLogout: () => void;
}

export function AdminHeader({
  saveMsg,
  sidebarCollapsed,
  user,
  onToggleSidebar,
  onOpenPreview,
  onLogout,
}: AdminHeaderProps) {
  void sidebarCollapsed;

  return (
    <header className="border-b border-white/10 bg-[#0a0f1a] flex-shrink-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <Icon name="Menu" size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Icon name="Settings" size={14} className="text-[#080c14]" />
            </div>
            <span className="font-bold font-['Oswald'] text-base">Панель управления</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveMsg && (
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                saveMsg === "Сохранено!"
                  ? "bg-green-500/20 text-green-400 border border-green-500/20"
                  : "bg-red-500/20 text-red-400 border border-red-500/20"
              }`}
            >
              {saveMsg === "Сохранено!" ? "✓ " : "✗ "}{saveMsg}
            </span>
          )}
          <button
            onClick={onOpenPreview}
            className="text-gray-400 hover:text-cyan-400 text-sm flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
          >
            <Icon name="Monitor" size={14} />
            <span className="hidden sm:inline">Предпросмотр</span>
          </button>
          <a
            href="/"
            target="_blank"
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Icon name="ExternalLink" size={14} />
            <span className="hidden sm:inline">Сайт</span>
          </a>
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-white font-medium">
                {user?.display_name || user?.username}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role === "owner"
                  ? "Владелец"
                  : user?.role === "editor"
                  ? "Редактор"
                  : "Просмотр"}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              title="Выйти"
            >
              <Icon name="LogOut" size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
