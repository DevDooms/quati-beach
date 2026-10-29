import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CalendarDays, Clock, History, MapPin, X } from 'lucide-react'
import { quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDataLonga, fmtDiaSemana, fmtFaixa } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import { linkWhatsApp } from '../../lib/whatsapp'
import type { Reserva } from '../../tipos'
import { Botao, IconeWhatsApp, Vazio } from '../../ui'
import { rotuloForma } from '../reservas/modal/EscolhaPagamento'
import { cancelarReserva, podeCancelar } from '../reservas/regras'
import { JanelaRemarcar } from './JanelaRemarcar'
import { TituloConta } from './TituloConta'

export function ProximasReservas({ reservas }: { reservas: Reserva[] }) {
  const [remarcando, setRemarcando] = useState<Reserva | null>(null)
  return (
    <section>
      <TituloConta icone={<CalendarDays />}>Próximas reservas</TituloConta>
      <div className="mt-3 space-y-3">
        {reservas.length === 0 && (
          <Vazio>
            Nenhuma reserva marcada. <Link to="/agendar" className="font-bold text-onda">Reservar agora</Link>
          </Vazio>
        )}
        {reservas.map((r) => <CartaoReserva key={r.id} reserva={r} onRemarcar={() => setRemarcando(r)} />)}
      </div>
      {remarcando && <JanelaRemarcar reserva={remarcando} onFechar={() => setRemarcando(null)} />}
    </section>
  )
}

function CartaoReserva({ reserva: r, onRemarcar }: { reserva: Reserva; onRemarcar: () => void }) {
  const { db, set } = useDB()
  const d = dataDeISO(r.data)
  const quadra = quadraPorId(r.quadraId).nome
  // dentro do prazo do dono dá para remarcar/cancelar pelo site; depois disso, pelo WhatsApp
  const noPrazo = podeCancelar(r, db.politica)
  return (
    <article className="rounded-2xl bg-white border border-mar/10 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-mar text-white text-center px-3 py-2 shrink-0">
          <p className="text-[11px] uppercase text-sol font-semibold">{fmtDiaSemana(d)}</p>
          <p className="titulo text-3xl leading-none">{d.getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold first-letter:uppercase">{fmtDataLonga(d)}</p>
          <p className="text-sm text-marinho/70 flex flex-wrap gap-x-3">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{fmtFaixa(r.hora, r.duracao)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{quadra}</span>
          </p>
          <p className={`mt-1 text-xs font-bold ${r.pago ? 'text-emerald-700' : 'text-laranja'}`}>
            {r.pago ? `Pago${r.formaPagamento ? ` · ${rotuloForma(r.formaPagamento)}` : ''}` : `A pagar no local · ${fmtReais(r.valor)}`}
          </p>
        </div>
      </div>
      {noPrazo ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Botao variante="secundario" redondo onClick={onRemarcar}>
            <CalendarClock className="size-4" /> Remarcar
          </Botao>
          <Botao variante="perigo" redondo onClick={() => set((db) => cancelarReserva(db, r.id))}>
            <X className="size-4" /> Cancelar
          </Botao>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-marinho/70">Faltam menos de {db.politica.cancelamentoHoras}h: mudanças pelo WhatsApp.</span>
          <Botao href={linkWhatsApp(doCliente.remarcar(r.nome, r.data, r.hora, quadra))} variante="secundario" redondo tamanho="sm">
            <IconeWhatsApp className="size-4 text-whatsapp-escuro" /> Falar com a gente
          </Botao>
        </div>
      )}
    </article>
  )
}

export function Historico({ reservas }: { reservas: Reserva[] }) {
  return (
    <section>
      <TituloConta icone={<History />}>Histórico</TituloConta>
      <div className="mt-3 rounded-2xl bg-white border border-mar/10 divide-y divide-mar/10">
        {reservas.length === 0 && <p className="p-4 text-sm text-marinho/70">Nada por aqui ainda.</p>}
        {reservas.map((r) => {
          const d = dataDeISO(r.data)
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="first-letter:uppercase">
                {fmtDiaSemana(d)} {fmtDataCurta(d)} · {fmtFaixa(r.hora, r.duracao)}
              </span>
              <span className="text-marinho/70">{quadraPorId(r.quadraId).nome}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
