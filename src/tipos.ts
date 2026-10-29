// Tipos do domínio, compartilhados por site, área do cliente e painel.
import type { QuadraId } from './config/estabelecimento'

export type { QuadraId }

// Data no formato yyyy-MM-dd. A "marca" impede passar qualquer string (um
// telefone, por exemplo) onde se espera uma data; crie com dataISO() ou paraDataISO().
export type DataISO = string & { readonly __marca: 'DataISO' }

// 0 = domingo ... 6 = sábado (igual ao Date.getDay())
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ModalidadeId = 'futevolei' | 'beach-tennis' | 'volei'
export type Nivel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Misto' | 'Kids' | 'Melhor idade'
export type Origem = 'Site' | 'WhatsApp' | 'Balcão'
export type FormaPagamento = 'Pix' | 'Cartão' | 'Balcão'

export interface Pessoa {
  nome: string
  telefone: string
}

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
  modalidades: readonly ModalidadeId[]
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

export interface Aula {
  id: string
  modalidade: ModalidadeId
  nivel: Nivel
  professorId: string
  quadraId: QuadraId
  diaSemana: DiaSemana
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
  data: DataISO
  horario: string
  categorias: string[]
  valor: number
  vagasPorCategoria: number
  premiacao: string
  duplas: Dupla[]
}

export interface Reserva extends Pessoa {
  id: string
  data: DataISO
  hora: number
  quadraId: QuadraId
  origem: Origem
  pago: boolean
  formaPagamento?: FormaPagamento
  minha?: boolean // feita neste navegador pelo site
  criadaEm?: string // ISO; só nas reservas feitas durante a demonstração
  fixoId?: string // reserva gerada por um horário fixo (mensalista)
}

// Grupo que joga toda semana no mesmo dia, horário e quadra
export interface Mensalista extends Pessoa {
  id: string
  diaSemana: DiaSemana
  hora: number
  quadraId: QuadraId
  desde: DataISO
}

export interface Espera extends Pessoa {
  id: string
  data: DataISO
  hora: number
  quadraId: QuadraId
  criadaEm: string
}

export interface PedidoEvento extends Pessoa {
  id: string
  tipo: string
  data: DataISO
  pessoas: number
  obs: string
  criadoEm: string
  respondido: boolean
}

export interface Plano {
  id: string
  nome: string
  preco: number
  descricao: string
}

export interface Modulos {
  aulas: boolean
  torneios: boolean
  bar: boolean
  eventos: boolean
}

export interface Precos {
  normal: number // seg–sex antes do pico
  pico: number // seg–sex a partir de `inicioPico`, sábado e domingo
  inicioPico: number // hora em que começa o preço de pico
}

// [abre, fecha] por dia da semana
export type Funcionamento = Record<DiaSemana, [number, number]>

export interface DB {
  versao: number
  reservas: Reserva[]
  mensalistas: Mensalista[]
  espera: Espera[]
  eventos: PedidoEvento[]
  aulas: Aula[]
  planos: Plano[]
  professores: Professor[]
  torneios: Torneio[]
  precos: Precos
  funcionamento: Funcionamento
  modulos: Modulos
}
