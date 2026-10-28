import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { QUADRAS, quadraPorId } from '../data/mock'
import { chaveData, dataDeChave, fmtDataCurta, fmtDiaSemana, fmtHora, fmtReais, linkWhatsApp, whatsDoTelefone } from '../lib/agenda'
import { useDB, type Reserva } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { Chip } from '../components/Pecas'
import { Botao, Cartao, JanelaNovaReserva, JanelaReserva, SeloOrigem, SeloPago, TituloPagina, classeInput, precoReserva } from './ui'

const PERIODOS = { proximas: 'Próximas', hoje: 'Hoje', passadas: 'Passadas', todas: 'Todas' } as const
type Periodo = keyof typeof PERIODOS

export default function Reservas() {
  const { db, set } = useDB()
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState<Periodo>('proximas')
  const [quadra, setQuadra] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [limite, setLimite] = useState(40)
  const [aberta, setAberta] = useState<Reserva | null>(null)
  const [nova, setNova] = useState(false)

  const hoje = chaveData(new Date())
  const termo = busca.trim().toLowerCase()
  const lista = db.reservas
    .filter((r) => {
      if (periodo === 'proximas' && r.data < hoje) return false
      if (periodo === 'hoje' && r.data !== hoje) return false
      if (periodo === 'passadas' && r.data >= hoje) return false
      if (quadra && r.quadraId !== quadra) return false
      if (pagamento === 'pago' && !r.pago) return false
      if (pagamento === 'pendente' && r.pago) return false
      if (termo && !r.nome.toLowerCase().includes(termo) && !r.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, '') || '§')) return false
      return true
    })
    .sort((a, b) => {
      const ka = a.data + fmtHora(a.hora)
      const kb = b.data + fmtHora(b.hora)
      return periodo === 'passadas' ? kb.localeCompare(ka) : ka.localeCompare(kb)
    })
  const total = lista.reduce((s, r) => s + precoReserva(db, r), 0)
  const pendente = lista.filter((r) => !r.pago).reduce((s, r) => s + precoReserva(db, r), 0)
  const alternarPago = (id: string) => set((db) => ({ ...db, reservas: db.reservas.map((r) => (r.id === id ? { ...r, pago: !r.pago } : r)) }))

  return (
    <>
      <TituloPagina
        titulo="Reservas"
        sub={`${lista.length} reservas · ${fmtReais(total)} no total · ${fmtReais(pendente)} pendente`}
        acoes={<Botao onClick={() => setNova(true)}><Plus className="size-4" /> Nova reserva</Botao>}
      />

      <Cartao className="p-4 space-y-3 mb-4">
        <div className="flex gap-2 overflow-x-auto sem-scrollbar">
          {(Object.keys(PERIODOS) as Periodo[]).map((p) => (
            <Chip key={p} ativo={periodo === p} onClick={() => { setPeriodo(p); setLimite(40) }}>{PERIODOS[p]}</Chip>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone" className={`${classeInput} pl-9`} />
          </div>
          <select value={quadra} onChange={(e) => setQuadra(e.target.value)} className={classeInput} aria-label="Quadra">
            <option value="">Todas as quadras</option>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
          <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} className={classeInput} aria-label="Pagamento">
            <option value="">Qualquer pagamento</option>
            <option value="pago">Pagas</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>
      </Cartao>

      {/* tabela (desktop) */}
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
            {lista.slice(0, limite).map((r) => {
              const d = dataDeChave(r.data)
              return (
                <tr key={r.id} className="hover:bg-areia-claro cursor-pointer" onClick={() => setAberta(r)}>
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
                    <SeloPago pago={r.pago} onClick={() => alternarPago(r.id)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <a href={linkWhatsApp(`Olá, ${r.nome.split(' ')[0]}! Aqui é do Quati Beach Sport.`, whatsDoTelefone(r.telefone))} target="_blank" rel="noreferrer" className="text-[#128c4a]" aria-label="WhatsApp">
                      <IconeWhatsApp />
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {lista.length === 0 && <p className="p-8 text-center text-petroleo-noite/60">Nenhuma reserva com esses filtros.</p>}
      </Cartao>

      {/* cartões (celular) */}
      <div className="md:hidden space-y-2">
        {lista.slice(0, limite).map((r) => {
          const d = dataDeChave(r.data)
          return (
            <Cartao key={r.id} className="p-3">
              <button onClick={() => setAberta(r)} className="w-full text-left flex items-center gap-3">
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
        {lista.length === 0 && <p className="p-8 text-center text-petroleo-noite/60">Nenhuma reserva com esses filtros.</p>}
      </div>

      {lista.length > limite && (
        <div className="mt-4 text-center">
          <Botao tipo="secundario" onClick={() => setLimite((l) => l + 40)}>Mostrar mais ({lista.length - limite})</Botao>
        </div>
      )}

      {aberta && <JanelaReserva reserva={aberta} onFechar={() => setAberta(null)} />}
      {nova && <JanelaNovaReserva inicial={{ data: hoje }} onFechar={() => setNova(false)} />}
    </>
  )
}
