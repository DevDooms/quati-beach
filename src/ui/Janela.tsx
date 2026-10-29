import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

// Janela modal: folha de baixo no celular, caixa centralizada no desktop.
// Prende o foco do teclado dentro dela e devolve ao fechar (acessibilidade).
export function Janela({
  onFechar,
  titulo,
  etiqueta,
  children,
  largura = 'sm:max-w-md',
}: {
  onFechar: () => void
  titulo?: ReactNode
  etiqueta?: ReactNode
  children: ReactNode
  largura?: string
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const fechar = useRef(onFechar)
  fechar.current = onFechar
  const idTitulo = useId()

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    const elementos = () => [...(caixa.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? [])]
    ;(elementos().find((e) => e.tagName === 'INPUT') ?? caixa.current)?.focus()

    const teclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return fechar.current()
      if (e.key !== 'Tab') return
      const lista = elementos()
      if (lista.length === 0) return
      const [primeiro, ultimo] = [lista[0], lista[lista.length - 1]]
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    window.addEventListener('keydown', teclado)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', teclado)
      document.body.style.overflow = ''
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-marinho/60 backdrop-blur-sm" onClick={onFechar}>
      <div
        ref={caixa}
        role="dialog"
        aria-modal
        aria-labelledby={titulo ? idTitulo : undefined}
        tabIndex={-1}
        className={`anim-sobe w-full ${largura} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] overflow-y-auto outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {titulo && (
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {etiqueta}
                <h2 id={idTitulo} className="titulo text-4xl text-mar mt-1">{titulo}</h2>
              </div>
              <button onClick={onFechar} className="p-1 -mr-1 text-marinho/70 hover:text-marinho" aria-label="Fechar">
                <X />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// Rótulo pequeno acima do título da janela
export function EtiquetaJanela({ children }: { children: ReactNode }) {
  return <span className="text-xs font-bold uppercase tracking-widest text-onda">{children}</span>
}
