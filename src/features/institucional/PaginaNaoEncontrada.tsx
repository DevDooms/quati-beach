import { CalendarDays, Home } from 'lucide-react'
import { Botao } from '../../ui'

export default function PaginaNaoEncontrada() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="titulo text-8xl text-sol">404</p>
      <h1 className="titulo text-5xl text-petroleo mt-2">Bola fora!</h1>
      <p className="mt-3 text-petroleo-noite/80">Essa página não existe ou mudou de lugar.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Botao para="/" redondo><Home className="size-4" /> Início</Botao>
        <Botao para="/agendar" variante="destaque" redondo><CalendarDays className="size-4" /> Agendar quadra</Botao>
      </div>
    </section>
  )
}
