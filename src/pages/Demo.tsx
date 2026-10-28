import quadraAerea from '../assets/quadra-aerea.png'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, LayoutDashboard, Lightbulb } from 'lucide-react'
import { Logo } from '../components/Icones'

const VISOES = [
  {
    to: '/',
    icone: Globe,
    titulo: 'Site do Quati',
    quem: 'O que o cliente vê',
    itens: [
      'Mapa das quadras para escolher onde jogar',
      'Calendário de cada quadra',
      'Grade de aulas e professores',
      'Torneios e inscrições',
      'Login e área do cliente (botão "Entrar")',
    ],
    cor: 'from-onda to-petroleo',
  },
  {
    to: '/admin',
    icone: LayoutDashboard,
    titulo: 'Painel do Quati',
    quem: 'Para o dono e a equipe',
    itens: ['Agenda do dia com quem reservou', 'Lista de reservas e pagamentos', 'Montar a grade de aulas', 'Torneios, professores e preços'],
    cor: 'from-petroleo-escuro to-petroleo-noite',
  },
]

export default function Demo() {
  return (
    <div className="min-h-dvh bg-petroleo-noite text-white relative overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-15" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <Logo className="size-24 mx-auto" />
          <p className="mt-5 text-sol font-semibold text-sm uppercase tracking-[0.25em]">Demonstração</p>
          <h1 className="titulo text-5xl sm:text-7xl mt-2">Site + painel do Quati Beach Sport</h1>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">Escolha por qual lado quer ver o sistema.</p>
        </div>

        <div className="mt-10 mx-auto max-w-4xl grid gap-5 md:grid-cols-2">
          {VISOES.map(({ to, icone: Icone, titulo, quem, itens, cor }) => (
            <Link key={to} to={to} className="group rounded-3xl bg-white text-petroleo-noite overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition">
              <div className={`bg-gradient-to-br ${cor} p-6 text-white`}>
                <Icone className="size-10" />
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/80">{quem}</p>
                <h2 className="titulo text-4xl">{titulo}</h2>
              </div>
              <ul className="p-6 space-y-2 text-sm flex-1">
                {itens.map((i) => (
                  <li key={i} className="flex gap-2"><span className="text-onda font-bold">✓</span> {i}</li>
                ))}
              </ul>
              <span className="mx-6 mb-6 inline-flex items-center justify-center gap-2 rounded-full bg-petroleo text-white py-3 font-bold group-hover:bg-sol group-hover:text-petroleo-noite transition">
                Abrir <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 mx-auto max-w-2xl flex gap-3 rounded-2xl bg-white/10 p-4 text-sm text-white/85">
          <Lightbulb className="size-5 text-sol shrink-0" />
          <span>
            Dica para a apresentação: abra o <b>site</b> e o <b>painel</b> em abas lado a lado. Uma reserva feita no site aparece no painel na mesma hora,
            e uma turma criada no painel aparece na grade do site.
          </span>
        </p>
      </div>
    </div>
  )
}
