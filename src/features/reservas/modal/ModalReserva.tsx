// Janela de confirmação usada para reservar quadra, aula experimental e inscrição em torneio.
import { useState, type ReactNode } from 'react'
import { CircleCheck, CloudRain, LoaderCircle, Repeat } from 'lucide-react'
import { POLITICA } from '../../../config/estabelecimento'
import { linkWhatsApp } from '../../../lib/whatsapp'
import type { FormaPagamento, Pessoa } from '../../../tipos'
import { Aviso, Botao, Detalhes, IconeWhatsApp, Janela } from '../../../ui'
import { CamposContato, useContato } from '../../conta/CamposContato'
import { SEMANAS_FIXO } from '../../mensalistas/regras'
import { DividirConta } from './DividirConta'
import { EscolhaPagamento, rotuloForma } from './EscolhaPagamento'
import { PixDemo } from './PixDemo'

export interface Confirmacao extends Pessoa {
  forma?: FormaPagamento
  repetir: boolean
}

interface Props {
  onFechar: () => void
  titulo: string
  etiqueta?: ReactNode
  detalhes: { rotulo: string; valor: string }[]
  preco?: string
  valor?: number // usado para dividir a conta entre os amigos
  resumoParaGrupo?: string // texto da divisão da conta no grupo
  pagamento?: boolean // mostra Pix / cartão / balcão
  fixo?: boolean // oferece "repetir toda semana"
  textoConfirmar: string
  textoSucesso: string
  mensagemWhatsApp: (nome: string) => string
  onConfirmar: (c: Confirmacao) => void
}

const TEMPO_CARTAO_MS = 1200 // simula o processamento do cartão

export default function ModalReserva(p: Props) {
  const { contato, setContato, ok } = useContato()
  const [forma, setForma] = useState<FormaPagamento>('Pix')
  const [repetir, setRepetir] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [feito, setFeito] = useState(false)

  const confirmar = () => {
    p.onConfirmar({ ...contato, nome: contato.nome.trim(), forma: p.pagamento ? forma : undefined, repetir })
    setFeito(true)
  }

  if (feito) {
    return (
      <Janela onFechar={p.onFechar}>
        <TelaSucesso {...p} forma={p.pagamento ? forma : undefined} repetir={repetir} contato={contato} />
      </Janela>
    )
  }

  const textoBotao = !p.pagamento ? p.textoConfirmar : forma === 'Pix' ? `Gerar Pix · ${p.preco}` : forma === 'Cartão' ? `Pagar com cartão · ${p.preco}` : p.textoConfirmar

  return (
    <Janela onFechar={p.onFechar} titulo={p.titulo} etiqueta={p.etiqueta}>
      <Detalhes
        itens={p.detalhes}
        rodape={
          p.preco && (
            <div className="flex justify-between gap-4 border-t border-areia pt-2 mt-2">
              <dt className="font-semibold">Valor</dt>
              <dd className="font-extrabold text-lg text-petroleo">
                {p.preco}
                {repetir && <span className="text-xs font-semibold text-petroleo-noite/60"> / semana</span>}
              </dd>
            </div>
          )
        }
      />

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok || processando) return
          if (p.pagamento && forma === 'Cartão') {
            setProcessando(true)
            setTimeout(confirmar, TEMPO_CARTAO_MS)
          } else confirmar()
        }}
      >
        <CamposContato contato={contato} onChange={setContato} />
        {p.fixo && <OpcaoRepetir marcado={repetir} onChange={setRepetir} />}
        {p.pagamento && (
          <>
            <EscolhaPagamento forma={forma} onChange={setForma} />
            <Aviso tom="info">
              <span className="flex items-start gap-2 text-xs"><CloudRain className="size-4 shrink-0 mt-px" /> {POLITICA.textoCurto}</span>
            </Aviso>
          </>
        )}

        <Botao type="submit" variante="destaque" tamanho="lg" largo disabled={!ok || processando}>
          {processando ? (
            <>
              <LoaderCircle className="size-5 animate-spin" /> Processando pagamento…
            </>
          ) : (
            textoBotao
          )}
        </Botao>
        <Botao href={linkWhatsApp(p.mensagemWhatsApp(contato.nome.trim()))} variante="whatsapp-contorno" tamanho="lg" largo>
          <IconeWhatsApp /> Prefiro confirmar pelo WhatsApp
        </Botao>
        <p className="text-center text-[11px] text-petroleo-noite/50">
          Ao confirmar, você concorda com a <a href="/privacidade" target="_blank" className="underline">política de privacidade</a>.
        </p>
      </form>
    </Janela>
  )
}

function OpcaoRepetir({ marcado, onChange }: { marcado: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex items-start gap-3 rounded-2xl border-2 p-3 cursor-pointer transition ${marcado ? 'border-sol bg-sol/15' : 'border-petroleo/10 hover:border-petroleo/30'}`}>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-petroleo size-4" />
      <span className="text-sm">
        <b className="inline-flex items-center gap-1.5"><Repeat className="size-4" /> Repetir toda semana</b>
        <span className="block text-xs text-petroleo-noite/60">Seu grupo fica com este horário fixo nas próximas {SEMANAS_FIXO} semanas. Paga semana a semana.</span>
      </span>
    </label>
  )
}

function TelaSucesso(p: Props & { forma?: FormaPagamento; repetir: boolean; contato: Pessoa }) {
  const pix = p.forma === 'Pix'
  const detalhes = [
    ...p.detalhes,
    ...(p.repetir ? [{ rotulo: 'Horário fixo', valor: `Toda semana (${SEMANAS_FIXO} semanas)` }] : []),
    ...(p.forma ? [{ rotulo: 'Pagamento', valor: rotuloForma(p.forma) }] : []),
  ]
  return (
    <div className="text-center py-2">
      {pix ? (
        <PixDemo semente={p.contato.nome + p.contato.telefone} valor={`${p.preco}${p.repetir ? ' (1ª semana)' : ''}`} />
      ) : (
        <>
          <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
          <h2 className="titulo text-4xl mt-4 text-petroleo">{p.textoSucesso}</h2>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            {p.forma === 'Cartão' && 'Pagamento aprovado! '}
            {p.forma === 'Balcão' && `Pague ${p.preco} no balcão quando chegar. `}
            Tudo certo, {p.contato.nome.split(' ')[0]}! Na versão final, a confirmação chega automaticamente no seu WhatsApp.
          </p>
        </>
      )}

      {p.valor !== undefined && p.resumoParaGrupo && <DividirConta valor={p.valor} resumo={p.resumoParaGrupo} />}

      <div className="mt-5 text-left">
        <Detalhes itens={detalhes} />
      </div>
      <Botao onClick={p.onFechar} tamanho="lg" largo className="mt-6">
        {pix ? 'Já paguei' : 'Fechar'}
      </Botao>
    </div>
  )
}
