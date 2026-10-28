import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarRange, ExternalLink, GraduationCap, Inbox, LayoutDashboard, ListChecks, LogOut, Repeat, Settings, Trophy, Users } from 'lucide-react'
import { chaveData } from '../lib/agenda'
import { useDB, useLoginDemo } from '../lib/store'
import { Logo } from '../components/Icones'
import AdminLogin from './Login'

const NAV = [
  { to: '/admin', label: 'Visão geral', icone: LayoutDashboard, end: true },
  { to: '/admin/agenda', label: 'Agenda', icone: CalendarRange },
  { to: '/admin/reservas', label: 'Reservas', icone: ListChecks },
  { to: '/admin/mensalistas', label: 'Mensalistas', icone: Repeat },
  { to: '/admin/solicitacoes', label: 'Solicitações', icone: Inbox },
  { to: '/admin/aulas', label: 'Grade de aulas', icone: GraduationCap },
  { to: '/admin/torneios', label: 'Torneios', icone: Trophy },
  { to: '/admin/professores', label: 'Professores', icone: Users },
  { to: '/admin/config', label: 'Configurações', icone: Settings },
]

export default function AdminLayout() {
  const { logado, sair } = useLoginDemo('admin')
  const { db } = useDB()
  // aviso de pendências ao lado de "Solicitações"
  const pendentes = db.eventos.filter((e) => !e.respondido).length + db.espera.filter((e) => e.data >= chaveData(new Date())).length
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  if (!logado) return <AdminLogin />

  return (
    <div className="min-h-dvh bg-[#eef3f3] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Lateral (desktop) / barra superior (celular) */}
      <aside className="bg-petroleo-noite text-white lg:sticky lg:top-0 lg:h-dvh flex flex-col z-30">
        <div className="flex items-center justify-between gap-3 px-4 h-16 lg:h-20 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2.5">
            <Logo className="size-10" />
            <span className="leading-tight">
              <span className="titulo text-xl block">Painel Quati</span>
              <span className="text-[11px] text-white/50">Beach Sport</span>
            </span>
          </Link>
          <button onClick={sair} className="lg:hidden p-2 text-white/70" aria-label="Sair">
            <LogOut className="size-5" />
          </button>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto sem-scrollbar px-3 py-2 lg:py-4 lg:flex-1">
          {NAV.map(({ to, label, icone: Icone, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `shrink-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-sol text-petroleo-noite' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icone className="size-5" /> {label}
              {to === '/admin/solicitacoes' && pendentes > 0 && (
                <span className="ml-auto rounded-full bg-laranja text-white text-[11px] font-extrabold px-1.5 min-w-5 text-center">{pendentes}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-3 border-t border-white/10 space-y-1">
          <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            <ExternalLink className="size-5" /> Ver site
          </Link>
          <button onClick={sair} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-5" /> Sair
          </button>
          <div className="flex items-center gap-3 px-3 pt-3">
            <span className="size-9 rounded-full bg-onda grid place-items-center font-bold text-sm">AD</span>
            <span className="text-xs leading-tight">
              <b className="block">Administrador</b>
              <span className="text-white/50">Quati Beach Sport</span>
            </span>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 sm:px-8 py-6 sm:py-8">
        <Outlet />
        <p className="mt-10 text-center text-xs text-petroleo-noite/40">
          Painel de demonstração · <Link to="/demo" className="underline">Trocar de visão</Link>
        </p>
      </main>
    </div>
  )
}
