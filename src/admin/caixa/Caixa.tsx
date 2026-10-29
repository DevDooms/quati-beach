import { useState } from 'react'
import { addDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { dataDeISO, dataISO, fmtDataLonga, fmtHora, hojeISO } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import type { Reserva } from '../../tipos'
import { Botao, Cartao, TituloPagina, Vazio } from '../../ui'
import { JanelaReserva } from '../../features/reservas/admin/JanelaReserva'
import { useOcultarValores } from '../useOcultarValores'
import { entradasDoDia, pendentesDoDia, resumoDoCaixa } from './calculos'

export default function Caixa() {
  const { db } = useDB()
  const { valor } = useOcultarValores()
  const [data, setData] = useState(hojeISO())
  const [aberta, setAberta] = useState<Reserva | null>(null)
  const entradas = entradasDoDia(db, data)
  const { porForma, total } = resumoDoCaixa(entradas)
  const pendentes = pendentesDoDia(db, data)
  const mover = (dias: number) => setData(dataISO(addDays(dataDeISO(data), dias)))

  return (
    <>
      <TituloPagina titulo="Caixa do dia" sub="Tudo o que entrou no dia, separado por forma de pagamento, para conferir na hora de fechar." />

      <Cartao className="p-3 flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => mover(-1)} className="p-2 rounded-xl hover:bg-mar/5" aria-label="Dia anterior"><ChevronLeft /></button>
        <button onClick={() => mover(1)} className="p-2 rounded-xl hover:bg-mar/5" aria-label="Próximo dia"><ChevronRight /></button>
        <h2 className="titulo text-2xl sm:text-3xl text-mar first-letter:uppercase flex-1">{fmtDataLonga(dataDeISO(data))}</h2>
        {data !== hojeISO() && <Botao variante="secundario" onClick={() => setData(hojeISO())}>Hoje</Botao>}
      </Cartao>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {porForma.map(({ forma, total }) => (
          <Cartao key={forma} className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-marinho/70">{forma}</p>
            <p className="titulo text-4xl text-mar mt-1">{valor(fmtReais(total))}</p>
          </Cartao>
        ))}
        <div className="rounded-2xl p-4 bg-mar text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">Total do dia</p>
          <p className="titulo text-4xl text-sol mt-1">{valor(fmtReais(total))}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-mar">Entradas ({entradas.length})</h2>
          {entradas.length === 0 ? (
            <div className="mt-3"><Vazio>Nada recebido neste dia.</Vazio></div>
          ) : (
            <ul className="mt-3 divide-y divide-mar/10 text-sm">
              {entradas.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2">
                  <span className="w-12 text-marinho/70">{new Date(e.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex-1 min-w-0">
                    <b className="block truncate">{e.nome}</b>
                    <span className="text-xs text-marinho/70">{e.descricao} · {e.forma}</span>
                  </span>
                  <b>{valor(fmtReais(e.valor))}</b>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-mar">A receber hoje ({pendentes.length})</h2>
          <p className="text-xs text-marinho/70">Toque para registrar o pagamento.</p>
          {pendentes.length === 0 ? (
            <div className="mt-3"><Vazio>Nenhuma reserva pendente neste dia.</Vazio></div>
          ) : (
            <ul className="mt-3 space-y-2">
              {pendentes.map((r) => (
                <li key={r.id}>
                  <button onClick={() => setAberta(r)} className="w-full flex items-center gap-3 rounded-xl bg-amber-50 px-3 py-2 text-left text-sm hover:bg-amber-100">
                    <span className="titulo text-xl text-mar w-12">{fmtHora(r.hora)}</span>
                    <span className="flex-1 min-w-0">
                      <b className="block truncate">{r.nome}</b>
                      <span className="text-xs text-marinho/70">{quadraPorId(r.quadraId).nome}</span>
                    </span>
                    <b>{valor(fmtReais(r.valor))}</b>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>

      {aberta && <JanelaReserva reserva={aberta} onFechar={() => setAberta(null)} />}
    </>
  )
}
