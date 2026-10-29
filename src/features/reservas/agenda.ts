// Como fica a agenda das quadras: horários do dia, preço e situação de cada horário.
import { QUADRAS } from '../../config/estabelecimento'
import { dataISO, diaDaSemana, proximosDias } from '../../lib/datas'
import type { Aula, DB, DiaSemana, QuadraId, Reserva } from '../../tipos'
import { ehDoCliente } from './regras'

export type SlotStatus = 'livre' | 'reservado' | 'minha' | 'aula' | 'passado'

export interface Slot {
  hora: number
  quadraId: QuadraId
  status: SlotStatus
  aula?: Aula
  reserva?: Reserva
}

export function horasDoDia(db: DB, d: Date): number[] {
  const [abre, fecha] = db.funcionamento[diaDaSemana(d)]
  return Array.from({ length: Math.max(0, fecha - abre) }, (_, i) => abre + i)
}

// Horários que ainda dá para reservar (hoje, só os que não começaram)
export function horasReservaveis(db: DB, d: Date, agora = new Date()) {
  const ehHoje = dataISO(d) === dataISO(agora)
  return horasDoDia(db, d).filter((h) => !ehHoje || h > agora.getHours())
}

export function precoDoHorario(db: DB, d: Date, hora: number) {
  const fimDeSemana = d.getDay() === 0 || d.getDay() === 6
  return fimDeSemana || hora >= db.precos.inicioPico ? db.precos.pico : db.precos.normal
}

export function statusFuncionamento(db: DB, agora = new Date()) {
  const [abre, fecha] = db.funcionamento[diaDaSemana(agora)]
  const h = agora.getHours()
  const aberto = h >= abre && h < fecha
  return { aberto, abre, fecha, texto: aberto ? `Aberto agora · fecha às ${fecha}h` : `Fechado · abre às ${abre}h` }
}

export function aulaNoHorario(db: Pick<DB, 'aulas'>, diaSemana: DiaSemana, hora: number, quadraId: QuadraId) {
  return db.aulas.find((a) => a.diaSemana === diaSemana && a.hora === hora && a.quadraId === quadraId)
}

export function reservaNoHorario(db: Pick<DB, 'reservas'>, data: string, hora: number, quadraId: QuadraId) {
  return db.reservas.find((r) => r.data === data && r.hora === hora && r.quadraId === quadraId)
}

// `agora` define o que já passou; o painel passa new Date(0) para ver tudo
export function slotDe(db: DB, d: Date, hora: number, quadraId: QuadraId, agora = new Date()): Slot {
  const data = dataISO(d)
  const reserva = reservaNoHorario(db, data, hora, quadraId)
  if (reserva) return { hora, quadraId, status: ehDoCliente(reserva) ? 'minha' : 'reservado', reserva }
  const hoje = dataISO(agora)
  if (data < hoje || (data === hoje && hora <= agora.getHours())) return { hora, quadraId, status: 'passado' }
  const aula = aulaNoHorario(db, diaDaSemana(d), hora, quadraId)
  if (aula) return { hora, quadraId, status: 'aula', aula }
  return { hora, quadraId, status: 'livre' }
}

export const estaLivre = (db: DB, d: Date, hora: number, quadraId: QuadraId, agora = new Date()) =>
  horasDoDia(db, d).includes(hora) && slotDe(db, d, hora, quadraId, agora).status === 'livre'

export function montarGrade(db: DB, d: Date, agora = new Date()): Slot[][] {
  return horasDoDia(db, d).map((hora) => QUADRAS.map((q) => slotDe(db, d, hora, q.id, agora)))
}

export function livresNoDia(db: DB, d: Date, quadraId: QuadraId) {
  return horasDoDia(db, d).filter((h) => slotDe(db, d, h, quadraId).status === 'livre').length
}

export function proximosLivres(db: DB, quantos: number, agora = new Date()) {
  const achados: { data: Date; hora: number; quadraId: QuadraId }[] = []
  for (const d of proximosDias(3, agora)) {
    for (const linha of montarGrade(db, d, agora)) {
      const livre = linha.find((s) => s.status === 'livre')
      if (livre) achados.push({ data: d, hora: livre.hora, quadraId: livre.quadraId })
      if (achados.length >= quantos) return achados
    }
  }
  return achados
}
