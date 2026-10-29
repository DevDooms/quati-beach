import { useState } from 'react'
import { CalendarX, X } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDiaSemana, hojeISO, paraDataISO } from '../../lib/datas'
import { Aviso, Botao, Campo, Entrada, Selecao } from '../../ui'
import { proximosDiasEspeciais, removerDiaEspecial, salvarDiaEspecial } from '../../features/agenda-dono/regras'
import { HORAS_CHEIAS, Secao } from './Secao'

// Feriados e dias com horário diferente (não mexe na grade da semana)
export function SecaoDiasEspeciais() {
  const { db, set, aplicar } = useDB()
  const [f, setF] = useState({ data: '', nome: '', fechado: true, horario: [8, 14] as [number, number] })
  const [erro, setErro] = useState<string | null>(null)
  const lista = proximosDiasEspeciais(db)

  return (
    <Secao titulo={<><CalendarX className="size-6" /> Feriados e datas especiais</>} descricao="Fechar um dia ou abrir em horário diferente, sem mexer na semana normal.">
      <ul className="mt-3 space-y-2">
        {lista.length === 0 && <li className="text-sm text-petroleo-noite/70">Nenhuma data especial cadastrada.</li>}
        {lista.map((e) => (
          <li key={e.id} className="flex items-center gap-3 rounded-xl bg-areia-claro px-3 py-2 text-sm">
            <b className="w-24 capitalize">{fmtDiaSemana(dataDeISO(e.data))} {fmtDataCurta(dataDeISO(e.data))}</b>
            <span className="flex-1">{e.nome} · {e.fechado ? 'fechado' : `${e.horario[0]}h às ${e.horario[1]}h`}</span>
            <button onClick={() => set((db) => removerDiaEspecial(db, e.id))} className="text-petroleo-noite/70 hover:text-red-600" aria-label={`Remover ${e.nome}`}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-4 grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!f.data) return setErro('Escolha a data.')
          const resultado = aplicar((db) => salvarDiaEspecial(db, { ...f, data: paraDataISO(f.data) }))
          setErro(resultado)
          if (!resultado) setF({ ...f, data: '', nome: '' })
        }}
      >
        <Campo rotulo="Data" compacto>
          <Entrada compacto type="date" min={hojeISO()} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
        </Campo>
        <Campo rotulo="Nome" compacto>
          <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex.: Natal" />
        </Campo>
        <Campo rotulo="Nesse dia" compacto>
          <Selecao compacto value={f.fechado ? 'fechado' : 'especial'} onChange={(e) => setF({ ...f, fechado: e.target.value === 'fechado' })}>
            <option value="fechado">Fechado</option>
            <option value="especial">Horário especial</option>
          </Selecao>
        </Campo>
        {!f.fechado && (
          <div className="grid grid-cols-2 gap-2">
            <Campo rotulo="Abre" compacto>
              <Selecao compacto value={f.horario[0]} onChange={(e) => setF({ ...f, horario: [Number(e.target.value), f.horario[1]] })}>
                {HORAS_CHEIAS.map((h) => <option key={h} value={h}>{h}h</option>)}
              </Selecao>
            </Campo>
            <Campo rotulo="Fecha" compacto>
              <Selecao compacto value={f.horario[1]} onChange={(e) => setF({ ...f, horario: [f.horario[0], Number(e.target.value)] })}>
                {HORAS_CHEIAS.filter((h) => h > f.horario[0]).map((h) => <option key={h} value={h}>{h}h</option>)}
              </Selecao>
            </Campo>
          </div>
        )}
        <div className="col-span-2 flex items-center justify-between gap-2">
          {erro ? <Aviso>{erro}</Aviso> : <span />}
          <Botao type="submit" variante="secundario">Adicionar data</Botao>
        </div>
      </form>
    </Secao>
  )
}
