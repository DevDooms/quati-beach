// Chamadas para bar, eventos e o próximo torneio (somem se o módulo estiver desligado)
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
    <section className="grid md:grid-cols-2">
      {db.modulos.bar && (
        <Link to="/bar" className="group bg-laranja text-white px-5 sm:px-8 lg:px-14 py-14 hover:bg-laranja-escuro transition">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Bar do {NEGOCIO.apelido}</p>
          <h2 className="titulo text-5xl sm:text-6xl mt-2">Porções e bebida gelada</h2>
          <p className="mt-3 text-white/90 max-w-md">O pós-jogo favorito da galera. Veja o cardápio e encomende para o fim do seu horário.</p>
          <span className="mt-6 inline-flex items-center gap-1 font-bold">Ver cardápio <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
        </Link>
      )}
      {db.modulos.eventos && (
        <Link to="/eventos" className="group bg-mar text-white px-5 sm:px-8 lg:px-14 py-14 hover:bg-mar-fundo transition">
          <p className="text-xs font-bold uppercase tracking-widest text-sol">Eventos</p>
          <h2 className="titulo text-5xl sm:text-6xl mt-2">Aniversário na areia?</h2>
          <p className="mt-3 text-white/85 max-w-md">Festas, confraternizações de empresa e torneios entre amigos com quadra exclusiva.</p>
          <span className="mt-6 inline-flex items-center gap-1 font-bold text-sol">Pedir orçamento <ArrowRight className="size-4 group-hover:translate-x-1 transition" /></span>
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
    <section className="bg-marinho text-white">
      <div className="h-1.5 faixa-quadra" aria-hidden />
      <div className="conteudo py-14 grid gap-6 md:grid-cols-[1fr_auto] items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sol">Inscrições abertas</p>
          <h2 className="titulo text-5xl sm:text-6xl mt-2">{t.nome}</h2>
          <p className="mt-2 text-white/80">
            {fmtDataCurta(d)} · {DIAS_SEMANA[d.getDay()].toLowerCase()} {t.horario} · categorias {t.categorias.join(', ').toLowerCase()}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <p><span className="titulo text-5xl text-sol">{fmtReais(t.valor)}</span> <span className="text-sm">por atleta</span></p>
          <Botao para="/torneios" variante="destaque" tamanho="lg">Quero participar</Botao>
        </div>
      </div>
    </section>
  )
}
