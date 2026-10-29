import { useState } from 'react'
import { addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Lock, Plus, X } from 'lucide-react'
import { QUADRAS, quadraPorId, type QuadraId } from '../../../config/estabelecimento'
import { useOcultarValores } from '../../../admin/useOcultarValores'
import { useDB } from '../../../lib/banco'
import { dataDeISO, dataISO, fmtDataLonga, fmtHora, hojeISO, paraDataISO } from '../../../lib/datas'
import { fmtReais, primeiroNome } from '../../../lib/formatos'
import type { Aula, Hora, Reserva } from '../../../tipos'
import { Botao, Cartao, Entrada, Selo, SeloFila, SeloModalidade, SeloOrigem, SeloPago, TituloPagina } from '../../../ui'
import { bloqueiosDoDia, removerBloqueio } from '../../agenda-dono/regras'
import { JanelaBloqueio } from '../../agenda-dono/admin/JanelaBloqueio'
import { JanelaAlunos } from '../../aulas/admin/JanelaAlunos'
import { acharProfessor } from '../../aulas/regras'
import { VER_TUDO, diaEspecial, horasDoDia, montarGrade, type Slot } from '../agenda'
import { filaDoHorario } from '../regras'
import { JanelaNovaReserva } from './JanelaNovaReserva'
import { JanelaReserva } from './JanelaReserva'

export default function AgendaAdmin() {
  const { db, set } = useDB()
  const { valor } = useOcultarValores()
  const [data, setData] = useState(hojeISO())
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [aula, setAula] = useState<Aula | null>(null)
  const [nova, setNova] = useState<{ hora?: Hora; quadraId?: QuadraId } | null>(null)
  const [bloquear, setBloquear] = useState(false)

  const d = dataDeISO(data)
  const grade = montarGrade(db, d, VER_TUDO)
  const normais = horasDoDia(db, d)
  const doDia = db.reservas.filter((r) => r.data === data)
  const totalDia = doDia.reduce((s, r) => s + r.valor, 0)
  const especial = diaEspecial(db, data)
  const bloqueios = bloqueiosDoDia(db, data)
  const mover = (dias: number) => setData(dataISO(addDays(d, dias)))

  return (
    <>
      <TituloPagina
        titulo="Agenda"
        sub={`${doDia.length} reservas · ${valor(fmtReais(totalDia))} no dia`}
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setBloquear(true)}><Lock className="size-4" /> Bloquear horário</Botao>
            <Botao onClick={() => setNova({})}><Plus className="size-4" /> Nova reserva</Botao>
          </>
        }
      />

      <Cartao className="p-3 flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => mover(-1)} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Dia anterior"><ChevronLeft /></button>
        <button onClick={() => mover(1)} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Próximo dia"><ChevronRight /></button>
        <h2 className="titulo text-2xl sm:text-3xl text-petroleo first-letter:uppercase flex-1 min-w-48">{fmtDataLonga(d)}</h2>
        {data !== hojeISO() && <Botao variante="secundario" onClick={() => setData(hojeISO())}>Hoje</Botao>}
        <span className="w-44">
          <Entrada compacto type="date" value={data} onChange={(e) => e.target.value && setData(paraDataISO(e.target.value))} aria-label="Escolher data" />
        </span>
      </Cartao>

      {(especial || bloqueios.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {especial && (
            <span className="rounded-xl bg-sol/25 px-3 py-2 text-sm font-semibold">
              {especial.nome}: {especial.fechado ? 'fechado' : `${especial.horario[0]}h às ${especial.horario[1]}h`}
            </span>
          )}
          {bloqueios.map((b) => (
            <span key={b.id} className="inline-flex items-center gap-2 rounded-xl bg-petroleo/10 px-3 py-2 text-sm">
              <Lock className="size-4" /> {fmtHora(b.inicio)}–{fmtHora(b.fim)} · {b.quadraId ? quadraPorId(b.quadraId).nome : 'Todas'} · {b.motivo}
              <button onClick={() => set((db) => removerBloqueio(db, b.id))} className="text-petroleo-noite/70 hover:text-red-600" aria-label="Desbloquear">
                <X className="size-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Cartao className="overflow-x-auto">
        <div className="grid min-w-[560px]" style={{ gridTemplateColumns: `64px repeat(${QUADRAS.length}, minmax(0, 1fr))` }}>
          <div className="bg-petroleo-noite rounded-tl-2xl" />
          {QUADRAS.map((q, i) => (
            <div key={q.id} className={`bg-petroleo-noite text-white px-3 py-3 ${i === QUADRAS.length - 1 ? 'rounded-tr-2xl' : ''}`}>
              <p className="titulo text-2xl">{q.nome}</p>
            </div>
          ))}
          {grade.length === 0 && <p className="col-span-full p-6 text-center text-sm text-petroleo-noite/70">Fechado neste dia.</p>}
          {grade.map((linha) => {
            const fora = !normais.includes(linha[0].hora)
            return (
              <div key={linha[0].hora} className="contents">
                <div className={`border-t border-petroleo/10 grid place-items-center text-sm font-bold ${fora ? 'text-red-600' : 'text-petroleo-noite/70'}`} title={fora ? 'Fora do horário de funcionamento' : undefined}>
                  {fmtHora(linha[0].hora)}
                </div>
                {linha.map((s) => (
                  <div key={s.quadraId} className="border-t border-l border-petroleo/10 p-1.5 min-h-16">
                    <CelulaAgenda
                      slot={s}
                      fila={filaDoHorario(db, { data, hora: s.hora, quadraId: s.quadraId }).length}
                      professor={s.aula ? primeiroNome(acharProfessor(db, s.aula.professorId).nome) : ''}
                      onReserva={setReserva}
                      onAula={setAula}
                      onLivre={() => setNova({ hora: s.hora, quadraId: s.quadraId })}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </Cartao>

      {reserva && <JanelaReserva reserva={reserva} onFechar={() => setReserva(null)} />}
      {nova && <JanelaNovaReserva inicial={{ data, ...nova }} onFechar={() => setNova(null)} />}
      {aula && <JanelaAlunos aula={aula} onFechar={() => setAula(null)} />}
      {bloquear && <JanelaBloqueio data={data} onFechar={() => setBloquear(false)} />}
    </>
  )
}

interface PropsCelula {
  slot: Slot
  fila: number
  professor: string
  onReserva: (r: Reserva) => void
  onAula: (a: Aula) => void
  onLivre: () => void
}

function CelulaAgenda({ slot: s, fila, professor, onReserva, onAula, onLivre }: PropsCelula) {
  if (s.reserva) {
    const r = s.reserva
    return (
      <button
        onClick={() => onReserva(r)}
        className={`w-full h-full rounded-xl px-3 py-2 text-left transition hover:ring-2 hover:ring-onda ${r.falta ? 'bg-red-50' : s.status === 'minha' ? 'bg-sol/30' : 'bg-areia-claro'}`}
      >
        <span className="flex items-center justify-between gap-2">
          <b className={`text-sm truncate ${r.falta ? 'line-through text-petroleo-noite/70' : ''}`}>{r.nome}</b>
          {r.falta ? <Selo className="bg-red-100 text-red-700">Faltou</Selo> : <SeloPago pago={r.pago} />}
        </span>
        <span className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-petroleo-noite/70 truncate">{r.telefone}</span>
          <span className="flex gap-1">
            <SeloFila quantidade={fila} />
            <SeloOrigem origem={r.origem} />
          </span>
        </span>
      </button>
    )
  }
  if (s.status === 'bloqueado') {
    return (
      <div className="w-full h-full min-h-13 rounded-xl bg-petroleo/10 px-3 py-2 text-xs text-petroleo-noite/70 flex items-center gap-1.5">
        <Lock className="size-3.5" /> {s.bloqueio?.motivo}
      </div>
    )
  }
  if (s.aula) {
    const a = s.aula
    return (
      <button onClick={() => onAula(a)} className="w-full h-full rounded-xl px-3 py-2 text-left bg-onda-claro hover:ring-2 hover:ring-onda">
        <span className="flex items-center gap-2">
          <SeloModalidade id={a.modalidade} pequeno />
          <span className="text-xs font-bold">{a.nivel}</span>
        </span>
        <span className="block text-xs text-petroleo-noite/70 mt-0.5 truncate">
          Prof. {professor} · {a.alunos.length}/{a.vagas} alunos
        </span>
      </button>
    )
  }
  return (
    <button
      onClick={onLivre}
      className="w-full h-full min-h-13 rounded-xl border border-dashed border-petroleo/20 text-xs font-semibold text-petroleo-noite/60 hover:border-onda hover:text-onda hover:bg-onda-claro/30"
    >
      + Livre
    </button>
  )
}
