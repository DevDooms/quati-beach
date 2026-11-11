import { useEffect, useState, type CSSProperties } from 'react'
import { NEGOCIO } from '../config/estabelecimento'
import { Logo, Ondas } from '../ui'

// Abertura do site: a logo cai e quica na areia, a maré sobe e a cortina se abre.
// Toca a cada vez que o site é aberto (não ao trocar de página). O painel do dono não tem intro.
const DURACAO = 2700 // ms até a cortina começar a subir
const DURACAO_REDUZIDA = 900 // para quem pediu menos movimento no sistema
const SAIDA = 750 // ms da cortina subindo (igual ao .intro-sai em index.css)

type Fase = 'entrando' | 'saindo' | 'fim'

const atraso = (s: number) => ({ '--atraso': `${s}s` }) as CSSProperties

export function Intro() {
  const [fase, setFase] = useState<Fase>(() => (window.location.pathname.startsWith('/admin') ? 'fim' : 'entrando'))

  useEffect(() => {
    const raiz = document.documentElement
    if (fase === 'entrando') {
      // segura a rolagem e a animação de entrada das páginas até a cortina abrir
      raiz.classList.add('intro-ativa')
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const t = window.setTimeout(() => setFase('saindo'), reduzido ? DURACAO_REDUZIDA : DURACAO)
      const pular = () => setFase('saindo')
      window.addEventListener('keydown', pular)
      return () => {
        window.clearTimeout(t)
        window.removeEventListener('keydown', pular)
      }
    }
    raiz.classList.remove('intro-ativa')
    if (fase === 'saindo') {
      const t = window.setTimeout(() => setFase('fim'), SAIDA)
      return () => window.clearTimeout(t)
    }
  }, [fase])

  if (fase === 'fim') return null

  return (
    <div
      onClick={() => setFase('saindo')}
      className={`fixed inset-0 z-[100] ceu-mar text-white overflow-hidden grid place-items-center cursor-pointer select-none ${fase === 'saindo' ? 'intro-sai' : ''}`}
    >
      <div className="absolute inset-0 textura-rede opacity-50 [mask-image:radial-gradient(circle_at_center,transparent_25%,black_75%)]" aria-hidden />
      <div className="absolute left-1/2 top-[38%] size-72 sm:size-96 rounded-full bg-sol/20 blur-3xl intro-brilho" aria-hidden />

      <div className="relative flex flex-col items-center text-center px-4 -mt-16" aria-hidden>
        {/* logo quicando, com os anéis de "impacto" e a sombra na areia */}
        <div className="relative size-40 sm:size-52">
          <span className="absolute inset-0 rounded-full border-4 border-sol intro-anel" style={atraso(0.5)} />
          <span className="absolute inset-0 rounded-full border-2 border-sol/70 intro-anel" style={atraso(0.96)} />
          <div className="intro-logo relative size-full">
            <Logo className="size-full shadow-2xl shadow-marinho/60" />
          </div>
          <div className="absolute left-[15%] right-[15%] -bottom-5 h-3 rounded-[50%] bg-marinho/70 blur-[4px] intro-sombra" />
        </div>

        <p className="mt-12 sm:mt-14">
          <span className="block overflow-hidden">
            <span className="titulo block text-6xl sm:text-8xl intro-texto drop-shadow-[0_5px_0_rgb(12_31_77/0.35)]" style={atraso(1.05)}>A areia</span>
          </span>
          <span className="manuscrito block text-sol text-4xl sm:text-6xl -rotate-3 -mt-1 intro-texto drop-shadow-[0_4px_0_rgb(12_31_77/0.45)]" style={atraso(1.3)}>
            te chama.
          </span>
        </p>
        <p className="mt-5 text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-white/70 intro-texto" style={atraso(1.55)}>
          {NEGOCIO.cidadeCurta}
        </p>
      </div>

      <Ondas className="absolute bottom-0 left-0 w-full h-24 sm:h-36 intro-ondas" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setFase('saindo')
        }}
        className="absolute top-4 right-4 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition"
      >
        Pular intro
      </button>
    </div>
  )
}
