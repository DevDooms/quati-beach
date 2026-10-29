// Tudo o que é específico do Quati Beach Sport. Para outro cliente, troca-se
// este arquivo (e as cores em index.css); no futuro, isto vem do banco.
import type { Funcionamento, Modalidade, ModalidadeId, Modulos, Nivel, Plano, Politica, Precos, Quadra } from '../tipos'

export const NEGOCIO = {
  nome: 'Quati Beach Sport',
  apelido: 'Quati', // usado em "Painel Quati", "Bar do Quati"…
  marca: ['Quati', 'Beach', 'Sport'] as [string, string, string], // como aparece no cabeçalho
  cidadeCurta: 'Embu-Guaçu',
  descricao: 'Futevôlei, beach tennis e vôlei de praia em Embu-Guaçu.',
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

// Ponto de partida; o dono ajusta em Painel → Configurações
export const POLITICA_PADRAO: Politica = { duracaoReserva: 1, cancelamentoHoras: 12 }

export const textoPolitica = (p: Politica) =>
  `Dá para cancelar ou remarcar pelo site até ${p.cancelamentoHoras}h antes do horário.`

export const FUNCIONAMENTO_PADRAO: Funcionamento = {
  0: [8, 20],
  1: [7, 22],
  2: [7, 22],
  3: [7, 22],
  4: [7, 22],
  5: [7, 22],
  6: [8, 22],
}

export const PRECOS_PADRAO: Precos = { normal: 70, pico: 90, inicioPico: 17 }

// Pacotes de horas começam desligados: só aparecem se o dono quiser vender
export const MODULOS_PADRAO: Modulos = { aulas: true, torneios: true, bar: true, eventos: true, pacotes: false }

export const PLANOS_PADRAO: Plano[] = [
  { id: 'p1', nome: '1x por semana', preco: 160, descricao: '4 aulas no mês na turma do seu nível' },
  { id: 'p2', nome: '2x por semana', preco: 280, descricao: '8 aulas no mês, evolução mais rápida' },
  { id: 'p3', nome: 'Livre', preco: 380, descricao: 'Todas as turmas do seu nível, quantas quiser' },
]

export const NIVEIS: Nivel[] = ['Iniciante', 'Intermediário', 'Avançado', 'Misto', 'Kids', 'Melhor idade']

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

export const QUADRAS = [
  { id: 'q1', nome: 'Quadra 1', modalidades: ['futevolei', 'volei'], descricao: 'Rede de futevôlei e vôlei · lado da rua' },
  { id: 'q2', nome: 'Quadra 2', modalidades: ['beach-tennis', 'futevolei'], descricao: 'Rede de beach tennis · ao lado do bar' },
] as const satisfies readonly Quadra[]

// Enquanto as quadras ficam neste arquivo, o id é um tipo fechado ('q1' | 'q2').
// Quando vierem do banco (vários clientes), vira string.
export type QuadraId = (typeof QUADRAS)[number]['id']

export const ehQuadraId = (v: unknown): v is QuadraId => QUADRAS.some((q) => q.id === v)
export const quadraPorId = (id: QuadraId): Quadra => QUADRAS.find((q) => q.id === id)!
export const modalidadePorId = (id: ModalidadeId) => MODALIDADES.find((m) => m.id === id)!

export const CORES_PROFESSOR = [
  'from-onda to-mar',
  'from-mar to-mar-fundo',
  'from-laranja to-[#c95f0c]',
  'from-sol to-[#d9a400]',
  'from-[#1f9a5e] to-mar',
]

// Avaliações reais do Google (pedir autorização ao dono antes de publicar)
export const AVALIACOES = [
  { nome: 'Cassio K.', quando: 'há 2 anos', texto: 'Lugar top demais, super indico. Ambiente familiar e muito agradável.' },
  { nome: 'Vitor C.', quando: 'há 2 anos', texto: 'Ótimo ambiente e petiscos! Bom pra trazer família ou amigos.' },
  { nome: 'Robson C.', quando: 'há 5 meses', texto: 'Melhor quadra de areia para prática de esporte vôlei de areia e beach tênis.' },
]

export const EDICOES_ANTERIORES = [
  { nome: '4º Torneio de Futevôlei', data: '06/06/2026', duplas: 42 },
  { nome: '3º Torneio de Futevôlei', data: '2025', duplas: 36 },
]

export const TIPOS_EVENTO = ['Aniversário', 'Confraternização de empresa', 'Despedida / chá', 'Torneio entre amigos', 'Outro']

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
