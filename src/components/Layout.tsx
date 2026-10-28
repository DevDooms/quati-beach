import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarDays, CircleUser, MapPin, Menu, Phone, X } from 'lucide-react'
import { NEGOCIO } from '../data/mock'
import { linkWhatsApp, statusFuncionamento } from '../lib/agenda'
import { useDB, useLoginDemo } from '../lib/store'
import { IconeInstagram, IconeWhatsApp, Logo } from './Icones'

const NAV = [
  { to: '/', label: 'Início' },
  { to: '/agendar', label: 'Agendar quadra' },
  { to: '/aulas', label: 'Aulas' },
  { to: '/professores', label: 'Professores' },
  { to: '/torneios', label: 'Torneios' },
]

export default function Layout() {
  const { pathname, search } = useLocation()
  const [menu, setMenu] = useState(false)
  const { db } = useDB()
  const { logado } = useLoginDemo('cliente')
  const status = statusFuncionamento(db)
  const conta = logado ? { to: '/minha-conta', label: 'Minha conta' } : { to: '/entrar', label: 'Entrar' }

  useEffect(() => {
    setMenu(false)
    window.scrollTo({ top: 0 })
  }, [pathname, search])

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="bg-petroleo-noite text-white/80 text-xs">
        <div className="mx-auto max-w-6xl px-4 h-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${status.aberto ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {status.texto}
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {NEGOCIO.endereco}, Embu-Guaçu
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-petroleo text-white shadow-lg shadow-petroleo-noite/20">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo className="size-10" />
            <span className="titulo text-2xl leading-none">
              Quati <span className="text-sol">Beach</span>
              <span className="block text-[11px] font-sans font-semibold tracking-[0.3em] text-onda-claro/80">SPORT</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.slice(1).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={conta.to}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white/85 hover:text-white"
            >
              <CircleUser className="size-5" /> {conta.label}
            </Link>
            <Link
              to="/agendar"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-sol text-petroleo-noite px-4 py-2 text-sm font-bold hover:brightness-105"
            >
              <CalendarDays className="size-4" /> Reservar
            </Link>
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMenu((m) => !m)}
              aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 anim-sobe">
            {[...NAV, conta].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  `block py-3 text-lg font-semibold border-b border-white/10 ${isActive ? 'text-sol' : 'text-white'}`
                }
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

      <footer className="bg-petroleo-noite text-white/70">
        <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 text-white">
              <Logo className="size-9" />
              <span className="titulo text-2xl">Quati Beach Sport</span>
            </div>
            <p className="mt-3 text-sm">Futevôlei, beach tennis e vôlei de praia em Embu-Guaçu.</p>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-white">Contato</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" /> {NEGOCIO.endereco}<br />{NEGOCIO.cidade}</p>
            <a href={`tel:+${NEGOCIO.whatsapp}`} className="flex items-center gap-2 hover:text-white"><Phone className="size-4" /> {NEGOCIO.telefone}</a>
            <a href={NEGOCIO.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <IconeInstagram className="size-4" /> {NEGOCIO.instagramUser}
            </a>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-semibold text-white">Navegar</p>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="block hover:text-white">{n.label}</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 py-4 px-4 text-center text-xs text-white/50">
          Protótipo de demonstração · horários, professores e preços são ilustrativos ·{' '}
          <Link to="/demo" className="underline hover:text-white">Trocar de visão</Link> ·{' '}
          <Link to="/admin" className="underline hover:text-white">Painel do Quati</Link>
        </div>
      </footer>

      <a
        href={linkWhatsApp('Olá! Vim pelo site e gostaria de mais informações.')}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-40 size-14 rounded-full bg-[#25d366] text-white grid place-items-center shadow-xl shadow-black/25 hover:scale-105 transition"
      >
        <IconeWhatsApp className="size-7" />
      </a>
    </div>
  )
}
