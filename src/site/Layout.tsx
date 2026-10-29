import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { CalendarDays, CircleUser, MapPin, Menu, Phone, X } from 'lucide-react'
import { NEGOCIO } from '../config/estabelecimento'
import { useUsuario } from '../lib/auth'
import { useDB } from '../lib/banco'
import { doCliente } from '../lib/mensagens'
import { linkWhatsApp } from '../lib/whatsapp'
import type { Modulos } from '../tipos'
import { Botao, IconeInstagram, IconeWhatsApp, Logo } from '../ui'
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
  const fecharMenu = useCallback(() => setMenu(false), [])
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
        <div className="conteudo h-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${status.aberto ? 'bg-verde-quadra animate-pulse' : 'bg-red-500'}`} />
            {status.texto}
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {NEGOCIO.endereco}, {NEGOCIO.cidadeCurta}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-marinho text-white border-b-[3px] border-sol">
        <div className="conteudo h-16 flex items-center justify-between gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setMenu(true)} aria-label="Abrir menu" aria-expanded={menu}>
            <Menu />
          </button>
          <Link to="/" className="group flex items-center gap-2.5 shrink-0 mr-auto lg:mr-0">
            <Logo className="size-11" />
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
                className={({ isActive }) => `px-3 py-2 text-sm font-semibold whitespace-nowrap transition border-b-2 ${isActive ? 'border-sol text-sol' : 'border-transparent text-white/80 hover:text-white'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to={conta.to} className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/85 hover:text-white">
              <CircleUser className="size-5" /> {conta.label}
            </Link>
            <Botao para="/agendar" variante="destaque" redondo>
              <CalendarDays className="size-4" /> Reservar
            </Botao>
          </div>
        </div>
      </header>

      {menu && <MenuLateral nav={nav} conta={conta} aberto={status.aberto} textoStatus={status.texto} onFechar={fecharMenu} />}

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

type ItemNav = { to: string; label: string }

// Gaveta do menu no celular: entra pela esquerda, fecha no fundo escuro ou no Esc
function MenuLateral({ nav, conta, aberto, textoStatus, onFechar }: { nav: ItemNav[]; conta: ItemNav; aberto: boolean; textoStatus: string; onFechar: () => void }) {
  useEffect(() => {
    const fechaNoEsc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', fechaNoEsc)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', fechaNoEsc)
    }
  }, [onFechar])

  return (
    <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-marinho/60 anim-aparece" onClick={onFechar} />
      <aside className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-marinho text-white flex flex-col anim-gaveta">
        <div className="h-1.5 faixa-quadra shrink-0" aria-hidden />
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <span className="flex items-center gap-2.5">
            <Logo className="size-10" />
            <span className="titulo text-2xl leading-none">
              {NEGOCIO.marca[0]} <span className="text-sol">{NEGOCIO.marca[1]}</span>
            </span>
          </span>
          <button className="p-2 -mr-2 text-white/80 hover:text-white" onClick={onFechar} aria-label="Fechar menu">
            <X />
          </button>
        </div>
        <p className="mx-5 flex items-center gap-2 text-xs font-semibold text-white/70">
          <span className={`size-2 rounded-full ${aberto ? 'bg-verde-quadra' : 'bg-red-500'}`} /> {textoStatus}
        </p>

        <nav className="mt-4 flex-1 overflow-y-auto" aria-label="Menu">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              onClick={onFechar}
              className={({ isActive }) =>
                `block border-l-4 px-5 py-2.5 titulo text-3xl transition ${isActive ? 'border-sol text-sol bg-white/5' : 'border-transparent text-white hover:bg-white/5'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-5 py-5 space-y-4">
          <Link to={conta.to} onClick={onFechar} className="flex items-center gap-2 font-semibold text-white/85 hover:text-white">
            <CircleUser className="size-5" /> {conta.label}
          </Link>
          <div className="flex gap-2">
            <Botao href={linkWhatsApp(doCliente.informacoes())} variante="whatsapp" redondo className="flex-1">
              <IconeWhatsApp /> WhatsApp
            </Botao>
            <Botao href={NEGOCIO.instagram} variante="contorno-claro" redondo aria-label="Instagram">
              <IconeInstagram />
            </Botao>
          </div>
          <p className="flex items-start gap-2 text-xs text-white/60">
            <MapPin className="size-4 shrink-0" /> {NEGOCIO.endereco}, {NEGOCIO.cidadeCurta}
          </p>
        </div>
      </aside>
    </div>
  )
}

function Rodape({ nav }: { nav: ItemNav[] }) {
  return (
    <footer className="relative bg-marinho text-white/70 overflow-hidden">
      <div className="h-2 faixa-quadra" aria-hidden />
      <div className="relative conteudo py-12 grid gap-8 sm:grid-cols-3">
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
