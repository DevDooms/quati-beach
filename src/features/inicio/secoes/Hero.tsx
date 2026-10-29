import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, GraduationCap } from 'lucide-react'
import { FOTO_CAPA } from '../../../config/fotos'
import { MODALIDADES, NEGOCIO, quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataISO, fmtDataCurta, fmtDiaSemana, fmtHora, hojeISO } from '../../../lib/datas'
import { Botao } from '../../../ui'
import { proximosLivres } from '../../reservas/agenda'
import { linkAgendar } from '../../reservas/PaginaAgendar'

export function Hero() {
  const { db } = useDB()
  return (
    <section className="relative bg-marinho text-white overflow-hidden">
      <img src={FOTO_CAPA} alt="" className="absolute inset-0 size-full object-cover" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-marinho via-marinho/85 to-marinho/40" aria-hidden />

      <div className="relative conteudo pt-14 pb-16 sm:pt-24 sm:pb-24 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-white/80">
            {MODALIDADES.map((m) => m.nome).join(' · ')} — {NEGOCIO.cidadeCurta}
          </p>
          <h1 className="mt-4">
            <span className="titulo block text-7xl sm:text-[8.5rem]">A areia</span>
            <span className="manuscrito block text-sol text-5xl sm:text-7xl -rotate-3 -mt-1 sm:-mt-3 ml-2">te chama.</span>
          </h1>
          <p className="mt-6 text-lg text-white/85 max-w-xl">
            Duas quadras de areia com iluminação, bar e área de mesas. Reserve seu horário pelo site ou entre numa turma com os nossos professores.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Botao para="/agendar" variante="destaque" tamanho="lg">
              <CalendarDays className="size-5" /> Agendar quadra
            </Botao>
            {db.modulos.aulas && (
              <Botao para="/aulas" variante="contorno-claro" tamanho="lg">
                <GraduationCap className="size-5" /> Ver aulas
              </Botao>
            )}
          </div>
        </div>
        <ProximosLivres />
      </div>
    </section>
  )
}

// Atalhos para os próximos horários livres (já abrem a reserva)
function ProximosLivres() {
  const { db } = useDB()
  const livres = proximosLivres(db, 4)
  const hoje = hojeISO()
  return (
    <div className="bg-marinho/85 border-t-4 border-sol">
      <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-widest text-sol">Próximos horários livres</p>
      <ul className="divide-y divide-white/10">
        {livres.map((l) => (
          <li key={`${dataISO(l.data)}-${l.hora}-${l.quadraId}`}>
            <Link to={linkAgendar(l.quadraId, l.data, l.hora)} className="group flex items-center gap-4 px-5 py-3 hover:bg-white/5">
              <span className="titulo text-3xl text-sol w-14">{fmtHora(l.hora)}</span>
              <span className="flex-1 text-sm leading-tight">
                <b className="first-letter:uppercase block">{dataISO(l.data) === hoje ? 'Hoje' : `${fmtDiaSemana(l.data)} ${fmtDataCurta(l.data)}`}</b>
                <span className="text-white/70">{quadraPorId(l.quadraId).nome}</span>
              </span>
              <span className="text-sm font-semibold text-white/80 group-hover:text-sol">Reservar</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/agendar" className="flex items-center gap-1 px-5 py-3 border-t border-white/10 text-sm font-semibold text-white/80 hover:text-sol">
        Ver agenda completa <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
