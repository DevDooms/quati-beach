// Dados fictícios da demonstração. Com backend, esta pasta (demo/) inteira some.
import type { Aula, DiaSemana, Dupla, ModalidadeId, Nivel, Pessoa, Professor, QuadraId, Torneio } from '../tipos'
import { paraDataISO } from '../lib/datas'

// Cliente usado na "Área do cliente"
export const CLIENTE_DEMO: Pessoa = { nome: 'Rafael Souza', telefone: '(11) 98765-4321' }

const NOMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriel', 'Helena', 'Igor', 'Júlia', 'Kaique', 'Larissa', 'Mateus', 'Natália', 'Otávio', 'Paula', 'Renan', 'Sabrina', 'Thiago', 'Vanessa', 'Wesley', 'Yasmin', 'Caio', 'Bianca', 'Leandro', 'Marina']
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Ferreira', 'Carvalho', 'Gomes', 'Ribeiro', 'Martins', 'Rocha']

export function pessoaFicticia(n: number): Pessoa {
  const nome = `${NOMES[n % NOMES.length]} ${SOBRENOMES[(n * 7 + 3) % SOBRENOMES.length]}`
  const tel = String(10000000 + ((n * 7919) % 89999999)).padStart(8, '0')
  return { nome, telefone: `(11) 9${tel.slice(0, 4)}-${tel.slice(4)}` }
}

export const PROFESSORES_DEMO: Professor[] = [
  {
    id: 'lucas',
    nome: 'Lucas Andrade',
    iniciais: 'LA',
    modalidades: ['futevolei'],
    bio: 'Atleta de circuito estadual, foca em quem está começando: domínio, levantada e posicionamento.',
    destaque: '8 anos de areia',
    cor: 'from-onda to-petroleo',
    telefone: '(11) 97111-2201',
  },
  {
    id: 'diego',
    nome: 'Diego Ramos',
    iniciais: 'DR',
    modalidades: ['futevolei'],
    bio: 'Responsável pelas turmas intermediária, avançada e kids. Treino com intensidade e muita técnica.',
    destaque: 'Campeão do 3º Torneio Quati',
    cor: 'from-petroleo to-petroleo-escuro',
    telefone: '(11) 97222-3302',
  },
  {
    id: 'camila',
    nome: 'Camila Torres',
    iniciais: 'CT',
    modalidades: ['beach-tennis'],
    bio: 'Professora de beach tennis com certificação de federação. Aulas leves, divertidas e com evolução rápida.',
    destaque: 'Certificada FPT',
    cor: 'from-laranja to-[#c96a10]',
    telefone: '(11) 97333-4403',
  },
  {
    id: 'juliana',
    nome: 'Juliana Prado',
    iniciais: 'JP',
    modalidades: ['volei'],
    bio: 'Ex-jogadora de quadra que migrou para a areia. Fundamentos, leitura de jogo e jogo em dupla.',
    destaque: 'Ex-atleta de vôlei',
    cor: 'from-sol to-[#d9a400]',
    telefone: '(11) 97444-5504',
  },
  {
    id: 'marcos',
    nome: 'Marcos Lima',
    iniciais: 'ML',
    modalidades: ['beach-tennis'],
    bio: 'Educador físico, toca a turma da melhor idade e as turmas noturnas de iniciantes.',
    destaque: 'Turma melhor idade',
    cor: 'from-[#2b8a6e] to-petroleo',
    telefone: '(11) 97555-6605',
  },
]

// [diaSemana, hora, modalidade, nivel, professorId, quadraId]
type AulaTupla = [DiaSemana, number, ModalidadeId, Nivel, string, QuadraId]

const GRADE: AulaTupla[] = [
  // segunda
  [1, 7, 'futevolei', 'Iniciante', 'lucas', 'q1'],
  [1, 8, 'beach-tennis', 'Iniciante', 'camila', 'q2'],
  [1, 18, 'futevolei', 'Intermediário', 'diego', 'q1'],
  [1, 19, 'futevolei', 'Iniciante', 'lucas', 'q1'],
  [1, 19, 'beach-tennis', 'Intermediário', 'camila', 'q2'],
  [1, 20, 'volei', 'Iniciante', 'juliana', 'q1'],
  // terça
  [2, 7, 'beach-tennis', 'Melhor idade', 'marcos', 'q2'],
  [2, 17, 'futevolei', 'Kids', 'diego', 'q1'],
  [2, 18, 'volei', 'Intermediário', 'juliana', 'q1'],
  [2, 19, 'beach-tennis', 'Iniciante', 'marcos', 'q2'],
  [2, 20, 'futevolei', 'Avançado', 'diego', 'q1'],
  // quarta
  [3, 7, 'futevolei', 'Iniciante', 'lucas', 'q1'],
  [3, 18, 'futevolei', 'Intermediário', 'diego', 'q1'],
  [3, 19, 'futevolei', 'Iniciante', 'lucas', 'q1'],
  [3, 19, 'beach-tennis', 'Intermediário', 'camila', 'q2'],
  [3, 20, 'volei', 'Iniciante', 'juliana', 'q1'],
  // quinta
  [4, 7, 'beach-tennis', 'Melhor idade', 'marcos', 'q2'],
  [4, 17, 'futevolei', 'Kids', 'diego', 'q1'],
  [4, 18, 'volei', 'Intermediário', 'juliana', 'q1'],
  [4, 19, 'beach-tennis', 'Iniciante', 'marcos', 'q2'],
  [4, 20, 'futevolei', 'Avançado', 'diego', 'q1'],
  // sexta
  [5, 18, 'futevolei', 'Misto', 'lucas', 'q1'],
  [5, 19, 'beach-tennis', 'Intermediário', 'camila', 'q2'],
  // sábado
  [6, 8, 'futevolei', 'Iniciante', 'lucas', 'q1'],
  [6, 9, 'beach-tennis', 'Kids', 'camila', 'q2'],
  [6, 10, 'volei', 'Misto', 'juliana', 'q1'],
  // domingo — aulão
  [0, 9, 'futevolei', 'Misto', 'diego', 'q1'],
]

export const AULAS_DEMO: Aula[] = GRADE.map(([diaSemana, hora, modalidade, nivel, professorId, quadraId], i) => {
  const vagas = modalidade === 'beach-tennis' ? 4 : 6
  const qtd = Math.min(vagas, (i * 7 + 3) % (vagas + 1))
  const alunos = Array.from({ length: qtd }, (_, j) => pessoaFicticia(i * 11 + j * 5 + 1))
  // o cliente da demo está matriculado no futevôlei iniciante de quarta
  if (diaSemana === 3 && hora === 19 && quadraId === 'q1') alunos[0] = CLIENTE_DEMO
  return { id: `a${i + 1}`, diaSemana, hora, modalidade, nivel, professorId, quadraId, vagas, alunos }
})

function duplasFicticias(categoria: string, qtd: number, base: number): Dupla[] {
  return Array.from({ length: qtd }, (_, i) => {
    const a = pessoaFicticia(base + i * 2)
    const b = pessoaFicticia(base + i * 2 + 1)
    return { id: `${categoria}-${i}`, categoria, atleta1: a.nome, atleta2: b.nome, telefone: a.telefone, pago: i % 4 !== 3 }
  })
}

export const TORNEIOS_DEMO: Torneio[] = [
  {
    id: 't5',
    nome: '5º Torneio de Futevôlei',
    data: paraDataISO('2026-12-05'),
    horario: 'a partir das 8h',
    categorias: ['Iniciante', 'Intermediário', 'Misto'],
    valor: 140,
    vagasPorCategoria: 16,
    premiacao: 'Troféu + kit para as 3 primeiras duplas de cada categoria',
    duplas: [
      ...duplasFicticias('Iniciante', 11, 100),
      ...duplasFicticias('Intermediário', 14, 200),
      ...duplasFicticias('Misto', 6, 300),
      { id: 'demo', categoria: 'Iniciante', atleta1: CLIENTE_DEMO.nome, atleta2: 'Bruno Costa', telefone: CLIENTE_DEMO.telefone, pago: true },
    ],
  },
]
