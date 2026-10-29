// "Banco de dados" da demonstração: fica salvo no navegador e é compartilhado
// entre o site, a área do cliente e o painel. Com backend, este arquivo vira
// os hooks de busca (React Query + Supabase) e as telas continuam iguais.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { differenceInDays } from 'date-fns'
import * as z from 'zod/v4-mini'
import { VERSAO_BANCO, semear } from '../demo/semente'
import type { DB } from '../tipos'
import { gravarLocal, lerLocal } from './armazenamento'
import { ErroRegra } from './erros'

const CHAVE = 'quati:db'
// A demonstração usa datas relativas a "hoje"; depois de alguns dias a agenda
// fica vazia, então a base é recriada sozinha.
const DIAS_ATE_RENOVAR = 7

// Confere a forma do que veio do localStorage. Se estiver corrompido ou numa
// versão antiga, recria a base em vez de quebrar uma tela qualquer.
const pessoa = { nome: z.string(), telefone: z.string() }
const data = z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/))
const lista = <T extends z.ZodMiniType>(item: T) => z.array(item)
const esquemaBanco = z.looseObject({
  versao: z.literal(VERSAO_BANCO),
  semeadoEm: z.string(),
  reservas: lista(z.looseObject({ id: z.string(), data, hora: z.number(), duracao: z.number(), quadraId: z.string(), valor: z.number(), pago: z.boolean(), ...pessoa })),
  espera: lista(z.looseObject({ id: z.string(), data, hora: z.number(), quadraId: z.string(), ...pessoa })),
  eventos: lista(z.looseObject({ id: z.string(), data, ...pessoa })),
  aulas: lista(z.looseObject({ id: z.string(), diaSemana: z.number(), hora: z.number(), alunos: z.array(z.object(pessoa)) })),
  planos: lista(z.looseObject({ id: z.string(), nome: z.string(), preco: z.number() })),
  professores: lista(z.looseObject({ id: z.string(), nome: z.string() })),
  torneios: lista(z.looseObject({ id: z.string(), data, duplas: z.array(z.looseObject({ id: z.string() })) })),
  bloqueios: lista(z.looseObject({ id: z.string(), data, inicio: z.number(), fim: z.number() })),
  diasEspeciais: lista(z.looseObject({ id: z.string(), data, fechado: z.boolean() })),
  promocoes: lista(z.looseObject({ id: z.string(), inicio: z.number(), fim: z.number(), preco: z.number() })),
  pacotes: lista(z.looseObject({ id: z.string(), horas: z.number(), preco: z.number() })),
  creditos: lista(z.looseObject({ id: z.string(), horas: z.number(), ...pessoa })),
  precos: z.object({ normal: z.number(), pico: z.number(), inicioPico: z.number() }),
  politica: z.object({ duracaoReserva: z.number(), cancelamentoHoras: z.number() }),
  funcionamento: z.record(z.string(), z.tuple([z.number(), z.number()])),
  modulos: z.object({ aulas: z.boolean(), torneios: z.boolean(), bar: z.boolean(), eventos: z.boolean(), pacotes: z.boolean() }),
})

function ler(texto: string | null): DB | null {
  if (!texto) return null
  try {
    const r = esquemaBanco.safeParse(JSON.parse(texto))
    if (!r.success) return null
    const db = r.data as unknown as DB
    return differenceInDays(new Date(), new Date(db.semeadoEm)) >= DIAS_ATE_RENOVAR ? null : db
  } catch {
    return null
  }
}

type Mudanca = (db: DB) => DB

interface Ctx {
  db: DB
  // aplica uma mudança sem conferir erro (para ações que não podem falhar)
  set: (fn: Mudanca) => void
  // aplica uma regra que pode recusar a ação; devolve a mensagem de erro, ou null se deu certo
  aplicar: (fn: Mudanca) => string | null
  resetar: () => void
}

const Contexto = createContext<Ctx | null>(null)

export function BancoProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => ler(lerLocal(CHAVE)) ?? semear())
  // a versão mais recente, para `aplicar` decidir na hora (sem esperar o próximo render)
  const atual = useRef(db)
  atual.current = db

  useEffect(() => gravarLocal(CHAVE, JSON.stringify(db)), [db])

  // site e painel abertos em abas diferentes ficam sincronizados
  useEffect(() => {
    const ouvir = (e: StorageEvent) => {
      if (e.key !== CHAVE) return
      const novo = ler(e.newValue)
      if (novo) setDb(novo)
    }
    window.addEventListener('storage', ouvir)
    return () => window.removeEventListener('storage', ouvir)
  }, [])

  const set = useCallback((fn: Mudanca) => setDb((d) => fn(d)), [])

  const aplicar = useCallback((fn: Mudanca) => {
    try {
      const novo = fn(atual.current)
      atual.current = novo
      setDb(novo)
      return null
    } catch (e) {
      if (e instanceof ErroRegra) return e.message
      throw e
    }
  }, [])

  const resetar = useCallback(() => setDb(semear()), [])

  return <Contexto.Provider value={{ db, set, aplicar, resetar }}>{children}</Contexto.Provider>
}

export function useDB() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useDB precisa estar dentro do BancoProvider')
  return c
}
