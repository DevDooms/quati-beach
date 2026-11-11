import { ArrowRight, Star } from 'lucide-react'
import { AVALIACOES, NEGOCIO } from '../../../config/estabelecimento'
import { TituloSecao } from '../../../ui'

export function Avaliacoes() {
  return (
    <section className="conteudo py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <TituloSecao sobre="Quem joga, recomenda" titulo={`Nota ${NEGOCIO.nota.toFixed(1).replace('.', ',')} no Google`} />
        </div>
        <a href={NEGOCIO.googleAvaliacoes} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-onda hover:text-mar">
          Ver as {NEGOCIO.avaliacoes} avaliações no Google <ArrowRight className="size-4" />
        </a>
      </div>
      <div className="mt-10 grid gap-10 md:grid-cols-3">
        {AVALIACOES.map((a) => (
          <figure key={a.nome} className="border-l-2 border-sol pl-6">
            <div className="flex gap-0.5" aria-label="5 estrelas">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-sol text-sol" />)}
            </div>
            <blockquote className="mt-3 text-lg text-marinho/85">“{a.texto}”</blockquote>
            <figcaption className="mt-4 text-sm">
              <b>{a.nome}</b> <span className="text-marinho/70">· {a.quando}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
