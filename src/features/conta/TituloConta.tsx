import type { ReactNode } from 'react'

// Título das seções da área do cliente (ícone + texto)
export function TituloConta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-mar [&>svg]:size-6">
      {icone}
      <span className="titulo text-3xl">{children}</span>
    </h2>
  )
}
