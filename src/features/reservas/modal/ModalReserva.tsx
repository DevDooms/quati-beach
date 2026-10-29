// Janela de confirmação usada para reservar quadra, aula experimental e inscrição em torneio.
import { useState, type ReactNode } from 'react'
import { CalendarPlus, CircleCheck, Info, LoaderCircle } from 'lucide-react'
import { textoPolitica } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { linkGoogleAgenda, type EventoAgenda } from '../../../lib/calendario'
import { linkWhatsApp } from '../../../lib/whatsapp'
import type { FormaPagamento, Pessoa } from '../../../tipos'
import { Aviso, Botao, Detalhes, IconeWhatsApp, Janela } from '../../../ui'
import { CamposContato, useContato } from '../../conta/CamposContato'
import { saldoDe } from '../../pacotes/regras'
import { DividirConta } from './DividirConta'
import { EscolhaPagamento, rotuloForma } from './EscolhaPagamento'
import { PixDemo } from './PixDemo'

export interface Confirmacao extends Pessoa {
  forma?: FormaPagamento
}

interface Props {
  onFechar: () => void
  titulo: string
  etiqueta?: ReactNode
  detalhes: { rotulo: string; valor: string }[]
  preco?: string
  valor?: number // usado para dividir a conta entre os amigos
  horas?: number // horas que a reserva consome (para pagar com créditos de pacote)
  resumoParaGrupo?: string // texto da divisão da conta no grupo
  evento?: EventoAgenda // para o botão "Adicionar à agenda"
  pagamento?: boolean // mostra Pix / cartão / balcão
  textoConfirmar: string
  textoSucesso: string
  mensagemWhatsApp: (nome: string) => string
  // devolve a mensagem de erro (ex.: "horário acabou de ser reservado") ou null se deu certo
  onConfirmar: (c: Confirmacao) => string | null
}

const TEMPO_CARTAO_MS = 1200 // simula o processamento do cartão

export default function ModalReserva(p: Props) {
  const { db } = useDB()
  const { contato, setContato, ok } = useContato()
  const [forma, setForma] = useState<FormaPagamento>('Pix')
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [feito, setFeito] = useState(false)

  // "Meus créditos" só aparece se o dono vende pacotes e a pessoa tem horas suficientes
  const saldo = saldoDe(db, contato.telefone)
  const podeUsarCredito = db.modulos.pacotes && p.horas !== undefined && saldo >= p.horas
  const formaEscolhida = forma === 'Crédito' && !podeUsarCredito ? 'Pix' : forma

  const confirmar = () => {
    const resultado = p.onConfirmar({ ...contato, nome: contato.nome.trim(), forma: p.pagamento ? formaEscolhida : undefined })
    setProcessando(false)
    if (resultado) setErro(resultado)
    else setFeito(true)
  }

  if (feito) {
    return (
      <Janela onFechar={p.onFechar}>
        <TelaSucesso {...p} forma={p.pagamento ? formaEscolhida : undefined} contato={contato} />
      </Janela>
    )
  }

  const textoBotao = !p.pagamento
    ? p.textoConfirmar
    : formaEscolhida === 'Pix'
      ? `Gerar Pix · ${p.preco}`
      : formaEscolhida === 'Cartão'
        ? `Pagar com cartão · ${p.preco}`
        : formaEscolhida === 'Crédito'
          ? `Usar ${p.horas}h dos meus créditos`
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
          if (!ok || processando) return
          setErro(null)
          if (p.pagamento && formaEscolhida === 'Cartão') {
            setProcessando(true)
            setTimeout(confirmar, TEMPO_CARTAO_MS)
          } else confirmar()
        }}
      >
        <CamposContato contato={contato} onChange={setContato} />
        {p.pagamento && (
          <>
            <EscolhaPagamento forma={formaEscolhida} onChange={setForma} saldoHoras={podeUsarCredito ? saldo : undefined} />
            <Aviso tom="info">
              <span className="flex items-start gap-2 text-xs"><Info className="size-4 shrink-0 mt-px" /> {textoPolitica(db.politica)}</span>
            </Aviso>
          </>
        )}

        {erro && (
          <div role="alert">
            <Aviso>{erro}</Aviso>
          </div>
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
        <p className="text-center text-[11px] text-petroleo-noite/70">
          Ao confirmar, você concorda com a <a href="/privacidade" target="_blank" className="underline">política de privacidade</a>.
        </p>
      </form>
    </Janela>
  )
}

function TelaSucesso(p: Props & { forma?: FormaPagamento; contato: Pessoa }) {
  const pix = p.forma === 'Pix'
  const detalhes = [...p.detalhes, ...(p.forma ? [{ rotulo: 'Pagamento', valor: rotuloForma(p.forma) }] : [])]
  return (
    <div className="text-center py-2">
      {pix ? (
        <PixDemo semente={p.contato.nome + p.contato.telefone} valor={p.preco ?? ''} />
      ) : (
        <>
          <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
          <h2 className="titulo text-4xl mt-4 text-petroleo">{p.textoSucesso}</h2>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            {p.forma === 'Cartão' && 'Pagamento aprovado! '}
            {p.forma === 'Crédito' && `Usamos ${p.horas}h dos seus créditos. `}
            {p.forma === 'Balcão' && `Pague ${p.preco} no balcão quando chegar. `}
            Tudo certo, {p.contato.nome.split(' ')[0]}! Na versão final, a confirmação chega automaticamente no seu WhatsApp.
          </p>
        </>
      )}

      {p.evento && (
        <Botao href={linkGoogleAgenda(p.evento)} variante="secundario" redondo className="mt-4">
          <CalendarPlus className="size-4" /> Adicionar à minha agenda
        </Botao>
      )}

      {p.valor !== undefined && p.resumoParaGrupo && p.forma !== 'Crédito' && <DividirConta valor={p.valor} resumo={p.resumoParaGrupo} />}

      <div className="mt-5 text-left">
        <Detalhes itens={detalhes} />
      </div>
      <Botao onClick={p.onFechar} tamanho="lg" largo className="mt-6">
        {pix ? 'Já paguei' : 'Fechar'}
      </Botao>
    </div>
  )
}
