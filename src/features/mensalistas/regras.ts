// Horários fixos (mensalistas): o mesmo dia, hora e quadra toda semana.
import { addDays, startOfDay } from 'date-fns'
import { novoId } from '../../lib/aleatorio'
import { dataDeISO, dataISO } from '../../lib/datas'
import type { DB, FormaPagamento, Mensalista, Origem, Reserva } from '../../tipos'

// semanas à frente que um horário fixo ocupa na agenda
export const SEMANAS_FIXO = 8

// Reservas que um mensalista ocupa a partir de `de`, pulando horários já tomados
export function reservasDoFixo(db: Pick<DB, 'reservas' | 'aulas'>, m: Mensalista, de: Date, semanas = SEMANAS_FIXO, origem: Origem = 'Site'): Reserva[] {
  const novas: Reserva[] = []
  let d = startOfDay(de)
  while (d.getDay() !== m.diaSemana) d = addDays(d, 1)
  for (let i = 0; i < semanas; i++, d = addDays(d, 7)) {
    const data = dataISO(d)
    const ocupado =
      db.reservas.some((r) => r.data === data && r.hora === m.hora && r.quadraId === m.quadraId) ||
      db.aulas.some((a) => a.diaSemana === m.diaSemana && a.hora === m.hora && a.quadraId === m.quadraId)
    if (ocupado) continue
    novas.push({ id: novoId(), data, hora: m.hora, quadraId: m.quadraId, nome: m.nome, telefone: m.telefone, origem, pago: false, fixoId: m.id })
  }
  return novas
}

export interface DadosFixo extends Omit<Mensalista, 'id'> {
  origem: Origem
  // pagamento da primeira semana (feito na hora da reserva pelo site)
  primeira?: { pago: boolean; formaPagamento?: FormaPagamento }
  minha?: boolean
}

export function criarHorarioFixo(db: DB, dados: DadosFixo): DB {
  const { origem, primeira, minha, ...resto } = dados
  const m: Mensalista = { ...resto, nome: resto.nome.trim(), id: novoId() }
  const agora = new Date().toISOString()
  const reservas = reservasDoFixo(db, m, dataDeISO(m.desde), SEMANAS_FIXO, origem).map((r, i) => ({
    ...r,
    minha,
    criadaEm: agora,
    ...(i === 0 && primeira ? primeira : {}),
  }))
  return { ...db, mensalistas: [...db.mensalistas, m], reservas: [...db.reservas, ...reservas] }
}

export const conflitoDeFixo = (db: DB, m: Pick<Mensalista, 'diaSemana' | 'hora' | 'quadraId'>) =>
  db.mensalistas.some((x) => x.diaSemana === m.diaSemana && x.hora === m.hora && x.quadraId === m.quadraId)

export const reservasFuturasDoFixo = (db: DB, m: Mensalista, agora = new Date()) =>
  db.reservas.filter((r) => r.fixoId === m.id && r.data >= dataISO(agora)).sort((a, b) => a.data.localeCompare(b.data))

// Mais SEMANAS_FIXO semanas a partir da última reservada
export function renovarFixo(db: DB, m: Mensalista, agora = new Date()): DB {
  const ultima = reservasFuturasDoFixo(db, m, agora).at(-1)
  const de = ultima ? addDays(dataDeISO(ultima.data), 1) : agora
  return { ...db, reservas: [...db.reservas, ...reservasDoFixo(db, m, de)] }
}

// Encerra o fixo e libera as próximas semanas (as passadas ficam no histórico)
export function encerrarFixo(db: DB, m: Mensalista, agora = new Date()): DB {
  const hoje = dataISO(agora)
  return {
    ...db,
    mensalistas: db.mensalistas.filter((x) => x.id !== m.id),
    reservas: db.reservas.filter((r) => !(r.fixoId === m.id && r.data >= hoje)),
  }
}
