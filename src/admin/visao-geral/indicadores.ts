// Números da Visão geral, calculados fora da tela (fáceis de testar e de levar para o backend)
import { addDays, startOfWeek } from 'date-fns'
import { QUADRAS } from '../../config/estabelecimento'
import { dataISO, diaDaSemana, proximosDias } from '../../lib/datas'
import type { DB, Origem } from '../../tipos'
import { horasDoDia, montarGrade } from '../../features/reservas/agenda'
import { precoReserva } from '../../features/reservas/regras'

const ORIGENS: Origem[] = ['Site', 'WhatsApp', 'Balcão']

export function indicadoresDoDia(db: DB, agora = new Date()) {
  const hoje = dataISO(agora)
  const reservas = db.reservas.filter((r) => r.data === hoje).length
  const aulas = db.aulas.filter((a) => a.diaSemana === diaDaSemana(agora)).length
  const capacidade = horasDoDia(db, agora).length * QUADRAS.length
  return { reservas, aulas, capacidade, ocupacao: capacidade ? Math.round(((reservas + aulas) / capacidade) * 100) : 0 }
}

export function indicadoresDaSemana(db: DB, agora = new Date()) {
  const inicio = startOfWeek(agora, { weekStartsOn: 1 })
  const dias = Array.from({ length: 7 }, (_, i) => dataISO(addDays(inicio, i)))
  const daSemana = db.reservas.filter((r) => dias.includes(r.data))
  const pendentes = db.reservas.filter((r) => !r.pago && r.data <= dias[6])
  return {
    reservas: daSemana.length,
    faturamento: daSemana.reduce((s, r) => s + precoReserva(db, r), 0),
    pendentes: pendentes.length,
    aReceber: pendentes.reduce((s, r) => s + precoReserva(db, r), 0),
  }
}

export const reservasPorDia = (db: DB, dias = 7, agora = new Date()) =>
  proximosDias(dias, agora).map((d) => ({ d, qtd: db.reservas.filter((r) => r.data === dataISO(d)).length }))

export function origensDasReservas(db: DB, dias = 30, agora = new Date()) {
  const hoje = dataISO(agora)
  const inicio = dataISO(addDays(agora, -dias))
  const periodo = db.reservas.filter((r) => r.data <= hoje && r.data >= inicio)
  const total = Math.max(1, periodo.length)
  return ORIGENS.map((origem) => {
    const qtd = periodo.filter((r) => r.origem === origem).length
    return { origem, qtd, pct: Math.round((qtd / total) * 100) }
  })
}

// Feitas durante a demonstração (pelo site ou lançadas no painel), mais novas primeiro
export const reservasRecentes = (db: DB, quantas = 5) =>
  db.reservas.filter((r) => r.criadaEm).sort((a, b) => b.criadaEm!.localeCompare(a.criadaEm!)).slice(0, quantas)

// Reservas e aulas que ainda vão acontecer hoje, por horário
export function agendaRestanteDeHoje(db: DB, agora = new Date()) {
  return montarGrade(db, agora, new Date(0))
    .flatMap((linha) => linha.filter((s) => s.reserva || s.aula))
    .filter((s) => s.hora >= agora.getHours())
}
