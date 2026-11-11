import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MODALIDADES } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { TituloSecao } from '../../../ui'

export function Modalidades() {
  const { db } = useDB()
  return (
    <section className="conteudo py-16">
      <TituloSecao sobre="Modalidades" titulo="Escolha seu esporte" />
      <div className="mt-10 grid md:grid-cols-3 border-t border-marinho/15 md:divide-x divide-marinho/15">
        {MODALIDADES.map((m) => {
          const turmas = db.aulas.filter((a) => a.modalidade === m.id).length
          return (
            <Link
              key={m.id}
              to={db.modulos.aulas ? `/aulas?modalidade=${m.id}` : '/agendar'}
              className="group block py-8 md:px-8 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 border-marinho/15"
            >
              <span className={`block h-1 w-12 ${m.cor}`} />
              <h3 className="titulo text-5xl text-mar mt-4 group-hover:text-onda transition">{m.nome}</h3>
              <p className="mt-2 text-marinho/75 max-w-sm">{m.descricao}</p>
              <p className="mt-4 text-sm font-bold text-onda inline-flex items-center gap-1">
                {db.modulos.aulas ? `${turmas} turmas na semana` : 'Reservar quadra'} <ArrowRight className="size-4" />
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
