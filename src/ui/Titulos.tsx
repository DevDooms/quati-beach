import type { ReactNode } from 'react'
import { Ondas } from './Icones'

// Faixa de céu e mar no topo das páginas do site, terminando em onda na areia
export function CabecalhoPagina({ sobre, titulo, children }: { sobre: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className="ceu-mar text-white relative overflow-hidden">
      <div className="absolute -right-20 -top-24 size-72 rounded-full border-[16px] border-sol/80" aria-hidden />
      <div className="absolute inset-0 textura-rede opacity-50 [mask-image:linear-gradient(to_top,black,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-20">
        <RotuloSecao claro>{sobre}</RotuloSecao>
        <h1 className="titulo text-5xl sm:text-6xl mt-2 drop-shadow-[0_4px_0_rgb(12_31_77/0.35)]">{titulo}</h1>
        {children && <div className="mt-3 max-w-2xl text-white/80">{children}</div>}
      </div>
      <Ondas className="absolute bottom-0 left-0 w-full h-12 sm:h-14" />
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
