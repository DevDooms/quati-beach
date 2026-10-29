import { Link } from 'react-router-dom'
import { ArrowRight, Globe, LayoutDashboard } from 'lucide-react'
import quadraAerea from '../../assets/quadra-aerea.jpg'
import { NEGOCIO } from '../../config/estabelecimento'
import { Logo } from '../../ui'

export default function PaginaDemo() {
  const visoes = [
    {
      to: '/',
      icone: Globe,
      titulo: `Site do ${NEGOCIO.apelido}`,
      quem: 'O que o cliente vê',
      itens: ['Mapa das quadras para escolher onde jogar', 'Calendário de cada quadra, com Pix ou cartão', 'Remarcar e cancelar sozinho, dentro das regras', 'Aulas, torneios, bar e eventos', 'Área do cliente (botão "Entrar")'],
      cor: 'from-onda to-mar',
    },
    {
      to: '/admin',
      icone: LayoutDashboard,
      titulo: `Painel do ${NEGOCIO.apelido}`,
      quem: 'Para o dono e a equipe',
      itens: ['Agenda do dia e bloqueio de horários', 'Caixa do dia para fechar sem planilha', 'Relatório do mês com horários mais cheios', 'Aulas, torneios, preços e feriados'],
      cor: 'from-mar-fundo to-marinho',
    },
  ]

  return (
    <div className="min-h-dvh bg-marinho text-white relative overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-15" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <Logo className="size-24 mx-auto text-4xl" />
          <p className="mt-5 text-sol font-semibold text-sm uppercase tracking-[0.25em]">Demonstração</p>
          <h1 className="titulo text-5xl sm:text-7xl mt-2">Site + painel do {NEGOCIO.nome}</h1>
          <p className="mt-3 text-white/75 max-w-xl mx-auto">Escolha por qual lado quer ver o sistema.</p>
        </div>

        <div className="mt-10 mx-auto max-w-4xl grid gap-5 md:grid-cols-2">
          {visoes.map(({ to, icone: Icone, titulo, quem, itens, cor }) => (
            <Link key={to} to={to} className="group rounded-3xl bg-white text-marinho overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition">
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
              <span className="mx-6 mb-6 inline-flex items-center justify-center gap-2 rounded-full bg-mar text-white py-3 font-bold group-hover:bg-sol group-hover:text-marinho transition">
                Abrir <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
