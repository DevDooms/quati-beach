// Logo e ícones de marca desenhados à mão (a lib de ícones não traz marcas).
import { useId } from 'react'
import logo from '../assets/logo.png'
import { NEGOCIO } from '../config/estabelecimento'

export function Logo({ className = 'size-10' }: { className?: string }) {
  return <img src={logo} alt={NEGOCIO.nome} className={`${className} rounded-full object-contain`} />
}

export function IconeWhatsApp({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  )
}

export function IconeInstagram({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Onda decorativa usada entre seções
export function Onda({ className = '', cor = 'var(--color-areia-claro)' }: { className?: string; cor?: string }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M0 40c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v40H0z" fill={cor} />
    </svg>
  )
}

// Mar batendo na areia: três camadas de onda andando em velocidades diferentes, a última é a areia
const CRISTA = 'M0 40 Q180 4 360 40 T720 40 T1080 40 T1440 40 T1800 40 T2160 40 T2520 40 T2880 40 V100 H0Z'
const CAMADAS = [
  { cor: 'var(--color-ceu)', opacidade: 0.35, y: 0, duracao: '22s' },
  { cor: '#ffffff', opacidade: 0.55, y: 14, duracao: '15s' },
  { cor: 'var(--color-areia-claro)', opacidade: 1, y: 28, duracao: '30s' },
]
export function Ondas({ className = '', cor }: { className?: string; cor?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      {CAMADAS.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
          className="anim-mare absolute left-0 w-[200%] h-full"
          style={{ top: `${c.y}%`, ['--duracao' as string]: c.duracao, animationDirection: i === 1 ? 'reverse' : 'normal' }}
        >
          <path d={CRISTA} fill={i === CAMADAS.length - 1 && cor ? cor : c.cor} fillOpacity={c.opacidade} />
        </svg>
      ))}
    </div>
  )
}

// Bola de futevôlei com as faixas nas cores da logo
export function Bola({ className = 'size-16' }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <clipPath id={`${id}c`}>
          <circle cx="50" cy="50" r="47" />
        </clipPath>
        <radialGradient id={`${id}l`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0c1f4d" stopOpacity=".28" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="100" height="100" fill="#fff" />
        <path d="M-10 26 Q50 2 112 36 L112 56 Q50 22 -10 46 Z" fill="var(--color-sol)" />
        <path d="M14 -10 Q44 48 8 112 L30 112 Q64 48 36 -10 Z" fill="var(--color-mar)" />
        <path d="M58 112 Q66 62 112 34 L112 56 Q84 72 80 112 Z" fill="var(--color-onda)" />
        <g fill="none" stroke="#0c1f4d" strokeOpacity=".35" strokeWidth="1.4">
          <path d="M-10 26 Q50 2 112 36 M-10 46 Q50 22 112 56" />
          <path d="M14 -10 Q44 48 8 112 M36 -10 Q64 48 30 112" />
          <path d="M58 112 Q66 62 112 34 M80 112 Q84 72 112 56" />
        </g>
        <rect width="100" height="100" fill={`url(#${id}l)`} />
      </g>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#0c1f4d" strokeWidth="2.5" />
    </svg>
  )
}

// Bola quicando com sombra na areia
export function BolaQuicando({ className = 'w-24' }: { className?: string }) {
  return (
    <div className={`relative aspect-[1/2] ${className}`} aria-hidden>
      <div className="absolute inset-x-0 bottom-[6%] h-[50%] flex items-end">
        <Bola className="w-full h-auto anim-quica" />
      </div>
      <div className="absolute left-[12%] right-[12%] bottom-0 h-[7%] rounded-[50%] bg-marinho blur-[3px] anim-sombra" />
    </div>
  )
}
