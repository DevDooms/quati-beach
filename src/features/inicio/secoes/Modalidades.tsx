import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MODALIDADES } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { TituloSecao } from '../../../ui'

export function Modalidades() {
  const { db } = useDB()
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <TituloSecao sobre="Modalidades" titulo="Escolha seu esporte" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {MODALIDADES.map((m) => {
          const turmas = db.aulas.filter((a) => a.modalidade === m.id).length
          return (
            <Link
              key={m.id}
              to={db.modulos.aulas ? `/aulas?modalidade=${m.id}` : '/agendar'}
              className="group relative overflow-hidden rounded-3xl bg-white border border-petroleo/10 p-6 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <span className={`absolute -right-10 -top-10 size-32 rounded-full ${m.cor} opacity-20 group-hover:scale-125 transition`} />
              <span className={`inline-block size-3 rounded-full ${m.cor}`} />
              <h3 className="titulo text-4xl text-petroleo mt-3">{m.nome}</h3>
              <p className="mt-2 text-sm text-petroleo-noite/70">{m.descricao}</p>
              <p className="mt-4 text-sm font-bold text-onda inline-flex items-center gap-1">
                {db.modulos.aulas ? `${turmas} turmas na semana` : 'Reservar quadra'} <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
