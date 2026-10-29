import { useState, type ReactNode } from 'react'
import { Copy } from 'lucide-react'
import { sorteio } from '../../../lib/aleatorio'

// Código Pix de mentira, só para a demonstração. Com o Mercado Pago/Asaas,
// o QR e o "copia e cola" vêm da API do provedor.
const PIX_DEMO = '00020126580014BR.GOV.BCB.PIX0136quatibeachsport-demo5204000053039865802BR5925QUATI BEACH SPORT DEMO6011EMBU GUACU6304ABCD'

export function PixDemo({ semente, valor }: { semente: string; valor: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-onda">Reserva garantida · pague com Pix</p>
      <h2 className="titulo text-4xl mt-1 text-mar">Escaneie o QR Code</h2>
      <div className="mt-4 mx-auto w-44 rounded-2xl border-2 border-mar/10 p-3 bg-white">
        <QrIlustrativo semente={semente} />
      </div>
      <p className="mt-3 text-sm font-extrabold text-mar">{valor}</p>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-areia-claro p-2 text-left">
        <code className="flex-1 truncate text-xs text-marinho/70">{PIX_DEMO}</code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(PIX_DEMO).catch(() => {})
            setCopiado(true)
          }}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-mar text-white px-3 py-1.5 text-xs font-bold"
        >
          <Copy className="size-3.5" /> {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-marinho/70">Demonstração: este Pix não é real.</p>
    </>
  )
}

// QR Code ilustrativo (não é lido por nenhum banco)
function QrIlustrativo({ semente }: { semente: string }) {
  const n = 25
  const ehMarcador = (x: number, y: number) => {
    const canto = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
    return canto(0, 0) || canto(n - 7, 0) || canto(0, n - 7)
  }
  const celulas: ReactNode[] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (!ehMarcador(x, y) && sorteio(`${semente}|${x}|${y}`) < 0.48) celulas.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
  const marcador = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <rect x={cx} y={cy} width="7" height="7" />
      <rect x={cx + 1} y={cy + 1} width="5" height="5" fill="#fff" />
      <rect x={cx + 2} y={cy + 2} width="3" height="3" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="w-full h-auto" shapeRendering="crispEdges" fill="#072a2e" aria-label="QR Code Pix (ilustrativo)">
      {celulas}
      {marcador(0, 0)}
      {marcador(n - 7, 0)}
      {marcador(0, n - 7)}
    </svg>
  )
}
