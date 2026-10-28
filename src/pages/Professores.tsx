import { Link } from 'react-router-dom'
import { ArrowRight, Award } from 'lucide-react'
import { DIAS_CURTOS } from '../lib/agenda'
import { useDB } from '../lib/store'
import { Avatar, CabecalhoPagina, SeloModalidade } from '../components/Pecas'

export default function Professores() {
  const { db } = useDB()
  return (
    <>
      <CabecalhoPagina sobre="Equipe" titulo={<>Nossos <span className="text-sol">professores</span></>}>
        Gente que vive a areia e sabe ensinar — do iniciante ao atleta de torneio.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {db.professores.map((p) => {
          const aulas = db.aulas.filter((a) => a.professorId === p.id)
          const dias = [...new Set(aulas.map((a) => a.diaSemana))].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
          return (
            <article key={p.id} className="rounded-3xl bg-white border border-petroleo/10 overflow-hidden flex flex-col">
              <div className={`h-28 bg-gradient-to-br ${p.cor} relative`}>
                <div className="absolute -bottom-10 left-6 rounded-full ring-4 ring-white">
                  <Avatar professorId={p.id} tamanho="size-20 text-2xl" />
                </div>
              </div>
              <div className="p-6 pt-12 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5">
                  {p.modalidades.map((m) => <SeloModalidade key={m} id={m} pequeno />)}
                </div>
                <h2 className="titulo text-4xl text-petroleo mt-2">Prof. {p.nome}</h2>
                {p.destaque && <p className="text-xs font-semibold text-sol-escuro inline-flex items-center gap-1"><Award className="size-4" /> {p.destaque}</p>}
                <p className="mt-3 text-sm text-petroleo-noite/70 flex-1">{p.bio}</p>
                <p className="mt-4 text-xs text-petroleo-noite/60">
                  {aulas.length} turmas{dias.length > 0 && ` · ${dias.map((d) => DIAS_CURTOS[d]).join(', ')}`}
                </p>
                <Link to={`/aulas?professor=${p.id}`} className="mt-4 inline-flex items-center justify-center gap-1 rounded-full bg-petroleo text-white py-2.5 text-sm font-bold hover:bg-petroleo-escuro">
                  Ver aulas de {p.nome.split(' ')[0]} <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
