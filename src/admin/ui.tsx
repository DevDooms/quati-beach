import { useState, type ReactNode } from 'react'
import { CircleCheck, CircleDashed, Trash2 } from 'lucide-react'
import { CLIENTE_DEMO, QUADRAS, quadraPorId } from '../data/mock'
import { dataDeChave, fmtDataLonga, fmtFaixa, fmtReais, horasDoDia, linkWhatsApp, precoDoHorario, slotDe, whatsDoTelefone } from '../lib/agenda'
import { novoId, useDB, type DB, type Origem, type Reserva } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { mascaraTelefone } from '../components/ModalReserva'
import { Detalhes, Janela } from '../components/Pecas'

export const classeInput =
  'mt-1 w-full rounded-xl border border-petroleo/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-onda focus:ring-2 focus:ring-onda/30'

export const precoReserva = (db: DB, r: Reserva) => precoDoHorario(db, dataDeChave(r.data), r.hora)

export function TituloPagina({ titulo, sub, acoes }: { titulo: string; sub?: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="titulo text-4xl sm:text-5xl text-petroleo">{titulo}</h1>
        {sub && <p className="text-sm text-petroleo-noite/60 mt-1">{sub}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-petroleo/10 shadow-sm ${className}`}>{children}</div>
}

export function Campo({ rotulo, children, className = '' }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/60">{rotulo}</span>
      {children}
    </label>
  )
}

export function Botao({
  children,
  onClick,
  tipo = 'primario',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  tipo?: 'primario' | 'secundario' | 'perigo'
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const estilos = {
    primario: 'bg-petroleo text-white hover:bg-petroleo-escuro',
    secundario: 'bg-white border border-petroleo/20 text-petroleo hover:border-petroleo/50',
    perigo: 'bg-white border border-red-200 text-red-600 hover:bg-red-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-40 ${estilos[tipo]}`}
    >
      {children}
    </button>
  )
}

export function SeloPago({ pago, onClick }: { pago: boolean; onClick?: () => void }) {
  const cls = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${
    pago ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
  }`
  const conteudo = (
    <>
      {pago ? <CircleCheck className="size-3" /> : <CircleDashed className="size-3" />}
      {pago ? 'Pago' : 'Pendente'}
    </>
  )
  return onClick ? (
    <button onClick={onClick} className={`${cls} hover:ring-2 hover:ring-current/20`} title="Alternar pagamento">
      {conteudo}
    </button>
  ) : (
    <span className={cls}>{conteudo}</span>
  )
}

const CORES_ORIGEM: Record<Origem, string> = {
  Site: 'bg-onda-claro text-petroleo',
  WhatsApp: 'bg-[#25d366]/15 text-[#128c4a]',
  Balcão: 'bg-petroleo/10 text-petroleo-noite/70',
}

export function SeloOrigem({ origem }: { origem: Origem }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${CORES_ORIGEM[origem]}`}>{origem}</span>
}

// Botão que pede confirmação antes de uma ação destrutiva
export function Confirmar({ rotulo, pergunta, onConfirmar }: { rotulo: ReactNode; pergunta: string; onConfirmar: () => void }) {
  const [perguntando, setPerguntando] = useState(false)
  if (!perguntando)
    return (
      <Botao tipo="perigo" onClick={() => setPerguntando(true)}>
        <Trash2 className="size-4" /> {rotulo}
      </Botao>
    )
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-sm">
      <span className="text-red-700 font-semibold">{pergunta}</span>
      <button onClick={onConfirmar} className="rounded-lg bg-red-600 text-white px-3 py-1 font-bold">Sim</button>
      <button onClick={() => setPerguntando(false)} className="rounded-lg px-2 py-1 font-semibold">Não</button>
    </div>
  )
}

export function JanelaReserva({ reserva, onFechar }: { reserva: Reserva; onFechar: () => void }) {
  const { db, set } = useDB()
  const r = db.reservas.find((x) => x.id === reserva.id) ?? reserva
  const d = dataDeChave(r.data)
  const atualizar = (mud: Partial<Reserva>) => set((db) => ({ ...db, reservas: db.reservas.map((x) => (x.id === r.id ? { ...x, ...mud } : x)) }))

  return (
    <Janela onFechar={onFechar} titulo={r.nome} etiqueta={<span className="text-xs font-bold uppercase tracking-widest text-onda">Reserva de quadra</span>}>
      <Detalhes
        itens={[
          { rotulo: 'Telefone', valor: r.telefone },
          { rotulo: 'Quadra', valor: quadraPorId(r.quadraId).nome },
          { rotulo: 'Data', valor: fmtDataLonga(d) },
          { rotulo: 'Horário', valor: fmtFaixa(r.hora) },
          { rotulo: 'Valor', valor: fmtReais(precoReserva(db, r)) },
          { rotulo: 'Origem', valor: <SeloOrigem origem={r.origem} /> },
          ...(r.formaPagamento ? [{ rotulo: 'Forma de pagamento', valor: r.formaPagamento === 'Balcão' ? 'No balcão' : r.formaPagamento }] : []),
          { rotulo: 'Pagamento', valor: <SeloPago pago={r.pago} onClick={() => atualizar({ pago: !r.pago })} /> },
        ]}
      />
      {r.telefone === CLIENTE_DEMO.telefone && (
        <p className="mt-3 text-xs text-petroleo-noite/60">Este é o cliente usado na demonstração da Área do cliente.</p>
      )}
      <div className="mt-5 grid gap-2">
        <a
          href={linkWhatsApp(
            `Olá, ${r.nome.split(' ')[0]}! Aqui é do Quati Beach Sport. Confirmando sua reserva da ${quadraPorId(r.quadraId).nome} em ${fmtDataLonga(d)}, das ${fmtFaixa(r.hora)}. Até lá!`,
            whatsDoTelefone(r.telefone),
          )}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] text-white py-2.5 font-bold"
        >
          <IconeWhatsApp /> Mandar confirmação no WhatsApp
        </a>
        <div className="flex flex-wrap gap-2 justify-between">
          <Botao tipo="secundario" onClick={() => atualizar({ pago: !r.pago })}>
            {r.pago ? 'Marcar como pendente' : 'Marcar como pago'}
          </Botao>
          <Confirmar
            rotulo="Cancelar reserva"
            pergunta="Cancelar?"
            onConfirmar={() => {
              set((db) => ({ ...db, reservas: db.reservas.filter((x) => x.id !== r.id) }))
              onFechar()
            }}
          />
        </div>
      </div>
    </Janela>
  )
}

export function JanelaNovaReserva({
  inicial,
  onFechar,
}: {
  inicial: { data: string; hora?: number; quadraId?: string }
  onFechar: () => void
}) {
  const { db, set } = useDB()
  const [data, setData] = useState(inicial.data)
  const [hora, setHora] = useState(inicial.hora ?? horasDoDia(db, dataDeChave(inicial.data))[0] ?? 8)
  const [quadraId, setQuadraId] = useState(inicial.quadraId ?? 'q1')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [origem, setOrigem] = useState<Origem>('Balcão')
  const [pago, setPago] = useState(false)

  const d = dataDeChave(data)
  const horas = horasDoDia(db, d)
  const slot = slotDe(db, d, hora, quadraId, new Date(0))
  const ocupado = slot.status !== 'livre'
  const valido = nome.trim().length >= 2 && !ocupado && horas.includes(hora)

  return (
    <Janela onFechar={onFechar} titulo="Nova reserva" etiqueta={<span className="text-xs font-bold uppercase tracking-widest text-onda">Lançamento manual</span>}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valido) return
          set((db) => ({ ...db, reservas: [...db.reservas, { id: novoId(), data, hora, quadraId, nome: nome.trim(), telefone, origem, pago, criadaEm: new Date().toISOString() }] }))
          onFechar()
        }}
      >
        <Campo rotulo="Data">
          <input type="date" value={data} onChange={(e) => e.target.value && setData(e.target.value)} className={classeInput} />
        </Campo>
        <Campo rotulo="Horário">
          <select value={hora} onChange={(e) => setHora(Number(e.target.value))} className={classeInput}>
            {horas.map((h) => <option key={h} value={h}>{fmtFaixa(h)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Quadra">
          <select value={quadraId} onChange={(e) => setQuadraId(e.target.value)} className={classeInput}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Origem">
          <select value={origem} onChange={(e) => setOrigem(e.target.value as Origem)} className={classeInput}>
            <option>Balcão</option>
            <option>WhatsApp</option>
            <option>Site</option>
          </select>
        </Campo>
        <Campo rotulo="Nome do cliente" className="col-span-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={classeInput} placeholder="Nome completo" />
        </Campo>
        <Campo rotulo="WhatsApp" className="col-span-2">
          <input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} className={classeInput} placeholder="(11) 99999-9999" inputMode="tel" />
        </Campo>
        <label className="col-span-2 inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={pago} onChange={(e) => setPago(e.target.checked)} className="accent-petroleo size-4" /> Já foi pago ({fmtReais(precoDoHorario(db, d, hora))})
        </label>
        {ocupado && (
          <p className="col-span-2 rounded-xl bg-amber-50 text-amber-800 text-sm p-3">
            Este horário já está {slot.status === 'aula' ? 'ocupado por uma aula' : 'reservado'}. Escolha outro.
          </p>
        )}
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Botao tipo="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao type="submit" disabled={!valido}>Salvar reserva</Botao>
        </div>
      </form>
    </Janela>
  )
}
