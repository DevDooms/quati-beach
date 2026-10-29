// Como fica a agenda das quadras: horários do dia, preço e situação de cada horário.
// Horários são intervalos [início, início + duração); dois horários conflitam se se sobrepõem.
import { QUADRAS } from '../../config/estabelecimento'
import { dataISO, diaDaSemana, horaDecimal, proximosDias } from '../../lib/datas'
import type { Aula, Bloqueio, DB, DataISO, DiaEspecial, DiaSemana, Hora, Pessoa, Promocao, QuadraId, Reserva } from '../../tipos'
import { ehDoCliente } from './regras'

export const DURACAO_AULA = 1

export type SlotStatus = 'livre' | 'reservado' | 'minha' | 'aula' | 'bloqueado' | 'passado'

export interface Slot {
  hora: Hora
  duracao: number
  quadraId: QuadraId
  status: SlotStatus
  aula?: Aula
  reserva?: Reserva
  bloqueio?: Bloqueio
}

// `agora` define o que já passou (o painel passa VER_TUDO para enxergar o passado);
// `usuario` marca as reservas da pessoa como "minha"
export interface OpcoesAgenda {
  agora?: Date
  usuario?: Pessoa | null
}
export const VER_TUDO: OpcoesAgenda = { agora: new Date(0) }

export const sobrepoe = (a: Hora, duracaoA: number, b: Hora, duracaoB: number) => a < b + duracaoB && b < a + duracaoA

// ---- Funcionamento do dia (normal ou especial) ----

export const diaEspecial = (db: DB, data: DataISO): DiaEspecial | undefined => db.diasEspeciais.find((e) => e.data === data)

// [abre, fecha] do dia, ou null se fechado (feriado)
export function horarioDoDia(db: DB, d: Date): [Hora, Hora] | null {
  const especial = diaEspecial(db, dataISO(d))
  if (especial) return especial.fechado ? null : especial.horario
  return db.funcionamento[diaDaSemana(d)]
}

// Inícios possíveis de reserva no dia, de `duracao` em `duracao`
export function horasDoDia(db: DB, d: Date, duracao = db.politica.duracaoReserva): Hora[] {
  const horario = horarioDoDia(db, d)
  if (!horario) return []
  const [abre, fecha] = horario
  const horas: Hora[] = []
  for (let h = abre; h + duracao <= fecha + 1e-9; h += duracao) horas.push(h)
  return horas
}

// Horários que ainda dá para reservar (hoje, só os que não começaram)
export function horasReservaveis(db: DB, d: Date, agora = new Date()) {
  const ehHoje = dataISO(d) === dataISO(agora)
  return horasDoDia(db, d).filter((h) => !ehHoje || h > horaDecimal(agora))
}

export function statusFuncionamento(db: DB, agora = new Date()) {
  const horario = horarioDoDia(db, agora)
  const especial = diaEspecial(db, dataISO(agora))
  if (!horario) return { aberto: false, texto: `Fechado hoje${especial ? ` · ${especial.nome}` : ''}` }
  const [abre, fecha] = horario
  const h = horaDecimal(agora)
  const aberto = h >= abre && h < fecha
  return { aberto, texto: aberto ? `Aberto agora · fecha às ${fecha}h` : `Fechado · abre às ${abre}h` }
}

// ---- Preço ----

export const promocaoNoHorario = (db: DB, d: Date, hora: Hora): Promocao | undefined =>
  db.promocoes.find((p) => p.ativa && p.dias.includes(diaDaSemana(d)) && hora >= p.inicio && hora < p.fim)

// Preço por hora (promoção do dono > pico > normal)
export function precoPorHora(db: DB, d: Date, hora: Hora) {
  const promo = promocaoNoHorario(db, d, hora)
  if (promo) return promo.preco
  const fimDeSemana = d.getDay() === 0 || d.getDay() === 6
  return fimDeSemana || hora >= db.precos.inicioPico ? db.precos.pico : db.precos.normal
}

// Valor de uma reserva com a duração padrão (fechado no momento de reservar)
export const precoDoHorario = (db: DB, d: Date, hora: Hora, duracao = db.politica.duracaoReserva) => Math.round(precoPorHora(db, d, hora) * duracao)

// ---- O que ocupa um horário ----

export const reservaNoHorario = (db: Pick<DB, 'reservas'>, data: string, hora: Hora, duracao: number, quadraId: QuadraId) =>
  db.reservas.find((r) => r.data === data && r.quadraId === quadraId && sobrepoe(r.hora, r.duracao, hora, duracao))

export const aulaNoHorario = (db: Pick<DB, 'aulas'>, diaSemana: DiaSemana, hora: Hora, duracao: number, quadraId: QuadraId) =>
  db.aulas.find((a) => a.diaSemana === diaSemana && a.quadraId === quadraId && sobrepoe(a.hora, DURACAO_AULA, hora, duracao))

export const bloqueioNoHorario = (db: Pick<DB, 'bloqueios'>, data: string, hora: Hora, duracao: number, quadraId: QuadraId) =>
  db.bloqueios.find((b) => b.data === data && (b.quadraId === null || b.quadraId === quadraId) && sobrepoe(b.inicio, b.fim - b.inicio, hora, duracao))

export function slotDe(db: DB, d: Date, hora: Hora, quadraId: QuadraId, opcoes: OpcoesAgenda = {}, duracao = db.politica.duracaoReserva): Slot {
  const { agora = new Date(), usuario = null } = opcoes
  const data = dataISO(d)
  const base = { hora, duracao, quadraId }
  const reserva = reservaNoHorario(db, data, hora, duracao, quadraId)
  if (reserva) return { ...base, status: ehDoCliente(reserva, usuario) ? 'minha' : 'reservado', reserva }
  const hoje = dataISO(agora)
  if (data < hoje || (data === hoje && hora <= horaDecimal(agora))) return { ...base, status: 'passado' }
  const bloqueio = bloqueioNoHorario(db, data, hora, duracao, quadraId)
  if (bloqueio) return { ...base, status: 'bloqueado', bloqueio }
  const aula = aulaNoHorario(db, diaDaSemana(d), hora, duracao, quadraId)
  if (aula) return { ...base, status: 'aula', aula }
  return { ...base, status: 'livre' }
}

export const estaLivre = (db: DB, d: Date, hora: Hora, quadraId: QuadraId, opcoes: OpcoesAgenda = {}) =>
  horasDoDia(db, d).includes(hora) && slotDe(db, d, hora, quadraId, opcoes).status === 'livre'

// Grade do dia (linhas = horários, colunas = quadras). No painel, inclui também
// reservas que ficaram fora do horário (ex.: depois de mudar o funcionamento).
export function montarGrade(db: DB, d: Date, opcoes: OpcoesAgenda = {}): Slot[][] {
  const data = dataISO(d)
  const normais = horasDoDia(db, d)
  const foraDoHorario = db.reservas
    .filter((r) => r.data === data && !normais.some((h) => sobrepoe(h, db.politica.duracaoReserva, r.hora, r.duracao)))
    .map((r) => r.hora)
  const horas = [...new Set([...normais, ...foraDoHorario])].sort((a, b) => a - b)
  return horas.map((hora) => QUADRAS.map((q) => slotDe(db, d, hora, q.id, opcoes)))
}

// Reservas marcadas fora do horário de funcionamento (para avisar o dono)
export function reservasForaDoHorario(db: DB, agora = new Date()) {
  const hoje = dataISO(agora)
  return db.reservas.filter((r) => {
    if (r.data < hoje) return false
    const horario = horarioDoDia(db, new Date(`${r.data}T12:00:00`))
    return !horario || r.hora < horario[0] || r.hora + r.duracao > horario[1]
  })
}

export function livresNoDia(db: DB, d: Date, quadraId: QuadraId) {
  return horasDoDia(db, d).filter((h) => slotDe(db, d, h, quadraId).status === 'livre').length
}

export function proximosLivres(db: DB, quantos: number, agora = new Date()) {
  const achados: { data: Date; hora: Hora; quadraId: QuadraId }[] = []
  for (const d of proximosDias(3, agora)) {
    for (const linha of montarGrade(db, d, { agora })) {
      const livre = linha.find((s) => s.status === 'livre')
      if (livre) achados.push({ data: d, hora: livre.hora, quadraId: livre.quadraId })
      if (achados.length >= quantos) return achados
    }
  }
  return achados
}
