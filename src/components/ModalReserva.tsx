import { useState, type ReactNode } from 'react'
import { CircleCheck } from 'lucide-react'
import { CLIENTE_DEMO } from '../data/mock'
import { linkWhatsApp } from '../lib/agenda'
import { useLoginDemo } from '../lib/store'
import { IconeWhatsApp } from './Icones'
import { Detalhes, Janela } from './Pecas'

interface Props {
  onFechar: () => void
  titulo: string
  etiqueta?: ReactNode
  detalhes: { rotulo: string; valor: string }[]
  preco?: string
  textoConfirmar: string
  textoSucesso: string
  mensagemWhatsApp: (nome: string) => string
  onConfirmar: (nome: string, telefone: string) => void
}

export function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const classeCampo =
  'mt-1 w-full rounded-xl border border-petroleo/20 bg-white px-4 py-3 outline-none focus:border-onda focus:ring-2 focus:ring-onda/30'

export default function ModalReserva(p: Props) {
  // se o cliente "entrou" na área do cliente, os dados já vêm preenchidos
  const { logado } = useLoginDemo('cliente')
  const [nome, setNome] = useState(logado ? CLIENTE_DEMO.nome : '')
  const [telefone, setTelefone] = useState(logado ? CLIENTE_DEMO.telefone : '')
  const [feito, setFeito] = useState(false)
  const valido = nome.trim().length >= 2 && telefone.replace(/\D/g, '').length >= 10

  if (feito) {
    return (
      <Janela onFechar={p.onFechar}>
        <div className="text-center py-2">
          <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
          <h2 className="titulo text-4xl mt-4 text-petroleo">{p.textoSucesso}</h2>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            Tudo certo, {nome.split(' ')[0]}! Na versão final, a confirmação chega automaticamente no seu WhatsApp.
          </p>
          <div className="mt-6 text-left">
            <Detalhes itens={p.detalhes} />
          </div>
          <button onClick={p.onFechar} className="mt-6 w-full rounded-full bg-petroleo text-white py-3 font-bold">
            Fechar
          </button>
        </div>
      </Janela>
    )
  }

  return (
    <Janela onFechar={p.onFechar} titulo={p.titulo} etiqueta={p.etiqueta}>
      <Detalhes
        itens={p.detalhes}
        rodape={
          p.preco && (
            <div className="flex justify-between gap-4 border-t border-areia pt-2 mt-2">
              <dt className="font-semibold">Valor</dt>
              <dd className="font-extrabold text-lg text-petroleo">{p.preco}</dd>
            </div>
          )
        }
      />

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valido) return
          p.onConfirmar(nome.trim(), telefone)
          setFeito(true)
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold">Seu nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" className={classeCampo} autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">WhatsApp</span>
          <input
            value={telefone}
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            className={classeCampo}
            autoComplete="tel"
          />
        </label>

        <button
          type="submit"
          disabled={!valido}
          className="w-full rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
        >
          {p.textoConfirmar}
        </button>
        <a
          href={linkWhatsApp(p.mensagemWhatsApp(nome.trim()))}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-[#25d366] text-[#128c4a] py-3 font-bold hover:bg-[#25d366]/10"
        >
          <IconeWhatsApp /> Prefiro confirmar pelo WhatsApp
        </a>
      </form>
    </Janela>
  )
}
