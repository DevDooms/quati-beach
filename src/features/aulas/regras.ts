// Turmas, matrículas e professores.
import { addDays, startOfDay } from 'date-fns'
import { novoId } from '../../lib/aleatorio'
import { dataISO, proximosDias } from '../../lib/datas'
import { iniciais } from '../../lib/formatos'
import type { Aula, DB, Pessoa, Professor } from '../../tipos'

const PROFESSOR_A_DEFINIR: Omit<Professor, 'id'> = {
  nome: 'A definir',
  iniciais: '?',
  modalidades: [],
  bio: '',
  destaque: '',
  cor: 'from-petroleo to-petroleo-escuro',
  telefone: '',
}

export const acharProfessor = (db: DB, id: string): Professor => db.professores.find((p) => p.id === id) ?? { id, ...PROFESSOR_A_DEFINIR }

export const vagasRestantes = (a: Aula) => Math.max(0, a.vagas - a.alunos.length)
export const estaLotada = (a: Aula) => vagasRestantes(a) === 0

export function proximaDataDaAula(a: Pick<Aula, 'diaSemana' | 'hora'>, agora = new Date()) {
  for (const d of proximosDias(8, agora)) {
    if (d.getDay() !== a.diaSemana) continue
    if (dataISO(d) === dataISO(agora) && a.hora <= agora.getHours()) continue
    return d
  }
  return addDays(startOfDay(agora), 7)
}

export function matricular(db: DB, aulaId: string, aluno: Pessoa): DB {
  return {
    ...db,
    aulas: db.aulas.map((a) => (a.id === aulaId && !estaLotada(a) ? { ...a, alunos: [...a.alunos, { ...aluno, nome: aluno.nome.trim() }] } : a)),
  }
}

export const turmasDoAluno = (db: DB, telefone: string) => db.aulas.filter((a) => a.alunos.some((p) => p.telefone === telefone))

// Outra turma no mesmo dia, horário e quadra
export const conflitoDeTurma = (db: DB, a: Pick<Aula, 'id' | 'diaSemana' | 'hora' | 'quadraId'>) =>
  db.aulas.find((x) => x.id !== a.id && x.diaSemana === a.diaSemana && x.hora === a.hora && x.quadraId === a.quadraId)

export function foraDoHorario(db: DB, a: Pick<Aula, 'diaSemana' | 'hora'>) {
  const [abre, fecha] = db.funcionamento[a.diaSemana]
  return a.hora < abre || a.hora >= fecha
}

// Cria (sem id) ou atualiza uma turma
export function salvarAula(db: DB, a: Aula): DB {
  if (!a.id) return { ...db, aulas: [...db.aulas, { ...a, id: novoId() }] }
  return { ...db, aulas: db.aulas.map((x) => (x.id === a.id ? a : x)) }
}

export const removerAula = (db: DB, id: string): DB => ({ ...db, aulas: db.aulas.filter((a) => a.id !== id) })

export const turmasDoProfessor = (db: DB, id: string) => db.aulas.filter((a) => a.professorId === id)

export function salvarProfessor(db: DB, p: Professor): DB {
  const pronto = { ...p, nome: p.nome.trim(), iniciais: iniciais(p.nome) }
  if (!p.id) return { ...db, professores: [...db.professores, { ...pronto, id: novoId() }] }
  return { ...db, professores: db.professores.map((x) => (x.id === p.id ? pronto : x)) }
}

export const removerProfessor = (db: DB, id: string): DB => ({ ...db, professores: db.professores.filter((p) => p.id !== id) })
