import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { QUADRAS } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { DIAS_CURTOS, ORDEM_DIAS, fmtHora } from '../../../lib/datas'
import { primeiroNome } from '../../../lib/formatos'
import type { Aula, DiaSemana } from '../../../tipos'
import { Botao, Cartao, SeloModalidade, TituloPagina } from '../../../ui'
import { acharProfessor, estaLotada } from '../regras'
import { JanelaTurma } from './JanelaTurma'

// horários que sempre aparecem na grade, mesmo sem turma (para facilitar criar)
const HORAS_BASE = [7, 8, 9, 17, 18, 19, 20]

export default function AulasAdmin() {
  const { db } = useDB()
  const [params, setParams] = useSearchParams()
  const [nova, setNova] = useState<{ diaSemana: DiaSemana; hora: number } | null>(null)

  // turma em edição fica na URL (?editar=) para a Agenda poder abrir direto nela
  const abrir = (id: string | null) => {
    if (id) params.set('editar', id)
    else params.delete('editar')
    setParams(params, { replace: true })
  }
  const aulaEditada = db.aulas.find((a) => a.id === params.get('editar'))

  const horas = [...new Set([...db.aulas.map((a) => a.hora), ...HORAS_BASE])].sort((a, b) => a - b)
  const alunos = db.aulas.reduce((s, a) => s + a.alunos.length, 0)
  const vagas = db.aulas.reduce((s, a) => s + a.vagas, 0)
  const turmaVazia = (n: { diaSemana: DiaSemana; hora: number }): Aula => ({
    id: '',
    modalidade: 'futevolei',
    nivel: 'Iniciante',
    professorId: db.professores[0]?.id ?? '',
    quadraId: QUADRAS[0].id,
    vagas: 6,
    alunos: [],
    ...n,
  })

  return (
    <>
      <TituloPagina
        titulo="Grade de aulas"
        sub={`${db.aulas.length} turmas por semana · ${alunos} de ${vagas} vagas preenchidas`}
        acoes={<Botao onClick={() => setNova({ diaSemana: 1, hora: 18 })}><Plus className="size-4" /> Nova turma</Botao>}
      />
      <p className="-mt-3 mb-4 text-sm text-marinho/70">Clique numa turma para editar ou em um espaço vazio para criar. O site e a agenda das quadras são atualizados na hora.</p>

      <Cartao className="overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="bg-marinho text-white">
              <th className="w-16 py-3" />
              {ORDEM_DIAS.map((d) => <th key={d} className="py-3 titulo text-xl font-normal">{DIAS_CURTOS[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {horas.map((h) => (
              <tr key={h} className="border-t border-mar/10 align-top">
                <td className="py-2 text-center font-bold text-marinho/70">{fmtHora(h)}</td>
                {ORDEM_DIAS.map((d) => {
                  const daCelula = db.aulas.filter((a) => a.diaSemana === d && a.hora === h)
                  return (
                    <td key={d} className="p-1 border-l border-mar/10 space-y-1">
                      {daCelula.map((a) => (
                        <button key={a.id} onClick={() => abrir(a.id)} className="w-full text-left rounded-xl bg-white border border-mar/10 p-2 hover:border-onda hover:shadow">
                          <SeloModalidade id={a.modalidade} pequeno />
                          <p className="mt-1 text-xs font-bold leading-tight">{a.nivel}</p>
                          <p className="text-[11px] text-marinho/70 leading-tight truncate">
                            {primeiroNome(acharProfessor(db, a.professorId).nome)} · {a.quadraId.toUpperCase()}
                          </p>
                          <p className={`text-[11px] font-semibold ${estaLotada(a) ? 'text-red-600' : 'text-emerald-700'}`}>
                            {a.alunos.length}/{a.vagas} alunos
                          </p>
                        </button>
                      ))}
                      {daCelula.length < QUADRAS.length && (
                        <button
                          onClick={() => setNova({ diaSemana: d, hora: h })}
                          className="w-full rounded-xl border border-dashed border-mar/10 py-1.5 text-xs font-semibold text-marinho/60 hover:text-onda hover:border-onda"
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
      {nova && <JanelaTurma aula={turmaVazia(nova)} onFechar={() => setNova(null)} />}
    </>
  )
}
