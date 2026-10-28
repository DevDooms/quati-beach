// Dados iniciais da demonstração. A "base" que o site e o painel usam fica em
// lib/store.tsx (salva no navegador); no futuro, isto vira uma API de verdade
// e o bot de WhatsApp passa a ler/escrever na mesma base.

export type ModalidadeId = 'futevolei' | 'beach-tennis' | 'volei'
export type Nivel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Misto' | 'Kids' | 'Melhor idade'
export const NIVEIS: Nivel[] = ['Iniciante', 'Intermediário', 'Avançado', 'Misto', 'Kids', 'Melhor idade']

export interface Modalidade {
  id: ModalidadeId
  nome: string
  curto: string
  descricao: string
  cor: string // classe tailwind de fundo
}

export interface Quadra {
  id: string
  nome: string
  modalidades: ModalidadeId[]
  descricao: string
}

export interface Professor {
  id: string
  nome: string
  iniciais: string
  modalidades: ModalidadeId[]
  bio: string
  destaque: string
  cor: string
  telefone: string
}

export interface Pessoa {
  nome: string
  telefone: string
}

export interface Aula {
  id: string
  modalidade: ModalidadeId
  nivel: Nivel
  professorId: string
  quadraId: string
  diaSemana: number // 0 = domingo ... 6 = sábado
  hora: number
  vagas: number
  alunos: Pessoa[]
}

export interface Dupla {
  id: string
  categoria: string
  atleta1: string
  atleta2: string
  telefone: string
  pago: boolean
}

export interface Torneio {
  id: string
  nome: string
  data: string // yyyy-MM-dd
  horario: string
  categorias: string[]
  valor: number
  vagasPorCategoria: number
  premiacao: string
  duplas: Dupla[]
}

export const NEGOCIO = {
  nome: 'Quati Beach Sport',
  endereco: 'R. Serafim Luís Martins, 865 — Vila Louro',
  cidade: 'Embu-Guaçu — SP, 06900-210',
  telefone: '(11) 99935-8944',
  whatsapp: '5511999358944',
  instagram: 'https://www.instagram.com/quatibeachsport/',
  instagramUser: '@quatibeachsport',
  googleAvaliacoes: 'https://www.google.com/search?q=Quati+Beach+Sport+Embu-Gua%C3%A7u+avalia%C3%A7%C3%B5es',
  nota: 5.0,
  avaliacoes: 21,
  mapaEmbed:
    'https://www.google.com/maps?q=R.+Serafim+Lu%C3%ADs+Martins,+865+-+Vila+Louro,+Embu-Gua%C3%A7u+-+SP&output=embed',
  mapaLink: 'https://maps.google.com/?q=Quati+Beach+Sport+Embu-Gua%C3%A7u',
}

// Regras mostradas no site (combinar com o dono antes de publicar)
export const POLITICA = {
  cancelamentoHoras: 12,
  textoCurto: 'Cancelamento grátis até 12h antes. Choveu forte? Remarcamos sem custo.',
}

// Cliente fictício usado na "Área do cliente" da demonstração
export const CLIENTE_DEMO: Pessoa = { nome: 'Rafael Souza', telefone: '(11) 98765-4321' }

// [abre, fecha] por dia da semana (0 = domingo)
export const FUNCIONAMENTO_INICIAL: Record<number, [number, number]> = {
  0: [8, 20],
  1: [7, 22],
  2: [7, 22],
  3: [7, 22],
  4: [7, 22],
  5: [7, 22],
  6: [8, 22],
}

export const PRECOS_INICIAIS = {
  normal: 70, // seg–sex antes das 17h
  pico: 90, // seg–sex a partir das 17h, sábado e domingo
}

export const MODALIDADES: Modalidade[] = [
  {
    id: 'futevolei',
    nome: 'Futevôlei',
    curto: 'Futevôlei',
    descricao: 'O carro-chefe da casa. Turmas do zero ao avançado, aulão de domingo e torneios abertos.',
    cor: 'bg-onda',
  },
  {
    id: 'beach-tennis',
    nome: 'Beach Tennis',
    curto: 'Beach Tennis',
    descricao: 'Raquete, bolinha e areia. Ótimo para começar, com turma especial para a melhor idade.',
    cor: 'bg-laranja',
  },
  {
    id: 'volei',
    nome: 'Vôlei de Praia',
    curto: 'Vôlei',
    descricao: 'Fundamentos, jogo em dupla e rachão entre amigos nas quadras com iluminação noturna.',
    cor: 'bg-sol',
  },
]

export const QUADRAS: Quadra[] = [
  { id: 'q1', nome: 'Quadra 1', modalidades: ['futevolei', 'volei'], descricao: 'Rede de futevôlei e vôlei · lado da rua' },
  { id: 'q2', nome: 'Quadra 2', modalidades: ['beach-tennis', 'futevolei'], descricao: 'Rede de beach tennis · ao lado do bar' },
]

export const PROFESSORES_INICIAIS: Professor[] = [
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

export const CORES_PROFESSOR = [
  'from-onda to-petroleo',
  'from-petroleo to-petroleo-escuro',
  'from-laranja to-[#c96a10]',
  'from-sol to-[#d9a400]',
  'from-[#2b8a6e] to-petroleo',
]

// [diaSemana, hora, modalidade, nivel, professorId, quadraId]
type AulaTupla = [number, number, ModalidadeId, Nivel, string, string]

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

const NOMES = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriel', 'Helena', 'Igor', 'Júlia', 'Kaique', 'Larissa', 'Mateus', 'Natália', 'Otávio', 'Paula', 'Renan', 'Sabrina', 'Thiago', 'Vanessa', 'Wesley', 'Yasmin', 'Caio', 'Bianca', 'Leandro', 'Marina']
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Ferreira', 'Carvalho', 'Gomes', 'Ribeiro', 'Martins', 'Rocha']

export function pessoaFicticia(n: number): Pessoa {
  const nome = `${NOMES[n % NOMES.length]} ${SOBRENOMES[(n * 7 + 3) % SOBRENOMES.length]}`
  const tel = String(10000000 + ((n * 7919) % 89999999)).padStart(8, '0')
  return { nome, telefone: `(11) 9${tel.slice(0, 4)}-${tel.slice(4)}` }
}

export const AULAS_INICIAIS: Aula[] = GRADE.map(([diaSemana, hora, modalidade, nivel, professorId, quadraId], i) => {
  const vagas = modalidade === 'beach-tennis' ? 4 : 6
  const qtd = Math.min(vagas, (i * 7 + 3) % (vagas + 1))
  const alunos = Array.from({ length: qtd }, (_, j) => pessoaFicticia(i * 11 + j * 5 + 1))
  // o cliente da demo está matriculado no futevôlei iniciante de quarta
  if (diaSemana === 3 && hora === 19 && quadraId === 'q1') alunos[0] = CLIENTE_DEMO
  return { id: `a${i + 1}`, diaSemana, hora, modalidade, nivel, professorId, quadraId, vagas, alunos }
})

export const AVALIACOES = [
  { nome: 'Cassio K.', quando: 'há 2 anos', texto: 'Lugar top demais, super indico. Ambiente familiar e muito agradável.' },
  { nome: 'Vitor C.', quando: 'há 2 anos', texto: 'Ótimo ambiente e petiscos! Bom pra trazer família ou amigos.' },
  { nome: 'Robson C.', quando: 'há 5 meses', texto: 'Melhor quadra de areia para prática de esporte vôlei de areia e beach tênis.' },
]

function duplasFicticias(categoria: string, qtd: number, base: number): Dupla[] {
  return Array.from({ length: qtd }, (_, i) => {
    const a = pessoaFicticia(base + i * 2)
    const b = pessoaFicticia(base + i * 2 + 1)
    return { id: `${categoria}-${i}`, categoria, atleta1: a.nome, atleta2: b.nome, telefone: a.telefone, pago: i % 4 !== 3 }
  })
}

export const TORNEIOS_INICIAIS: Torneio[] = [
  {
    id: 't5',
    nome: '5º Torneio de Futevôlei',
    data: '2026-12-05',
    horario: 'a partir das 8h',
    categorias: ['Iniciante', 'Intermediário', 'Misto'],
    valor: 140,
    vagasPorCategoria: 16,
    premiacao: 'Troféu + kit para as 3 primeiras duplas de cada categoria',
    duplas: [
      ...duplasFicticias('Iniciante', 11, 100),
      ...duplasFicticias('Intermediário', 14, 200),
      ...duplasFicticias('Misto', 6, 300),
    ],
  },
]

// Cardápio ilustrativo do bar (itens e preços inventados para a demonstração)
export const CARDAPIO: { categoria: string; itens: { nome: string; descricao?: string; preco: number }[] }[] = [
  {
    categoria: 'Porções',
    itens: [
      { nome: 'Batata frita', descricao: 'Com cheddar e bacon +R$ 8', preco: 32 },
      { nome: 'Calabresa acebolada', descricao: 'Acompanha pão francês', preco: 38 },
      { nome: 'Isca de frango', descricao: 'Empanada, com molho da casa', preco: 42 },
      { nome: 'Mandioca frita', preco: 28 },
    ],
  },
  {
    categoria: 'Lanches',
    itens: [
      { nome: 'X-Quati', descricao: 'Hambúrguer artesanal, queijo, bacon e salada', preco: 29 },
      { nome: 'Misto quente', preco: 14 },
      { nome: 'Açaí 500 ml', descricao: 'Com 3 acompanhamentos', preco: 22 },
    ],
  },
  {
    categoria: 'Bebidas',
    itens: [
      { nome: 'Água de coco', preco: 9 },
      { nome: 'Água mineral', preco: 5 },
      { nome: 'Isotônico', preco: 9 },
      { nome: 'Refrigerante lata', preco: 7 },
      { nome: 'Suco natural', descricao: 'Laranja, limão ou abacaxi com hortelã', preco: 12 },
      { nome: 'Cerveja long neck', preco: 12 },
      { nome: 'Balde com 6 long necks', preco: 62 },
    ],
  },
]

export const TIPOS_EVENTO = ['Aniversário', 'Confraternização de empresa', 'Despedida / chá', 'Torneio entre amigos', 'Outro']

export const EDICOES_ANTERIORES = [
  { nome: '4º Torneio de Futevôlei', data: '06/06/2026', duplas: 42 },
  { nome: '3º Torneio de Futevôlei', data: '2025', duplas: 36 },
]

export const modalidadePorId = (id: ModalidadeId) => MODALIDADES.find((m) => m.id === id)!
export const quadraPorId = (id: string) => QUADRAS.find((q) => q.id === id)!
