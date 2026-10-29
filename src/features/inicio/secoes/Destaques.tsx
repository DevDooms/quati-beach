// Chamadas para bar, eventos e o próximo torneio (somem se o módulo estiver desligado)
import { Link } from 'react-router-dom'
import { ArrowRight, PartyPopper, Trophy, UtensilsCrossed } from 'lucide-react'
import { NEGOCIO } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { DIAS_SEMANA, dataDeISO, fmtDataCurta } from '../../../lib/datas'
import { fmtReais } from '../../../lib/formatos'
import { Botao } from '../../../ui'
import { proximoTorneio } from '../../torneios/regras'

export function BarEventos() {
  const { db } = useDB()
  if (!db.modulos.bar && !db.modulos.eventos) return null
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 grid gap-4 md:grid-cols-2">
      {db.modulos.bar && (
        <Link to="/bar" className="group rounded-3xl bg-laranja text-white p-8 relative overflow-hidden hover:-translate-y-1 transition">
          <UtensilsCrossed className="absolute -right-4 -bottom-4 size-36 text-white/15" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Bar do {NEGOCIO.apelido}</p>
          <h2 className="titulo text-5xl mt-1">Porções e bebida gelada</h2>
          <p className="mt-2 text-white/90 max-w-sm">O pós-jogo favorito da galera. Veja o cardápio e encomende para o fim do seu horário.</p>
          <span className="mt-4 inline-flex items-center gap-1 font-bold">Ver cardápio <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
        </Link>
      )}
      {db.modulos.eventos && (
        <Link to="/eventos" className="group rounded-3xl bg-petroleo text-white p-8 relative overflow-hidden hover:-translate-y-1 transition">
          <PartyPopper className="absolute -right-4 -bottom-4 size-36 text-white/10" />
          <p className="text-xs font-bold uppercase tracking-widest text-sol">Eventos</p>
          <h2 className="titulo text-5xl mt-1">Aniversário na areia?</h2>
          <p className="mt-2 text-white/85 max-w-sm">Festas, confraternizações de empresa e torneios entre amigos com quadra exclusiva.</p>
          <span className="mt-4 inline-flex items-center gap-1 font-bold text-sol">Pedir orçamento <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
        </Link>
      )}
    </section>
  )
}

export function BannerTorneio() {
  const { db } = useDB()
  const t = proximoTorneio(db.torneios)
  if (!t || !db.modulos.torneios) return null
  const d = dataDeISO(t.data)
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-onda to-petroleo text-white p-8 sm:p-12 grid gap-6 md:grid-cols-[1fr_auto] items-center">
        <Trophy className="absolute -right-6 -bottom-6 size-48 text-white/10" />
        <div className="relative">
          <p className="inline-block rounded-full bg-sol text-petroleo-noite text-xs font-extrabold px-3 py-1 uppercase tracking-wide">Inscrições abertas</p>
          <h2 className="titulo text-5xl sm:text-6xl mt-3">{t.nome}</h2>
          <p className="mt-2 text-white/85">
            {fmtDataCurta(d)} · {DIAS_SEMANA[d.getDay()].toLowerCase()} {t.horario} · categorias {t.categorias.join(', ').toLowerCase()}
          </p>
        </div>
        <div className="relative flex flex-col items-start md:items-end gap-3">
          <p><span className="titulo text-5xl text-sol">{fmtReais(t.valor)}</span> <span className="text-sm">por atleta</span></p>
          <Botao para="/torneios" variante="claro" tamanho="lg">Quero participar</Botao>
        </div>
      </div>
    </section>
  )
}
