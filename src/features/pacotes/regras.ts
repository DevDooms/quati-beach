// Pacotes de horas (créditos). Só existem se o dono criar pacotes e ligar o
// módulo; o sistema não vem com nenhum pacote pronto.
import { novoId } from '../../lib/aleatorio'
import { exigir } from '../../lib/erros'
import { soDigitos } from '../../lib/formatos'
import type { DB, FormaRecebida, MovimentoCredito, Pacote, Pessoa } from '../../tipos'

const daPessoa = (telefone: string) => (m: { telefone: string }) => soDigitos(m.telefone) === soDigitos(telefone)

export const movimentosDe = (db: DB, telefone: string) => db.creditos.filter(daPessoa(telefone)).sort((a, b) => b.em.localeCompare(a.em))

export const saldoDe = (db: DB, telefone: string) => db.creditos.filter(daPessoa(telefone)).reduce((s, m) => s + m.horas, 0)

function movimentar(db: DB, m: Omit<MovimentoCredito, 'id' | 'em'>): DB {
  return { ...db, creditos: [...db.creditos, { ...m, nome: m.nome.trim(), id: novoId(), em: new Date().toISOString() }] }
}

export function comprarPacote(db: DB, pacoteId: string, pessoa: Pessoa, forma: FormaRecebida): DB {
  const p = db.pacotes.find((x) => x.id === pacoteId)
  exigir(p, 'Pacote não encontrado.')
  return movimentar(db, { ...pessoa, horas: p.horas, descricao: `Compra: ${p.nome}`, valor: p.preco, forma })
}

// Crédito lançado à mão no painel (cortesia, ajuste, venda no balcão)
export const adicionarCredito = (db: DB, pessoa: Pessoa, horas: number, descricao: string, valor?: number, forma?: FormaRecebida) =>
  movimentar(db, { ...pessoa, horas, descricao, valor, forma })

export function debitarCredito(db: DB, pessoa: Pessoa, horas: number, reservaId: string): DB {
  exigir(saldoDe(db, pessoa.telefone) >= horas, 'Créditos insuficientes para esse horário.')
  return movimentar(db, { ...pessoa, horas: -horas, descricao: 'Uso em reserva', reservaId })
}

// Reserva cancelada: as horas usadas voltam para o saldo
export function devolverCreditoDaReserva(db: DB, reservaId: string): DB {
  const uso = db.creditos.find((m) => m.reservaId === reservaId && m.horas < 0)
  if (!uso) return db
  return movimentar(db, { nome: uso.nome, telefone: uso.telefone, horas: -uso.horas, descricao: 'Devolução de reserva cancelada' })
}

export const precoPorHoraDoPacote = (p: Pacote) => p.preco / p.horas

export function salvarPacote(db: DB, p: Pacote): DB {
  exigir(p.nome.trim() && p.horas > 0 && p.preco >= 0, 'Preencha nome, horas e preço.')
  if (!p.id) return { ...db, pacotes: [...db.pacotes, { ...p, id: novoId() }] }
  return { ...db, pacotes: db.pacotes.map((x) => (x.id === p.id ? p : x)) }
}

export const removerPacote = (db: DB, id: string): DB => ({ ...db, pacotes: db.pacotes.filter((p) => p.id !== id) })
