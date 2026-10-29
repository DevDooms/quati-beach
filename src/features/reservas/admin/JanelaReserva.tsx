import { quadraPorId } from '../../../config/estabelecimento'
import { CLIENTE_DEMO } from '../../../demo/dados'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataLonga, fmtFaixa } from '../../../lib/datas'
import { fmtReais } from '../../../lib/formatos'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { Reserva } from '../../../tipos'
import { Aviso, Botao, Confirmar, Detalhes, EtiquetaJanela, IconeWhatsApp, Janela, SeloOrigem, SeloPago } from '../../../ui'
import { rotuloForma } from '../modal/EscolhaPagamento'
import { alternarPago, cancelarReserva, filaDoHorario, precoReserva } from '../regras'

// Detalhes de uma reserva no painel: contato, pagamento, fila e cancelamento
export function JanelaReserva({ reserva, onFechar }: { reserva: Reserva; onFechar: () => void }) {
  const { db, set } = useDB()
  const r = db.reservas.find((x) => x.id === reserva.id) ?? reserva
  const quadra = quadraPorId(r.quadraId).nome
  const fila = filaDoHorario(db, r)
  const pagar = () => set((db) => alternarPago(db, r.id))

  return (
    <Janela onFechar={onFechar} titulo={r.nome} etiqueta={<EtiquetaJanela>Reserva de quadra</EtiquetaJanela>}>
      <Detalhes
        itens={[
          { rotulo: 'Telefone', valor: r.telefone },
          { rotulo: 'Quadra', valor: quadra },
          { rotulo: 'Data', valor: fmtDataLonga(dataDeISO(r.data)) },
          { rotulo: 'Horário', valor: fmtFaixa(r.hora) },
          { rotulo: 'Valor', valor: fmtReais(precoReserva(db, r)) },
          { rotulo: 'Origem', valor: <SeloOrigem origem={r.origem} /> },
          ...(r.formaPagamento ? [{ rotulo: 'Forma de pagamento', valor: rotuloForma(r.formaPagamento) }] : []),
          { rotulo: 'Pagamento', valor: <SeloPago pago={r.pago} onClick={pagar} /> },
        ]}
      />

      <div className="mt-3 space-y-3">
        {r.fixoId && <Aviso tom="info">Horário fixo (mensalista). Cancelar aqui libera só esta semana.</Aviso>}
        {fila.length > 0 && (
          <div className="rounded-xl border border-laranja/30 bg-laranja/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-laranja">Lista de espera deste horário</p>
            <ol className="mt-1 space-y-1 text-sm">
              {fila.map((e, i) => (
                <li key={e.id} className="flex items-center gap-2">
                  <span className="text-petroleo-noite/40 font-bold w-5">{i + 1}º</span>
                  <span className="flex-1 truncate">{e.nome}</span>
                  <a href={whatsPara(e, doEstabelecimento.vagouHorario(e.nome, r.data, r.hora, quadra))} target="_blank" rel="noreferrer" className="text-whatsapp-escuro" aria-label={`Avisar ${e.nome}`}>
                    <IconeWhatsApp className="size-4" />
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-1 text-[11px] text-petroleo-noite/60">Se cancelar esta reserva, avise o 1º da fila.</p>
          </div>
        )}
        {r.telefone === CLIENTE_DEMO.telefone && <p className="text-xs text-petroleo-noite/60">Este é o cliente usado na demonstração da Área do cliente.</p>}
      </div>

      <div className="mt-5 grid gap-2">
        <Botao href={whatsPara(r, doEstabelecimento.confirmacaoReserva(r.nome, quadra, r.data, r.hora))} variante="whatsapp" largo>
          <IconeWhatsApp /> Mandar confirmação no WhatsApp
        </Botao>
        <div className="flex flex-wrap gap-2 justify-between">
          <Botao variante="secundario" onClick={pagar}>{r.pago ? 'Marcar como pendente' : 'Marcar como pago'}</Botao>
          <Confirmar
            rotulo="Cancelar reserva"
            pergunta="Cancelar?"
            onConfirmar={() => {
              set((db) => cancelarReserva(db, r.id))
              onFechar()
            }}
          />
        </div>
      </div>
    </Janela>
  )
}
