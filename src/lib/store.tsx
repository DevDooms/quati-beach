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
  fixoId?: string // reserva gerada por um horário fixo (mensalista)
}

// Grupo que joga toda semana no mesmo dia, horário e quadra
export interface Mensalista {
  id: string
  nome: string
  telefone: string
  diaSemana: number
  hora: number
  quadraId: string
  desde: string // yyyy-MM-dd
}

export interface Espera {
  id: string
  data: string
  hora: number
  quadraId: string
  nome: string
  telefone: string
  criadaEm: string
}

export interface PedidoEvento {
  id: string
  nome: string
  telefone: string
  tipo: string
  data: string
  pessoas: number
  obs: string
  criadoEm: string
  respondido: boolean
}

export interface Plano {
  id: string
  nome: string
  preco: number
  descricao: string
}

export interface Modulos {
  aulas: boolean
  torneios: boolean
  bar: boolean
  eventos: boolean
}

export interface DB {
  versao: number
  reservas: Reserva[]
  mensalistas: Mensalista[]
  espera: Espera[]
  eventos: PedidoEvento[]
  aulas: Aula[]
  planos: Plano[]
  professores: Professor[]
  torneios: Torneio[]
  precos: { normal: number; pico: number }
  funcionamento: Record<number, [number, number]>
  modulos: Modulos
}

const CHAVE = 'quati:db'
const VERSAO = 4

// semanas à frente que um horário fixo ocupa na agenda
export const SEMANAS_FIXO = 8

// Reservas que um mensalista ocupa a partir de `de`, pulando horários já tomados
export function reservasDoFixo(
  db: Pick<DB, 'reservas' | 'aulas'>,
  m: Mensalista,
  de: Date,
  semanas = SEMANAS_FIXO,
  pago = false,
): Reserva[] {
  const novas: Reserva[] = []
  let d = startOfDay(de)
  while (d.getDay() !== m.diaSemana) d = addDays(d, 1)
  for (let i = 0; i < semanas; i++, d = addDays(d, 7)) {
    const data = format(d, 'yyyy-MM-dd')
    const ocupado =
      db.reservas.some((r) => r.data === data && r.hora === m.hora && r.quadraId === m.quadraId) ||
      db.aulas.some((a) => a.diaSemana === m.diaSemana && a.hora === m.hora && a.quadraId === m.quadraId)
    if (ocupado) continue
    novas.push({ id: novoId(), data, hora: m.hora, quadraId: m.quadraId, nome: m.nome, telefone: m.telefone, origem: 'Site', pago, fixoId: m.id })
  }
  return novas
}

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

const dataDeChaveLocal = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
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
    reservas.push({ id: novoId(), data, hora: 21, quadraId: 'q2', ...CLIENTE_DEMO, origem: 'Site', pago, formaPagamento: pago ? 'Pix' : 'Balcão' })
  }

  // horários fixos de exemplo: tiram as reservas avulsas do mesmo horário
  const inicioFixos = addDays(hoje, -14)
  const mensalistas: Mensalista[] = [
    { id: 'm1', nome: 'Grupo do Marcão', telefone: '(11) 98123-4455', diaSemana: 2, hora: 21, quadraId: 'q1', desde: format(addDays(hoje, -90), 'yyyy-MM-dd') },
    { id: 'm2', nome: 'Futevôlei da Firma', telefone: '(11) 97654-3210', diaSemana: 4, hora: 21, quadraId: 'q2', desde: format(addDays(hoje, -60), 'yyyy-MM-dd') },
    { id: 'm3', nome: 'Beach das Amigas', telefone: '(11) 99876-1122', diaSemana: 6, hora: 16, quadraId: 'q2', desde: format(addDays(hoje, -30), 'yyyy-MM-dd') },
  ]
  const semFixos = reservas.filter(
    (r) => r.telefone === CLIENTE_DEMO.telefone || !mensalistas.some((m) => m.quadraId === r.quadraId && m.hora === r.hora && dataDeChaveLocal(r.data).getDay() === m.diaSemana),
  )
  const fixas = mensalistas.flatMap((m) =>
    reservasDoFixo({ reservas: semFixos, aulas: AULAS_INICIAIS }, m, inicioFixos, SEMANAS_FIXO + 2).map((r) => ({ ...r, pago: r.data < format(hoje, 'yyyy-MM-dd') })),
  )

  const eventos: PedidoEvento[] = [
    {
      id: 'e1',
      nome: 'Patrícia Mendes',
      telefone: '(11) 98222-7788',
      tipo: 'Aniversário',
      data: format(addDays(hoje, 17), 'yyyy-MM-dd'),
      pessoas: 25,
      obs: 'Festa de 15 anos, queremos as duas quadras à tarde e porções do bar.',
      criadoEm: addDays(hoje, -1).toISOString(),
      respondido: false,
    },
    {
      id: 'e2',
      nome: 'RH Metalúrgica Guaçu',
      telefone: '(11) 4661-2030',
      tipo: 'Confraternização de empresa',
      data: format(addDays(hoje, 30), 'yyyy-MM-dd'),
      pessoas: 40,
      obs: 'Torneio interno de futevôlei para os funcionários.',
      criadoEm: addDays(hoje, -3).toISOString(),
      respondido: true,
    },
  ]

  // gente na lista de espera dos primeiros horários de pico ocupados dos próximos dias
  const amanha = format(addDays(hoje, 1), 'yyyy-MM-dd')
  const espera: Espera[] = semFixos
    .filter((r) => r.data >= amanha && r.hora >= 17 && r.telefone !== CLIENTE_DEMO.telefone)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 2)
    .flatMap((r, i) =>
      [0, 1].slice(0, 2 - i).map((j) => ({
        id: novoId(),
        data: r.data,
        hora: r.hora,
        quadraId: r.quadraId,
        ...pessoaFicticia(500 + i * 10 + j),
        criadaEm: addDays(hoje, -1).toISOString(),
      })),
    )

  return {
    versao: VERSAO,
    reservas: [...semFixos, ...fixas],
    mensalistas,
    espera,
    eventos,
    planos: [
      { id: 'p1', nome: '1x por semana', preco: 160, descricao: '4 aulas no mês na turma do seu nível' },
      { id: 'p2', nome: '2x por semana', preco: 280, descricao: '8 aulas no mês, evolução mais rápida' },
      { id: 'p3', nome: 'Livre', preco: 380, descricao: 'Todas as turmas do seu nível, quantas quiser' },
    ],
    modulos: { aulas: true, torneios: true, bar: true, eventos: true },
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
