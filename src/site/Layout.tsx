import { useLayoutEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { CalendarDays, CircleUser, MapPin, Menu, Phone, X } from 'lucide-react'
import { NEGOCIO } from '../config/estabelecimento'
import { useUsuario } from '../lib/auth'
import { useDB } from '../lib/banco'
import { doCliente } from '../lib/mensagens'
import { linkWhatsApp } from '../lib/whatsapp'
import type { Modulos } from '../tipos'
import { Bola, Botao, IconeInstagram, IconeWhatsApp, Logo } from '../ui'
import { statusFuncionamento } from '../features/reservas/agenda'

// itens do menu; os de módulos desligados no painel somem do site
const TODOS_NAV: { to: string; label: string; modulo?: keyof Modulos }[] = [
  { to: '/', label: 'Início' },
  { to: '/agendar', label: 'Agendar quadra' },
  { to: '/aulas', label: 'Aulas', modulo: 'aulas' },
  { to: '/professores', label: 'Professores', modulo: 'aulas' },
  { to: '/torneios', label: 'Torneios', modulo: 'torneios' },
  { to: '/bar', label: 'Bar', modulo: 'bar' },
  { to: '/eventos', label: 'Eventos', modulo: 'eventos' },
  { to: '/pacotes', label: 'Pacotes', modulo: 'pacotes' },
]

export default function Layout() {
  const { pathname, search } = useLocation()
  const tipoNavegacao = useNavigationType()
  const [menu, setMenu] = useState(false)
  const { db } = useDB()
  const { usuario } = useUsuario()
  // pacotes só aparece se o dono ligou o módulo E criou algum pacote
  const nav = TODOS_NAV.filter((n) => (!n.modulo || db.modulos[n.modulo]) && (n.modulo !== 'pacotes' || db.pacotes.length > 0))
  const conta = usuario ? { to: '/minha-conta', label: 'Minha conta' } : { to: '/entrar', label: 'Entrar' }
  const status = statusFuncionamento(db)

  // Ao trocar de página, volta ao topo. É um layout effect para rodar ANTES dos
  // efeitos das páginas (assim a página de agendamento pode descer até o calendário).
  // Filtros que trocam a URL com replace (dia, quadra…) não rolam.
  useLayoutEffect(() => {
    setMenu(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  useLayoutEffect(() => {
    if (tipoNavegacao === 'PUSH') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [search])

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="bg-sol text-marinho text-xs font-semibold">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${status.aberto ? 'bg-verde-quadra animate-pulse' : 'bg-red-500'}`} />
            {status.texto}
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {NEGOCIO.endereco}, {NEGOCIO.cidadeCurta}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-marinho/95 backdrop-blur text-white shadow-lg shadow-marinho/25 border-b-[3px] border-sol">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <Logo className="size-11 ring-2 ring-sol/60 transition group-hover:rotate-12" />
            <span className="titulo text-2xl leading-none">
              {NEGOCIO.marca[0]} <span className="text-sol">{NEGOCIO.marca[1]}</span>
              <span className="block text-[11px] font-sans font-semibold tracking-[0.3em] text-ceu uppercase">{NEGOCIO.marca[2]}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Principal">
            {nav.slice(1).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${isActive ? 'bg-sol text-marinho' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to={conta.to} className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/85 hover:text-white">
              <CircleUser className="size-5" /> {conta.label}
            </Link>
            <Botao para="/agendar" variante="destaque" redondo className="hidden sm:inline-flex">
              <CalendarDays className="size-4" /> Reservar
            </Botao>
            <button className="lg:hidden p-2 -mr-2" onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu}>
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="lg:hidden border-t border-white/10 px-4 pb-4 pt-2 anim-sobe" aria-label="Menu">
            {[...nav, conta].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) => `block py-3 text-lg font-semibold border-b border-white/10 ${isActive ? 'text-sol' : 'text-white'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Rodape nav={nav} />

      <a
        href={linkWhatsApp(doCliente.informacoes())}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-40 size-14 rounded-full bg-whatsapp text-white grid place-items-center shadow-xl shadow-black/25 hover:scale-105 transition"
      >
        <IconeWhatsApp className="size-7" />
      </a>
    </div>
  )
}

function Rodape({ nav }: { nav: { to: string; label: string }[] }) {
  return (
    <footer className="relative bg-marinho text-white/70 overflow-hidden">
      <div className="h-2 faixa-quadra" aria-hidden />
      <Bola className="absolute -right-10 bottom-10 size-48 opacity-[0.07] rotate-12" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 text-white">
            <Logo className="size-9" />
            <span className="titulo text-2xl">{NEGOCIO.nome}</span>
          </div>
          <p className="mt-3 text-sm">{NEGOCIO.descricao}</p>
          <p className="manuscrito mt-4 text-2xl text-sol -rotate-2">Nos vemos na areia!</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="titulo text-xl tracking-widest text-sol">Contato</p>
          <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" /> {NEGOCIO.endereco}<br />{NEGOCIO.cidade}</p>
          <a href={`tel:+${NEGOCIO.whatsapp}`} className="flex items-center gap-2 hover:text-white"><Phone className="size-4" /> {NEGOCIO.telefone}</a>
          <a href={NEGOCIO.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
            <IconeInstagram className="size-4" /> {NEGOCIO.instagramUser}
          </a>
        </div>
        <div className="text-sm space-y-2">
          <p className="titulo text-xl tracking-widest text-sol">Navegar</p>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="block hover:text-white">{n.label}</Link>
          ))}
          <Link to="/privacidade" className="block hover:text-white">Política de privacidade</Link>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-4 px-4 text-center text-xs text-white/50">
        Protótipo de demonstração · horários, professores e preços são ilustrativos ·{' '}
        <Link to="/demo" className="underline hover:text-white">Trocar de visão</Link> ·{' '}
        <Link to="/admin" className="underline hover:text-white">Painel do {NEGOCIO.apelido}</Link>
      </div>
    </footer>
  )
}
