import { NEGOCIO } from '../../config/estabelecimento'
import { QUADRAS, modalidadePorId, type QuadraId } from '../../config/estabelecimento'

// Planta simplificada do Quati (vista de cima, baseada na foto aérea):
// duas quadras de areia deitadas, uma acima da outra, bar/vestiário laranja na esquina e a entrada pela rua.

const POS: Record<QuadraId, { x: number; y: number }> = {
  q1: { x: 80, y: 182 }, // lado da rua
  q2: { x: 80, y: 54 },
}
const L = 340 // largura da quadra no desenho
const A = 104 // altura da quadra no desenho
const meio = A / 2

interface Props {
  selecionada: QuadraId | null
  onEscolher: (id: QuadraId) => void
  livres?: Partial<Record<QuadraId, number>>
}

export default function MapaQuadras({ selecionada, onEscolher, livres }: Props) {
  return (
    <svg viewBox="0 0 640 400" className="w-full h-auto select-none" role="group" aria-label="Mapa das quadras">
      <defs>
        <pattern id="grade" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#0f5c63" strokeOpacity=".07" />
        </pattern>
        <pattern id="areia" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#f3e3c3" />
          <circle cx="2" cy="3" r=".9" fill="#d9c08f" />
          <circle cx="7" cy="8" r=".7" fill="#d9c08f" />
        </pattern>
      </defs>

      <rect width="640" height="400" fill="url(#grade)" />

      {/* rua */}
      <rect x="0" y="332" width="640" height="68" fill="#d5dcde" />
      <line x1="0" y1="368" x2="640" y2="368" stroke="#fff" strokeWidth="2" strokeDasharray="18 14" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={512 + i * 14} y="336" width="8" height="60" fill="#fff" opacity=".9" />
      ))}
      <text x="24" y="392" fontSize="11" fill="#0f5c63" opacity=".55" fontWeight="600">R. Serafim Luís Martins</text>

      {/* calçada */}
      <rect x="0" y="318" width="640" height="14" fill="#ece8df" />

      {/* terreno */}
      <rect x="24" y="20" width="592" height="298" fill="#fbf6ec" stroke="#0f5c63" strokeOpacity=".25" strokeWidth="2" />

      {/* muro com a faixa azul da fachada */}
      <rect x="24" y="304" width="448" height="14" fill="#1e6fb5" />
      <text x="248" y="314.5" fontSize="8.5" fill="#fff" fontWeight="800" textAnchor="middle" letterSpacing="2">
        {NEGOCIO.nome.toUpperCase()} · FUTEVÔLEI · BEACH TENNIS · VÔLEI
      </text>
      <rect x="24" y="20" width="10" height="298" fill="#1e6fb5" />
      <rect x="500" y="304" width="116" height="14" fill="#1e6fb5" />

      {/* entrada */}
      <path d="M486 350 v-30 m-7 9 l7 -9 l7 9" stroke="#0f5c63" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="486" y="362" fontSize="10" fill="#0f5c63" fontWeight="700" textAnchor="middle">ENTRADA</text>

      {/* areia */}
      <rect x="44" y="36" width="412" height="262" rx="4" fill="url(#areia)" />

      {/* área de mesas */}
      <rect x="484" y="36" width="118" height="150" rx="6" fill="none" stroke="#0f5c63" strokeOpacity=".3" strokeDasharray="5 4" />
      {[
        [516, 72],
        [568, 72],
        [516, 124],
        [568, 124],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} fill="#0f5c63" fillOpacity=".25">
          <circle cx={cx} cy={cy} r="9" />
          <circle cx={cx - 15} cy={cy} r="3.5" />
          <circle cx={cx + 15} cy={cy} r="3.5" />
        </g>
      ))}
      <text x="543" y="172" fontSize="10" fill="#0f5c63" opacity=".6" fontWeight="700" textAnchor="middle">MESAS · PETISCOS</text>

      {/* bar / vestiário */}
      <rect x="484" y="198" width="118" height="100" rx="4" fill="#f08a24" />
      <path d="M484 222 H602" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <text x="543" y="252" fontSize="15" fill="#fff" fontWeight="800" textAnchor="middle">BAR</text>
      <text x="543" y="270" fontSize="10" fill="#fff" fontWeight="600" textAnchor="middle" opacity=".9">Vestiários</text>

      {/* árvore */}
      <circle cx="618" cy="320" r="16" fill="#2b8a6e" opacity=".55" />

      {/* quadras */}
      {QUADRAS.map((q) => {
        const { x, y } = POS[q.id]
        const ativa = selecionada === q.id
        const qtd = livres?.[q.id]
        return (
          <g
            key={q.id}
            role="button"
            tabIndex={0}
            aria-pressed={ativa}
            aria-label={`${q.nome}${qtd !== undefined ? `, ${qtd} ${qtd === 1 ? 'horário livre' : 'horários livres'} hoje` : ''}`}
            onClick={() => onEscolher(q.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEscolher(q.id))}
            className="cursor-pointer outline-none group"
          >
            <rect
              x={x - 8}
              y={y - 8}
              width={L + 16}
              height={A + 16}
              rx="10"
              className={`transition ${ativa ? 'fill-onda/25 stroke-onda' : 'fill-transparent stroke-transparent group-hover:fill-onda/10 group-hover:stroke-onda/50 group-focus-visible:stroke-onda'}`}
              strokeWidth="3"
            />
            <rect x={x} y={y} width={L} height={A} fill="none" stroke="#e05a2b" strokeWidth="2.5" />
            <line x1={x} y1={y + meio} x2={x + L} y2={y + meio} stroke="#e05a2b" strokeOpacity=".25" strokeDasharray="4 6" />
            {/* rede */}
            <line x1={x + L / 2} y1={y - 10} x2={x + L / 2} y2={y + A + 10} stroke="#0a3f45" strokeWidth="3" />
            <circle cx={x + L / 2} cy={y - 10} r="4" fill="#0a3f45" />
            <circle cx={x + L / 2} cy={y + A + 10} r="4" fill="#0a3f45" />

            {/* rótulo (lado esquerdo da rede) */}
            <rect x={x + L / 4 - 62} y={y + meio - 27} width="124" height="54" rx="12" className={ativa ? 'fill-petroleo' : 'fill-white'} stroke="#0f5c63" strokeOpacity=".15" />
            <text x={x + L / 4} y={y + meio + 1} textAnchor="middle" fontSize="22" className={`font-display ${ativa ? 'fill-sol' : 'fill-petroleo'}`} letterSpacing="1">
              {q.nome.toUpperCase()}
            </text>
            <text x={x + L / 4} y={y + meio + 17} textAnchor="middle" fontSize="9.5" fontWeight="600" className={ativa ? 'fill-white/80' : 'fill-petroleo-noite/60'}>
              {q.modalidades.map((m) => modalidadePorId(m).curto).join(' · ')}
            </text>

            {/* disponibilidade (lado direito da rede) */}
            {qtd !== undefined && (
              <g>
                <rect x={x + (L * 3) / 4 - 50} y={y + meio - 28} width="100" height="26" rx="13" fill={qtd > 0 ? '#10b981' : '#94a3b8'} />
                <text x={x + (L * 3) / 4} y={y + meio - 11} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">
                  {qtd > 1 ? `${qtd} livres hoje` : qtd === 1 ? '1 livre hoje' : 'Lotada hoje'}
                </text>
              </g>
            )}
            <text x={x + (L * 3) / 4} y={y + meio + (qtd !== undefined ? 18 : 4)} textAnchor="middle" fontSize="10.5" fontWeight="700" className={ativa ? 'fill-petroleo' : 'fill-onda'}>
              {ativa ? '✓ Selecionada' : 'Toque para ver horários'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
