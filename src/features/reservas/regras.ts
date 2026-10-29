// Regras de reserva e lista de espera. Funções puras (recebem o estado e
// devolvem o novo); quando a ação não pode acontecer, lançam ErroRegra com a
// mensagem para o usuário. Servem para o site, o painel e, no futuro, o bot.
import { novoId } from '../../lib/aleatorio'
import { chaveHorario, dataDeISO, dataISO, diaDaSemana, horaDecimal, inicioDoHorario } from '../../lib/datas'
import { exigir } from '../../lib/erros'
import { soDigitos } from '../../lib/formatos'
import type { DB, DataISO, Espera, FormaPagamento, FormaRecebida, Hora, Origem, Pessoa, Politica, QuadraId, Reserva } from '../../tipos'
import { debitarCredito, devolverCreditoDaReserva } from '../pacotes/regras'
import { aulaNoHorario, bloqueioNoHorario, horarioDoDia, precoDoHorario, reservaNoHorario } from './agenda'

export interface Horario {
  data: DataISO
  hora: Hora
  quadraId: QuadraId
}

export interface DadosReserva extends Horario, Pessoa {
  origem: Origem
  pago: boolean
  formaPagamento?: FormaPagamento
  minha?: boolean
  duracao?: number // padrão: a duração definida pelo dono
}

const mesmoHorario = (a: Horario, b: Horario) => a.data === b.data && a.hora === b.hora && a.quadraId === b.quadraId
const ordemCronologica = (a: Horario, b: Horario) => chaveHorario(a.data, a.hora).localeCompare(chaveHorario(b.data, b.hora))
const mesmaPessoa = (a: { telefone: string }, b: { telefone: string }) => soDigitos(a.telefone) === soDigitos(b.telefone)

// "Do cliente" = feita neste navegador ou pelo cliente que entrou no site
export const ehDoCliente = (r: Pick<Reserva, 'telefone' | 'minha'>, usuario: Pessoa | null | undefined) =>
  !!r.minha || (!!usuario && mesmaPessoa(r, usuario))

export const precoReserva = (r: Pick<Reserva, 'valor'>) => r.valor

// Confere se o horário pode receber uma reserva. `ignorar` = a própria reserva (ao remarcar).
function conferirHorario(db: DB, h: Horario, duracao: number, opcoes: { verificarPassado: boolean; ignorar?: string }) {
  const d = dataDeISO(h.data)
  const horario = horarioDoDia(db, d)
  exigir(horario, 'O estabelecimento está fechado nesse dia.')
  exigir(h.hora >= horario[0] && h.hora + duracao <= horario[1], 'Esse horário está fora do funcionamento.')
  if (opcoes.verificarPassado) {
    const agora = new Date()
    exigir(h.data > dataISO(agora) || (h.data === dataISO(agora) && h.hora > horaDecimal(agora)), 'Esse horário já passou.')
  }
  const outras = { reservas: db.reservas.filter((r) => r.id !== opcoes.ignorar) }
  exigir(!reservaNoHorario(outras, h.data, h.hora, duracao, h.quadraId), 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.')
  exigir(!bloqueioNoHorario(db, h.data, h.hora, duracao, h.quadraId), 'Esse horário foi bloqueado pelo estabelecimento.')
  exigir(!aulaNoHorario(db, diaDaSemana(d), h.hora, duracao, h.quadraId), 'Tem aula nesse horário.')
}

export function criarReserva(db: DB, dados: DadosReserva): DB {
  const duracao = dados.duracao ?? db.politica.duracaoReserva
  // pelo site não dá para reservar o passado; no painel dá (lançar o que já aconteceu)
  conferirHorario(db, dados, duracao, { verificarPassado: dados.origem === 'Site' })
  const nova: Reserva = {
    ...dados,
    nome: dados.nome.trim(),
    duracao,
    valor: precoDoHorario(db, dataDeISO(dados.data), dados.hora, duracao),
    id: novoId(),
    criadaEm: new Date().toISOString(),
    pagoEm: dados.pago ? new Date().toISOString() : undefined,
  }
  const comReserva = { ...db, reservas: [...db.reservas, nova] }
  // pago com créditos de pacote: desconta as horas (lança erro se não houver saldo)
  return dados.formaPagamento === 'Crédito' ? debitarCredito(comReserva, nova, duracao, nova.id) : comReserva
}

export const atualizarReserva = (db: DB, id: string, mudancas: Partial<Reserva>): DB => ({
  ...db,
  reservas: db.reservas.map((r) => (r.id === id ? { ...r, ...mudancas } : r)),
})

export const marcarPago = (db: DB, id: string, forma: FormaRecebida) =>
  atualizarReserva(db, id, { pago: true, formaPagamento: forma, pagoEm: new Date().toISOString() })

export const marcarPendente = (db: DB, id: string) => atualizarReserva(db, id, { pago: false, formaPagamento: 'Balcão', pagoEm: undefined })

export const alternarFalta = (db: DB, id: string) => {
  const r = db.reservas.find((x) => x.id === id)
  return r ? atualizarReserva(db, id, { falta: !r.falta }) : db
}

export function cancelarReservas(db: DB, ids: string[]): DB {
  const remover = new Set(ids)
  // quem pagou com créditos recebe as horas de volta
  const comCreditos = ids.reduce((acc, id) => devolverCreditoDaReserva(acc, id), db)
  return { ...comCreditos, reservas: comCreditos.reservas.filter((r) => !remover.has(r.id)) }
}

export const cancelarReserva = (db: DB, id: string) => cancelarReservas(db, [id])

// Política do dono: pelo site, só até X horas antes do jogo
export function podeCancelar(r: Pick<Reserva, 'data' | 'hora'>, politica: Politica, agora = new Date()) {
  return inicioDoHorario(r.data, r.hora).getTime() - agora.getTime() >= politica.cancelamentoHoras * 3_600_000
}

// Trocar dia/horário mantendo o valor combinado
export function remarcarReserva(db: DB, id: string, novo: Horario, agora = new Date()): DB {
  const r = db.reservas.find((x) => x.id === id)
  exigir(r, 'Reserva não encontrada.')
  exigir(podeCancelar(r, db.politica, agora), `Só dá para remarcar pelo site até ${db.politica.cancelamentoHoras}h antes. Fale com a gente no WhatsApp.`)
  conferirHorario(db, novo, r.duracao, { verificarPassado: true, ignorar: id })
  return atualizarReserva(db, id, { data: novo.data, hora: novo.hora, quadraId: novo.quadraId })
}

export function reservasDoCliente(db: DB, usuario: Pessoa | null, agora = new Date()) {
  const hoje = dataISO(agora)
  const minhas = db.reservas.filter((r) => ehDoCliente(r, usuario)).sort(ordemCronologica)
  return { proximas: minhas.filter((r) => r.data >= hoje), passadas: minhas.filter((r) => r.data < hoje).reverse() }
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
  exigir(!filaDoHorario(db, dados).some((e) => mesmaPessoa(e, dados)), 'Você já está na lista de espera desse horário.')
  const nova: Espera = { ...dados, nome: dados.nome.trim(), id: novoId(), criadaEm: new Date().toISOString() }
  return { ...db, espera: [...db.espera, nova] }
}

export const sairDaEspera = (db: DB, id: string): DB => ({ ...db, espera: db.espera.filter((e) => e.id !== id) })

// Fila agrupada por horário, em ordem cronológica
export function filasPorHorario(db: DB, agora = new Date()): Espera[][] {
  const grupos = new Map<string, Espera[]>()
  for (const e of esperaFutura(db, agora)) {
    const k = chaveHorario(e.data, e.hora) + e.quadraId
    grupos.set(k, [...(grupos.get(k) ?? []), e])
  }
  return [...grupos.values()].sort((a, b) => ordemCronologica(a[0], b[0]))
}
