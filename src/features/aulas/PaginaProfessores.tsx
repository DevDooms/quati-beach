import { ArrowRight, Award } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { DIAS_CURTOS, ORDEM_DIAS } from '../../lib/datas'
import { primeiroNome } from '../../lib/formatos'
import { Avatar, Botao, CabecalhoPagina, SeloModalidade } from '../../ui'
import { turmasDoProfessor } from './regras'

export default function PaginaProfessores() {
  const { db } = useDB()
  return (
    <>
      <CabecalhoPagina sobre="Equipe" titulo={<>Nossos <span className="text-sol">professores</span></>}>
        Gente que vive a areia e sabe ensinar — do iniciante ao atleta de torneio.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {db.professores.map((p) => {
          const turmas = turmasDoProfessor(db, p.id)
          const dias = ORDEM_DIAS.filter((d) => turmas.some((a) => a.diaSemana === d))
          return (
            <article key={p.id} className="rounded-3xl bg-white border border-mar/10 overflow-hidden flex flex-col">
              <div className={`h-28 bg-gradient-to-br ${p.cor} relative`}>
                <div className="absolute -bottom-10 left-6 rounded-full ring-4 ring-white">
                  <Avatar professor={p} tamanho="size-20 text-2xl" />
                </div>
              </div>
              <div className="p-6 pt-12 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5">
                  {p.modalidades.map((m) => <SeloModalidade key={m} id={m} pequeno />)}
                </div>
                <h2 className="titulo text-4xl text-mar mt-2">Prof. {p.nome}</h2>
                {p.destaque && <p className="text-xs font-semibold text-sol-escuro inline-flex items-center gap-1"><Award className="size-4" /> {p.destaque}</p>}
                <p className="mt-3 text-sm text-marinho/70 flex-1">{p.bio}</p>
                <p className="mt-4 text-xs text-marinho/70">
                  {turmas.length} turmas{dias.length > 0 && ` · ${dias.map((d) => DIAS_CURTOS[d]).join(', ')}`}
                </p>
                <Botao para={`/aulas?professor=${p.id}`} redondo className="mt-4">
                  Ver aulas de {primeiroNome(p.nome)} <ArrowRight className="size-4" />
                </Botao>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
