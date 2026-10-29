import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// Um só estilo de campo para o site e o painel; `compacto` é o tamanho do painel.
export const classeEntrada = (compacto = false) =>
  `w-full rounded-xl border border-mar/20 bg-white outline-none focus:border-onda focus:ring-2 focus:ring-onda/30 ${
    compacto ? 'px-3 py-2.5 text-sm' : 'px-4 py-3'
  }`

export function Campo({ rotulo, children, compacto, className = '' }: { rotulo: string; children: ReactNode; compacto?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={compacto ? 'text-xs font-bold uppercase tracking-wide text-marinho/70' : 'text-sm font-semibold'}>{rotulo}</span>
      <span className="block mt-1">{children}</span>
    </label>
  )
}

type ComCompacto<T> = T & { compacto?: boolean; icone?: ReactNode }

export function Entrada({ compacto, icone, className = '', ...props }: ComCompacto<InputHTMLAttributes<HTMLInputElement>>) {
  if (!icone) return <input {...props} className={`${classeEntrada(compacto)} ${className}`} />
  return (
    <span className="relative block">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marinho/70 [&>svg]:size-4">{icone}</span>
      <input {...props} className={`${classeEntrada(compacto)} pl-10 ${className}`} />
    </span>
  )
}

export function Selecao({ compacto, className = '', ...props }: ComCompacto<SelectHTMLAttributes<HTMLSelectElement>>) {
  return <select {...props} className={`${classeEntrada(compacto)} ${className}`} />
}

export function AreaTexto({ compacto, className = '', ...props }: ComCompacto<TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return <textarea {...props} className={`${classeEntrada(compacto)} ${className}`} />
}
