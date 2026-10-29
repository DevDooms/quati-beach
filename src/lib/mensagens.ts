// Todos os textos de WhatsApp num lugar só. Na API oficial da Meta, as mensagens
// que o Quati envia (seção "do estabelecimento") viram modelos aprovados.
import { NEGOCIO } from '../config/estabelecimento'
import type { DataISO } from '../tipos'
import { DIAS_SEMANA, dataDeISO, fmtDataCurta, fmtDataLonga, fmtFaixa, fmtHora, hojeISO } from './datas'
import { fmtReais, fmtReaisCentavos, primeiroNome } from './formatos'

const souEu = (nome: string) => (nome ? `Sou ${nome} e ` : '')
const dia = (data: DataISO) => (data === hojeISO() ? 'hoje' : fmtDataCurta(dataDeISO(data)))

// Do cliente para o Quati (links "Prefiro pelo WhatsApp", "Remarcar"…)
export const doCliente = {
  informacoes: () => 'Olá! Vim pelo site e gostaria de mais informações.',
  reservarQuadra: (nome: string, quadra: string, data: DataISO, hora: number) =>
    `Olá! ${souEu(nome)}gostaria de reservar a ${quadra} no dia ${fmtDataCurta(dataDeISO(data))} das ${fmtFaixa(hora)}.`,
  aulaExperimental: (nome: string, modalidade: string, nivel: string, professor: string, data: DataISO, hora: number) =>
    `Olá! ${souEu(nome)}quero fazer uma aula experimental de ${modalidade} (${nivel}) com o prof. ${primeiroNome(professor)} no dia ${fmtDataCurta(dataDeISO(data))} às ${fmtHora(hora)}.`,
  inscricaoTorneio: (nome: string, torneio: string, categoria: string) =>
    `Olá! ${souEu(nome)}quero inscrever minha dupla no ${torneio}, categoria ${categoria}.`,
  plano: (plano: string, preco: number) => `Olá! Quero saber mais sobre o plano de aulas "${plano}" (${fmtReais(preco)}/mês).`,
  encomendaBar: () => 'Olá! Quero encomendar uma porção para o fim do meu jogo hoje.',
  remarcar: (nome: string, data: DataISO, hora: number, quadra: string) =>
    `Olá! Sou ${nome} e gostaria de remarcar minha reserva de ${fmtDataCurta(dataDeISO(data))} às ${fmtHora(hora)} (${quadra}).`,
  avisarFalta: (nome: string, modalidade: string, nivel: string, data: DataISO) =>
    `Olá! Sou ${nome}, da turma de ${modalidade} ${nivel}. Não vou conseguir ir na aula de ${fmtDataCurta(dataDeISO(data))}.`,
  dividirConta: (resumo: string, total: number, pessoas: number) =>
    `🏐 Quadra fechada no ${NEGOCIO.nome}!\n${resumo}\nTotal ${fmtReais(total)} ÷ ${pessoas} = ${fmtReaisCentavos(total / pessoas)} pra cada.\nManda o Pix pra quem reservou 😉`,
}

// Do Quati para clientes, alunos, professores (botões do painel)
export const doEstabelecimento = {
  contato: (nome: string) => `Olá, ${primeiroNome(nome)}! Aqui é do ${NEGOCIO.nome}.`,
  confirmacaoReserva: (nome: string, quadra: string, data: DataISO, hora: number) =>
    `Olá, ${primeiroNome(nome)}! Aqui é do ${NEGOCIO.nome}. Confirmando sua reserva da ${quadra} em ${fmtDataLonga(dataDeISO(data))}, das ${fmtFaixa(hora)}. Até lá!`,
  lembreteAula: (nome: string, hora: number) => `Olá, ${primeiroNome(nome)}! Lembrete da sua aula hoje às ${fmtHora(hora)} no ${NEGOCIO.nome}.`,
  vagouHorario: (nome: string, data: DataISO, hora: number, quadra: string) =>
    `Olá, ${primeiroNome(nome)}! Vagou o horário de ${dia(data)} às ${hora}h na ${quadra}. Quer ficar com ele?`,
  naFila: (nome: string, data: DataISO, hora: number) =>
    `Olá, ${primeiroNome(nome)}! Você está na lista de espera de ${dia(data)} às ${hora}h. Avisamos se vagar!`,
  chuva: (nome: string, data: DataISO, hora: number) =>
    `Olá, ${primeiroNome(nome)}! Aqui é do ${NEGOCIO.nome}. Por causa da chuva, seu horário de ${dia(data)} às ${hora}h não vai rolar 🌧️. Podemos remarcar sem custo: qual dia fica bom pra você?`,
  mensalista: (nome: string, diaSemana: number, hora: number) =>
    `Olá, ${nome}! Aqui é do ${NEGOCIO.nome}, sobre o horário fixo de ${DIAS_SEMANA[diaSemana].toLowerCase()} às ${hora}h.`,
  respostaEvento: (nome: string, tipo: string, data: DataISO) =>
    `Olá, ${primeiroNome(nome)}! Aqui é do ${NEGOCIO.nome}, sobre o seu pedido de ${tipo.toLowerCase()} para ${fmtDataCurta(dataDeISO(data))}.`,
  inscricaoTorneio: (nome: string, torneio: string) => `Olá, ${primeiroNome(nome)}! Aqui é do ${NEGOCIO.nome}, sobre a inscrição no ${torneio}.`,
  professor: (nome: string) => `Olá, ${primeiroNome(nome)}!`,
}
