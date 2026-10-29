import type { ReactNode } from 'react'
import { Cartao } from '../../ui'

export function Secao({ titulo, descricao, children, className = '' }: { titulo: ReactNode; descricao?: string; children: ReactNode; className?: string }) {
  return (
    <Cartao className={`p-5 ${className}`}>
      <h2 className="titulo text-3xl text-petroleo flex items-center gap-2">{titulo}</h2>
      {descricao && <p className="text-sm text-petroleo-noite/70">{descricao}</p>}
      {children}
    </Cartao>
  )
}

export const MEIAS_HORAS = Array.from({ length: 37 }, (_, i) => 5 + i / 2) // 5h às 23h
export const HORAS_CHEIAS = Array.from({ length: 19 }, (_, i) => i + 5) // 5h às 23h
