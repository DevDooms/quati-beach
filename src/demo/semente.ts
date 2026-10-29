// Monta a base inicial da demonstração: reservas "de outros clientes" nas
// últimas e próximas duas semanas, lista de espera e pedidos de evento.
// O que é decisão do dono (bloqueios, feriados, promoções, pacotes) começa vazio.
import { addDays, addHours, startOfDay } from 'date-fns'
import { FUNCIONAMENTO_PADRAO, MODULOS_PADRAO, PLANOS_PADRAO, POLITICA_PADRAO, PRECOS_PADRAO, QUADRAS } from '../config/estabelecimento'
import { novoId, sorteio } from '../lib/aleatorio'
import { dataISO, diaDaSemana } from '../lib/datas'
import type { DB, Espera, FormaRecebida, PedidoEvento, Reserva } from '../tipos'
import { AULAS_DEMO, CLIENTE_DEMO, PROFESSORES_DEMO, TORNEIOS_DEMO, pessoaFicticia } from './dados'

export const VERSAO_BANCO = 9

const FORMAS: FormaRecebida[] = ['Pix', 'Pix', 'Cartão', 'Dinheiro']

// Uma carteira de ~60 clientes, com alguns "da casa" jogando bem mais que os outros
const CARTEIRA = 60
const cliente = (n: number) => Math.floor(CARTEIRA * ((n * 0.618034) % 1) ** 2)

// Preço da tabela padrão (a semente não depende das regras para não criar dependência circular)
const precoPadrao = (d: Date, hora: number) => {
  const fimDeSemana = d.getDay() === 0 || d.getDay() === 6
  return fimDeSemana || hora >= PRECOS_PADRAO.inicioPico ? PRECOS_PADRAO.pico : PRECOS_PADRAO.normal
}

export function semear(): DB {
  const hoje = startOfDay(new Date())
  const reservas: Reserva[] = []
  let n = 0

  for (let i = -21; i < 14; i++) {
    const d = addDays(hoje, i)
    const data = dataISO(d)
    const dia = diaDaSemana(d)
    const [abre, fecha] = FUNCIONAMENTO_PADRAO[dia]
    for (let hora = abre; hora < fecha; hora++) {
      for (const q of QUADRAS) {
        if (AULAS_DEMO.some((a) => a.diaSemana === dia && a.hora === hora && a.quadraId === q.id)) continue
        const fimDeSemana = dia === 0 || dia === 6
        const chance = fimDeSemana ? 0.5 : hora >= 18 ? 0.6 : hora >= 17 ? 0.45 : 0.2
        if (sorteio(`${data}|${hora}|${q.id}`) >= chance) continue
        const o = sorteio(`origem${data}${hora}${q.id}`)
        const passado = i < 0
        const pago = passado || o > 0.45
        reservas.push({
          id: novoId(),
          data,
          hora,
          duracao: 1,
          quadraId: q.id,
          ...pessoaFicticia(cliente(n++)),
          origem: o < 0.5 ? 'Site' : o < 0.85 ? 'WhatsApp' : 'Balcão',
          valor: precoPadrao(d, hora),
          pago,
          formaPagamento: pago ? FORMAS[Math.floor(o * 1000) % FORMAS.length] : 'Balcão',
          // passado: pago no dia do jogo; futuro: pago pelo site nos últimos dias
          pagoEm: pago
            ? (passado ? addHours(d, hora) : addHours(addDays(hoje, -Math.floor(((o * 10) % 1) * 4)), 8 + Math.floor(o * 1300) % 14)).toISOString()
            : undefined,
          // uma ou outra falta no passado, para os relatórios terem o que mostrar
          falta: passado && sorteio(`falta${data}${hora}${q.id}`) < 0.06,
        })
      }
    }
  }

  // reservas do cliente da demonstração (uma futura, duas passadas)
  for (const [dias, pago] of [[2, false], [-4, true], [-11, true]] as const) {
    const d = addDays(hoje, dias)
    const data = dataISO(d)
    const idx = reservas.findIndex((r) => r.data === data && r.hora === 21 && r.quadraId === 'q2')
    if (idx >= 0) reservas.splice(idx, 1)
    reservas.push({
      id: novoId(),
      data,
      hora: 21,
      duracao: 1,
      quadraId: 'q2',
      ...CLIENTE_DEMO,
      origem: 'Site',
      valor: precoPadrao(d, 21),
      pago,
      formaPagamento: pago ? 'Pix' : 'Balcão',
      pagoEm: pago ? d.toISOString() : undefined,
    })
  }

  const eventos: PedidoEvento[] = [
    {
      id: 'e1',
      nome: 'Patrícia Mendes',
      telefone: '(11) 98222-7788',
      tipo: 'Aniversário',
      data: dataISO(addDays(hoje, 17)),
      pessoas: 25,
      obs: 'Festa de 15 anos, queremos as duas quadras à tarde e porções do bar.',
      criadoEm: addDays(hoje, -1).toISOString(),
      respondido: false,
    },
    {
      id: 'e2',
      nome: 'RH Metalúrgica Guaçu',
      telefone: '(11) 4661-2030',
      tipo: 'Confraternização de empresa',
      data: dataISO(addDays(hoje, 30)),
      pessoas: 40,
      obs: 'Torneio interno de futevôlei para os funcionários.',
      criadoEm: addDays(hoje, -3).toISOString(),
      respondido: true,
    },
  ]

  // gente na lista de espera dos primeiros horários de pico ocupados dos próximos dias
  const amanha = dataISO(addDays(hoje, 1))
  const espera: Espera[] = reservas
    .filter((r) => r.data >= amanha && r.hora >= 17 && r.telefone !== CLIENTE_DEMO.telefone)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 2)
    .flatMap((r, i) =>
      [0, 1].slice(0, 2 - i).map((j) => ({
        id: novoId(),
        data: r.data,
        hora: r.hora,
        quadraId: r.quadraId,
        ...pessoaFicticia(500 + i * 10 + j),
        criadaEm: addDays(hoje, -1).toISOString(),
      })),
    )

  return {
    versao: VERSAO_BANCO,
    semeadoEm: new Date().toISOString(),
    reservas,
    espera,
    eventos,
    planos: structuredClone(PLANOS_PADRAO),
    modulos: { ...MODULOS_PADRAO },
    aulas: structuredClone(AULAS_DEMO),
    professores: structuredClone(PROFESSORES_DEMO),
    torneios: structuredClone(TORNEIOS_DEMO),
    bloqueios: [],
    diasEspeciais: [],
    promocoes: [],
    pacotes: [],
    creditos: [],
    precos: { ...PRECOS_PADRAO },
    politica: { ...POLITICA_PADRAO },
    funcionamento: structuredClone(FUNCIONAMENTO_PADRAO),
  }
}
