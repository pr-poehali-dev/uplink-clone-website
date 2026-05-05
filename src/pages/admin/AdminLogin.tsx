import Icon from "@/components/ui/icon";

interface AdminLoginProps {
  loginStep: "username" | "password";
  loginUsername: string;
  loginPassword: string;
  setupNewPassword: string;
  setupConfirm: string;
  setupError: string;
  setupRequired: boolean;
  authLoading: boolean;
  authError: string;
  onSetLoginUsername: (v: string) => void;
  onSetLoginPassword: (v: string) => void;
  onSetSetupNewPassword: (v: string) => void;
  onSetSetupConfirm: (v: string) => void;
  onUsernameStep: (e: React.FormEvent) => void;
  onLogin: (e: React.FormEvent) => void;
  onSetupPassword: (e: React.FormEvent) => void;
  onBackToUsername: () => void;
}

function LogoBlock() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <Icon name="Settings" size={16} className="text-[#080c14]" />
        </div>
        <span className="text-white font-bold font-['Oswald'] text-xl">Панель управления</span>
      </div>
      <p className="text-gray-500 text-sm">ИТК Аплинк-IT</p>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all";

export function AdminLogin({
  loginStep,
  loginUsername,
  loginPassword,
  setupNewPassword,
  setupConfirm,
  setupError,
  setupRequired,
  authLoading,
  authError,
  onSetLoginUsername,
  onSetLoginPassword,
  onSetSetupNewPassword,
  onSetSetupConfirm,
  onUsernameStep,
  onLogin,
  onSetupPassword,
  onBackToUsername,
}: AdminLoginProps) {
  // Экран установки пароля (первый вход)
  if (setupRequired) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <LogoBlock />
          <div className="glass-card neon-border rounded-2xl p-8 space-y-2 mb-4">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Icon name="KeyRound" size={16} />
              <span className="font-semibold text-sm">Первый вход — установите пароль</span>
            </div>
            <p className="text-gray-500 text-xs">Придумайте надёжный пароль для входа в админку</p>
          </div>
          <form onSubmit={onSetupPassword} className="glass-card neon-border rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Новый пароль</label>
              <input
                type="password" value={setupNewPassword} autoFocus
                onChange={(e) => onSetSetupNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Повторите пароль</label>
              <input
                type="password" value={setupConfirm}
                onChange={(e) => onSetSetupConfirm(e.target.value)}
                placeholder="Повторите пароль"
                className={inputCls}
              />
            </div>
            {setupError && <p className="text-red-400 text-sm">{setupError}</p>}
            <button type="submit" disabled={authLoading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
              {authLoading ? "Сохраняю..." : "Установить пароль и войти"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Шаг 1: ввод логина
  if (loginStep === "username") {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <LogoBlock />
          <form onSubmit={onUsernameStep} className="glass-card neon-border rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Логин</label>
              <input
                type="text" value={loginUsername} autoFocus
                onChange={(e) => onSetLoginUsername(e.target.value)}
                placeholder="owner"
                className={inputCls}
              />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
              {authLoading ? "Проверяю..." : "Продолжить"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Шаг 2: ввод пароля
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <LogoBlock />
        <form onSubmit={onLogin} className="glass-card neon-border rounded-2xl p-8 space-y-4">
          <button
            type="button"
            onClick={onBackToUsername}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors mb-1"
          >
            <Icon name="ArrowLeft" size={14} />
            {loginUsername}
          </button>
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Пароль</label>
            <input
              type="password" value={loginPassword} autoFocus
              onChange={(e) => onSetLoginPassword(e.target.value)}
              placeholder="Введите пароль"
              className={inputCls}
            />
          </div>
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          <button type="submit" disabled={authLoading} className="btn-neon w-full py-3 rounded-xl font-semibold disabled:opacity-50">
            {authLoading ? "Вхожу..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
