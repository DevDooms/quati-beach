// Login apenas visual da demonstração: guarda quem "entrou" como cliente e se
// o painel está aberto. Com backend, vira o contexto de sessão real.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Pessoa } from '../tipos'
import { gravarLocal, lerLocal } from './armazenamento'

const CHAVE_CLIENTE = 'quati:login:cliente'
const CHAVE_ADMIN = 'quati:login:admin'

function lerCliente(): Pessoa | null {
  try {
    const p = JSON.parse(lerLocal(CHAVE_CLIENTE) ?? 'null')
    return p && typeof p.nome === 'string' && typeof p.telefone === 'string' ? p : null
  } catch {
    return null
  }
}

interface Ctx {
  cliente: Pessoa | null
  admin: boolean
  entrarCliente: (p: Pessoa) => void
  sairCliente: () => void
  definirAdmin: (v: boolean) => void
}

const Contexto = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState(lerCliente)
  const [admin, setAdmin] = useState(() => lerLocal(CHAVE_ADMIN) === '1')

  const entrarCliente = useCallback((p: Pessoa) => {
    gravarLocal(CHAVE_CLIENTE, JSON.stringify(p))
    setCliente(p)
  }, [])
  const sairCliente = useCallback(() => {
    gravarLocal(CHAVE_CLIENTE, null)
    setCliente(null)
  }, [])
  const definirAdmin = useCallback((v: boolean) => {
    gravarLocal(CHAVE_ADMIN, v ? '1' : null)
    setAdmin(v)
  }, [])

  return <Contexto.Provider value={{ cliente, admin, entrarCliente, sairCliente, definirAdmin }}>{children}</Contexto.Provider>
}

function useAuth() {
  const c = useContext(Contexto)
  if (!c) throw new Error('precisa estar dentro do AuthProvider')
  return c
}

// Cliente que "entrou" no site (null se ninguém)
export function useUsuario() {
  const { cliente, entrarCliente, sairCliente } = useAuth()
  return { usuario: cliente, entrar: entrarCliente, sair: sairCliente }
}

export function useAdmin() {
  const { admin, definirAdmin } = useAuth()
  return { logado: admin, entrar: () => definirAdmin(true), sair: () => definirAdmin(false) }
}
