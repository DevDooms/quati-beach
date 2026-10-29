// Grade de horários de uma quadra num dia (site)
import { Bell } from 'lucide-react'
import { modalidadePorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { fmtFaixa } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { primeiroNome } from '../../lib/formatos'
import { acharProfessor } from '../aulas/regras'
import { precoDoHorario, type Slot } from './agenda'

interface Props {
  dia: Date
  slots: Slot[]
  onReservar: (hora: number) => void
  onAvisar: (hora: number) => void
}

export function HorariosDaQuadra({ dia, slots, onReservar, onAvisar }: Props) {
  const { db } = useDB()
  if (slots.length === 0) return <p className="mt-4 rounded-2xl bg-white p-6 text-center text-petroleo-noite/60">Não há mais horários hoje. Escolha outro dia.</p>
  return (
    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((s) => (
        <Celula
          key={s.hora}
          slot={s}
          preco={precoDoHorario(db, dia, s.hora)}
          professor={s.aula ? primeiroNome(acharProfessor(db, s.aula.professorId).nome) : ''}
          onReservar={() => onReservar(s.hora)}
          onAvisar={() => onAvisar(s.hora)}
        />
      ))}
    </div>
  )
}

export function Legenda() {
  const itens = [
    ['bg-white border border-onda', 'Livre'],
    ['bg-sol', 'Sua reserva'],
    ['bg-onda-claro', 'Aula'],
    ['bg-petroleo/10', 'Ocupado'],
  ]
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-petroleo-noite/70">
      {itens.map(([cor, nome]) => (
        <span key={nome} className="inline-flex items-center gap-1.5">
          <span className={`size-3 rounded ${cor}`} /> {nome}
        </span>
      ))}
    </div>
  )
}

const BASE = 'w-full h-20 rounded-2xl text-center px-2 flex flex-col items-center justify-center gap-0.5'
const LISTRADO = 'bg-[repeating-linear-gradient(135deg,#0f5c6314_0_6px,transparent_6px_12px)]'

function Celula({ slot, preco, professor, onReservar, onAvisar }: { slot: Slot; preco: number; professor: string; onReservar: () => void; onAvisar: () => void }) {
  const hora = <span className="titulo text-2xl leading-none">{fmtFaixa(slot.hora).replace(' – ', '–')}</span>
  switch (slot.status) {
    case 'livre':
      return (
        <button onClick={onReservar} className={`${BASE} group bg-white border-2 border-onda/40 text-petroleo hover:bg-onda hover:text-white hover:border-onda transition`}>
          {hora}
          <span className="text-xs font-semibold text-emerald-700 group-hover:text-white">Livre · {fmtReais(preco)}</span>
        </button>
      )
    case 'minha':
      return (
        <div className={`${BASE} bg-sol text-petroleo-noite`}>
          {hora}
          <span className="text-xs font-bold">Sua reserva</span>
        </div>
      )
    case 'aula':
      return (
        <div className={`${BASE} bg-onda-claro text-petroleo`}>
          {hora}
          <span className="text-[11px] font-semibold truncate max-w-full">
            Aula de {modalidadePorId(slot.aula!.modalidade).curto} · {professor}
          </span>
        </div>
      )
    case 'reservado':
      return (
        <button onClick={onAvisar} title="Entrar na lista de espera" className={`${BASE} ${LISTRADO} text-petroleo-noite/40 hover:text-petroleo hover:ring-2 hover:ring-petroleo/20`}>
          {hora}
          <span className="text-xs inline-flex items-center gap-1">
            {slot.reserva?.fixoId ? 'Horário fixo' : 'Ocupado'} · <Bell className="size-3" /> avise-me
          </span>
        </button>
      )
    default:
      return null
  }
}
