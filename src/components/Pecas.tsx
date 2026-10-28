import { useEffect, useRef, type ReactNode } from 'react'
import { Clock, MapPin, Users, X } from 'lucide-react'
import { modalidadePorId, quadraPorId, type Aula, type ModalidadeId } from '../data/mock'
import { fmtFaixa } from '../lib/agenda'
import { acharProfessor, useDB } from '../lib/store'

export function SeloModalidade({ id, pequeno = false }: { id: ModalidadeId; pequeno?: boolean }) {
  const m = modalidadePorId(id)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide whitespace-nowrap ${
        pequeno ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${m.cor} ${id === 'volei' ? 'text-petroleo-noite' : 'text-white'}`}
    >
      {m.curto}
    </span>
  )
}

export function Avatar({ professorId, tamanho = 'size-10' }: { professorId: string; tamanho?: string }) {
  const { db } = useDB()
  const p = acharProfessor(db, professorId)
  return (
    <span className={`${tamanho} shrink-0 rounded-full bg-gradient-to-br ${p.cor} text-white grid place-items-center font-bold`}>
      {p.iniciais}
    </span>
  )
}

export function CabecalhoPagina({ sobre, titulo, children }: { sobre: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-petroleo text-white relative overflow-hidden">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-sol/20 blur-2xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-12">
        <p className="text-sol font-semibold text-sm uppercase tracking-[0.2em]">{sobre}</p>
        <h1 className="titulo text-5xl sm:text-6xl mt-2">{titulo}</h1>
        {children && <div className="mt-3 max-w-2xl text-white/80">{children}</div>}
      </div>
    </section>
  )
}

export function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition ${
        ativo ? 'bg-petroleo text-white border-petroleo' : 'bg-white text-petroleo-noite/80 border-petroleo/15 hover:border-petroleo/40'
      }`}
    >
      {children}
    </button>
  )
}

// Janela modal: folha de baixo no celular, caixa centralizada no desktop
export function Janela({
  onFechar,
  titulo,
  etiqueta,
  children,
  largura = 'sm:max-w-md',
}: {
  onFechar: () => void
  titulo?: ReactNode
  etiqueta?: ReactNode
  children: ReactNode
  largura?: string
}) {
  const fechar = useRef(onFechar)
  fechar.current = onFechar

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && fechar.current()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-petroleo-noite/60 backdrop-blur-sm" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal
        className={`anim-sobe w-full ${largura} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {titulo && (
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {etiqueta}
                <h2 className="titulo text-4xl text-petroleo mt-1">{titulo}</h2>
              </div>
              <button onClick={onFechar} className="p-1 -mr-1 text-petroleo-noite/50 hover:text-petroleo-noite" aria-label="Fechar">
                <X />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export function Detalhes({ itens, rodape }: { itens: { rotulo: string; valor: ReactNode }[]; rodape?: ReactNode }) {
  return (
    <dl className="rounded-2xl bg-areia-claro p-4 text-sm space-y-1.5">
      {itens.map((d) => (
        <div key={d.rotulo} className="flex justify-between gap-4">
          <dt className="text-petroleo-noite/60">{d.rotulo}</dt>
          <dd className="font-semibold text-right first-letter:uppercase">{d.valor}</dd>
        </div>
      ))}
      {rodape}
    </dl>
  )
}

export function CartaoAula({ aula, onParticipar, compacto = false }: { aula: Aula; onParticipar: () => void; compacto?: boolean }) {
  const { db } = useDB()
  const prof = acharProfessor(db, aula.professorId)
  const restantes = aula.vagas - aula.alunos.length
  const lotada = restantes <= 0
  const corVagas = lotada ? 'text-red-600' : restantes <= 1 ? 'text-laranja' : 'text-emerald-700'

  if (compacto) {
    return (
      <button
        onClick={onParticipar}
        className="w-full text-left rounded-xl bg-white border border-petroleo/10 p-2.5 hover:border-onda hover:shadow-md transition"
      >
        <SeloModalidade id={aula.modalidade} pequeno />
        <p className="mt-1.5 text-xs font-bold leading-tight">{aula.nivel}</p>
        <p className="text-[11px] text-petroleo-noite/60 leading-tight">
          {prof.nome.split(' ')[0]} · {quadraPorId(aula.quadraId).nome.replace('Quadra ', 'Q')}
        </p>
        <p className={`mt-1 text-[11px] font-semibold ${corVagas}`}>{lotada ? 'Lotada' : `${restantes} vaga${restantes > 1 ? 's' : ''}`}</p>
      </button>
    )
  }

  return (
    <article className="rounded-2xl bg-white border border-petroleo/10 p-4 grid grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-3 items-center shadow-sm">
      <div className="text-center w-16 shrink-0">
        <p className="titulo text-4xl text-petroleo">{String(aula.hora).padStart(2, '0')}h</p>
        <p className="text-[11px] text-petroleo-noite/50">1 hora</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <SeloModalidade id={aula.modalidade} pequeno />
          <span className="text-xs font-semibold text-petroleo-noite/70">{aula.nivel}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Avatar professorId={aula.professorId} tamanho="size-7 text-[11px]" />
          <p className="font-semibold truncate">Prof. {prof.nome}</p>
        </div>
        <p className="mt-1.5 text-xs text-petroleo-noite/60 flex flex-wrap gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{quadraPorId(aula.quadraId).nome}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{fmtFaixa(aula.hora)}</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${corVagas}`}>
            <Users className="size-3.5" />
            {lotada ? 'Turma lotada' : `${restantes} de ${aula.vagas} vagas`}
          </span>
        </p>
      </div>
      <button
        onClick={onParticipar}
        className={`col-span-2 lg:col-span-1 rounded-full px-4 py-2.5 text-sm font-bold ${
          lotada ? 'bg-petroleo/10 text-petroleo' : 'bg-sol text-petroleo-noite hover:brightness-105'
        }`}
      >
        {lotada ? 'Lista de espera' : 'Participar'}
      </button>
    </article>
  )
}
