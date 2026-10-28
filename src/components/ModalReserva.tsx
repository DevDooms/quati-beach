import { useState, type ReactNode } from 'react'
import { CircleCheck, Copy, CreditCard, LoaderCircle, QrCode, ShieldCheck, Store } from 'lucide-react'
import { CLIENTE_DEMO } from '../data/mock'
import { linkWhatsApp } from '../lib/agenda'
import { sorteio, useLoginDemo, type FormaPagamento } from '../lib/store'
import { IconeWhatsApp } from './Icones'
import { Detalhes, Janela } from './Pecas'

interface Props {
  onFechar: () => void
  titulo: string
  etiqueta?: ReactNode
  detalhes: { rotulo: string; valor: string }[]
  preco?: string
  // mostra a escolha Pix / cartão / balcão (só faz sentido quando há valor a pagar)
  pagamento?: boolean
  textoConfirmar: string
  textoSucesso: string
  mensagemWhatsApp: (nome: string) => string
  onConfirmar: (nome: string, telefone: string, forma?: FormaPagamento) => void
}

export function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const classeCampo =
  'mt-1 w-full rounded-xl border border-petroleo/20 bg-white px-4 py-3 outline-none focus:border-onda focus:ring-2 focus:ring-onda/30'

const FORMAS: { id: FormaPagamento; rotulo: string; detalhe: string; icone: typeof QrCode }[] = [
  { id: 'Pix', rotulo: 'Pix', detalhe: 'Aprovação na hora', icone: QrCode },
  { id: 'Cartão', rotulo: 'Cartão', detalhe: 'Crédito ou débito', icone: CreditCard },
  { id: 'Balcão', rotulo: 'No balcão', detalhe: 'Paga ao chegar', icone: Store },
]

// Código Pix de mentira, só para a demonstração
const PIX_DEMO = '00020126580014BR.GOV.BCB.PIX0136quatibeachsport-demo5204000053039865802BR5925QUATI BEACH SPORT DEMO6011EMBU GUACU6304ABCD'

export default function ModalReserva(p: Props) {
  // se o cliente "entrou" na área do cliente, os dados já vêm preenchidos
  const { logado } = useLoginDemo('cliente')
  const [nome, setNome] = useState(logado ? CLIENTE_DEMO.nome : '')
  const [telefone, setTelefone] = useState(logado ? CLIENTE_DEMO.telefone : '')
  const [forma, setForma] = useState<FormaPagamento>('Pix')
  const [processando, setProcessando] = useState(false)
  const [feito, setFeito] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const valido = nome.trim().length >= 2 && telefone.replace(/\D/g, '').length >= 10

  const confirmar = () => {
    p.onConfirmar(nome.trim(), telefone, p.pagamento ? forma : undefined)
    setFeito(true)
  }

  if (feito) {
    const pix = p.pagamento && forma === 'Pix'
    return (
      <Janela onFechar={p.onFechar}>
        <div className="text-center py-2">
          {pix ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-onda">Reserva garantida · pague com Pix</p>
              <h2 className="titulo text-4xl mt-1 text-petroleo">Escaneie o QR Code</h2>
              <div className="mt-4 mx-auto w-48 rounded-2xl border-2 border-petroleo/10 p-3 bg-white">
                <QrFalso semente={nome + telefone} />
              </div>
              <p className="mt-3 text-sm font-extrabold text-petroleo">{p.preco}</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-areia-claro p-2 text-left">
                <code className="flex-1 truncate text-xs text-petroleo-noite/70">{PIX_DEMO}</code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(PIX_DEMO).catch(() => {})
                    setCopiado(true)
                  }}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-petroleo text-white px-3 py-1.5 text-xs font-bold"
                >
                  <Copy className="size-3.5" /> {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-petroleo-noite/50">Demonstração: este Pix não é real.</p>
            </>
          ) : (
            <>
              <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
              <h2 className="titulo text-4xl mt-4 text-petroleo">{p.textoSucesso}</h2>
              <p className="mt-2 text-sm text-petroleo-noite/70">
                {p.pagamento && forma === 'Cartão' && 'Pagamento aprovado! '}
                {p.pagamento && forma === 'Balcão' && `Pague ${p.preco} no balcão quando chegar. `}
                Tudo certo, {nome.split(' ')[0]}! Na versão final, a confirmação chega automaticamente no seu WhatsApp.
              </p>
            </>
          )}
          <div className="mt-6 text-left">
            <Detalhes itens={p.pagamento ? [...p.detalhes, { rotulo: 'Pagamento', valor: FORMAS.find((f) => f.id === forma)!.rotulo }] : p.detalhes} />
          </div>
          <button onClick={p.onFechar} className="mt-6 w-full rounded-full bg-petroleo text-white py-3 font-bold">
            {pix ? 'Já paguei' : 'Fechar'}
          </button>
        </div>
      </Janela>
    )
  }

  const textoBotao = !p.pagamento
    ? p.textoConfirmar
    : forma === 'Pix'
      ? `Gerar Pix · ${p.preco}`
      : forma === 'Cartão'
        ? `Pagar com cartão · ${p.preco}`
        : p.textoConfirmar

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
          if (!valido || processando) return
          if (p.pagamento && forma === 'Cartão') {
            // simula o tempo do pagamento com cartão
            setProcessando(true)
            setTimeout(confirmar, 1200)
          } else confirmar()
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

        {p.pagamento && (
          <fieldset>
            <legend className="text-sm font-semibold">Forma de pagamento</legend>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {FORMAS.map(({ id, rotulo, detalhe, icone: Icone }) => {
                const ativo = forma === id
                return (
                  <label
                    key={id}
                    className={`cursor-pointer rounded-2xl border-2 px-2 py-3 text-center transition ${
                      ativo ? 'border-onda bg-onda-claro/60' : 'border-petroleo/10 hover:border-petroleo/30'
                    }`}
                  >
                    <input type="radio" name="forma" value={id} checked={ativo} onChange={() => setForma(id)} className="sr-only" />
                    <Icone className={`size-6 mx-auto ${ativo ? 'text-petroleo' : 'text-petroleo-noite/50'}`} />
                    <span className="block mt-1 text-sm font-bold">{rotulo}</span>
                    <span className="block text-[11px] text-petroleo-noite/60 leading-tight">{detalhe}</span>
                  </label>
                )
              })}
            </div>
            {forma === 'Cartão' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-petroleo-noite/60">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" /> Pagamento seguro · Visa, Mastercard, Elo e Hipercard
              </p>
            )}
            {forma === 'Balcão' && (
              <p className="mt-2 text-xs text-petroleo-noite/60">O horário fica reservado e você paga em dinheiro, Pix ou cartão ao chegar.</p>
            )}
          </fieldset>
        )}

        <button
          type="submit"
          disabled={!valido || processando}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
        >
          {processando ? (
            <>
              <LoaderCircle className="size-5 animate-spin" /> Processando pagamento…
            </>
          ) : (
            textoBotao
          )}
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

// QR Code ilustrativo (não é lido por nenhum banco)
function QrFalso({ semente }: { semente: string }) {
  const n = 25
  const ehMarcador = (x: number, y: number) => {
    const canto = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
    return canto(0, 0) || canto(n - 7, 0) || canto(0, n - 7)
  }
  const celulas: ReactNode[] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (!ehMarcador(x, y) && sorteio(`${semente}|${x}|${y}`) < 0.48) celulas.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
  const marcador = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <rect x={cx} y={cy} width="7" height="7" />
      <rect x={cx + 1} y={cy + 1} width="5" height="5" fill="#fff" />
      <rect x={cx + 2} y={cy + 2} width="3" height="3" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="w-full h-auto" shapeRendering="crispEdges" fill="#072a2e" aria-label="QR Code Pix (ilustrativo)">
      {celulas}
      {marcador(0, 0)}
      {marcador(n - 7, 0)}
      {marcador(0, n - 7)}
    </svg>
  )
}
