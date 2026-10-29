// "Banco de dados" da demonstração: fica salvo no navegador e é compartilhado
// entre o site, a área do cliente e o painel. Com backend, este arquivo vira
// os hooks de busca (React Query + Supabase) e as telas continuam iguais.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { VERSAO_BANCO, semear } from '../demo/semente'
import type { DB } from '../tipos'
import { gravarLocal, lerLocal } from './armazenamento'

const CHAVE = 'quati:db'

// Confere a forma do que veio do localStorage. Se estiver corrompido ou numa
// versão antiga, recria a base em vez de quebrar uma tela qualquer.
const pessoa = { nome: z.string(), telefone: z.string() }
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const esquemaBanco = z.object({
  versao: z.literal(VERSAO_BANCO),
  reservas: z.array(z.object({ id: z.string(), data, hora: z.number().int(), quadraId: z.string(), ...pessoa, pago: z.boolean() }).passthrough()),
  mensalistas: z.array(z.object({ id: z.string(), diaSemana: z.number(), hora: z.number(), quadraId: z.string(), ...pessoa }).passthrough()),
  espera: z.array(z.object({ id: z.string(), data, hora: z.number(), quadraId: z.string(), ...pessoa }).passthrough()),
  eventos: z.array(z.object({ id: z.string(), data, ...pessoa }).passthrough()),
  aulas: z.array(z.object({ id: z.string(), diaSemana: z.number(), hora: z.number(), alunos: z.array(z.object(pessoa)) }).passthrough()),
  planos: z.array(z.object({ id: z.string(), nome: z.string(), preco: z.number() }).passthrough()),
  professores: z.array(z.object({ id: z.string(), nome: z.string() }).passthrough()),
  torneios: z.array(z.object({ id: z.string(), data, duplas: z.array(z.object({ id: z.string() }).passthrough()) }).passthrough()),
  precos: z.object({ normal: z.number(), pico: z.number(), inicioPico: z.number() }),
  funcionamento: z.record(z.tuple([z.number(), z.number()])),
  modulos: z.object({ aulas: z.boolean(), torneios: z.boolean(), bar: z.boolean(), eventos: z.boolean() }),
})

function ler(texto: string | null): DB | null {
  if (!texto) return null
  try {
    const r = esquemaBanco.safeParse(JSON.parse(texto))
    return r.success ? (r.data as unknown as DB) : null
  } catch {
    return null
  }
}

interface Ctx {
  db: DB
  // aplica uma mudança: recebe o estado atual e devolve o novo (as funções de regras.ts têm esse formato)
  set: (fn: (db: DB) => DB) => void
  resetar: () => void
}

const Contexto = createContext<Ctx | null>(null)

export function BancoProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => ler(lerLocal(CHAVE)) ?? semear())

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

  const set = useCallback((fn: (db: DB) => DB) => setDb((atual) => fn(atual)), [])
  const resetar = useCallback(() => setDb(semear()), [])

  return <Contexto.Provider value={{ db, set, resetar }}>{children}</Contexto.Provider>
}

export function useDB() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useDB precisa estar dentro do BancoProvider')
  return c
}
