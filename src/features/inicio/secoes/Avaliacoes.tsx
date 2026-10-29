import { ArrowRight, Star } from 'lucide-react'
import { AVALIACOES, NEGOCIO } from '../../../config/estabelecimento'
import { Botao, TituloSecao } from '../../../ui'

const Estrelas = ({ tamanho }: { tamanho: string }) => (
  <div className="flex gap-0.5" aria-label="5 estrelas">
    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${tamanho} fill-sol text-sol`} />)}
  </div>
)

export function Avaliacoes() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <TituloSecao sobre="Quem joga, recomenda" titulo={`Nota ${NEGOCIO.nota.toFixed(1)} no Google`} />
        </div>
        <Estrelas tamanho="size-6" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {AVALIACOES.map((a) => (
          <figure key={a.nome} className="rounded-3xl bg-white border border-petroleo/10 p-6">
            <Estrelas tamanho="size-4" />
            <blockquote className="mt-3 text-petroleo-noite/80">“{a.texto}”</blockquote>
            <figcaption className="mt-4 text-sm">
              <b>{a.nome}</b> <span className="text-petroleo-noite/70">· {a.quando}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Botao href={NEGOCIO.googleAvaliacoes} variante="secundario" redondo>
          Ver todas as {NEGOCIO.avaliacoes} avaliações no Google <ArrowRight className="size-4" />
        </Botao>
      </div>
    </section>
  )
}
