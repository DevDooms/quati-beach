import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, UserPlus, X } from 'lucide-react'
import { MODALIDADES, NIVEIS, QUADRAS, type Aula, type ModalidadeId, type Nivel } from '../data/mock'
import { DIAS_CURTOS, DIAS_SEMANA, ORDEM_DIAS, fmtFaixa, fmtHora } from '../lib/agenda'
import { acharProfessor, novoId, useDB } from '../lib/store'
import { mascaraTelefone } from '../components/ModalReserva'
import { Janela, SeloModalidade } from '../components/Pecas'
import { Botao, Cartao, Campo, Confirmar, TituloPagina, classeInput } from './ui'

export default function AulasAdmin() {
  const { db } = useDB()
  const [params, setParams] = useSearchParams()
  const editando = params.get('editar')
  const [nova, setNova] = useState<{ diaSemana: number; hora: number } | null>(null)

  const abrir = (id: string | null) => {
    if (id) params.set('editar', id)
    else params.delete('editar')
    setParams(params, { replace: true })
  }

  const horas = [...new Set([...db.aulas.map((a) => a.hora), 7, 8, 9, 17, 18, 19, 20])].sort((a, b) => a - b)
  const alunos = db.aulas.reduce((s, a) => s + a.alunos.length, 0)
  const vagas = db.aulas.reduce((s, a) => s + a.vagas, 0)
  const aulaEditada = db.aulas.find((a) => a.id === editando)

  return (
    <>
      <TituloPagina
        titulo="Grade de aulas"
        sub={`${db.aulas.length} turmas por semana · ${alunos} de ${vagas} vagas preenchidas`}
        acoes={<Botao onClick={() => setNova({ diaSemana: 1, hora: 18 })}><Plus className="size-4" /> Nova turma</Botao>}
      />
      <p className="-mt-3 mb-4 text-sm text-petroleo-noite/60">Clique numa turma para editar ou em um espaço vazio para criar. O site e a agenda das quadras são atualizados na hora.</p>

      <Cartao className="overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="bg-petroleo-noite text-white">
              <th className="w-16 py-3" />
              {ORDEM_DIAS.map((d) => <th key={d} className="py-3 titulo text-xl font-normal">{DIAS_CURTOS[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {horas.map((h) => (
              <tr key={h} className="border-t border-petroleo/10 align-top">
                <td className="py-2 text-center font-bold text-petroleo-noite/70">{fmtHora(h)}</td>
                {ORDEM_DIAS.map((d) => {
                  const daCelula = db.aulas.filter((a) => a.diaSemana === d && a.hora === h)
                  return (
                    <td key={d} className="p-1 border-l border-petroleo/10 space-y-1 group">
                      {daCelula.map((a) => (
                        <button key={a.id} onClick={() => abrir(a.id)} className="w-full text-left rounded-xl bg-white border border-petroleo/10 p-2 hover:border-onda hover:shadow">
                          <SeloModalidade id={a.modalidade} pequeno />
                          <p className="mt-1 text-xs font-bold leading-tight">{a.nivel}</p>
                          <p className="text-[11px] text-petroleo-noite/60 leading-tight truncate">
                            {acharProfessor(db, a.professorId).nome.split(' ')[0]} · {a.quadraId.toUpperCase()}
                          </p>
                          <p className={`text-[11px] font-semibold ${a.alunos.length >= a.vagas ? 'text-red-600' : 'text-emerald-700'}`}>
                            {a.alunos.length}/{a.vagas} alunos
                          </p>
                        </button>
                      ))}
                      {daCelula.length < QUADRAS.length && (
                        <button
                          onClick={() => setNova({ diaSemana: d, hora: h })}
                          className="w-full rounded-xl border border-dashed border-transparent py-1.5 text-xs font-semibold text-transparent group-hover:border-petroleo/20 group-hover:text-petroleo-noite/40 hover:!text-onda hover:!border-onda"
                        >
                          + turma
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Cartao>

      {aulaEditada && <JanelaTurma key={aulaEditada.id} aula={aulaEditada} onFechar={() => abrir(null)} />}
      {nova && (
        <JanelaTurma
          aula={{ id: '', modalidade: 'futevolei', nivel: 'Iniciante', professorId: db.professores[0]?.id ?? '', quadraId: 'q1', vagas: 6, alunos: [], ...nova }}
          onFechar={() => setNova(null)}
        />
      )}
    </>
  )
}

function JanelaTurma({ aula, onFechar }: { aula: Aula; onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState(aula)
  const [novoAluno, setNovoAluno] = useState({ nome: '', telefone: '' })
  const ehNova = !aula.id
  const campo = <K extends keyof Aula>(k: K, v: Aula[K]) => setF((x) => ({ ...x, [k]: v }))

  const conflito = db.aulas.find((a) => a.id !== f.id && a.diaSemana === f.diaSemana && a.hora === f.hora && a.quadraId === f.quadraId)
  const [abre, fecha] = db.funcionamento[f.diaSemana]
  const foraDoHorario = f.hora < abre || f.hora >= fecha

  const salvar = () => {
    if (conflito || foraDoHorario) return
    set((db) => ({
      ...db,
      aulas: ehNova ? [...db.aulas, { ...f, id: novoId() }] : db.aulas.map((a) => (a.id === f.id ? f : a)),
    }))
    onFechar()
  }

  return (
    <Janela onFechar={onFechar} titulo={ehNova ? 'Nova turma' : 'Editar turma'} largura="sm:max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Campo rotulo="Modalidade">
          <select value={f.modalidade} onChange={(e) => campo('modalidade', e.target.value as ModalidadeId)} className={classeInput}>
            {MODALIDADES.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Nível">
          <select value={f.nivel} onChange={(e) => campo('nivel', e.target.value as Nivel)} className={classeInput}>
            {NIVEIS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Professor">
          <select value={f.professorId} onChange={(e) => campo('professorId', e.target.value)} className={classeInput}>
            {db.professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Dia">
          <select value={f.diaSemana} onChange={(e) => campo('diaSemana', Number(e.target.value))} className={classeInput}>
            {ORDEM_DIAS.map((d) => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Horário">
          <select value={f.hora} onChange={(e) => campo('hora', Number(e.target.value))} className={classeInput}>
            {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>{fmtFaixa(h)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Quadra">
          <select value={f.quadraId} onChange={(e) => campo('quadraId', e.target.value)} className={classeInput}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Vagas">
          <input type="number" min={1} max={20} value={f.vagas} onChange={(e) => campo('vagas', Math.max(1, Number(e.target.value)))} className={classeInput} />
        </Campo>
      </div>

      {conflito && (
        <p className="mt-3 rounded-xl bg-amber-50 text-amber-800 text-sm p-3">
          Já existe uma turma de {conflito.nivel.toLowerCase()} nesse dia, horário e quadra.
        </p>
      )}
      {foraDoHorario && (
        <p className="mt-3 rounded-xl bg-amber-50 text-amber-800 text-sm p-3">
          Fora do horário de funcionamento de {DIAS_SEMANA[f.diaSemana].toLowerCase()} ({abre}h às {fecha}h).
        </p>
      )}

      <h3 className="titulo text-2xl text-petroleo mt-6">Alunos ({f.alunos.length}/{f.vagas})</h3>
      <ul className="mt-2 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
        {f.alunos.length === 0 && <li className="p-3 text-sm text-petroleo-noite/60">Nenhum aluno ainda.</li>}
        {f.alunos.map((p, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 min-w-0">
              <b className="truncate">{p.nome}</b> <span className="text-xs text-petroleo-noite/60">{p.telefone}</span>
            </span>
            <button onClick={() => campo('alunos', f.alunos.filter((_, j) => j !== i))} className="p-1 text-petroleo-noite/40 hover:text-red-600" aria-label={`Remover ${p.nome}`}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (novoAluno.nome.trim().length < 2) return
          campo('alunos', [...f.alunos, { nome: novoAluno.nome.trim(), telefone: novoAluno.telefone }])
          setNovoAluno({ nome: '', telefone: '' })
        }}
      >
        <input value={novoAluno.nome} onChange={(e) => setNovoAluno((x) => ({ ...x, nome: e.target.value }))} placeholder="Nome do aluno" className={`${classeInput} !mt-0`} />
        <input value={novoAluno.telefone} onChange={(e) => setNovoAluno((x) => ({ ...x, telefone: mascaraTelefone(e.target.value) }))} placeholder="WhatsApp" className={`${classeInput} !mt-0`} />
        <Botao type="submit" tipo="secundario" disabled={f.alunos.length >= f.vagas}><UserPlus className="size-4" /></Botao>
      </form>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {!ehNova ? (
          <Confirmar
            rotulo="Excluir turma"
            pergunta="Excluir?"
            onConfirmar={() => {
              set((db) => ({ ...db, aulas: db.aulas.filter((a) => a.id !== f.id) }))
              onFechar()
            }}
          />
        ) : <span />}
        <div className="flex gap-2">
          <Botao tipo="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={!!conflito || foraDoHorario}>Salvar</Botao>
        </div>
      </div>
    </Janela>
  )
}
