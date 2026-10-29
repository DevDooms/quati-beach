import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type VarianteBotao = 'primario' | 'destaque' | 'secundario' | 'perigo' | 'whatsapp' | 'whatsapp-contorno' | 'claro' | 'contorno-claro'
export type TamanhoBotao = 'sm' | 'md' | 'lg'

const VARIANTES: Record<VarianteBotao, string> = {
  primario: 'bg-petroleo text-white hover:bg-petroleo-escuro',
  destaque: 'bg-sol text-petroleo-noite hover:brightness-105',
  secundario: 'bg-white border border-petroleo/20 text-petroleo hover:border-petroleo/50',
  perigo: 'bg-white border border-red-200 text-red-600 hover:bg-red-50',
  whatsapp: 'bg-whatsapp text-white hover:brightness-105',
  'whatsapp-contorno': 'border-2 border-whatsapp text-whatsapp-escuro hover:bg-whatsapp/10',
  claro: 'bg-white text-petroleo hover:bg-sol',
  'contorno-claro': 'border-2 border-white/30 text-white hover:bg-white/10',
}

const TAMANHOS: Record<TamanhoBotao, string> = {
  sm: 'px-3 py-1.5 text-xs font-bold',
  md: 'px-4 py-2.5 text-sm font-bold',
  lg: 'px-6 py-3.5 font-extrabold',
}

// sm e md são cantos arredondados (painel); lg e `redondo` são pílula (site)
const cantos = (tamanho: TamanhoBotao, redondo: boolean) => (redondo || tamanho === 'lg' ? 'rounded-full' : tamanho === 'sm' ? 'rounded-lg' : 'rounded-xl')

export const classeBotao = (variante: VarianteBotao = 'primario', tamanho: TamanhoBotao = 'md', redondo = false, extra = '') =>
  `inline-flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${cantos(tamanho, redondo)} ${extra}`

interface Comum {
  children: ReactNode
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  redondo?: boolean
  largo?: boolean // ocupa a largura toda
  className?: string // só para posição/espaçamento (margens, grid)
  'aria-label'?: string
}

type Props =
  | (Comum & { href: string; onClick?: () => void }) // link externo (abre em nova aba)
  | (Comum & { para: string }) // rota interna do site
  | (Comum & { onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean })

export function Botao(p: Props) {
  const classe = classeBotao(p.variante, p.tamanho, p.redondo, `${p.largo ? 'w-full' : ''} ${p.className ?? ''}`)
  if ('href' in p) {
    return (
      <a href={p.href} target="_blank" rel="noreferrer" onClick={p.onClick} className={classe} aria-label={p['aria-label']}>
        {p.children}
      </a>
    )
  }
  if ('para' in p) {
    return (
      <Link to={p.para} className={classe} aria-label={p['aria-label']}>
        {p.children}
      </Link>
    )
  }
  return (
    <button type={p.type ?? 'button'} onClick={p.onClick} disabled={p.disabled} className={classe} aria-label={p['aria-label']}>
      {p.children}
    </button>
  )
}
