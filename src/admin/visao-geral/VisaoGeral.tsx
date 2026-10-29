import { useState } from 'react'
import { CalendarCheck, CircleDollarSign, Eye, EyeOff, Gauge, Hourglass } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { fmtDataLonga } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import type { Reserva } from '../../tipos'
import { Botao, TituloPagina } from '../../ui'
import { pedidosNovos } from '../../features/eventos/regras'
import { JanelaReserva } from '../../features/reservas/admin/JanelaReserva'
import { esperaFutura } from '../../features/reservas/regras'
import { useOcultarValores } from '../useOcultarValores'
import { indicadoresDaSemana, indicadoresDoDia } from './indicadores'
import { AgendaDeHoje, AvisosPendentes, ChegouAgora, GraficoProximosDias, Kpi, OrigemDasReservas } from './Paineis'

export default function VisaoGeral() {
  const { db } = useDB()
  const { oculto, alternar, valor } = useOcultarValores()
  const [aberta, setAberta] = useState<Reserva | null>(null)
  const dia = indicadoresDoDia(db)
  const semana = indicadoresDaSemana(db)

  return (
    <>
      <TituloPagina
        titulo="Visão geral"
        sub={<span className="first-letter:uppercase inline-block">{fmtDataLonga(new Date())}</span>}
        acoes={
          <Botao variante="secundario" onClick={alternar}>
            {oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />} {oculto ? 'Mostrar valores' : 'Ocultar valores'}
          </Botao>
        }
      />

      <AvisosPendentes eventos={pedidosNovos(db).length} fila={esperaFutura(db).length} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi icone={<CalendarCheck />} rotulo="Reservas hoje" valor={String(dia.reservas)} detalhe={`+ ${dia.aulas} aulas`} />
        <Kpi icone={<Gauge />} rotulo="Ocupação hoje" valor={`${dia.ocupacao}%`} detalhe={`${dia.reservas + dia.aulas} de ${dia.capacidade} horários`} barra={dia.ocupacao} />
        <Kpi icone={<CircleDollarSign />} rotulo="Faturamento da semana" valor={valor(fmtReais(semana.faturamento))} detalhe={`${semana.reservas} reservas`} />
        <Kpi icone={<Hourglass />} rotulo="A receber" valor={valor(fmtReais(semana.aReceber))} detalhe={`${semana.pendentes} pendentes`} alerta />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AgendaDeHoje onAbrir={setAberta} />
        <div className="space-y-6">
          <ChegouAgora onAbrir={setAberta} />
          <GraficoProximosDias />
          <OrigemDasReservas />
        </div>
      </div>

      {aberta && <JanelaReserva reserva={aberta} onFechar={() => setAberta(null)} />}
    </>
  )
}
