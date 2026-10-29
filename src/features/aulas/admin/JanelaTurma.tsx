import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { MODALIDADES, NIVEIS, QUADRAS, ehQuadraId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { DIAS_SEMANA, ORDEM_DIAS, fmtFaixa } from '../../../lib/datas'
import { mascaraTelefone } from '../../../lib/formatos'
import { esquemaNome, valido } from '../../../lib/validacao'
import type { Aula, DiaSemana, ModalidadeId, Nivel, Pessoa } from '../../../tipos'
import { Aviso, Botao, Campo, Confirmar, Entrada, Janela, Selecao } from '../../../ui'
import { conflitoDeTurma, foraDoHorario, removerAula, salvarAula } from '../regras'

const HORAS_POSSIVEIS = Array.from({ length: 17 }, (_, i) => i + 6) // 6h às 22h

// Criar (aula.id vazio) ou editar uma turma, com a lista de alunos
export function JanelaTurma({ aula, onFechar }: { aula: Aula; onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState(aula)
  const ehNova = !aula.id
  const campo = <K extends keyof Aula>(k: K, v: Aula[K]) => setF((x) => ({ ...x, [k]: v }))

  const conflito = conflitoDeTurma(db, f)
  const fora = foraDoHorario(db, f)
  const [abre, fecha] = db.funcionamento[f.diaSemana]

  return (
    <Janela onFechar={onFechar} titulo={ehNova ? 'Nova turma' : 'Editar turma'} largura="sm:max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Campo rotulo="Modalidade" compacto>
          <Selecao compacto value={f.modalidade} onChange={(e) => campo('modalidade', e.target.value as ModalidadeId)}>
            {MODALIDADES.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Nível" compacto>
          <Selecao compacto value={f.nivel} onChange={(e) => campo('nivel', e.target.value as Nivel)}>
            {NIVEIS.map((n) => <option key={n}>{n}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Professor" compacto>
          <Selecao compacto value={f.professorId} onChange={(e) => campo('professorId', e.target.value)}>
            {db.professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Dia" compacto>
          <Selecao compacto value={f.diaSemana} onChange={(e) => campo('diaSemana', Number(e.target.value) as DiaSemana)}>
            {ORDEM_DIAS.map((d) => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Horário" compacto>
          <Selecao compacto value={f.hora} onChange={(e) => campo('hora', Number(e.target.value))}>
            {HORAS_POSSIVEIS.map((h) => <option key={h} value={h}>{fmtFaixa(h)}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Quadra" compacto>
          <Selecao compacto value={f.quadraId} onChange={(e) => ehQuadraId(e.target.value) && campo('quadraId', e.target.value)}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Vagas" compacto>
          <Entrada compacto type="number" min={1} max={20} value={f.vagas} onChange={(e) => campo('vagas', Math.max(1, Number(e.target.value)))} />
        </Campo>
      </div>

      <div className="mt-3 space-y-2">
        {conflito && <Aviso>Já existe uma turma de {conflito.nivel.toLowerCase()} nesse dia, horário e quadra.</Aviso>}
        {fora && <Aviso>Fora do horário de funcionamento de {DIAS_SEMANA[f.diaSemana].toLowerCase()} ({abre}h às {fecha}h).</Aviso>}
      </div>

      <ListaAlunos alunos={f.alunos} vagas={f.vagas} onChange={(alunos) => campo('alunos', alunos)} />

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {!ehNova ? (
          <Confirmar
            rotulo="Excluir turma"
            pergunta="Excluir?"
            onConfirmar={() => {
              set((db) => removerAula(db, f.id))
              onFechar()
            }}
          />
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Botao variante="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao
            disabled={!!conflito || fora}
            onClick={() => {
              set((db) => salvarAula(db, f))
              onFechar()
            }}
          >
            Salvar
          </Botao>
        </div>
      </div>
    </Janela>
  )
}

function ListaAlunos({ alunos, vagas, onChange }: { alunos: Pessoa[]; vagas: number; onChange: (a: Pessoa[]) => void }) {
  const [novo, setNovo] = useState<Pessoa>({ nome: '', telefone: '' })
  return (
    <>
      <h3 className="titulo text-2xl text-petroleo mt-6">Alunos ({alunos.length}/{vagas})</h3>
      <ul className="mt-2 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
        {alunos.length === 0 && <li className="p-3 text-sm text-petroleo-noite/60">Nenhum aluno ainda.</li>}
        {alunos.map((p, i) => (
          <li key={`${p.telefone}-${i}`} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 min-w-0">
              <b className="truncate">{p.nome}</b> <span className="text-xs text-petroleo-noite/60">{p.telefone}</span>
            </span>
            <button onClick={() => onChange(alunos.filter((_, j) => j !== i))} className="p-1 text-petroleo-noite/40 hover:text-red-600" aria-label={`Remover ${p.nome}`}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valido(esquemaNome, novo.nome)) return
          onChange([...alunos, { ...novo, nome: novo.nome.trim() }])
          setNovo({ nome: '', telefone: '' })
        }}
      >
        <Entrada compacto value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} placeholder="Nome do aluno" />
        <Entrada compacto value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: mascaraTelefone(e.target.value) })} placeholder="WhatsApp" />
        <Botao type="submit" variante="secundario" disabled={alunos.length >= vagas} aria-label="Adicionar aluno">
          <UserPlus className="size-4" />
        </Botao>
      </form>
    </>
  )
}
