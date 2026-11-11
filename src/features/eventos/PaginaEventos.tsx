import { NEGOCIO } from '../../config/estabelecimento'
import { useState } from 'react'
import { CircleCheck, Music, PartyPopper, Trophy, UtensilsCrossed } from 'lucide-react'
import { TIPOS_EVENTO } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { hojeISO, paraDataISO } from '../../lib/datas'
import { esquemaPedidoEvento, valido } from '../../lib/validacao'
import { AreaTexto, Botao, CabecalhoPagina, Campo, Entrada, Selecao } from '../../ui'
import { CamposContato } from '../conta/CamposContato'
import { criarPedidoEvento } from './regras'

const DESTAQUES = [
  { icone: PartyPopper, titulo: 'Quadras exclusivas', texto: 'Uma ou as duas quadras só para o seu grupo, no horário que combinar.' },
  { icone: UtensilsCrossed, titulo: 'Bar e porções', texto: 'Pacotes de porções e bebidas para a turma toda, servidos na mesa.' },
  { icone: Trophy, titulo: 'Torneio organizado', texto: 'Montamos chaves, arbitragem e premiação para o seu torneio entre amigos.' },
  { icone: Music, titulo: 'Clima de praia', texto: 'Área de mesas, som ambiente e iluminação para ir até a noite.' },
]

const VAZIO = { nome: '', telefone: '', tipo: TIPOS_EVENTO[0], data: '', pessoas: 20, obs: '' }

export default function PaginaEventos() {
  const { set } = useDB()
  const [f, setF] = useState(VAZIO)
  const [enviado, setEnviado] = useState(false)
  const pode = valido(esquemaPedidoEvento, f)

  return (
    <>
      <CabecalhoPagina sobre="Eventos e aniversários" titulo={<>Sua festa <span className="text-sol">na areia</span></>}>
        Aniversários, confraternizações de empresa e torneios entre amigos. Conte o que você imagina e a gente monta a proposta.
      </CabecalhoPagina>

      <div className="conteudo py-10 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4 sm:grid-cols-2 self-start">
          {DESTAQUES.map(({ icone: Icone, titulo, texto }) => (
            <div key={titulo} className="rounded-xl bg-white border border-mar/10 p-6">
              <Icone className="size-8 text-laranja" />
              <h2 className="titulo text-3xl text-mar mt-3">{titulo}</h2>
              <p className="text-sm text-marinho/70 mt-1">{texto}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white border border-mar/10 p-6 self-start">
          {enviado ? (
            <div className="text-center py-6">
              <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
              <h2 className="titulo text-4xl text-mar mt-3">Pedido enviado!</h2>
              <p className="mt-2 text-sm text-marinho/70">A equipe do {NEGOCIO.apelido} vai te chamar no WhatsApp com a proposta.</p>
              <Botao
                variante="secundario"
                redondo
                className="mt-5"
                onClick={() => {
                  setF(VAZIO)
                  setEnviado(false)
                }}
              >
                Enviar outro pedido
              </Botao>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!pode) return
                set((db) => criarPedidoEvento(db, { ...f, data: paraDataISO(f.data) }))
                setEnviado(true)
              }}
            >
              <h2 className="titulo text-4xl text-mar">Pedir orçamento</h2>
              <CamposContato contato={f} onChange={(c) => setF({ ...f, ...c })} />
              <Campo rotulo="Tipo de evento">
                <Selecao value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
                  {TIPOS_EVENTO.map((t) => <option key={t}>{t}</option>)}
                </Selecao>
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo rotulo="Data">
                  <Entrada type="date" min={hojeISO()} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
                </Campo>
                <Campo rotulo="Pessoas">
                  <Entrada type="number" min={2} max={300} value={f.pessoas} onChange={(e) => setF({ ...f, pessoas: Number(e.target.value) })} />
                </Campo>
              </div>
              <Campo rotulo="Conte um pouco mais">
                <AreaTexto value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} rows={3} placeholder="Horário, se quer bar, torneio…" />
              </Campo>
              <Botao type="submit" variante="destaque" tamanho="lg" largo disabled={!pode}>
                Enviar pedido
              </Botao>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
