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

// Momento de início de um horário (ex.: 30/10 às 19h)
export function inicioDoHorario(data: DataISO, hora: number) {
  const d = dataDeISO(data)
  d.setHours(hora)
  return d
}

export function proximosDias(n: number, base = new Date()): Date[] {
  const hoje = startOfDay(base)
  return Array.from({ length: n }, (_, i) => addDays(hoje, i))
}

export const fmtHora = (h: number) => `${String(h).padStart(2, '0')}h`
export const fmtFaixa = (h: number, duracao = 1) => `${fmtHora(h)} – ${fmtHora(h + duracao)}`
export const fmtDataLonga = (d: Date) => format(d, "EEEE, d 'de' MMMM", { locale: ptBR })
export const fmtDataCurta = (d: Date) => format(d, 'dd/MM', { locale: ptBR })
export const fmtDiaSemana = (d: Date) => format(d, 'EEE', { locale: ptBR }).replace('.', '')

export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
// segunda primeiro, domingo por último
export const ORDEM_DIAS: DiaSemana[] = [1, 2, 3, 4, 5, 6, 0]
