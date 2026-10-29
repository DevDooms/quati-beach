import { novoId } from '../../lib/aleatorio'
import type { DB, PedidoEvento } from '../../tipos'

export function criarPedidoEvento(db: DB, dados: Omit<PedidoEvento, 'id' | 'criadoEm' | 'respondido'>): DB {
  const novo: PedidoEvento = { ...dados, nome: dados.nome.trim(), id: novoId(), criadoEm: new Date().toISOString(), respondido: false }
  return { ...db, eventos: [...db.eventos, novo] }
}

export const marcarRespondido = (db: DB, id: string, respondido = true): DB => ({
  ...db,
  eventos: db.eventos.map((e) => (e.id === id ? { ...e, respondido } : e)),
})

export const removerPedido = (db: DB, id: string): DB => ({ ...db, eventos: db.eventos.filter((e) => e.id !== id) })

export const pedidosNovos = (db: DB) => db.eventos.filter((e) => !e.respondido)

// Novos primeiro, depois os mais recentes
export const pedidosOrdenados = (db: DB) =>
  [...db.eventos].sort((a, b) => Number(a.respondido) - Number(b.respondido) || b.criadoEm.localeCompare(a.criadoEm))
