import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, GraduationCap, Star, Zap } from 'lucide-react'
import quadraAerea from '../../../assets/quadra-aerea.jpg'
import { NEGOCIO, quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataISO, fmtDataCurta, fmtDiaSemana, fmtHora, hojeISO } from '../../../lib/datas'
import { Botao, Onda } from '../../../ui'
import { proximosLivres } from '../../reservas/agenda'
import { linkAgendar } from '../../reservas/PaginaAgendar'

export function Hero() {
  const { db } = useDB()
  return (
    <section className="relative bg-petroleo text-white overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-35" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-petroleo-noite/95 via-petroleo/80 to-petroleo/40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-24 sm:pt-20 sm:pb-32 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold">
            <Star className="size-3.5 fill-sol text-sol" /> {NEGOCIO.nota.toFixed(1)} no Google · {NEGOCIO.avaliacoes} avaliações
          </p>
          <h1 className="titulo text-6xl sm:text-8xl mt-4">
            A areia <br />
            <span className="text-sol">te chama.</span>
          </h1>
          <p className="mt-4 text-lg text-white/85 max-w-lg">
            Futevôlei, beach tennis e vôlei de praia em Embu-Guaçu. Reserve sua quadra em segundos ou entre para uma turma com nossos professores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Botao para="/agendar" variante="destaque" tamanho="lg" className="shadow-lg shadow-sol/20">
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
      <Onda className="absolute bottom-0 left-0 w-full h-12 sm:h-16" />
    </section>
  )
}

// Atalhos para os próximos horários livres (já abrem a reserva)
function ProximosLivres() {
  const { db } = useDB()
  const livres = proximosLivres(db, 4)
  const hoje = hojeISO()
  return (
    <div className="rounded-3xl bg-white text-petroleo-noite p-5 shadow-2xl shadow-petroleo-noite/40">
      <div className="flex items-center justify-between">
        <p className="titulo text-2xl text-petroleo">Próximos horários livres</p>
        <Zap className="size-5 text-sol-escuro" />
      </div>
      <ul className="mt-3 space-y-2">
        {livres.map((l) => (
          <li key={`${dataISO(l.data)}-${l.hora}-${l.quadraId}`}>
            <Link
              to={linkAgendar(l.quadraId, l.data, l.hora)}
              className="flex items-center gap-3 rounded-2xl border border-petroleo/10 px-4 py-3 hover:border-onda hover:bg-onda-claro/40 transition"
            >
              <span className="titulo text-3xl text-petroleo w-14">{fmtHora(l.hora)}</span>
              <span className="flex-1 text-sm leading-tight">
                <b className="first-letter:uppercase block">{dataISO(l.data) === hoje ? 'Hoje' : `${fmtDiaSemana(l.data)} ${fmtDataCurta(l.data)}`}</b>
                <span className="text-petroleo-noite/70">{quadraPorId(l.quadraId).nome}</span>
              </span>
              <span className="text-xs font-bold rounded-full bg-sol px-3 py-1.5">Reservar</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/agendar" className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-onda">
        Ver agenda completa <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
