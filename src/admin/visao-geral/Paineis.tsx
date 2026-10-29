// Blocos da Visão geral
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Bell, PartyPopper, Sparkles } from 'lucide-react'
import { modalidadePorId, quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDiaSemana, fmtFaixa, fmtHora } from '../../lib/datas'
import type { Reserva } from '../../tipos'
import { Cartao, IconeWhatsApp, SeloOrigem, SeloPago } from '../../ui'
import { acharProfessor } from '../../features/aulas/regras'
import { agendaRestanteDeHoje, origensDasReservas, reservasPorDia, reservasRecentes } from './indicadores'

export function Kpi({ icone, rotulo, valor, detalhe, barra, alerta }: { icone: ReactNode; rotulo: string; valor: string; detalhe: string; barra?: number; alerta?: boolean }) {
  return (
    <Cartao className="p-4">
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${alerta ? 'text-amber-700' : 'text-petroleo-noite/60'} [&>svg]:size-4`}>
        {icone} {rotulo}
      </div>
      <p className="titulo text-4xl text-petroleo mt-2">{valor}</p>
      {barra !== undefined && (
        <div className="mt-1 h-1.5 rounded-full bg-petroleo/10 overflow-hidden">
          <div className="h-full bg-onda rounded-full" style={{ width: `${barra}%` }} />
        </div>
      )}
      <p className="text-xs text-petroleo-noite/60 mt-1">{detalhe}</p>
    </Cartao>
  )
}

export function AvisosPendentes({ eventos, fila }: { eventos: number; fila: number }) {
  if (!eventos && !fila) return null
  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      {eventos > 0 && (
        <Link to="/admin/solicitacoes" className="flex items-center gap-3 rounded-2xl bg-laranja/10 border border-laranja/30 px-4 py-3 text-sm hover:bg-laranja/15">
          <PartyPopper className="size-5 text-laranja" />
          <span className="flex-1"><b>{eventos} pedido{eventos > 1 ? 's' : ''} de evento</b> esperando resposta</span>
          <ArrowRight className="size-4" />
        </Link>
      )}
      {fila > 0 && (
        <Link to="/admin/solicitacoes?aba=espera" className="flex items-center gap-3 rounded-2xl bg-onda-claro border border-onda/30 px-4 py-3 text-sm hover:bg-onda-claro/70">
          <Bell className="size-5 text-onda" />
          <span className="flex-1"><b>{fila} pessoa{fila > 1 ? 's' : ''}</b> na lista de espera</span>
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

export function AgendaDeHoje({ onAbrir }: { onAbrir: (r: Reserva) => void }) {
  const { db } = useDB()
  const linhas = agendaRestanteDeHoje(db)
  return (
    <Cartao className="min-w-0">
      <div className="flex items-center justify-between p-5 pb-3">
        <h2 className="titulo text-3xl text-petroleo">Agenda de hoje</h2>
        <Link to="/admin/agenda" className="text-sm font-semibold text-onda inline-flex items-center gap-1 shrink-0">Ver tudo <ArrowRight className="size-4" /></Link>
      </div>
      <ul className="divide-y divide-petroleo/10">
        {linhas.length === 0 && <li className="px-5 pb-5 text-sm text-petroleo-noite/60">Nada mais marcado para hoje.</li>}
        {linhas.map((s) => {
          const quadra = quadraPorId(s.quadraId).nome
          if (s.reserva) {
            const r = s.reserva
            return (
              <li key={r.id}>
                <button onClick={() => onAbrir(r)} className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-areia-claro">
                  <span className="titulo text-2xl text-petroleo w-12">{fmtHora(s.hora)}</span>
                  <span className="flex-1 min-w-0">
                    <b className="block truncate">{r.nome}</b>
                    <span className="text-xs text-petroleo-noite/60">{quadra} · {r.telefone}</span>
                  </span>
                  <span className="hidden sm:inline-flex"><SeloOrigem origem={r.origem} /></span>
                  <SeloPago pago={r.pago} />
                </button>
              </li>
            )
          }
          const a = s.aula!
          return (
            <li key={a.id} className="flex items-center gap-4 px-5 py-3 bg-onda-claro/40">
              <span className="titulo text-2xl text-petroleo w-12">{fmtHora(s.hora)}</span>
              <span className="flex-1 min-w-0">
                <b className="block truncate">Aula de {modalidadePorId(a.modalidade).nome} · {a.nivel}</b>
                <span className="text-xs text-petroleo-noite/60">
                  {quadra} · Prof. {acharProfessor(db, a.professorId).nome} · {a.alunos.length}/{a.vagas} alunos
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </Cartao>
  )
}

export function ChegouAgora({ onAbrir }: { onAbrir: (r: Reserva) => void }) {
  const { db } = useDB()
  const recentes = reservasRecentes(db)
  return (
    <Cartao className="p-5">
      <h2 className="titulo text-3xl text-petroleo flex items-center gap-2"><Sparkles className="size-6 text-sol-escuro" /> Chegou agora</h2>
      {recentes.length === 0 ? (
        <p className="mt-2 text-sm text-petroleo-noite/60">
          Faça uma reserva pelo <Link to="/agendar" target="_blank" className="font-semibold text-onda underline">site</Link> em outra aba: ela aparece aqui na hora.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {recentes.map((r) => {
            const d = dataDeISO(r.data)
            return (
              <li key={r.id}>
                <button onClick={() => onAbrir(r)} className="w-full flex items-center gap-3 rounded-xl bg-sol/15 px-3 py-2 text-left text-sm hover:bg-sol/25">
                  <span className="flex-1 min-w-0">
                    <b className="block truncate">{r.nome}</b>
                    <span className="text-xs text-petroleo-noite/60 first-letter:uppercase inline-block">
                      {fmtDiaSemana(d)} {fmtDataCurta(d)} · {fmtFaixa(r.hora)} · {quadraPorId(r.quadraId).nome}
                    </span>
                  </span>
                  <span className="text-[11px] text-petroleo-noite/50 shrink-0">{formatDistanceToNow(new Date(r.criadaEm!), { locale: ptBR, addSuffix: true })}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Cartao>
  )
}

export function GraficoProximosDias() {
  const { db } = useDB()
  const dias = reservasPorDia(db)
  const maximo = Math.max(1, ...dias.map((x) => x.qtd))
  return (
    <Cartao className="p-5">
      <h2 className="titulo text-3xl text-petroleo">Próximos 7 dias</h2>
      <div className="mt-4 flex items-end gap-2 h-36" role="img" aria-label={`Reservas por dia: ${dias.map((x) => x.qtd).join(', ')}`}>
        {dias.map(({ d, qtd }, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs font-bold text-petroleo">{qtd}</span>
            <div className="w-full rounded-t-lg bg-onda" style={{ height: `${(qtd / maximo) * 100}%`, minHeight: 4 }} />
            <span className="text-[11px] text-petroleo-noite/60 capitalize">{i === 0 ? 'Hoje' : fmtDiaSemana(d)}</span>
          </div>
        ))}
      </div>
    </Cartao>
  )
}

const COR_ORIGEM = { Site: 'bg-onda', WhatsApp: 'bg-whatsapp', Balcão: 'bg-petroleo/40' }

export function OrigemDasReservas() {
  const { db } = useDB()
  return (
    <Cartao className="p-5">
      <h2 className="titulo text-3xl text-petroleo">De onde vêm as reservas</h2>
      <p className="text-xs text-petroleo-noite/60">Últimos 30 dias</p>
      <div className="mt-4 space-y-3">
        {origensDasReservas(db).map(({ origem, qtd, pct }) => (
          <div key={origem}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{origem}</span>
              <span className="text-petroleo-noite/60">{qtd} · {pct}%</span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-petroleo/10 overflow-hidden">
              <div className={`h-full rounded-full ${COR_ORIGEM[origem]}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 flex gap-2 rounded-xl bg-whatsapp/10 p-3 text-xs text-whatsapp-escuro">
        <IconeWhatsApp className="size-4 shrink-0" /> Com o bot de WhatsApp, as reservas feitas pela conversa entram sozinhas nesta agenda.
      </p>
    </Cartao>
  )
}
