import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { addDays, format, startOfDay } from 'date-fns'
import {
  AULAS_INICIAIS,
  CLIENTE_DEMO,
  FUNCIONAMENTO_INICIAL,
  PRECOS_INICIAIS,
  PROFESSORES_INICIAIS,
  QUADRAS,
  TORNEIOS_INICIAIS,
  pessoaFicticia,
  type Aula,
  type Professor,
  type Torneio,
} from '../data/mock'

// "Banco de dados" da demonstração: fica salvo no navegador e é compartilhado
// entre o site, a área do cliente e o painel do Quati. Na versão real, isto
// vira uma API (e o bot de WhatsApp escreve nas mesmas tabelas).

export type Origem = 'Site' | 'WhatsApp' | 'Balcão'
export type FormaPagamento = 'Pix' | 'Cartão' | 'Balcão'

export interface Reserva {
  id: string
  data: string // yyyy-MM-dd
  hora: number
  quadraId: string
  nome: string
  telefone: string
  origem: Origem
  pago: boolean
  formaPagamento?: FormaPagamento
  minha?: boolean // feita neste navegador pelo site
  criadaEm?: string // ISO; só nas reservas feitas durante a demonstração
}

export interface DB {
  versao: number
  reservas: Reserva[]
  aulas: Aula[]
  professores: Professor[]
  torneios: Torneio[]
  precos: { normal: number; pico: number }
  funcionamento: Record<number, [number, number]>
}

const CHAVE = 'quati:db'
const VERSAO = 3

export const novoId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

// Pseudoaleatório estável: mesma entrada, mesmo resultado
export function sorteio(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

function semear(): DB {
  const hoje = startOfDay(new Date())
  const reservas: Reserva[] = []
  let n = 0
  for (let i = -14; i < 14; i++) {
    const d = addDays(hoje, i)
    const data = format(d, 'yyyy-MM-dd')
    const dia = d.getDay()
    const [abre, fecha] = FUNCIONAMENTO_INICIAL[dia]
    for (let hora = abre; hora < fecha; hora++) {
      for (const q of QUADRAS) {
        if (AULAS_INICIAIS.some((a) => a.diaSemana === dia && a.hora === hora && a.quadraId === q.id)) continue
        const fimDeSemana = dia === 0 || dia === 6
        const chance = fimDeSemana ? 0.5 : hora >= 18 ? 0.6 : hora >= 17 ? 0.45 : 0.2
        const r = sorteio(`${data}|${hora}|${q.id}`)
        if (r >= chance) continue
        const p = pessoaFicticia(n++)
        const o = sorteio(`origem${data}${hora}${q.id}`)
        reservas.push({
          id: novoId(),
          data,
          hora,
          quadraId: q.id,
          ...p,
          origem: o < 0.5 ? 'Site' : o < 0.85 ? 'WhatsApp' : 'Balcão',
          pago: i < 0 || o > 0.45,
        })
      }
    }
  }

  // reservas do cliente da demonstração (uma futura, duas passadas)
  for (const [dias, pago] of [[2, false], [-4, true], [-11, true]] as const) {
    const data = format(addDays(hoje, dias), 'yyyy-MM-dd')
    const idx = reservas.findIndex((r) => r.data === data && r.hora === 21 && r.quadraId === 'q2')
    if (idx >= 0) reservas.splice(idx, 1)
    reservas.push({ id: novoId(), data, hora: 21, quadraId: 'q2', ...CLIENTE_DEMO, origem: 'Site', pago })
  }

  return {
    versao: VERSAO,
    reservas,
    aulas: structuredClone(AULAS_INICIAIS),
    professores: structuredClone(PROFESSORES_INICIAIS),
    torneios: [
      {
        ...structuredClone(TORNEIOS_INICIAIS[0]),
        duplas: [
          ...structuredClone(TORNEIOS_INICIAIS[0].duplas),
          { id: 'demo', categoria: 'Iniciante', atleta1: CLIENTE_DEMO.nome, atleta2: 'Bruno Costa', telefone: CLIENTE_DEMO.telefone, pago: true },
        ],
      },
    ],
    precos: { ...PRECOS_INICIAIS },
    funcionamento: structuredClone(FUNCIONAMENTO_INICIAL),
  }
}

function carregar(): DB {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
    if (salvo?.versao === VERSAO) return salvo
  } catch {
    // ignora e recria
  }
  return semear()
}

interface Ctx {
  db: DB
  set: (fn: (db: DB) => DB) => void
  resetar: () => void
}

const Contexto = createContext<Ctx | null>(null)

export function DBProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(db))
    } catch {
      // navegação privada: segue só em memória
    }
  }, [db])

  // site e painel abertos em abas diferentes ficam sincronizados
  useEffect(() => {
    const ouvir = (e: StorageEvent) => {
      if (e.key === CHAVE && e.newValue) setDb(JSON.parse(e.newValue))
    }
    window.addEventListener('storage', ouvir)
    return () => window.removeEventListener('storage', ouvir)
  }, [])

  const set = useCallback((fn: (db: DB) => DB) => setDb((atual) => fn(atual)), [])
  const resetar = useCallback(() => setDb(semear()), [])

  return <Contexto.Provider value={{ db, set, resetar }}>{children}</Contexto.Provider>
}

export function useDB() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useDB fora do DBProvider')
  return c
}

export const acharProfessor = (db: DB, id: string): Professor =>
  db.professores.find((p) => p.id === id) ?? {
    id,
    nome: 'A definir',
    iniciais: '?',
    modalidades: [],
    bio: '',
    destaque: '',
    cor: 'from-petroleo to-petroleo-escuro',
    telefone: '',
  }

export const ehDoCliente = (r: { telefone: string; minha?: boolean }) => r.minha || r.telefone === CLIENTE_DEMO.telefone

// Login apenas visual: guarda só se a pessoa "entrou" para mostrar a área certa
export function useLoginDemo(chave: 'cliente' | 'admin') {
  const k = `quati:login:${chave}`
  const ler = () => {
    try {
      return localStorage.getItem(k) === '1'
    } catch {
      return false
    }
  }
  const [logado, setLogado] = useState(ler)

  // mantém cabeçalho e páginas em sincronia quando a pessoa entra/sai
  useEffect(() => {
    const atualizar = () => setLogado(ler())
    window.addEventListener('quati:login', atualizar)
    return () => window.removeEventListener('quati:login', atualizar)
  }, [k])

  const definir = (v: boolean) => {
    setLogado(v)
    try {
      if (v) localStorage.setItem(k, '1')
      else localStorage.removeItem(k)
    } catch {
      // sem armazenamento: vale só nesta visita
    }
    window.dispatchEvent(new Event('quati:login'))
  }
  return { logado, entrar: () => definir(true), sair: () => definir(false) }
}
