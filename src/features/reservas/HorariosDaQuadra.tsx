// Grade de horários de uma quadra num dia (site)
import { Bell, Lock, Tag } from 'lucide-react'
import { modalidadePorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { fmtFaixa } from '../../lib/datas'
import { fmtReais, primeiroNome } from '../../lib/formatos'
import type { Aula, Hora } from '../../tipos'
import { acharProfessor, estaLotada } from '../aulas/regras'
import { precoDoHorario, promocaoNoHorario, type Slot } from './agenda'

interface Props {
  dia: Date
  slots: Slot[]
  onReservar: (hora: Hora) => void
  onAvisar: (hora: Hora) => void
  onAula?: (aula: Aula) => void // sem ele, a aula aparece só como horário ocupado
}

export function HorariosDaQuadra({ dia, slots, onReservar, onAvisar, onAula }: Props) {
  const { db } = useDB()
  if (slots.length === 0) return <p className="mt-4 rounded-2xl bg-white p-6 text-center text-marinho/70">Não há mais horários hoje. Escolha outro dia.</p>
  return (
    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((s) => (
        <Celula
          key={s.hora}
          slot={s}
          preco={precoDoHorario(db, dia, s.hora)}
          promocao={promocaoNoHorario(db, dia, s.hora)?.nome}
          professor={s.aula ? primeiroNome(acharProfessor(db, s.aula.professorId).nome) : ''}
          onReservar={() => onReservar(s.hora)}
          onAvisar={() => onAvisar(s.hora)}
          onAula={onAula && s.aula ? () => onAula(s.aula!) : undefined}
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
    ['bg-mar/10', 'Ocupado'],
  ]
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-marinho/70">
      {itens.map(([cor, nome]) => (
        <span key={nome} className="inline-flex items-center gap-1.5">
          <span className={`size-3 rounded ${cor}`} /> {nome}
        </span>
      ))}
    </div>
  )
}

const BASE = 'w-full h-20 rounded-2xl text-center px-2 flex flex-col items-center justify-center gap-0.5'
const LISTRADO = 'bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-mar)_8%,transparent)_0_6px,transparent_6px_12px)]'

interface PropsCelula {
  slot: Slot
  preco: number
  promocao?: string
  professor: string
  onReservar: () => void
  onAvisar: () => void
  onAula?: () => void
}

function Celula({ slot, preco, promocao, professor, onReservar, onAvisar, onAula }: PropsCelula) {
  const hora = <span className="titulo text-2xl leading-none">{fmtFaixa(slot.hora, slot.duracao).replace(' – ', '–')}</span>
  switch (slot.status) {
    case 'livre':
      return (
        <button
          onClick={onReservar}
          title={promocao ? `Promoção: ${promocao}` : undefined}
          className={`${BASE} group relative bg-white border-2 text-mar hover:bg-onda hover:text-white hover:border-onda transition ${promocao ? 'border-laranja' : 'border-onda/40'}`}
        >
          {promocao && (
            <span className="absolute -top-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-laranja text-white px-1.5 text-[10px] font-extrabold">
              <Tag className="size-2.5" /> PROMO
            </span>
          )}
          {hora}
          <span className="text-xs font-semibold text-emerald-700 group-hover:text-white">Livre · {fmtReais(preco)}</span>
        </button>
      )
    case 'minha':
      return (
        <div className={`${BASE} bg-sol text-marinho`}>
          {hora}
          <span className="text-xs font-bold">Sua reserva</span>
        </div>
      )
    case 'aula': {
      const aula = slot.aula!
      const descricao = (
        <span className="text-[11px] font-semibold truncate max-w-full">
          Aula de {modalidadePorId(aula.modalidade).curto} · {professor}
        </span>
      )
      if (!onAula) {
        return (
          <div className={`${BASE} bg-onda-claro text-mar`}>
            {hora}
            {descricao}
          </div>
        )
      }
      return (
        <button onClick={onAula} title="Ver a turma e participar" className={`${BASE} group bg-onda-claro text-mar hover:bg-mar hover:text-white transition`}>
          {hora}
          {descricao}
          <span className="text-[11px] font-bold text-onda group-hover:text-sol">
            {estaLotada(aula) ? 'Turma cheia · lista de espera' : 'Participar'}
          </span>
        </button>
      )
    }
    case 'bloqueado':
      return (
        <div className={`${BASE} ${LISTRADO} text-marinho/70`} title={slot.bloqueio?.motivo}>
          {hora}
          <span className="text-xs inline-flex items-center gap-1"><Lock className="size-3" /> Indisponível</span>
        </div>
      )
    case 'reservado':
      return (
        <button onClick={onAvisar} title="Entrar na lista de espera" className={`${BASE} ${LISTRADO} text-marinho/70 hover:text-mar hover:ring-2 hover:ring-mar/20`}>
          {hora}
          <span className="text-xs inline-flex items-center gap-1">
            Ocupado · <Bell className="size-3" /> avise-me
          </span>
        </button>
      )
    default:
      return null
  }
}
