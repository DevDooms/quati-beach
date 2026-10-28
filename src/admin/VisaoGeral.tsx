import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { addDays, formatDistanceToNow, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Bell, CalendarCheck, CircleDollarSign, Eye, EyeOff, Gauge, Hourglass, PartyPopper, Sparkles } from 'lucide-react'
import { QUADRAS, modalidadePorId, quadraPorId } from '../data/mock'
import { chaveData, dataDeChave, fmtDataCurta, fmtDiaSemana, fmtFaixa, fmtHora, fmtReais, horasDoDia, montarGrade, proximosDias } from '../lib/agenda'
import { acharProfessor, useDB, type Origem, type Reserva } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { Botao, Cartao, JanelaReserva, SeloOrigem, SeloPago, TituloPagina, precoReserva, useOcultarValores } from './ui'

export default function VisaoGeral() {
  const { db } = useDB()
  const [aberta, setAberta] = useState<Reserva | null>(null)
  const { oculto, alternar } = useOcultarValores()
  const agora = new Date()
  const hoje = chaveData(agora)
  const eventosNovos = db.eventos.filter((e) => !e.respondido).length
  const filaEspera = db.espera.filter((e) => e.data >= hoje).length

  const reservasHoje = db.reservas.filter((r) => r.data === hoje)
  const aulasHoje = db.aulas.filter((a) => a.diaSemana === agora.getDay())
  const capacidade = horasDoDia(db, agora).length * QUADRAS.length
  const ocupacao = capacidade ? Math.round(((reservasHoje.length + aulasHoje.length) / capacidade) * 100) : 0

  const inicioSemana = startOfWeek(agora, { weekStartsOn: 1 })
  const diasSemana = Array.from({ length: 7 }, (_, i) => chaveData(addDays(inicioSemana, i)))
  const daSemana = db.reservas.filter((r) => diasSemana.includes(r.data))
  const faturamento = daSemana.reduce((s, r) => s + precoReserva(db, r), 0)
  const pendentes = db.reservas.filter((r) => !r.pago && r.data <= diasSemana[6])
  const aReceber = pendentes.reduce((s, r) => s + precoReserva(db, r), 0)

  const proximos7 = proximosDias(7).map((d) => ({ d, qtd: db.reservas.filter((r) => r.data === chaveData(d)).length }))
  const max7 = Math.max(1, ...proximos7.map((x) => x.qtd))

  const ultimos30 = db.reservas.filter((r) => r.data <= hoje && r.data >= chaveData(addDays(agora, -30)))
  const origens = (['Site', 'WhatsApp', 'Balcão'] as Origem[]).map((o) => ({ o, qtd: ultimos30.filter((r) => r.origem === o).length }))
  const totalOrigens = Math.max(1, ultimos30.length)

  const recentes = db.reservas.filter((r) => r.criadaEm).sort((a, b) => b.criadaEm!.localeCompare(a.criadaEm!)).slice(0, 5)

  // agenda do dia: reservas e aulas juntas, por horário
  const linhasHoje = montarGrade(db, agora, new Date(0))
    .flatMap((linha) => linha.filter((s) => s.reserva || s.aula))
    .filter((s) => s.hora >= agora.getHours())

  return (
    <>
      <TituloPagina
        titulo="Visão geral"
        sub={<span className="first-letter:uppercase inline-block">{agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>}
        acoes={
          <Botao tipo="secundario" onClick={alternar}>
            {oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />} {oculto ? 'Mostrar valores' : 'Ocultar valores'}
          </Botao>
        }
      />

      {(eventosNovos > 0 || filaEspera > 0) && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {eventosNovos > 0 && (
            <Link to="/admin/solicitacoes" className="flex items-center gap-3 rounded-2xl bg-laranja/10 border border-laranja/30 px-4 py-3 text-sm hover:bg-laranja/15">
              <PartyPopper className="size-5 text-laranja" />
              <span className="flex-1"><b>{eventosNovos} pedido{eventosNovos > 1 ? 's' : ''} de evento</b> esperando resposta</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
          {filaEspera > 0 && (
            <Link to="/admin/solicitacoes?aba=espera" className="flex items-center gap-3 rounded-2xl bg-onda-claro border border-onda/30 px-4 py-3 text-sm hover:bg-onda-claro/70">
              <Bell className="size-5 text-onda" />
              <span className="flex-1"><b>{filaEspera} pessoa{filaEspera > 1 ? 's' : ''}</b> na lista de espera</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi icone={<CalendarCheck />} rotulo="Reservas hoje" valor={String(reservasHoje.length)} detalhe={`+ ${aulasHoje.length} aulas`} />
        <Kpi icone={<Gauge />} rotulo="Ocupação hoje" valor={`${ocupacao}%`} detalhe={`${reservasHoje.length + aulasHoje.length} de ${capacidade} horários`} barra={ocupacao} />
        <Kpi icone={<CircleDollarSign />} rotulo="Faturamento da semana" valor={oculto ? 'R$ •••' : fmtReais(faturamento)} detalhe={`${daSemana.length} reservas`} />
        <Kpi icone={<Hourglass />} rotulo="A receber" valor={oculto ? 'R$ •••' : fmtReais(aReceber)} detalhe={`${pendentes.length} pendentes`} alerta />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Cartao className="min-w-0">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="titulo text-3xl text-petroleo">Agenda de hoje</h2>
            <Link to="/admin/agenda" className="text-sm font-semibold text-onda inline-flex items-center gap-1 shrink-0">Ver tudo <ArrowRight className="size-4" /></Link>
          </div>
          <ul className="divide-y divide-petroleo/10">
            {linhasHoje.length === 0 && <li className="px-5 pb-5 text-sm text-petroleo-noite/60">Nada mais marcado para hoje.</li>}
            {linhasHoje.map((s) =>
              s.reserva ? (
                <li key={s.reserva.id}>
                  <button onClick={() => setAberta(s.reserva!)} className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-areia-claro">
                    <span className="titulo text-2xl text-petroleo w-12">{fmtHora(s.hora)}</span>
                    <span className="flex-1 min-w-0">
                      <b className="block truncate">{s.reserva.nome}</b>
                      <span className="text-xs text-petroleo-noite/60">{quadraPorId(s.quadraId).nome} · {s.reserva.telefone}</span>
                    </span>
                    <span className="hidden sm:inline-flex"><SeloOrigem origem={s.reserva.origem} /></span>
                    <SeloPago pago={s.reserva.pago} />
                  </button>
                </li>
              ) : (
                <li key={s.aula!.id} className="flex items-center gap-4 px-5 py-3 bg-onda-claro/40">
                  <span className="titulo text-2xl text-petroleo w-12">{fmtHora(s.hora)}</span>
                  <span className="flex-1 min-w-0">
                    <b className="block truncate">Aula de {modalidadePorId(s.aula!.modalidade).nome} · {s.aula!.nivel}</b>
                    <span className="text-xs text-petroleo-noite/60">
                      {quadraPorId(s.quadraId).nome} · Prof. {acharProfessor(db, s.aula!.professorId).nome} · {s.aula!.alunos.length}/{s.aula!.vagas} alunos
                    </span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </Cartao>

        <div className="space-y-6">
          <Cartao className="p-5">
            <h2 className="titulo text-3xl text-petroleo flex items-center gap-2"><Sparkles className="size-6 text-sol-escuro" /> Chegou agora</h2>
            {recentes.length === 0 ? (
              <p className="mt-2 text-sm text-petroleo-noite/60">
                Faça uma reserva pelo <Link to="/agendar" target="_blank" className="font-semibold text-onda underline">site</Link> em outra aba: ela aparece aqui na hora.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentes.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => setAberta(r)} className="w-full flex items-center gap-3 rounded-xl bg-sol/15 px-3 py-2 text-left text-sm hover:bg-sol/25">
                      <span className="flex-1 min-w-0">
                        <b className="block truncate">{r.nome}</b>
                        <span className="text-xs text-petroleo-noite/60 first-letter:uppercase inline-block">
                          {fmtDiaSemana(dataDeChave(r.data))} {fmtDataCurta(dataDeChave(r.data))} · {fmtFaixa(r.hora)} · {quadraPorId(r.quadraId).nome}
                        </span>
                      </span>
                      <span className="text-[11px] text-petroleo-noite/50 shrink-0">{formatDistanceToNow(new Date(r.criadaEm!), { locale: ptBR, addSuffix: true })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>

          <Cartao className="p-5">
            <h2 className="titulo text-3xl text-petroleo">Próximos 7 dias</h2>
            <div className="mt-4 flex items-end gap-2 h-36">
              {proximos7.map(({ d, qtd }, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-xs font-bold text-petroleo">{qtd}</span>
                  <div className="w-full rounded-t-lg bg-onda" style={{ height: `${(qtd / max7) * 100}%`, minHeight: 4 }} />
                  <span className="text-[11px] text-petroleo-noite/60 capitalize">{i === 0 ? 'Hoje' : fmtDiaSemana(d)}</span>
                </div>
              ))}
            </div>
          </Cartao>

          <Cartao className="p-5">
            <h2 className="titulo text-3xl text-petroleo">De onde vêm as reservas</h2>
            <p className="text-xs text-petroleo-noite/60">Últimos 30 dias</p>
            <div className="mt-4 space-y-3">
              {origens.map(({ o, qtd }) => {
                const pct = Math.round((qtd / totalOrigens) * 100)
                return (
                  <div key={o}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{o}</span>
                      <span className="text-petroleo-noite/60">{qtd} · {pct}%</span>
                    </div>
                    <div className="mt-1 h-2.5 rounded-full bg-petroleo/10 overflow-hidden">
                      <div className={`h-full rounded-full ${o === 'Site' ? 'bg-onda' : o === 'WhatsApp' ? 'bg-[#25d366]' : 'bg-petroleo/40'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 flex gap-2 rounded-xl bg-[#25d366]/10 p-3 text-xs text-[#0e6b39]">
              <IconeWhatsApp className="size-4 shrink-0" /> Com o bot de WhatsApp, as reservas feitas pela conversa entram sozinhas nesta agenda.
            </p>
          </Cartao>
        </div>
      </div>

      {aberta && <JanelaReserva reserva={aberta} onFechar={() => setAberta(null)} />}
    </>
  )
}

function Kpi({ icone, rotulo, valor, detalhe, barra, alerta }: { icone: ReactNode; rotulo: string; valor: string; detalhe: string; barra?: number; alerta?: boolean }) {
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
