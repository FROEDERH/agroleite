import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Milk, HeartPulse, Wheat, Package,
  Wallet, TrendingUp, Building2, LogOut, Menu, X, Users, Pill
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IconeVaca from './IconeVaca';

const menuItems = [
  { to: '/', label: 'Animais em Lactação', icon: Pill },
  { to: '/animais', label: 'Animais', icon: IconeVaca },
  { to: '/producao-leite', label: 'Produção de Leite', icon: Milk },
  { to: '/reproducao', label: 'Reprodução', icon: HeartPulse },
  { to: '/venda-animais', label: 'Venda de Corte', icon: TrendingUp },
  { to: '/estoque-racao', label: 'Estoque de Ração', icon: Package },
  { to: '/estoque-feno', label: 'Estoque de Feno', icon: Wheat },
  { to: '/estoque-silagem', label: 'Estoque de Silagem', icon: Wheat },
  { to: '/despesas', label: 'Despesas', icon: Wallet },
  { to: '/receitas', label: 'Receitas', icon: TrendingUp },
  { to: '/financeiro', label: 'Painel Financeiro', icon: LayoutDashboard },
  { to: '/propriedade', label: 'Propriedade', icon: Building2 },
];

export default function Layout() {
  const { usuario, logout, ehAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const conteudoRef = useRef(null);

  // Só a área de conteúdo rola; ao trocar de tela, volta para o topo
  useEffect(() => {
    conteudoRef.current?.scrollTo(0, 0);
  }, [pathname]);

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen supports-[height:100dvh]:h-dvh overflow-hidden bg-leite-200">
      {/* Overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static z-40 h-full w-72 shrink-0 bg-verde-900 text-leite-100 flex flex-col
        transition-transform duration-300
        ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-verde-700/60">
          <div className="bg-verde-500 rounded-xl p-2">
            <Milk className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AgroLeite</h1>
            <p className="text-verde-300 text-xs">Controle Pecuário</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMenuAberto(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-verde-500 text-white shadow-sm'
                  : 'text-verde-100 hover:bg-verde-800'}
              `}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}

          {ehAdmin && (
            <NavLink
              to="/usuarios"
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-verde-500 text-white shadow-sm' : 'text-verde-100 hover:bg-verde-800'}
              `}
            >
              <Users className="w-[18px] h-[18px]" />
              Usuários
            </NavLink>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-verde-700/60">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-verde-500 flex items-center justify-center font-semibold text-sm">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-xs text-verde-300 truncate">{usuario?.papel === 'admin' ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
          <button
            onClick={sair}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-verde-100 hover:bg-verde-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 bg-verde-900 text-white px-4 py-3 shrink-0">
          <button onClick={() => setMenuAberto(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">AgroLeite</span>
        </header>

        <div ref={conteudoRef} className="flex-1 overflow-y-auto">
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
