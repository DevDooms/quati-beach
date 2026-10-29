// Ferramentas do dono sobre a agenda: bloquear horários, dias especiais
// (feriados) e preços promocionais. Tudo começa vazio: é o dono quem cria.
import { novoId } from '../../lib/aleatorio'
import { dataDeISO, dataISO, fmtDataCurta } from '../../lib/datas'
import { exigir } from '../../lib/erros'
import type { Bloqueio, DB, DataISO, DiaEspecial, Promocao } from '../../tipos'
import { sobrepoe } from '../reservas/agenda'

// ---- Bloqueios ----

// Reservas já marcadas que o bloqueio atingiria
export const reservasAtingidas = (db: DB, b: Omit<Bloqueio, 'id' | 'motivo'>) =>
  db.reservas.filter((r) => r.data === b.data && (b.quadraId === null || r.quadraId === b.quadraId) && sobrepoe(r.hora, r.duracao, b.inicio, b.fim - b.inicio))

export function criarBloqueio(db: DB, b: Omit<Bloqueio, 'id'>): DB {
  exigir(b.fim > b.inicio, 'O fim precisa ser depois do início.')
  const atingidas = reservasAtingidas(db, b)
  exigir(atingidas.length === 0, `Já há ${atingidas.length} reserva(s) nesse período. Cancele ou remarque antes de bloquear.`)
  return { ...db, bloqueios: [...db.bloqueios, { ...b, motivo: b.motivo.trim() || 'Bloqueado', id: novoId() }] }
}

export const removerBloqueio = (db: DB, id: string): DB => ({ ...db, bloqueios: db.bloqueios.filter((b) => b.id !== id) })

export const bloqueiosDoDia = (db: DB, data: DataISO) => db.bloqueios.filter((b) => b.data === data).sort((a, b) => a.inicio - b.inicio)

// ---- Dias especiais (feriados, horário reduzido) ----

export function salvarDiaEspecial(db: DB, e: Omit<DiaEspecial, 'id'>): DB {
  exigir(e.nome.trim(), 'Dê um nome (ex.: Natal).')
  exigir(e.fechado || e.horario[1] > e.horario[0], 'O horário de fechar precisa ser depois do de abrir.')
  exigir(!db.diasEspeciais.some((x) => x.data === e.data), `Já existe uma regra para ${fmtDataCurta(dataDeISO(e.data))}.`)
  return { ...db, diasEspeciais: [...db.diasEspeciais, { ...e, nome: e.nome.trim(), id: novoId() }] }
}

export const removerDiaEspecial = (db: DB, id: string): DB => ({ ...db, diasEspeciais: db.diasEspeciais.filter((e) => e.id !== id) })

export const proximosDiasEspeciais = (db: DB, agora = new Date()) =>
  db.diasEspeciais.filter((e) => e.data >= dataISO(agora)).sort((a, b) => a.data.localeCompare(b.data))

// ---- Promoções ----

export function salvarPromocao(db: DB, p: Promocao): DB {
  exigir(p.nome.trim(), 'Dê um nome para a promoção.')
  exigir(p.dias.length > 0, 'Escolha pelo menos um dia.')
  exigir(p.fim > p.inicio, 'O fim precisa ser depois do início.')
  exigir(p.preco >= 0, 'Preço inválido.')
  if (!p.id) return { ...db, promocoes: [...db.promocoes, { ...p, nome: p.nome.trim(), id: novoId() }] }
  return { ...db, promocoes: db.promocoes.map((x) => (x.id === p.id ? p : x)) }
}

export const removerPromocao = (db: DB, id: string): DB => ({ ...db, promocoes: db.promocoes.filter((p) => p.id !== id) })
