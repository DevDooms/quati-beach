import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { QUADRAS, modalidadePorId, type Aula } from '../data/mock'
import { chaveData, dataDeChave, fmtDataLonga, fmtHora, fmtReais, linkWhatsApp, montarGrade, whatsDoTelefone } from '../lib/agenda'
import { acharProfessor, useDB, type Reserva } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { Janela, SeloModalidade } from '../components/Pecas'
import { Botao, Cartao, JanelaNovaReserva, JanelaReserva, SeloOrigem, SeloPago, TituloPagina, classeInput, precoReserva } from './ui'

export default function Agenda() {
  const { db } = useDB()
  const [data, setData] = useState(chaveData(new Date()))
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [aula, setAula] = useState<Aula | null>(null)
  const [nova, setNova] = useState<{ hora?: number; quadraId?: string } | null>(null)

  const d = dataDeChave(data)
  const grade = montarGrade(db, d, new Date(0))
  const doDia = db.reservas.filter((r) => r.data === data)
  const totalDia = doDia.reduce((s, r) => s + precoReserva(db, r), 0)
  const mover = (dias: number) => setData(chaveData(addDays(d, dias)))
  const ehHoje = data === chaveData(new Date())

  return (
    <>
      <TituloPagina
        titulo="Agenda"
        sub={`${doDia.length} reservas · ${fmtReais(totalDia)} no dia`}
        acoes={<Botao onClick={() => setNova({})}><Plus className="size-4" /> Nova reserva</Botao>}
      />

      <Cartao className="p-3 flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => mover(-1)} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Dia anterior"><ChevronLeft /></button>
        <button onClick={() => mover(1)} className="p-2 rounded-xl hover:bg-petroleo/5" aria-label="Próximo dia"><ChevronRight /></button>
        <h2 className="titulo text-2xl sm:text-3xl text-petroleo first-letter:uppercase flex-1 min-w-48">{fmtDataLonga(d)}</h2>
        {!ehHoje && <Botao tipo="secundario" onClick={() => setData(chaveData(new Date()))}>Hoje</Botao>}
        <input type="date" value={data} onChange={(e) => e.target.value && setData(e.target.value)} className={`${classeInput} !mt-0 !w-auto`} />
      </Cartao>

      <Cartao className="overflow-x-auto">
        <div className="grid min-w-[560px]" style={{ gridTemplateColumns: `64px repeat(${QUADRAS.length}, minmax(0, 1fr))` }}>
          <div className="bg-petroleo-noite rounded-tl-2xl" />
          {QUADRAS.map((q, i) => (
            <div key={q.id} className={`bg-petroleo-noite text-white px-3 py-3 ${i === QUADRAS.length - 1 ? 'rounded-tr-2xl' : ''}`}>
              <p className="titulo text-2xl">{q.nome}</p>
            </div>
          ))}
          {grade.map((linha) => (
            <div key={linha[0].hora} className="contents">
              <div className="border-t border-petroleo/10 grid place-items-center text-sm font-bold text-petroleo-noite/70">{fmtHora(linha[0].hora)}</div>
              {linha.map((s) => (
                <div key={s.quadraId} className="border-t border-l border-petroleo/10 p-1.5 min-h-16">
                  {s.reserva ? (
                    <button
                      onClick={() => setReserva(s.reserva!)}
                      className={`w-full h-full rounded-xl px-3 py-2 text-left transition hover:ring-2 hover:ring-onda ${s.status === 'minha' ? 'bg-sol/30' : 'bg-areia-claro'}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <b className="text-sm truncate">{s.reserva.nome}</b>
                        <SeloPago pago={s.reserva.pago} />
                      </span>
                      <span className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-petroleo-noite/60 truncate">{s.reserva.telefone}</span>
                        <SeloOrigem origem={s.reserva.origem} />
                      </span>
                    </button>
                  ) : s.aula ? (
                    <button onClick={() => setAula(s.aula!)} className="w-full h-full rounded-xl px-3 py-2 text-left bg-onda-claro hover:ring-2 hover:ring-onda">
                      <span className="flex items-center gap-2">
                        <SeloModalidade id={s.aula.modalidade} pequeno />
                        <span className="text-xs font-bold">{s.aula.nivel}</span>
                      </span>
                      <span className="block text-xs text-petroleo-noite/60 mt-0.5 truncate">
                        Prof. {acharProfessor(db, s.aula.professorId).nome.split(' ')[0]} · {s.aula.alunos.length}/{s.aula.vagas} alunos
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setNova({ hora: s.hora, quadraId: s.quadraId })}
                      className="w-full h-full min-h-13 rounded-xl border border-dashed border-petroleo/15 text-xs font-semibold text-petroleo-noite/30 hover:border-onda hover:text-onda hover:bg-onda-claro/30"
                    >
                      + Livre
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Cartao>

      {reserva && <JanelaReserva reserva={reserva} onFechar={() => setReserva(null)} />}
      {nova && <JanelaNovaReserva inicial={{ data, ...nova }} onFechar={() => setNova(null)} />}
      {aula && <JanelaAula aula={aula} onFechar={() => setAula(null)} />}
    </>
  )
}

function JanelaAula({ aula, onFechar }: { aula: Aula; onFechar: () => void }) {
  const { db } = useDB()
  const a = db.aulas.find((x) => x.id === aula.id) ?? aula
  return (
    <Janela onFechar={onFechar} titulo={`${modalidadePorId(a.modalidade).nome} · ${a.nivel}`} etiqueta={<SeloModalidade id={a.modalidade} />}>
      <p className="text-sm text-petroleo-noite/70">
        Prof. {acharProfessor(db, a.professorId).nome} · {fmtHora(a.hora)} · {a.alunos.length}/{a.vagas} alunos
      </p>
      <ul className="mt-4 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
        {a.alunos.length === 0 && <li className="p-3 text-sm text-petroleo-noite/60">Nenhum aluno matriculado.</li>}
        {a.alunos.map((p, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 min-w-0">
              <b className="block truncate">{p.nome}</b>
              <span className="text-xs text-petroleo-noite/60">{p.telefone}</span>
            </span>
            <a
              href={linkWhatsApp(`Olá, ${p.nome.split(' ')[0]}! Lembrete da sua aula hoje às ${fmtHora(a.hora)} no Quati Beach Sport.`, whatsDoTelefone(p.telefone))}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-[#128c4a]"
              aria-label={`WhatsApp de ${p.nome}`}
            >
              <IconeWhatsApp />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <Link to={`/admin/aulas?editar=${a.id}`} className="rounded-xl bg-petroleo text-white px-4 py-2.5 text-sm font-bold">Editar turma</Link>
      </div>
    </Janela>
  )
}
