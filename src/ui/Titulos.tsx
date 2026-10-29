import type { ReactNode } from 'react'
import { FOTO_CAPA } from '../config/fotos'

// Faixa no topo das páginas do site, com a foto do espaço ao fundo
export function CabecalhoPagina({ sobre, titulo, children }: { sobre: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative bg-marinho text-white overflow-hidden">
      <img src={FOTO_CAPA} alt="" className="absolute inset-0 size-full object-cover opacity-25" aria-hidden />
      <div className="relative conteudo pt-12 pb-12">
        <RotuloSecao claro>{sobre}</RotuloSecao>
        <h1 className="titulo text-5xl sm:text-6xl mt-2">{titulo}</h1>
        {children && <div className="mt-3 max-w-2xl text-white/80">{children}</div>}
      </div>
      <div className="relative h-1.5 faixa-quadra" aria-hidden />
    </section>
  )
}

// Rótulo com o risquinho de onda na frente
function RotuloSecao({ claro, children }: { claro: boolean; children: ReactNode }) {
  return (
    <p className={`flex items-center gap-2 font-bold text-sm uppercase tracking-[0.2em] ${claro ? 'text-sol' : 'text-onda'}`}>
      <svg viewBox="0 0 32 10" className="w-8 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
        <path d="M2 5c3.5-4 7-4 10.5 0s7 4 10.5 0 5-3 7-2" />
      </svg>
      {children}
    </p>
  )
}

// Rótulo pequeno + título grande, usado nas seções do site
// `principal` usa h1 (quando é o título da página, como em "Entrar")
export function TituloSecao({ sobre, titulo, claro = false, principal = false }: { sobre: string; titulo: ReactNode; claro?: boolean; principal?: boolean }) {
  const Titulo = principal ? 'h1' : 'h2'
  return (
    <>
      <RotuloSecao claro={claro}>{sobre}</RotuloSecao>
      <Titulo className={`titulo text-5xl mt-1 ${claro ? '' : 'text-mar'}`}>{titulo}</Titulo>
    </>
  )
}

// Título das telas do painel, com ações à direita
export function TituloPagina({ titulo, sub, acoes }: { titulo: string; sub?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="titulo text-4xl sm:text-5xl text-mar">{titulo}</h1>
        {sub && <p className="text-sm text-marinho/70 mt-1">{sub}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}
