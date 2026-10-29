import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { QUADRAS, quadraPorId } from '../../../config/estabelecimento'
import { useOcultarValores } from '../../../admin/useOcultarValores'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDiaSemana, fmtHora, hojeISO } from '../../../lib/datas'
import { fmtReais } from '../../../lib/formatos'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { DB, Reserva } from '../../../tipos'
import { Botao, Cartao, Chip, Entrada, IconeWhatsApp, SeloOrigem, SeloPago, Selecao, TituloPagina } from '../../../ui'
import { alternarPago, buscaCorresponde, precoReserva } from '../regras'
import { JanelaNovaReserva } from './JanelaNovaReserva'
import { JanelaReserva } from './JanelaReserva'

const PERIODOS = { proximas: 'Próximas', hoje: 'Hoje', passadas: 'Passadas', todas: 'Todas' } as const
type Periodo = keyof typeof PERIODOS
const POR_PAGINA = 40

interface Filtros {
  busca: string
  periodo: Periodo
  quadra: string
  pagamento: '' | 'pago' | 'pendente'
}

function filtrar(db: DB, f: Filtros): Reserva[] {
  const hoje = hojeISO()
  const chave = (r: Reserva) => r.data + fmtHora(r.hora)
  return db.reservas
    .filter(
      (r) =>
        (f.periodo !== 'proximas' || r.data >= hoje) &&
        (f.periodo !== 'hoje' || r.data === hoje) &&
        (f.periodo !== 'passadas' || r.data < hoje) &&
        (!f.quadra || r.quadraId === f.quadra) &&
        (f.pagamento !== 'pago' || r.pago) &&
        (f.pagamento !== 'pendente' || !r.pago) &&
        buscaCorresponde(r, f.busca),
    )
    .sort((a, b) => (f.periodo === 'passadas' ? chave(b).localeCompare(chave(a)) : chave(a).localeCompare(chave(b))))
}

export default function ReservasAdmin() {
  const { db, set } = useDB()
  const { valor } = useOcultarValores()
  const [f, setF] = useState<Filtros>({ busca: '', periodo: 'proximas', quadra: '', pagamento: '' })
  const [limite, setLimite] = useState(POR_PAGINA)
  const [aberta, setAberta] = useState<Reserva | null>(null)
  const [nova, setNova] = useState(false)

  const lista = filtrar(db, f)
  const total = lista.reduce((s, r) => s + precoReserva(db, r), 0)
  const pendente = lista.filter((r) => !r.pago).reduce((s, r) => s + precoReserva(db, r), 0)
  const pagar = (id: string) => set((db) => alternarPago(db, id))

  return (
    <>
      <TituloPagina
        titulo="Reservas"
        sub={`${lista.length} reservas · ${valor(fmtReais(total))} no total · ${valor(fmtReais(pendente))} pendente`}
        acoes={<Botao onClick={() => setNova(true)}><Plus className="size-4" /> Nova reserva</Botao>}
      />

      <Cartao className="p-4 space-y-3 mb-4">
        <div className="flex gap-2 overflow-x-auto sem-scrollbar">
          {(Object.keys(PERIODOS) as Periodo[]).map((p) => (
            <Chip
              key={p}
              ativo={f.periodo === p}
              onClick={() => {
                setF({ ...f, periodo: p })
                setLimite(POR_PAGINA)
              }}
            >
              {PERIODOS[p]}
            </Chip>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_180px_180px]">
          <Entrada compacto icone={<Search />} value={f.busca} onChange={(e) => setF({ ...f, busca: e.target.value })} placeholder="Buscar por nome ou telefone" />
          <Selecao compacto value={f.quadra} onChange={(e) => setF({ ...f, quadra: e.target.value })} aria-label="Quadra">
            <option value="">Todas as quadras</option>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </Selecao>
          <Selecao compacto value={f.pagamento} onChange={(e) => setF({ ...f, pagamento: e.target.value as Filtros['pagamento'] })} aria-label="Pagamento">
            <option value="">Qualquer pagamento</option>
            <option value="pago">Pagas</option>
            <option value="pendente">Pendentes</option>
          </Selecao>
        </div>
      </Cartao>

      <TabelaReservas lista={lista.slice(0, limite)} onAbrir={setAberta} onPagar={pagar} />
      <CartoesReservas lista={lista.slice(0, limite)} onAbrir={setAberta} />
      {lista.length === 0 && <p className="p-8 text-center text-petroleo-noite/60">Nenhuma reserva com esses filtros.</p>}

      {lista.length > limite && (
        <div className="mt-4 text-center">
          <Botao variante="secundario" onClick={() => setLimite((l) => l + POR_PAGINA)}>Mostrar mais ({lista.length - limite})</Botao>
        </div>
      )}

      {aberta && <JanelaReserva reserva={aberta} onFechar={() => setAberta(null)} />}
      {nova && <JanelaNovaReserva inicial={{ data: hojeISO() }} onFechar={() => setNova(false)} />}
    </>
  )
}

// Desktop
function TabelaReservas({ lista, onAbrir, onPagar }: { lista: Reserva[]; onAbrir: (r: Reserva) => void; onPagar: (id: string) => void }) {
  const { db } = useDB()
  if (lista.length === 0) return null
  return (
    <Cartao className="hidden md:block overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-petroleo-noite text-white text-left">
          <tr>
            {['Data', 'Hora', 'Quadra', 'Cliente', 'Origem', 'Valor', 'Pagamento', ''].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-petroleo/10">
          {lista.map((r) => {
            const d = dataDeISO(r.data)
            return (
              <tr key={r.id} className="hover:bg-areia-claro cursor-pointer" onClick={() => onAbrir(r)}>
                <td className="px-4 py-3 whitespace-nowrap"><span className="capitalize">{fmtDiaSemana(d)}</span> {fmtDataCurta(d)}</td>
                <td className="px-4 py-3 font-bold">{fmtHora(r.hora)}</td>
                <td className="px-4 py-3">{quadraPorId(r.quadraId).nome}</td>
                <td className="px-4 py-3">
                  <b className="block">{r.nome}</b>
                  <span className="text-xs text-petroleo-noite/60">{r.telefone}</span>
                </td>
                <td className="px-4 py-3"><SeloOrigem origem={r.origem} /></td>
                <td className="px-4 py-3">{fmtReais(precoReserva(db, r))}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <SeloPago pago={r.pago} onClick={() => onPagar(r.id)} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <a href={whatsPara(r, doEstabelecimento.contato(r.nome))} target="_blank" rel="noreferrer" className="text-whatsapp-escuro" aria-label="WhatsApp">
                    <IconeWhatsApp />
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Cartao>
  )
}

// Celular
function CartoesReservas({ lista, onAbrir }: { lista: Reserva[]; onAbrir: (r: Reserva) => void }) {
  const { db } = useDB()
  return (
    <div className="md:hidden space-y-2">
      {lista.map((r) => {
        const d = dataDeISO(r.data)
        return (
          <Cartao key={r.id} className="p-3">
            <button onClick={() => onAbrir(r)} className="w-full text-left flex items-center gap-3">
              <span className="rounded-xl bg-petroleo text-white text-center px-2.5 py-1.5 shrink-0">
                <span className="block text-[10px] uppercase text-sol font-semibold">{fmtDiaSemana(d)} {fmtDataCurta(d)}</span>
                <span className="titulo text-2xl leading-none">{fmtHora(r.hora)}</span>
              </span>
              <span className="flex-1 min-w-0">
                <b className="block truncate">{r.nome}</b>
                <span className="text-xs text-petroleo-noite/60">{quadraPorId(r.quadraId).nome} · {fmtReais(precoReserva(db, r))}</span>
                <span className="flex gap-1.5 mt-1"><SeloOrigem origem={r.origem} /><SeloPago pago={r.pago} /></span>
              </span>
            </button>
          </Cartao>
        )
      })}
    </div>
  )
}
