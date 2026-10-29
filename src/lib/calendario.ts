// Link "Adicionar ao Google Agenda" (abre o Google Agenda já preenchido;
// no celular, o Google oferece salvar na agenda do aparelho)
const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export interface EventoAgenda {
  titulo: string
  inicio: Date
  duracaoHoras: number
  local: string
  detalhes?: string
}

export function linkGoogleAgenda(e: EventoAgenda) {
  const fim = new Date(e.inicio.getTime() + e.duracaoHoras * 3_600_000)
  const p = new URLSearchParams({ action: 'TEMPLATE', text: e.titulo, dates: `${fmt(e.inicio)}/${fmt(fim)}`, location: e.local, details: e.detalhes ?? '' })
  return `https://calendar.google.com/calendar/render?${p}`
}
