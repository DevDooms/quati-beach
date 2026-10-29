import type { ReactNode } from 'react'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { modalidadePorId } from '../config/estabelecimento'
import type { ModalidadeId, Origem } from '../tipos'

// Selo genérico (pílula). As variações abaixo só escolhem cor e texto.
export function Selo({ children, className, pequeno = true }: { children: ReactNode; className: string; pequeno?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap ${pequeno ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} ${className}`}
    >
      {children}
    </span>
  )
}

export function SeloModalidade({ id, pequeno = false }: { id: ModalidadeId; pequeno?: boolean }) {
  const m = modalidadePorId(id)
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold whitespace-nowrap uppercase tracking-wide ${pequeno ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${m.cor} ${
        id === 'volei' ? 'text-petroleo-noite' : 'text-white'
      }`}
    >
      {m.curto}
    </span>
  )
}

export function SeloPago({ pago, onClick }: { pago: boolean; onClick?: () => void }) {
  const selo = (
    <Selo className={pago ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
      {pago ? <CircleCheck className="size-3" /> : <CircleDashed className="size-3" />}
      {pago ? 'Pago' : 'Pendente'}
    </Selo>
  )
  if (!onClick) return selo
  return (
    <button onClick={onClick} className="rounded-full hover:ring-2 hover:ring-petroleo/20" title="Alternar pagamento">
      {selo}
    </button>
  )
}

const CORES_ORIGEM: Record<Origem, string> = {
  Site: 'bg-onda-claro text-petroleo',
  WhatsApp: 'bg-whatsapp/15 text-whatsapp-escuro',
  Balcão: 'bg-petroleo/10 text-petroleo-noite/70',
}

export const SeloOrigem = ({ origem }: { origem: Origem }) => <Selo className={CORES_ORIGEM[origem]}>{origem}</Selo>

// Quantas pessoas esperam este horário vagar
export const SeloFila = ({ quantidade }: { quantidade: number }) =>
  quantidade > 0 ? (
    <Selo className="bg-laranja/15 text-laranja font-extrabold">
      <span title="Na lista de espera">+{quantidade} fila</span>
    </Selo>
  ) : null
