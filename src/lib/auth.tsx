// Login apenas visual da demonstração: guarda só se a pessoa "entrou" como
// cliente e/ou como administrador. Com backend, vira o contexto de sessão real.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { gravarLocal, lerLocal } from './armazenamento'

type Papel = 'cliente' | 'admin'
const chave = (p: Papel) => `quati:login:${p}`

interface Ctx {
  logados: Record<Papel, boolean>
  definir: (p: Papel, v: boolean) => void
}

const Contexto = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [logados, setLogados] = useState<Record<Papel, boolean>>(() => ({
    cliente: lerLocal(chave('cliente')) === '1',
    admin: lerLocal(chave('admin')) === '1',
  }))

  const definir = useCallback((p: Papel, v: boolean) => {
    gravarLocal(chave(p), v ? '1' : null)
    setLogados((atual) => ({ ...atual, [p]: v }))
  }, [])

  return <Contexto.Provider value={{ logados, definir }}>{children}</Contexto.Provider>
}

export function useLogin(papel: Papel) {
  const c = useContext(Contexto)
  if (!c) throw new Error('useLogin precisa estar dentro do AuthProvider')
  return { logado: c.logados[papel], entrar: () => c.definir(papel, true), sair: () => c.definir(papel, false) }
}
