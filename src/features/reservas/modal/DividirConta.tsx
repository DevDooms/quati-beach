import { useState, type ReactNode } from 'react'
import { Minus, Plus, Users } from 'lucide-react'
import { fmtReaisCentavos } from '../../../lib/formatos'
import { doCliente } from '../../../lib/mensagens'
import { linkCompartilhar } from '../../../lib/whatsapp'
import { Botao, IconeWhatsApp } from '../../../ui'

const MIN = 2
const MAX = 12

// Divide o valor da quadra entre os amigos e gera a mensagem para o grupo
export function DividirConta({ valor, resumo }: { valor: number; resumo: string }) {
  const [pessoas, setPessoas] = useState(4)

  return (
    <div className="mt-5 rounded-2xl border-2 border-dashed border-onda/40 p-4 text-left">
      <p className="font-bold flex items-center gap-2 text-petroleo"><Users className="size-5" /> Dividir com a galera</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BotaoRedondo onClick={() => setPessoas((n) => Math.max(MIN, n - 1))} rotulo="Menos pessoas"><Minus className="size-4" /></BotaoRedondo>
          <span className="w-16 text-center text-sm"><b className="text-lg">{pessoas}</b> pessoas</span>
          <BotaoRedondo onClick={() => setPessoas((n) => Math.min(MAX, n + 1))} rotulo="Mais pessoas"><Plus className="size-4" /></BotaoRedondo>
        </div>
        <p className="text-right leading-tight">
          <span className="titulo text-3xl text-petroleo">{fmtReaisCentavos(valor / pessoas)}</span>
          <span className="block text-[11px] text-petroleo-noite/70">por pessoa</span>
        </p>
      </div>
      <Botao href={linkCompartilhar(doCliente.dividirConta(resumo, valor, pessoas))} variante="whatsapp" tamanho="lg" largo className="mt-3">
        <IconeWhatsApp className="size-4" /> Mandar no grupo do WhatsApp
      </Botao>
    </div>
  )
}

function BotaoRedondo({ onClick, rotulo, children }: { onClick: () => void; rotulo: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="size-9 rounded-full border border-petroleo/20 grid place-items-center" aria-label={rotulo}>
      {children}
    </button>
  )
}
