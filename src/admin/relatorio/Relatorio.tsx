import { useState } from 'react'
import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { DIAS_CURTOS, fmtHora } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { Cartao, TituloPagina } from '../../ui'
import { useOcultarValores } from '../useOcultarValores'
import { relatorioDoMes } from './calculos'

// cor do mapa de calor: quanto mais cheio, mais escuro
const corOcupacao = (pct: number) =>
  pct >= 80 ? 'bg-petroleo text-white' : pct >= 60 ? 'bg-onda text-white' : pct >= 40 ? 'bg-onda/60' : pct >= 20 ? 'bg-onda/30' : 'bg-onda/10'

export default function Relatorio() {
  const { db } = useDB()
  const { valor } = useOcultarValores()
  const [mes, setMes] = useState(() => new Date())
  const r = relatorioDoMes(db, mes)

  return (
    <>
      <TituloPagina titulo="Relatório do mês" sub="Movimento, faltas, clientes e os horários mais cheios e mais vazios." />

      <Cartao className="p-3 flex items-center gap-2 mb-4">
        <button onClick={() => setMes((m) => addMonths(m, -1))} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Mês anterior"><ChevronLeft /></button>
        <button onClick={() => setMes((m) => addMonths(m, 1))} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Próximo mês"><ChevronRight /></button>
        <h2 className="titulo text-3xl text-petroleo first-letter:uppercase">{format(mes, 'MMMM yyyy', { locale: ptBR })}</h2>
      </Cartao>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Numero rotulo="Faturamento" valor={valor(fmtReais(r.faturamento))} detalhe={`${valor(fmtReais(r.recebido))} já recebido`} />
        <Numero rotulo="Reservas" valor={String(r.reservas)} detalhe={`ocupação média ${r.ocupacaoMedia}%`} />
        <Numero rotulo="Faltas" valor={`${r.taxaFaltas}%`} detalhe={`${r.faltas} reservas sem aparecer`} />
        <Numero rotulo="Clientes" valor={String(r.clientes)} detalhe={`${r.novos} novos · ${r.recorrentes} voltaram`} />
      </div>

      <Cartao className="mt-6 p-5 overflow-x-auto">
        <h2 className="titulo text-3xl text-petroleo">Horários mais cheios</h2>
        <p className="text-xs text-petroleo-noite/70">Ocupação média das quadras no mês (reservas + aulas). Bom para decidir promoções e horários de aula.</p>
        <table className="mt-4 min-w-[640px] w-full table-fixed border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-14" />
              {r.dias.map((d) => <th key={d} className="font-bold text-petroleo-noite/70">{DIAS_CURTOS[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {r.horas.map((h) => (
              <tr key={h}>
                <td className="text-right pr-1 font-semibold text-petroleo-noite/70">{fmtHora(h)}</td>
                {r.dias.map((d) => {
                  const pct = r.celula(d, h)
                  return (
                    <td key={d} className={`h-7 rounded text-center font-semibold ${pct === null ? 'bg-petroleo/5' : corOcupacao(pct)}`} title={pct === null ? 'Fechado' : `${pct}%`}>
                      {pct === null ? '' : `${pct}%`}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Cartao>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo">Quem mais jogou</h2>
          <ol className="mt-3 divide-y divide-petroleo/10 text-sm">
            {r.ranking.map((c, i) => (
              <li key={c.nome + i} className="flex items-center gap-3 py-2">
                <span className="w-6 font-bold text-petroleo-noite/70">{i + 1}º</span>
                <span className="flex-1">{c.nome}</span>
                <span className="text-petroleo-noite/70">{c.jogos} jogos · {valor(fmtReais(c.valor))}</span>
              </li>
            ))}
          </ol>
        </Cartao>
        {db.modulos.pacotes && (
          <Cartao className="p-5">
            <h2 className="titulo text-3xl text-petroleo">Pacotes vendidos</h2>
            <p className="mt-2 text-sm">{r.pacotes.quantidade} pacotes · <b>{valor(fmtReais(r.pacotes.valor))}</b></p>
          </Cartao>
        )}
      </div>
    </>
  )
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe: string }) {
  return (
    <Cartao className="p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/70">{rotulo}</p>
      <p className="titulo text-4xl text-petroleo mt-1">{valor}</p>
      <p className="text-xs text-petroleo-noite/70">{detalhe}</p>
    </Cartao>
  )
}
