import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { DIAS_CURTOS, ORDEM_DIAS, fmtHora } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import type { DiaSemana, Promocao } from '../../tipos'
import { Aviso, Botao, Campo, Entrada, Selecao } from '../../ui'
import { removerPromocao, salvarPromocao } from '../../features/agenda-dono/regras'
import { MEIAS_HORAS, Secao } from './Secao'

const VAZIA: Promocao = { id: '', nome: '', dias: [], inicio: 14, fim: 17, preco: 50, ativa: true }

// Preços especiais criados pelo dono (o site mostra o selo PROMO nesses horários)
export function SecaoPromocoes() {
  const { db, set, aplicar } = useDB()
  const [f, setF] = useState(VAZIA)
  const [erro, setErro] = useState<string | null>(null)
  const alternarDia = (d: DiaSemana) => setF({ ...f, dias: f.dias.includes(d) ? f.dias.filter((x) => x !== d) : [...f.dias, d] })

  return (
    <Secao titulo={<><Tag className="size-6" /> Preços promocionais</>} descricao="Opcional. Ex.: horário de pouco movimento com preço menor.">
      <ul className="mt-3 space-y-2">
        {db.promocoes.length === 0 && <li className="text-sm text-petroleo-noite/70">Nenhuma promoção cadastrada.</li>}
        {db.promocoes.map((p) => (
          <li key={p.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${p.ativa ? 'bg-sol/20' : 'bg-petroleo/5 opacity-70'}`}>
            <span className="flex-1">
              <b>{p.nome}</b> · {fmtReais(p.preco)}/h
              <span className="block text-xs text-petroleo-noite/70">
                {ORDEM_DIAS.filter((d) => p.dias.includes(d)).map((d) => DIAS_CURTOS[d]).join(', ')} · {fmtHora(p.inicio)} às {fmtHora(p.fim)}
              </span>
            </span>
            <label className="inline-flex items-center gap-1 text-xs font-semibold">
              <input type="checkbox" checked={p.ativa} onChange={() => set((db) => salvarPromocao(db, { ...p, ativa: !p.ativa }))} className="accent-petroleo" /> Ativa
            </label>
            <button onClick={() => set((db) => removerPromocao(db, p.id))} className="text-petroleo-noite/70 hover:text-red-600" aria-label={`Remover ${p.nome}`}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          const resultado = aplicar((db) => salvarPromocao(db, f))
          setErro(resultado)
          if (!resultado) setF(VAZIA)
        }}
      >
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <Campo rotulo="Nome" compacto>
            <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex.: Tarde de semana" />
          </Campo>
          <Campo rotulo="R$ / hora" compacto>
            <Entrada compacto type="number" min={0} value={f.preco} onChange={(e) => setF({ ...f, preco: Number(e.target.value) })} />
          </Campo>
        </div>
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/70">Dias</legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {ORDEM_DIAS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={f.dias.includes(d)}
                onClick={() => alternarDia(d)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border ${f.dias.includes(d) ? 'bg-petroleo text-white border-petroleo' : 'border-petroleo/20'}`}
              >
                {DIAS_CURTOS[d]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="De" compacto>
            <Selecao compacto value={f.inicio} onChange={(e) => setF({ ...f, inicio: Number(e.target.value) })}>
              {MEIAS_HORAS.map((h) => <option key={h} value={h}>{fmtHora(h)}</option>)}
            </Selecao>
          </Campo>
          <Campo rotulo="Até" compacto>
            <Selecao compacto value={f.fim} onChange={(e) => setF({ ...f, fim: Number(e.target.value) })}>
              {MEIAS_HORAS.filter((h) => h > f.inicio).map((h) => <option key={h} value={h}>{fmtHora(h)}</option>)}
            </Selecao>
          </Campo>
        </div>
        <div className="flex items-center justify-between gap-2">
          {erro ? <Aviso>{erro}</Aviso> : <span />}
          <Botao type="submit" variante="secundario">Criar promoção</Botao>
        </div>
      </form>
    </Secao>
  )
}
