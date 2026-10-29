// Turmas, matrículas e professores.
import { addDays, startOfDay } from 'date-fns'
import { novoId } from '../../lib/aleatorio'
import { dataDeISO, dataISO, fmtDataCurta, horaDecimal, proximosDias } from '../../lib/datas'
import { exigir } from '../../lib/erros'
import { iniciais, soDigitos } from '../../lib/formatos'
import type { Aula, DB, Pessoa, Professor } from '../../tipos'
import { DURACAO_AULA, sobrepoe } from '../reservas/agenda'

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
    if (dataISO(d) === dataISO(agora) && a.hora <= horaDecimal(agora)) continue
    return d
  }
  return addDays(startOfDay(agora), 7)
}

const mesmoTelefone = (a: string, b: string) => soDigitos(a) === soDigitos(b)

export function matricular(db: DB, aulaId: string, aluno: Pessoa): DB {
  const aula = db.aulas.find((a) => a.id === aulaId)
  exigir(aula, 'Turma não encontrada.')
  exigir(!aula.alunos.some((p) => mesmoTelefone(p.telefone, aluno.telefone)), 'Você já está matriculado nessa turma.')
  exigir(!estaLotada(aula), 'Essa turma acabou de lotar.')
  return { ...db, aulas: db.aulas.map((a) => (a.id === aulaId ? { ...a, alunos: [...a.alunos, { ...aluno, nome: aluno.nome.trim() }] } : a)) }
}

export const turmasDoAluno = (db: DB, telefone: string) => db.aulas.filter((a) => a.alunos.some((p) => mesmoTelefone(p.telefone, telefone)))

// O que já ocupa o horário de uma turma (outra turma ou reservas futuras naquele dia da semana)
export function conflitosDaTurma(db: DB, a: Pick<Aula, 'id' | 'diaSemana' | 'hora' | 'quadraId'>, agora = new Date()) {
  const hoje = dataISO(agora)
  const turma = db.aulas.find((x) => x.id !== a.id && x.diaSemana === a.diaSemana && x.quadraId === a.quadraId && sobrepoe(x.hora, DURACAO_AULA, a.hora, DURACAO_AULA))
  const reservas = db.reservas
    .filter((r) => r.data >= hoje && r.quadraId === a.quadraId && dataDeISO(r.data).getDay() === a.diaSemana && sobrepoe(r.hora, r.duracao, a.hora, DURACAO_AULA))
    .sort((x, y) => x.data.localeCompare(y.data))
  return { turma, reservas }
}

export function foraDoHorario(db: DB, a: Pick<Aula, 'diaSemana' | 'hora'>) {
  const [abre, fecha] = db.funcionamento[a.diaSemana]
  return a.hora < abre || a.hora + DURACAO_AULA > fecha
}

// Cria (sem id) ou atualiza uma turma. Não deixa cair em cima de outra turma
// nem de reservas já marcadas (elas ficariam escondidas na agenda).
export function salvarAula(db: DB, a: Aula): DB {
  const { turma, reservas } = conflitosDaTurma(db, a)
  exigir(!turma, `Já existe a turma ${turma?.nivel.toLowerCase()} nesse dia, horário e quadra.`)
  exigir(!foraDoHorario(db, a), 'Fora do horário de funcionamento desse dia.')
  exigir(
    reservas.length === 0,
    `Há ${reservas.length} reserva(s) marcada(s) nesse horário (a próxima em ${reservas[0] && fmtDataCurta(dataDeISO(reservas[0].data))}). Cancele ou mude essas reservas antes, ou escolha outro horário.`,
  )
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
