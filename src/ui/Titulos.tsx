import type { ReactNode } from 'react'

// Faixa verde no topo das páginas do site
export function CabecalhoPagina({ sobre, titulo, children }: { sobre: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-petroleo text-white relative overflow-hidden">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-sol/20 blur-2xl" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-12">
        <p className="text-sol font-semibold text-sm uppercase tracking-[0.2em]">{sobre}</p>
        <h1 className="titulo text-5xl sm:text-6xl mt-2">{titulo}</h1>
        {children && <div className="mt-3 max-w-2xl text-white/80">{children}</div>}
      </div>
    </section>
  )
}

// Rótulo pequeno + título grande, usado nas seções do site
// `principal` usa h1 (quando é o título da página, como em "Entrar")
export function TituloSecao({ sobre, titulo, claro = false, principal = false }: { sobre: string; titulo: ReactNode; claro?: boolean; principal?: boolean }) {
  const Titulo = principal ? 'h1' : 'h2'
  return (
    <>
      <p className={`font-semibold text-sm uppercase tracking-[0.2em] ${claro ? 'text-sol' : 'text-onda'}`}>{sobre}</p>
      <Titulo className={`titulo text-5xl mt-1 ${claro ? '' : 'text-petroleo'}`}>{titulo}</Titulo>
    </>
  )
}

// Título das telas do painel, com ações à direita
export function TituloPagina({ titulo, sub, acoes }: { titulo: string; sub?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="titulo text-4xl sm:text-5xl text-petroleo">{titulo}</h1>
        {sub && <p className="text-sm text-petroleo-noite/70 mt-1">{sub}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}
