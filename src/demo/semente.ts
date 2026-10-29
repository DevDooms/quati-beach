// Monta a base inicial da demonstração: reservas "de outros clientes" nas
// últimas e próximas duas semanas, mensalistas, lista de espera e pedidos.
import { addDays, startOfDay } from 'date-fns'
import { FUNCIONAMENTO_PADRAO, MODULOS_PADRAO, PLANOS_PADRAO, PRECOS_PADRAO, QUADRAS } from '../config/estabelecimento'
import { novoId, sorteio } from '../lib/aleatorio'
import { dataDeISO, dataISO, diaDaSemana } from '../lib/datas'
import { SEMANAS_FIXO, reservasDoFixo } from '../features/mensalistas/regras'
import type { DB, Espera, Mensalista, PedidoEvento, Reserva } from '../tipos'
import { AULAS_DEMO, CLIENTE_DEMO, PROFESSORES_DEMO, TORNEIOS_DEMO, pessoaFicticia } from './dados'

export const VERSAO_BANCO = 5

export function semear(): DB {
  const hoje = startOfDay(new Date())
  const hojeISO = dataISO(hoje)
  const reservas: Reserva[] = []
  let n = 0

  for (let i = -14; i < 14; i++) {
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
        reservas.push({
          id: novoId(),
          data,
          hora,
          quadraId: q.id,
          ...pessoaFicticia(n++),
          origem: o < 0.5 ? 'Site' : o < 0.85 ? 'WhatsApp' : 'Balcão',
          pago: i < 0 || o > 0.45,
        })
      }
    }
  }

  // reservas do cliente da demonstração (uma futura, duas passadas)
  for (const [dias, pago] of [[2, false], [-4, true], [-11, true]] as const) {
    const data = dataISO(addDays(hoje, dias))
    const idx = reservas.findIndex((r) => r.data === data && r.hora === 21 && r.quadraId === 'q2')
    if (idx >= 0) reservas.splice(idx, 1)
    reservas.push({ id: novoId(), data, hora: 21, quadraId: 'q2', ...CLIENTE_DEMO, origem: 'Site', pago, formaPagamento: pago ? 'Pix' : 'Balcão' })
  }

  // horários fixos de exemplo: tiram as reservas avulsas do mesmo horário
  const mensalistas: Mensalista[] = [
    { id: 'm1', nome: 'Grupo do Marcão', telefone: '(11) 98123-4455', diaSemana: 2, hora: 21, quadraId: 'q1', desde: dataISO(addDays(hoje, -90)) },
    { id: 'm2', nome: 'Futevôlei da Firma', telefone: '(11) 97654-3210', diaSemana: 4, hora: 21, quadraId: 'q2', desde: dataISO(addDays(hoje, -60)) },
    { id: 'm3', nome: 'Beach das Amigas', telefone: '(11) 99876-1122', diaSemana: 6, hora: 16, quadraId: 'q2', desde: dataISO(addDays(hoje, -30)) },
  ]
  const avulsas = reservas.filter(
    (r) =>
      r.telefone === CLIENTE_DEMO.telefone ||
      !mensalistas.some((m) => m.quadraId === r.quadraId && m.hora === r.hora && diaDaSemana(dataDeISO(r.data)) === m.diaSemana),
  )
  const fixas = mensalistas.flatMap((m) =>
    reservasDoFixo({ reservas: avulsas, aulas: AULAS_DEMO }, m, addDays(hoje, -14), SEMANAS_FIXO + 2).map((r) => ({ ...r, pago: r.data < hojeISO })),
  )

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
  const espera: Espera[] = avulsas
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
    reservas: [...avulsas, ...fixas],
    mensalistas,
    espera,
    eventos,
    planos: structuredClone(PLANOS_PADRAO),
    modulos: { ...MODULOS_PADRAO },
    aulas: structuredClone(AULAS_DEMO),
    professores: structuredClone(PROFESSORES_DEMO),
    torneios: structuredClone(TORNEIOS_DEMO),
    precos: { ...PRECOS_PADRAO },
    funcionamento: structuredClone(FUNCIONAMENTO_PADRAO),
  }
}
