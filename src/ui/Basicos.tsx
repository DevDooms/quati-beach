import { useState, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import type { Professor } from '../tipos'
import { Botao } from './Botao'

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-petroleo/10 shadow-sm ${className}`}>{children}</div>
}

export function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition ${
        ativo ? 'bg-petroleo text-white border-petroleo' : 'bg-white text-petroleo-noite/80 border-petroleo/15 hover:border-petroleo/40'
      }`}
    >
      {children}
    </button>
  )
}

export function Avatar({ professor, tamanho = 'size-10' }: { professor: Pick<Professor, 'cor' | 'iniciais'>; tamanho?: string }) {
  return (
    <span className={`${tamanho} shrink-0 rounded-full bg-gradient-to-br ${professor.cor} text-white grid place-items-center font-bold`}>
      {professor.iniciais}
    </span>
  )
}

// Lista "rótulo → valor" (resumo de reserva, aula, inscrição…)
export function Detalhes({ itens, rodape }: { itens: { rotulo: string; valor: ReactNode }[]; rodape?: ReactNode }) {
  return (
    <dl className="rounded-2xl bg-areia-claro p-4 text-sm space-y-1.5">
      {itens.map((d) => (
        <div key={d.rotulo} className="flex justify-between gap-4">
          <dt className="text-petroleo-noite/70">{d.rotulo}</dt>
          <dd className="font-semibold text-right first-letter:uppercase">{d.valor}</dd>
        </div>
      ))}
      {rodape}
    </dl>
  )
}

// Numerozinho com legenda (cartões do painel)
export function MiniNumero({ valor, rotulo }: { valor: ReactNode; rotulo: string }) {
  return (
    <div className="rounded-xl bg-areia-claro py-2 text-center">
      <p className="titulo text-2xl sm:text-3xl text-petroleo">{valor}</p>
      <p className="text-[11px] text-petroleo-noite/70">{rotulo}</p>
    </div>
  )
}

// Estado vazio de listas
export function Vazio({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-petroleo/15 p-6 text-center text-sm text-petroleo-noite/70">{children}</p>
}

// Aviso colorido curto (alertas de conflito, dicas)
export function Aviso({ children, tom = 'alerta' }: { children: ReactNode; tom?: 'alerta' | 'info' | 'sucesso' }) {
  const cores = { alerta: 'bg-amber-50 text-amber-800', info: 'bg-onda-claro/60 text-petroleo', sucesso: 'bg-emerald-50 text-emerald-800' }
  return <p className={`rounded-xl p-3 text-sm ${cores[tom]}`}>{children}</p>
}

// Botão que pede confirmação antes de uma ação destrutiva
export function Confirmar({ rotulo, pergunta, onConfirmar }: { rotulo: ReactNode; pergunta: string; onConfirmar: () => void }) {
  const [perguntando, setPerguntando] = useState(false)
  if (!perguntando)
    return (
      <Botao variante="perigo" onClick={() => setPerguntando(true)}>
        <Trash2 className="size-4" /> {rotulo}
      </Botao>
    )
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-sm">
      <span className="text-red-700 font-semibold">{pergunta}</span>
      <button onClick={onConfirmar} className="rounded-lg bg-red-600 text-white px-3 py-1 font-bold">Sim</button>
      <button onClick={() => setPerguntando(false)} className="rounded-lg px-2 py-1 font-semibold">Não</button>
    </div>
  )
}
