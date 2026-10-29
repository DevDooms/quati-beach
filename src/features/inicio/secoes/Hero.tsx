import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, GraduationCap, Star, Zap } from 'lucide-react'
import quadraAerea from '../../../assets/quadra-aerea.jpg'
import { MODALIDADES, NEGOCIO, quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataISO, fmtDataCurta, fmtDiaSemana, fmtHora, hojeISO } from '../../../lib/datas'
import { BolaQuicando, Botao, Ondas } from '../../../ui'
import { proximosLivres } from '../../reservas/agenda'
import { linkAgendar } from '../../reservas/PaginaAgendar'

// atraso da animação de entrada, em cascata
const atraso = (s: number) => ({ '--atraso': `${s}s` }) as CSSProperties

export function Hero() {
  const { db } = useDB()
  return (
    <section className="relative ceu-mar text-white overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity" aria-hidden />
      {/* o anel amarelo da logo vira o sol se pondo atrás das quadras */}
      <div className="absolute -right-24 -top-28 size-[26rem] sm:size-[34rem] rounded-full border-[18px] sm:border-[26px] border-sol/90 anim-brilho" aria-hidden />
      <div className="absolute right-10 top-10 sm:right-24 sm:top-16 size-40 sm:size-56 rounded-full bg-sol/25 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-1/2 textura-rede opacity-60 [mask-image:linear-gradient(to_top,black,transparent)]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-32 sm:pt-20 sm:pb-44 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
        <div>
          <p className="anim-entra inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
            <Star className="size-3.5 fill-sol text-sol" /> {NEGOCIO.nota.toFixed(1)} no Google · {NEGOCIO.avaliacoes} avaliações
          </p>
          <h1 className="mt-5">
            <span className="anim-entra titulo block text-7xl sm:text-[8.5rem] drop-shadow-[0_6px_0_rgb(12_31_77/0.35)]" style={atraso(0.08)}>
              A areia
            </span>
            <span
              className="anim-entra manuscrito block text-sol text-5xl sm:text-7xl -rotate-3 -mt-1 sm:-mt-3 ml-2 drop-shadow-[0_4px_0_rgb(12_31_77/0.45)]"
              style={atraso(0.2)}
            >
              te chama.
            </span>
          </h1>
          <ul className="anim-entra mt-6 flex flex-wrap gap-2" style={atraso(0.3)}>
            {MODALIDADES.map((m) => (
              <li key={m.id} className="rounded-full bg-marinho/50 ring-1 ring-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                {m.nome}
              </li>
            ))}
          </ul>
          <p className="anim-entra mt-4 text-lg text-white/85 max-w-lg" style={atraso(0.36)}>
            Pé na areia em {NEGOCIO.cidadeCurta}. Reserve sua quadra em segundos ou entre para uma turma com nossos professores.
          </p>
          <div className="anim-entra mt-8 flex flex-wrap items-center gap-3" style={atraso(0.44)}>
            <Botao para="/agendar" variante="destaque" tamanho="lg" className="shadow-[0_6px_0_var(--color-sol-escuro)] hover:translate-y-0.5 hover:shadow-[0_4px_0_var(--color-sol-escuro)]">
              <CalendarDays className="size-5" /> Agendar quadra
            </Botao>
            {db.modulos.aulas && (
              <Botao para="/aulas" variante="contorno-claro" tamanho="lg">
                <GraduationCap className="size-5" /> Ver aulas
              </Botao>
            )}
          </div>
        </div>
        <div className="anim-entra relative" style={atraso(0.3)}>
          <BolaQuicando className="hidden lg:block absolute -left-24 bottom-2 w-20" />
          <ProximosLivres />
        </div>
      </div>
      <Ondas className="absolute bottom-0 left-0 w-full h-20 sm:h-28" />
    </section>
  )
}

// Atalhos para os próximos horários livres (já abrem a reserva)
function ProximosLivres() {
  const { db } = useDB()
  const livres = proximosLivres(db, 4)
  const hoje = hojeISO()
  return (
    <div className="relative rounded-3xl bg-white text-marinho p-5 pt-6 shadow-2xl shadow-marinho/50 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 faixa-quadra" aria-hidden />
      <div className="flex items-center justify-between">
        <p className="titulo text-2xl text-mar">Próximos horários livres</p>
        <Zap className="size-5 fill-sol text-sol-escuro" />
      </div>
      <ul className="mt-3 space-y-2">
        {livres.map((l) => (
          <li key={`${dataISO(l.data)}-${l.hora}-${l.quadraId}`}>
            <Link
              to={linkAgendar(l.quadraId, l.data, l.hora)}
              className="group flex items-center gap-3 rounded-2xl border border-mar/10 bg-areia-claro/60 px-4 py-3 hover:border-onda hover:bg-onda-claro/50 transition"
            >
              <span className="titulo text-3xl text-mar w-14">{fmtHora(l.hora)}</span>
              <span className="flex-1 text-sm leading-tight">
                <b className="first-letter:uppercase block">{dataISO(l.data) === hoje ? 'Hoje' : `${fmtDiaSemana(l.data)} ${fmtDataCurta(l.data)}`}</b>
                <span className="text-marinho/70">{quadraPorId(l.quadraId).nome}</span>
              </span>
              <span className="text-xs font-bold rounded-full bg-sol px-3 py-1.5 group-hover:bg-marinho group-hover:text-sol transition">Reservar</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/agendar" className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-onda hover:text-mar">
        Ver agenda completa <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
