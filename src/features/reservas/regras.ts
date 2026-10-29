// Regras de reserva e lista de espera. Funções puras (recebem o estado e
// devolvem o novo): servem para o site, o painel e, no futuro, o bot.
import { POLITICA } from '../../config/estabelecimento'
import { CLIENTE_DEMO } from '../../demo/dados'
import { novoId } from '../../lib/aleatorio'
import { dataDeISO, dataISO, fmtHora, inicioDoHorario } from '../../lib/datas'
import { soDigitos } from '../../lib/formatos'
import type { DB, DataISO, Espera, FormaPagamento, Origem, Pessoa, QuadraId, Reserva } from '../../tipos'
import { precoDoHorario, reservaNoHorario } from './agenda'

export interface Horario {
  data: DataISO
  hora: number
  quadraId: QuadraId
}

export interface DadosReserva extends Horario, Pessoa {
  origem: Origem
  pago: boolean
  formaPagamento?: FormaPagamento
  minha?: boolean
}

const mesmoHorario = (a: Horario, b: Horario) => a.data === b.data && a.hora === b.hora && a.quadraId === b.quadraId
const ordemCronologica = (a: Horario, b: Horario) => (a.data + fmtHora(a.hora)).localeCompare(b.data + fmtHora(b.hora))

// Na demonstração, "do cliente" é o que foi reservado neste navegador ou pelo cliente fictício
export const ehDoCliente = (r: Pick<Reserva, 'telefone' | 'minha'>) => !!r.minha || r.telefone === CLIENTE_DEMO.telefone

export const precoReserva = (db: DB, r: Reserva) => precoDoHorario(db, dataDeISO(r.data), r.hora)

export function criarReserva(db: DB, dados: DadosReserva): DB {
  // horário tomado nesse meio-tempo: não duplica (no banco real, uma restrição única faz isso)
  if (reservaNoHorario(db, dados.data, dados.hora, dados.quadraId)) return db
  const nova: Reserva = { ...dados, nome: dados.nome.trim(), id: novoId(), criadaEm: new Date().toISOString() }
  return { ...db, reservas: [...db.reservas, nova] }
}

export const atualizarReserva = (db: DB, id: string, mudancas: Partial<Reserva>): DB => ({
  ...db,
  reservas: db.reservas.map((r) => (r.id === id ? { ...r, ...mudancas } : r)),
})

export const alternarPago = (db: DB, id: string): DB => {
  const r = db.reservas.find((x) => x.id === id)
  return r ? atualizarReserva(db, id, { pago: !r.pago }) : db
}

export const cancelarReservas = (db: DB, ids: string[]): DB => {
  const remover = new Set(ids)
  return { ...db, reservas: db.reservas.filter((r) => !remover.has(r.id)) }
}

export const cancelarReserva = (db: DB, id: string) => cancelarReservas(db, [id])

// Política: pelo site, só até X horas antes do jogo
export function podeCancelar(r: Pick<Reserva, 'data' | 'hora'>, agora = new Date()) {
  return inicioDoHorario(r.data, r.hora).getTime() - agora.getTime() >= POLITICA.cancelamentoHoras * 3_600_000
}

export function reservasDoCliente(db: DB, agora = new Date()) {
  const hoje = dataISO(agora)
  const minhas = db.reservas.filter(ehDoCliente).sort(ordemCronologica)
  return { proximas: minhas.filter((r) => r.data >= hoje), passadas: minhas.filter((r) => r.data < hoje).reverse() }
}

// Reservas que ainda vão acontecer no dia (para o aviso de chuva)
export function reservasRestantesDoDia(db: DB, data: DataISO, agora = new Date()) {
  const ehHoje = data === dataISO(agora)
  return db.reservas.filter((r) => r.data === data && (!ehHoje || r.hora >= agora.getHours())).sort((a, b) => a.hora - b.hora)
}

// Busca do painel: por nome ou pelos números do telefone
export function buscaCorresponde(r: Pessoa, termo: string) {
  const t = termo.trim().toLowerCase()
  if (!t) return true
  if (r.nome.toLowerCase().includes(t)) return true
  const digitos = soDigitos(t)
  return digitos.length > 0 && soDigitos(r.telefone).includes(digitos)
}

// ---- Lista de espera ----

export const filaDoHorario = (db: DB, h: Horario) => db.espera.filter((e) => mesmoHorario(e, h))

export const esperaFutura = (db: DB, agora = new Date()) => db.espera.filter((e) => e.data >= dataISO(agora))

export function entrarNaEspera(db: DB, dados: Horario & Pessoa): DB {
  const nova: Espera = { ...dados, nome: dados.nome.trim(), id: novoId(), criadaEm: new Date().toISOString() }
  return { ...db, espera: [...db.espera, nova] }
}

export const sairDaEspera = (db: DB, id: string): DB => ({ ...db, espera: db.espera.filter((e) => e.id !== id) })

// Fila agrupada por horário, em ordem cronológica
export function filasPorHorario(db: DB, agora = new Date()): Espera[][] {
  const grupos = new Map<string, Espera[]>()
  for (const e of esperaFutura(db, agora)) {
    const k = `${e.data}|${e.hora}|${e.quadraId}`
    grupos.set(k, [...(grupos.get(k) ?? []), e])
  }
  return [...grupos.values()].sort((a, b) => ordemCronologica(a[0], b[0]))
}
