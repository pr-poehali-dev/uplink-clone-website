import Icon from "@/components/ui/icon";

export type Tab =
  | "dashboard" | "leads" | "settings" | "sections" | "services" | "plans"
  | "calculator" | "projects" | "team" | "faq" | "secrets" | "password"
  | "whyus" | "quickorder" | "pricing" | "nav" | "videocalc" | "pages"
  | "media" | "design" | "users" | "history" | "seo"
  | "home" | "privacy";

export interface NavGroup {
  label: string;
  items: { id: Tab; label: string; icon: string; badge?: number }[];
}

interface AdminSidebarProps {
  tab: Tab;
  collapsed: boolean;
  navGroups: NavGroup[];
  onTabChange: (tab: Tab) => void;
}

export function AdminSidebar({ tab, collapsed, navGroups, onTabChange }: AdminSidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? "w-12" : "w-56"
      } flex-shrink-0 bg-[#0a0f1a] border-r border-white/10 overflow-y-auto transition-all duration-200 flex flex-col`}
    >
      <nav className="p-2 flex-1">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {!collapsed && (
              <div className="px-3 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 relative ${
                  tab === item.id
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                    : "text-gray-400 hover:text-white border border-transparent hover:bg-white/5"
                }`}
              >
                <Icon
                  name={item.icon as Parameters<typeof Icon>[0]["name"]}
                  size={15}
                  className="flex-shrink-0"
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            {!collapsed && <div className="h-px bg-white/5 mt-2" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}