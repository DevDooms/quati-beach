import { Link } from 'react-router-dom'
import { CalendarDays, Clock, History, MapPin, X } from 'lucide-react'
import { POLITICA, quadraPorId } from '../../config/estabelecimento'
import { CLIENTE_DEMO } from '../../demo/dados'
import { useDB } from '../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDataLonga, fmtDiaSemana, fmtFaixa } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import { linkWhatsApp } from '../../lib/whatsapp'
import type { Reserva } from '../../tipos'
import { Botao, IconeWhatsApp, Selo, Vazio } from '../../ui'
import { rotuloForma } from '../reservas/modal/EscolhaPagamento'
import { cancelarReserva, podeCancelar, precoReserva } from '../reservas/regras'
import { TituloConta } from './TituloConta'

export function ProximasReservas({ reservas }: { reservas: Reserva[] }) {
  return (
    <section>
      <TituloConta icone={<CalendarDays />}>Próximas reservas</TituloConta>
      <div className="mt-3 space-y-3">
        {reservas.length === 0 && (
          <Vazio>
            Nenhuma reserva marcada. <Link to="/agendar" className="font-bold text-onda">Reservar agora</Link>
          </Vazio>
        )}
        {reservas.map((r) => <CartaoReserva key={r.id} reserva={r} />)}
      </div>
    </section>
  )
}

function CartaoReserva({ reserva: r }: { reserva: Reserva }) {
  const { db, set } = useDB()
  const d = dataDeISO(r.data)
  const quadra = quadraPorId(r.quadraId).nome
  return (
    <article className="rounded-2xl bg-white border border-petroleo/10 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-petroleo text-white text-center px-3 py-2 shrink-0">
          <p className="text-[11px] uppercase text-sol font-semibold">{fmtDiaSemana(d)}</p>
          <p className="titulo text-3xl leading-none">{d.getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold first-letter:uppercase">{fmtDataLonga(d)}</p>
          <p className="text-sm text-petroleo-noite/70 flex flex-wrap gap-x-3">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{fmtFaixa(r.hora)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{quadra}</span>
          </p>
          <p className={`mt-1 text-xs font-bold ${r.pago ? 'text-emerald-700' : 'text-laranja'}`}>
            {r.pago ? `Pago${r.formaPagamento ? ` · ${rotuloForma(r.formaPagamento)}` : ''}` : `A pagar no local · ${fmtReais(precoReserva(db, r))}`}
            {r.fixoId && <Selo className="ml-2 bg-sol/30 text-petroleo-noite">Horário fixo</Selo>}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Botao href={linkWhatsApp(doCliente.remarcar(CLIENTE_DEMO.nome, r.data, r.hora, quadra))} variante="secundario" redondo>
          <IconeWhatsApp className="size-4 text-whatsapp-escuro" /> Remarcar
        </Botao>
        {podeCancelar(r) ? (
          <Botao variante="perigo" redondo onClick={() => set((db) => cancelarReserva(db, r.id))}>
            <X className="size-4" /> Cancelar
          </Botao>
        ) : (
          <span className="inline-flex items-center justify-center rounded-full bg-petroleo/5 px-2 text-center text-[11px] leading-tight text-petroleo-noite/60">
            Menos de {POLITICA.cancelamentoHoras}h: fale no WhatsApp
          </span>
        )}
      </div>
    </article>
  )
}

export function Historico({ reservas }: { reservas: Reserva[] }) {
  return (
    <section>
      <TituloConta icone={<History />}>Histórico</TituloConta>
      <div className="mt-3 rounded-2xl bg-white border border-petroleo/10 divide-y divide-petroleo/10">
        {reservas.length === 0 && <p className="p-4 text-sm text-petroleo-noite/60">Nada por aqui ainda.</p>}
        {reservas.map((r) => {
          const d = dataDeISO(r.data)
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="first-letter:uppercase">
                {fmtDiaSemana(d)} {fmtDataCurta(d)} · {fmtFaixa(r.hora)}
              </span>
              <span className="text-petroleo-noite/60">{quadraPorId(r.quadraId).nome}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
