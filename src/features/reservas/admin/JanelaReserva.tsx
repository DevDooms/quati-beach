import { useState } from 'react'
import { Bell, UserX } from 'lucide-react'
import { quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataLonga, fmtDuracao, fmtFaixa, hojeISO } from '../../../lib/datas'
import { fmtReais } from '../../../lib/formatos'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { Espera, FormaRecebida, Reserva } from '../../../tipos'
import { Aviso, Botao, Confirmar, Detalhes, EtiquetaJanela, IconeWhatsApp, Janela, Selo, SeloOrigem, SeloPago } from '../../../ui'
import { rotuloForma } from '../modal/EscolhaPagamento'
import { alternarFalta, cancelarReserva, filaDoHorario, marcarPago, marcarPendente } from '../regras'

const RECEBIMENTOS: FormaRecebida[] = ['Pix', 'Cartão', 'Dinheiro']

// Detalhes de uma reserva no painel: contato, pagamento, falta, fila e cancelamento
export function JanelaReserva({ reserva, onFechar }: { reserva: Reserva; onFechar: () => void }) {
  const { db, set } = useDB()
  // depois de cancelar, a reserva some do banco: a janela continua mostrando a cópia e a fila para avisar
  const [cancelada, setCancelada] = useState(false)
  const r = db.reservas.find((x) => x.id === reserva.id) ?? reserva
  const quadra = quadraPorId(r.quadraId).nome
  const fila = filaDoHorario(db, r)
  const jaComecou = r.data <= hojeISO()

  if (cancelada) {
    return (
      <Janela onFechar={onFechar} titulo="Reserva cancelada" etiqueta={<EtiquetaJanela>{r.nome}</EtiquetaJanela>}>
        {fila.length > 0 ? (
          <>
            <Aviso tom="sucesso">O horário vagou. Avise o 1º da lista de espera:</Aviso>
            <ListaFila fila={fila} reserva={r} quadra={quadra} destaque />
          </>
        ) : (
          <p className="text-sm text-marinho/70">O horário voltou a ficar livre no site.</p>
        )}
        <Botao onClick={onFechar} largo className="mt-5">Fechar</Botao>
      </Janela>
    )
  }

  return (
    <Janela onFechar={onFechar} titulo={r.nome} etiqueta={<EtiquetaJanela>Reserva de quadra</EtiquetaJanela>}>
      <Detalhes
        itens={[
          { rotulo: 'Telefone', valor: r.telefone },
          { rotulo: 'Quadra', valor: quadra },
          { rotulo: 'Data', valor: fmtDataLonga(dataDeISO(r.data)) },
          { rotulo: 'Horário', valor: `${fmtFaixa(r.hora, r.duracao)} (${fmtDuracao(r.duracao)})` },
          { rotulo: 'Valor', valor: fmtReais(r.valor) },
          { rotulo: 'Origem', valor: <SeloOrigem origem={r.origem} /> },
          ...(r.formaPagamento ? [{ rotulo: 'Forma de pagamento', valor: rotuloForma(r.formaPagamento) }] : []),
          { rotulo: 'Pagamento', valor: <SeloPago pago={r.pago} /> },
          ...(r.falta ? [{ rotulo: 'Presença', valor: <Selo className="bg-red-100 text-red-700">Faltou</Selo> }] : []),
        ]}
      />

      <div className="mt-4 rounded-xl border border-mar/10 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-marinho/70">{r.pago ? 'Pago' : 'Receber agora'}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {r.pago ? (
            <Botao variante="secundario" tamanho="sm" onClick={() => set((db) => marcarPendente(db, r.id))}>Voltar para pendente</Botao>
          ) : (
            RECEBIMENTOS.map((f) => (
              <Botao key={f} variante="secundario" tamanho="sm" onClick={() => set((db) => marcarPago(db, r.id, f))}>
                Pago em {f.toLowerCase()}
              </Botao>
            ))
          )}
        </div>
      </div>

      {fila.length > 0 && <ListaFila fila={fila} reserva={r} quadra={quadra} />}

      <div className="mt-5 grid gap-2">
        <Botao href={whatsPara(r, doEstabelecimento.confirmacaoReserva(r.nome, quadra, r.data, r.hora))} variante="whatsapp" largo>
          <IconeWhatsApp /> Mandar confirmação no WhatsApp
        </Botao>
        <div className="flex flex-wrap gap-2 justify-between">
          {jaComecou && (
            <Botao variante="secundario" onClick={() => set((db) => alternarFalta(db, r.id))}>
              <UserX className="size-4" /> {r.falta ? 'Desfazer falta' : 'Marcar falta'}
            </Botao>
          )}
          <Confirmar
            rotulo="Cancelar reserva"
            pergunta="Cancelar?"
            onConfirmar={() => {
              set((db) => cancelarReserva(db, r.id))
              setCancelada(true)
            }}
          />
        </div>
      </div>
    </Janela>
  )
}

function ListaFila({ fila, reserva: r, quadra, destaque = false }: { fila: Espera[]; reserva: Reserva; quadra: string; destaque?: boolean }) {
  return (
    <div className={`mt-3 rounded-xl border p-3 ${destaque ? 'border-emerald-300 bg-emerald-50' : 'border-laranja/30 bg-laranja/5'}`}>
      <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${destaque ? 'text-emerald-800' : 'text-laranja'}`}>
        <Bell className="size-3.5" /> Lista de espera deste horário
      </p>
      <ol className="mt-1 space-y-1 text-sm">
        {fila.map((e, i) => (
          <li key={e.id} className="flex items-center gap-2">
            <span className="text-marinho/70 font-bold w-5">{i + 1}º</span>
            <span className="flex-1 truncate">{e.nome}</span>
            <a href={whatsPara(e, doEstabelecimento.vagouHorario(e.nome, r.data, r.hora, quadra))} target="_blank" rel="noreferrer" className="text-whatsapp-escuro" aria-label={`Avisar ${e.nome}`}>
              <IconeWhatsApp className="size-4" />
            </a>
          </li>
        ))}
      </ol>
      {!destaque && <p className="mt-1 text-[11px] text-marinho/70">Se cancelar esta reserva, avise o 1º da fila.</p>}
    </div>
  )
}
