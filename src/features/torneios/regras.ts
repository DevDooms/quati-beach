import { novoId } from '../../lib/aleatorio'
import { exigir } from '../../lib/erros'
import { hojeISO, paraDataISO } from '../../lib/datas'
import type { DB, Dupla, Torneio } from '../../tipos'

// O próximo torneio com data de hoje em diante (é o que aparece no site)
export function proximoTorneio(torneios: Torneio[]): Torneio | undefined {
  const hoje = hojeISO()
  return [...torneios].sort((a, b) => a.data.localeCompare(b.data)).find((t) => t.data >= hoje)
}

export const duplasDaCategoria = (t: Torneio, categoria: string) => t.duplas.filter((d) => d.categoria === categoria)
export const vagasNaCategoria = (t: Torneio, categoria: string) => Math.max(0, t.vagasPorCategoria - duplasDaCategoria(t, categoria).length)

export function arrecadacao(t: Torneio) {
  const porDupla = t.valor * 2
  return { recebido: t.duplas.filter((d) => d.pago).length * porDupla, previsto: t.duplas.length * porDupla }
}

const mudarDuplas = (db: DB, torneioId: string, fn: (d: Dupla[]) => Dupla[]): DB => ({
  ...db,
  torneios: db.torneios.map((t) => (t.id === torneioId ? { ...t, duplas: fn(t.duplas) } : t)),
})

export function inscreverDupla(db: DB, torneioId: string, dados: Omit<Dupla, 'id'>): DB {
  const t = db.torneios.find((x) => x.id === torneioId)
  exigir(t, 'Torneio não encontrado.')
  exigir(vagasNaCategoria(t, dados.categoria) > 0, `A categoria ${dados.categoria} acabou de lotar.`)
  const nova: Dupla = { ...dados, atleta1: dados.atleta1.trim(), atleta2: dados.atleta2.trim() || 'A definir', id: novoId() }
  return mudarDuplas(db, torneioId, (ds) => [...ds, nova])
}

export const alternarPagoDupla = (db: DB, torneioId: string, duplaId: string) =>
  mudarDuplas(db, torneioId, (ds) => ds.map((d) => (d.id === duplaId ? { ...d, pago: !d.pago } : d)))

export const removerDupla = (db: DB, torneioId: string, duplaId: string) => mudarDuplas(db, torneioId, (ds) => ds.filter((d) => d.id !== duplaId))

// Atualiza os dados do torneio mantendo as inscrições
export const salvarTorneio = (db: DB, t: Omit<Torneio, 'duplas'>): DB => ({
  ...db,
  torneios: db.torneios.map((x) => (x.id === t.id ? { ...t, duplas: x.duplas } : x)),
})

// O id vem de fora para a tela já poder selecionar o torneio criado
export function novoTorneio(db: DB, id = novoId()): DB {
  const t: Torneio = {
    id,
    nome: 'Novo torneio',
    data: paraDataISO('2027-03-06'),
    horario: 'a partir das 8h',
    categorias: ['Iniciante', 'Intermediário'],
    valor: 120,
    vagasPorCategoria: 12,
    premiacao: 'Troféu para os 3 primeiros',
    duplas: [],
  }
  return { ...db, torneios: [...db.torneios, t] }
}

export const removerTorneio = (db: DB, id: string): DB => ({ ...db, torneios: db.torneios.filter((t) => t.id !== id) })
