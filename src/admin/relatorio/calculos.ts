// Números do relatório mensal (calculados a partir das reservas guardadas)
import { eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns'
import { QUADRAS } from '../../config/estabelecimento'
import { dataISO, diaDaSemana, ORDEM_DIAS } from '../../lib/datas'
import { soDigitos } from '../../lib/formatos'
import type { DB, DiaSemana } from '../../tipos'
import { aulaNoHorario, horasDoDia, reservaNoHorario } from '../../features/reservas/agenda'

export function relatorioDoMes(db: DB, mes: Date) {
  const inicio = dataISO(startOfMonth(mes))
  const fim = dataISO(endOfMonth(mes))
  const doMes = db.reservas.filter((r) => r.data >= inicio && r.data <= fim)
  const realizadas = doMes.filter((r) => !r.falta)
  const faltas = doMes.filter((r) => r.falta)

  // clientes: novo = primeira reserva da vida dele foi neste mês
  const primeiraPorCliente = new Map<string, string>()
  for (const r of db.reservas) {
    const k = soDigitos(r.telefone)
    const atual = primeiraPorCliente.get(k)
    if (!atual || r.data < atual) primeiraPorCliente.set(k, r.data)
  }
  const clientesDoMes = new Set(doMes.map((r) => soDigitos(r.telefone)))
  const novos = [...clientesDoMes].filter((k) => (primeiraPorCliente.get(k) ?? '') >= inicio).length

  // ranking de clientes por número de jogos no mês
  const porCliente = new Map<string, { nome: string; jogos: number; valor: number }>()
  for (const r of realizadas) {
    const k = soDigitos(r.telefone)
    const c = porCliente.get(k) ?? { nome: r.nome, jogos: 0, valor: 0 }
    porCliente.set(k, { nome: r.nome, jogos: c.jogos + 1, valor: c.valor + r.valor })
  }

  const pacotesVendidos = db.creditos.filter((m) => m.valor && dataISO(new Date(m.em)) >= inicio && dataISO(new Date(m.em)) <= fim)

  return {
    faturamento: doMes.reduce((s, r) => s + r.valor, 0),
    recebido: doMes.filter((r) => r.pago).reduce((s, r) => s + r.valor, 0),
    reservas: doMes.length,
    faltas: faltas.length,
    taxaFaltas: doMes.length ? Math.round((faltas.length / doMes.length) * 100) : 0,
    clientes: clientesDoMes.size,
    novos,
    recorrentes: clientesDoMes.size - novos,
    ranking: [...porCliente.values()].sort((a, b) => b.jogos - a.jogos).slice(0, 5),
    pacotes: { quantidade: pacotesVendidos.length, valor: pacotesVendidos.reduce((s, m) => s + (m.valor ?? 0), 0) },
    ...mapaDeCalor(db, mes),
  }
}

// Ocupação média por dia da semana e hora (reservas + aulas ÷ quadras), em %
function mapaDeCalor(db: DB, mes: Date) {
  const dias = eachDayOfInterval({ start: startOfMonth(mes), end: endOfMonth(mes) })
  const horas = [...new Set(dias.flatMap((d) => horasDoDia(db, d)))].sort((a, b) => a - b)
  const soma = new Map<string, { ocupado: number; total: number }>()
  for (const d of dias) {
    const data = dataISO(d)
    const dia = diaDaSemana(d)
    for (const h of horasDoDia(db, d)) {
      const k = `${dia}|${h}`
      const atual = soma.get(k) ?? { ocupado: 0, total: 0 }
      const ocupadas = QUADRAS.filter((q) => {
        const r = reservaNoHorario(db, data, h, db.politica.duracaoReserva, q.id)
        return (r && !r.falta) || aulaNoHorario(db, dia, h, db.politica.duracaoReserva, q.id)
      }).length
      soma.set(k, { ocupado: atual.ocupado + ocupadas, total: atual.total + QUADRAS.length })
    }
  }
  const celula = (dia: DiaSemana, h: number) => {
    const s = soma.get(`${dia}|${h}`)
    return s && s.total ? Math.round((s.ocupado / s.total) * 100) : null
  }
  const valores = [...soma.values()]
  const ocupacaoMedia = valores.length ? Math.round((valores.reduce((s, v) => s + v.ocupado, 0) / valores.reduce((s, v) => s + v.total, 0)) * 100) : 0
  return { horas, dias: ORDEM_DIAS, celula, ocupacaoMedia }
}
