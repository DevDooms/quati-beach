// Tipos do domínio, compartilhados por site, área do cliente e painel.
import type { QuadraId } from './config/estabelecimento'

export type { QuadraId }

// Data no formato yyyy-MM-dd. A "marca" impede passar qualquer string (um
// telefone, por exemplo) onde se espera uma data; crie com dataISO() ou paraDataISO().
export type DataISO = string & { readonly __marca: 'DataISO' }

// 0 = domingo ... 6 = sábado (igual ao Date.getDay())
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Horários são em horas decimais: 8 = 08h00, 8.5 = 08h30
export type Hora = number

export type ModalidadeId = 'futevolei' | 'beach-tennis' | 'volei'
export type Nivel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Misto' | 'Kids' | 'Melhor idade'
export type Origem = 'Site' | 'WhatsApp' | 'Balcão'

// Como a reserva foi (ou será) paga. "Balcão" = combinado para pagar ao chegar (ainda pendente).
export type FormaPagamento = 'Pix' | 'Cartão' | 'Dinheiro' | 'Crédito' | 'Balcão'
export type FormaRecebida = Exclude<FormaPagamento, 'Balcão'>

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

// Aulas duram 1 hora e repetem toda semana
export interface Aula {
  id: string
  modalidade: ModalidadeId
  nivel: Nivel
  professorId: string
  quadraId: QuadraId
  diaSemana: DiaSemana
  hora: Hora
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
  hora: Hora
  duracao: number // horas (1, 1.5…), guardada porque a duração padrão pode mudar
  quadraId: QuadraId
  origem: Origem
  valor: number // preço fechado na hora da reserva (mudar a tabela não reescreve o passado)
  pago: boolean
  formaPagamento?: FormaPagamento
  pagoEm?: string // ISO; usado no caixa do dia
  falta?: boolean // reservou e não apareceu
  minha?: boolean // feita neste navegador pelo site
  criadaEm?: string // ISO; só nas reservas feitas durante a demonstração
}

export interface Espera extends Pessoa {
  id: string
  data: DataISO
  hora: Hora
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

// Horário fechado pelo próprio estabelecimento (manutenção, evento particular…)
export interface Bloqueio {
  id: string
  data: DataISO
  inicio: Hora
  fim: Hora
  quadraId: QuadraId | null // null = todas as quadras
  motivo: string
}

// Feriado ou dia com horário diferente do normal
export interface DiaEspecial {
  id: string
  data: DataISO
  nome: string
  fechado: boolean
  horario: [Hora, Hora] // usado quando não está fechado
}

// Preço especial criado pelo dono (ex.: terça 14h–17h por R$ 50)
export interface Promocao {
  id: string
  nome: string
  dias: DiaSemana[]
  inicio: Hora
  fim: Hora
  preco: number // por hora
  ativa: boolean
}

// Pacote de horas que o dono decidiu vender
export interface Pacote {
  id: string
  nome: string
  horas: number
  preco: number
}

// Movimento de créditos (horas) de um cliente: compra (+) ou uso (−)
export interface MovimentoCredito extends Pessoa {
  id: string
  horas: number
  descricao: string
  em: string // ISO
  valor?: number // quanto foi pago (só nas compras)
  forma?: FormaRecebida
  reservaId?: string // só nos usos
}

export interface Modulos {
  aulas: boolean
  torneios: boolean
  bar: boolean
  eventos: boolean
  pacotes: boolean
}

export interface Precos {
  normal: number // por hora, seg–sex antes do pico
  pico: number // por hora, seg–sex a partir de `inicioPico`, sábado e domingo
  inicioPico: Hora
}

// Regras de funcionamento que o próprio dono define no painel
export interface Politica {
  duracaoReserva: number // horas: 1, 1.5 ou 2
  cancelamentoHoras: number // cancelar pelo site até X horas antes
}

// [abre, fecha] por dia da semana
export type Funcionamento = Record<DiaSemana, [Hora, Hora]>

export interface DB {
  versao: number
  semeadoEm: string // ISO; a demonstração se renova quando fica velha
  reservas: Reserva[]
  espera: Espera[]
  eventos: PedidoEvento[]
  aulas: Aula[]
  planos: Plano[]
  professores: Professor[]
  torneios: Torneio[]
  bloqueios: Bloqueio[]
  diasEspeciais: DiaEspecial[]
  promocoes: Promocao[]
  pacotes: Pacote[]
  creditos: MovimentoCredito[]
  precos: Precos
  politica: Politica
  funcionamento: Funcionamento
  modulos: Modulos
}
