import { useState } from 'react'
import { CircleCheck, Ticket } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { fmtReais } from '../../lib/formatos'
import type { FormaRecebida, Pacote } from '../../tipos'
import { Aviso, Botao, CabecalhoPagina, Detalhes, EtiquetaJanela, Janela, Vazio } from '../../ui'
import { CamposContato, useContato } from '../conta/CamposContato'
import { EscolhaPagamento } from '../reservas/modal/EscolhaPagamento'
import { PixDemo } from '../reservas/modal/PixDemo'
import { comprarPacote, precoPorHoraDoPacote, saldoDe } from './regras'

// Pacotes criados pelo dono em Painel → Configurações (a página só existe com o módulo ligado)
export default function PaginaPacotes() {
  const { db } = useDB()
  const [escolhido, setEscolhido] = useState<Pacote | null>(null)
  const avulso = db.precos.pico

  return (
    <>
      <CabecalhoPagina sobre="Pacotes" titulo={<>Horas <span className="text-sol">antecipadas</span></>}>
        Compre um pacote e use as horas quando quiser: na hora de reservar, escolha “Meus créditos”.
      </CabecalhoPagina>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {db.pacotes.length === 0 ? (
          <Vazio>Nenhum pacote disponível no momento.</Vazio>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {db.pacotes.map((p) => {
              const porHora = precoPorHoraDoPacote(p)
              const economia = Math.round(avulso * p.horas - p.preco)
              return (
                <div key={p.id} className="rounded-3xl bg-white border border-mar/10 p-6 flex flex-col">
                  <Ticket className="size-8 text-laranja" />
                  <h2 className="titulo text-4xl text-mar mt-3">{p.nome}</h2>
                  <p className="text-sm text-marinho/70">{p.horas} horas · {fmtReais(porHora)} por hora</p>
                  <p className="mt-4 titulo text-5xl text-mar flex-1">{fmtReais(p.preco)}</p>
                  {economia > 0 && <p className="text-xs font-semibold text-emerald-700">Até {fmtReais(economia)} a menos que avulso no horário de pico</p>}
                  <Botao variante="destaque" tamanho="lg" largo className="mt-5" onClick={() => setEscolhido(p)}>Comprar</Botao>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {escolhido && <JanelaComprar pacote={escolhido} onFechar={() => setEscolhido(null)} />}
    </>
  )
}

function JanelaComprar({ pacote, onFechar }: { pacote: Pacote; onFechar: () => void }) {
  const { db, aplicar } = useDB()
  const { contato, setContato, ok } = useContato()
  const [forma, setForma] = useState<FormaRecebida>('Pix')
  const [erro, setErro] = useState<string | null>(null)
  const [feito, setFeito] = useState(false)

  if (feito) {
    return (
      <Janela onFechar={onFechar}>
        <div className="text-center py-2">
          {forma === 'Pix' ? (
            <PixDemo semente={contato.telefone + pacote.id} valor={fmtReais(pacote.preco)} />
          ) : (
            <>
              <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
              <h2 className="titulo text-4xl mt-4 text-mar">Pacote comprado!</h2>
            </>
          )}
          <p className="mt-3 text-sm text-marinho/70">Seu saldo agora é de <b>{saldoDe(db, contato.telefone)} horas</b>.</p>
          <Botao onClick={onFechar} tamanho="lg" largo className="mt-6">Fechar</Botao>
        </div>
      </Janela>
    )
  }

  return (
    <Janela onFechar={onFechar} titulo={pacote.nome} etiqueta={<EtiquetaJanela>Pacote de horas</EtiquetaJanela>}>
      <Detalhes itens={[{ rotulo: 'Horas', valor: String(pacote.horas) }, { rotulo: 'Valor', valor: fmtReais(pacote.preco) }]} />
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok) return
          const resultado = aplicar((db) => comprarPacote(db, pacote.id, contato, forma))
          if (resultado) setErro(resultado)
          else setFeito(true)
        }}
      >
        <CamposContato contato={contato} onChange={setContato} />
        <EscolhaPagamento forma={forma} onChange={(f) => setForma(f as FormaRecebida)} semBalcao />
        {erro && <Aviso>{erro}</Aviso>}
        <Botao type="submit" variante="destaque" tamanho="lg" largo disabled={!ok}>
          {forma === 'Pix' ? `Gerar Pix · ${fmtReais(pacote.preco)}` : `Pagar com cartão · ${fmtReais(pacote.preco)}`}
        </Botao>
      </form>
    </Janela>
  )
}
