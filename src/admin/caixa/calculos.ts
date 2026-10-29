// Fechamento de caixa: o que entrou num dia, por forma de pagamento.
import { dataISO } from '../../lib/datas'
import type { DB, DataISO, FormaRecebida } from '../../tipos'

export interface Entrada {
  id: string
  descricao: string
  nome: string
  valor: number
  forma: FormaRecebida
  em: string
}

const FORMAS: FormaRecebida[] = ['Dinheiro', 'Pix', 'Cartão']

export function entradasDoDia(db: DB, data: DataISO): Entrada[] {
  const doDia = (iso?: string) => !!iso && dataISO(new Date(iso)) === data
  // reservas pagas nesse dia (as pagas com créditos já entraram quando o pacote foi vendido)
  const reservas = db.reservas
    .filter((r) => r.pago && doDia(r.pagoEm) && r.formaPagamento && r.formaPagamento !== 'Crédito' && r.formaPagamento !== 'Balcão')
    .map((r) => ({ id: r.id, descricao: 'Reserva de quadra', nome: r.nome, valor: r.valor, forma: r.formaPagamento as FormaRecebida, em: r.pagoEm! }))
  const pacotes = db.creditos
    .filter((m) => m.valor && m.forma && doDia(m.em))
    .map((m) => ({ id: m.id, descricao: m.descricao, nome: m.nome, valor: m.valor!, forma: m.forma!, em: m.em }))
  return [...reservas, ...pacotes].sort((a, b) => a.em.localeCompare(b.em))
}

export function resumoDoCaixa(entradas: Entrada[]) {
  const porForma = FORMAS.map((forma) => ({ forma, total: entradas.filter((e) => e.forma === forma).reduce((s, e) => s + e.valor, 0) }))
  return { porForma, total: entradas.reduce((s, e) => s + e.valor, 0) }
}

// Reservas do dia que ainda não foram pagas (para cobrar no balcão)
export const pendentesDoDia = (db: DB, data: DataISO) => db.reservas.filter((r) => r.data === data && !r.pago && !r.falta).sort((a, b) => a.hora - b.hora)
