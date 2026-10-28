import { addDays, format, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { NEGOCIO, QUADRAS, type Aula } from '../data/mock'
import { ehDoCliente, type DB, type Reserva } from './store'

export type SlotStatus = 'livre' | 'reservado' | 'minha' | 'aula' | 'passado'

export interface Slot {
  hora: number
  quadraId: string
  status: SlotStatus
  aula?: Aula
  reserva?: Reserva
}

export const chaveData = (d: Date) => format(d, 'yyyy-MM-dd')
export const dataDeChave = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const fmtHora = (h: number) => `${String(h).padStart(2, '0')}h`
export const fmtFaixa = (h: number) => `${fmtHora(h)} – ${fmtHora(h + 1)}`
export const fmtDataLonga = (d: Date) => format(d, "EEEE, d 'de' MMMM", { locale: ptBR })
export const fmtDataCurta = (d: Date) => format(d, 'dd/MM', { locale: ptBR })
export const fmtDiaSemana = (d: Date) => format(d, 'EEE', { locale: ptBR }).replace('.', '')
export const fmtReais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
// segunda primeiro, domingo por último
export const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]

export function proximosDias(n: number, base = new Date()): Date[] {
  const hoje = startOfDay(base)
  return Array.from({ length: n }, (_, i) => addDays(hoje, i))
}

export function horasDoDia(db: DB, d: Date): number[] {
  const [abre, fecha] = db.funcionamento[d.getDay()]
  return Array.from({ length: Math.max(0, fecha - abre) }, (_, i) => abre + i)
}

export function precoDoHorario(db: DB, d: Date, hora: number) {
  const fimDeSemana = d.getDay() === 0 || d.getDay() === 6
  return fimDeSemana || hora >= 17 ? db.precos.pico : db.precos.normal
}

export function statusFuncionamento(db: DB, agora = new Date()) {
  const [abre, fecha] = db.funcionamento[agora.getDay()]
  const h = agora.getHours()
  const aberto = h >= abre && h < fecha
  return { aberto, abre, fecha, texto: aberto ? `Aberto agora · fecha às ${fecha}h` : `Fechado · abre às ${abre}h` }
}

export function aulaNoHorario(db: DB, diaSemana: number, hora: number, quadraId: string) {
  return db.aulas.find((a) => a.diaSemana === diaSemana && a.hora === hora && a.quadraId === quadraId)
}

export function slotDe(db: DB, d: Date, hora: number, quadraId: string, agora = new Date()): Slot {
  const data = chaveData(d)
  const reserva = db.reservas.find((r) => r.data === data && r.hora === hora && r.quadraId === quadraId)
  if (reserva) return { hora, quadraId, status: ehDoCliente(reserva) ? 'minha' : 'reservado', reserva }
  if (data === chaveData(agora) && hora <= agora.getHours()) return { hora, quadraId, status: 'passado' }
  if (data < chaveData(agora)) return { hora, quadraId, status: 'passado' }
  const aula = aulaNoHorario(db, d.getDay(), hora, quadraId)
  if (aula) return { hora, quadraId, status: 'aula', aula }
  return { hora, quadraId, status: 'livre' }
}

export function montarGrade(db: DB, d: Date, agora = new Date()): Slot[][] {
  return horasDoDia(db, d).map((hora) => QUADRAS.map((q) => slotDe(db, d, hora, q.id, agora)))
}

export function proximosLivres(db: DB, quantos: number, agora = new Date()) {
  const achados: { data: Date; hora: number; quadraId: string }[] = []
  for (const d of proximosDias(3, agora)) {
    for (const linha of montarGrade(db, d, agora)) {
      const livre = linha.find((s) => s.status === 'livre')
      if (livre) achados.push({ data: d, hora: livre.hora, quadraId: livre.quadraId })
      if (achados.length >= quantos) return achados
    }
  }
  return achados
}

export function proximaDataDaAula(diaSemana: number, hora: number, agora = new Date()) {
  for (const d of proximosDias(8, agora)) {
    if (d.getDay() !== diaSemana) continue
    if (chaveData(d) === chaveData(agora) && hora <= agora.getHours()) continue
    return d
  }
  return addDays(startOfDay(agora), 7)
}

export function linkWhatsApp(texto: string, numero = NEGOCIO.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

export const soDigitos = (tel: string) => tel.replace(/\D/g, '')
export const whatsDoTelefone = (tel: string) => `55${soDigitos(tel)}`
