import { addDays, format, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DataISO, DiaSemana } from '../tipos'

// Datas sempre no horário local (America/Sao_Paulo no navegador do cliente).
// No backend, usar date-fns-tz com esse fuso para não errar o dia.

export const dataISO = (d: Date) => format(d, 'yyyy-MM-dd') as DataISO

export function paraDataISO(s: string): DataISO {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`Data inválida: ${s}`)
  return s as DataISO
}

export function dataDeISO(s: DataISO) {
  const [a, m, d] = s.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export const hojeISO = () => dataISO(new Date())
export const diaDaSemana = (d: Date) => d.getDay() as DiaSemana

// Momento de início de um horário (ex.: 30/10 às 19h30 → hora 19.5)
export function inicioDoHorario(data: DataISO, hora: number) {
  const d = dataDeISO(data)
  d.setHours(Math.floor(hora), Math.round((hora % 1) * 60))
  return d
}

// Hora atual em horas decimais (19h30 → 19.5)
export const horaDecimal = (d: Date) => d.getHours() + d.getMinutes() / 60

// Chave para ordenar por data e hora ("2026-10-30|19.50")
export const chaveHorario = (data: string, hora: number) => `${data}|${hora.toFixed(2).padStart(5, '0')}`

export function proximosDias(n: number, base = new Date()): Date[] {
  const hoje = startOfDay(base)
  return Array.from({ length: n }, (_, i) => addDays(hoje, i))
}

// 8 → "08h", 8.5 → "08h30"
export function fmtHora(h: number) {
  const minutos = Math.round((h % 1) * 60)
  return `${String(Math.floor(h)).padStart(2, '0')}h${minutos ? String(minutos).padStart(2, '0') : ''}`
}

export const fmtDuracao = (horas: number) => (horas === 1 ? '1 hora' : horas % 1 ? `${Math.floor(horas)}h${Math.round((horas % 1) * 60)}` : `${horas} horas`)
export const fmtFaixa = (h: number, duracao = 1) => `${fmtHora(h)} – ${fmtHora(h + duracao)}`
export const fmtDataLonga = (d: Date) => format(d, "EEEE, d 'de' MMMM", { locale: ptBR })
export const fmtDataCurta = (d: Date) => format(d, 'dd/MM', { locale: ptBR })
export const fmtDiaSemana = (d: Date) => format(d, 'EEE', { locale: ptBR }).replace('.', '')

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
// segunda primeiro, domingo por último
export const ORDEM_DIAS: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0]
