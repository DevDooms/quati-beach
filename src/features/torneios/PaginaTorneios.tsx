import { useState } from 'react'
import { CalendarDays, Clock, Gift, History, MapPin, Trophy } from 'lucide-react'
import { EDICOES_ANTERIORES, NEGOCIO } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { DIAS_SEMANA, dataDeISO, fmtDataCurta } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import type { Torneio } from '../../tipos'
import { Botao, CabecalhoPagina, EtiquetaJanela, Vazio } from '../../ui'
import ModalReserva from '../reservas/modal/ModalReserva'
import { duplasDaCategoria, inscreverDupla, proximoTorneio, vagasNaCategoria } from './regras'

const quandoTorneio = (t: Torneio) => {
  const d = dataDeISO(t.data)
  return `${fmtDataCurta(d)}/${d.getFullYear()} · ${DIAS_SEMANA[d.getDay()]}`
}

export default function PaginaTorneios() {
  const { db, aplicar } = useDB()
  const t = proximoTorneio(db.torneios)
  const [categoria, setCategoria] = useState<string | null>(null)

  return (
    <>
      <CabecalhoPagina sobre="Competições" titulo={<>Torneios <span className="text-sol">{NEGOCIO.apelido}</span></>}>
        Campeonatos abertos com categorias para todos os níveis. Junte sua dupla e venha competir.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {t ? <CartazTorneio torneio={t} onInscrever={setCategoria} /> : <Vazio>Nenhum torneio com inscrições abertas agora. Fique de olho no nosso Instagram!</Vazio>}

        <aside className="space-y-4">
          {t && (
            <div className="rounded-3xl bg-petroleo text-white p-6 text-center">
              <p className="text-sm text-white/70">Valor da inscrição</p>
              <p className="titulo text-6xl text-sol">{fmtReais(t.valor)}</p>
              <p className="text-sm text-white/70">por atleta</p>
            </div>
          )}
          <div className="rounded-3xl bg-white border border-petroleo/10 p-6">
            <h3 className="titulo text-2xl text-petroleo inline-flex items-center gap-2"><History className="size-5" /> Edições anteriores</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {EDICOES_ANTERIORES.map((e) => (
                <li key={e.nome} className="flex justify-between gap-3 border-b border-petroleo/10 pb-3 last:border-0">
                  <span><b>{e.nome}</b><br /><span className="text-petroleo-noite/70">{e.data}</span></span>
                  <span className="text-petroleo-noite/70 shrink-0">{e.duplas} duplas</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {t && categoria && (
        <ModalReserva
          onFechar={() => setCategoria(null)}
          titulo="Inscrição"
          etiqueta={<EtiquetaJanela>{t.nome}</EtiquetaJanela>}
          detalhes={[
            { rotulo: 'Categoria', valor: categoria },
            { rotulo: 'Data', valor: quandoTorneio(t) },
          ]}
          preco={`${fmtReais(t.valor * 2)} (dupla)`}
          textoConfirmar="Reservar vaga da dupla"
          textoSucesso="Vaga reservada!"
          mensagemWhatsApp={(nome) => doCliente.inscricaoTorneio(nome, t.nome, categoria)}
          onConfirmar={({ nome, telefone }) => aplicar((db) => inscreverDupla(db, t.id, { categoria, atleta1: nome, atleta2: '', telefone, pago: false }))}
        />
      )}
    </>
  )
}

function CartazTorneio({ torneio: t, onInscrever }: { torneio: Torneio; onInscrever: (categoria: string) => void }) {
  return (
    <article className="rounded-3xl bg-white border border-petroleo/10 overflow-hidden">
      <div className="relative bg-gradient-to-br from-sol via-sol to-laranja p-8 text-petroleo-noite overflow-hidden">
        <Trophy className="absolute right-4 top-4 size-32 text-white/30" />
        <p className="inline-block rounded-full bg-petroleo text-white text-xs font-extrabold px-3 py-1 uppercase tracking-wide">Inscrições abertas</p>
        <h2 className="titulo text-6xl mt-3 relative">{t.nome}</h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold relative">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{quandoTorneio(t)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{t.horario}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{NEGOCIO.endereco}</span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="titulo text-3xl text-petroleo">Categorias</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {t.categorias.map((c) => {
            const inscritas = duplasDaCategoria(t, c).length
            const restantes = vagasNaCategoria(t, c)
            const pct = Math.min(100, Math.round((inscritas / t.vagasPorCategoria) * 100))
            const quaseLotado = restantes <= 2
            return (
              <div key={c} className="rounded-2xl border border-petroleo/10 p-4">
                <p className="font-extrabold text-lg">{c}</p>
                <div className="mt-2 h-2 rounded-full bg-petroleo/10 overflow-hidden">
                  <div className={`h-full rounded-full ${quaseLotado ? 'bg-laranja' : 'bg-onda'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-petroleo-noite/70">
                  {inscritas}/{t.vagasPorCategoria} duplas · <b className={quaseLotado ? 'text-laranja' : ''}>{restantes} vagas</b>
                </p>
                <Botao onClick={() => onInscrever(c)} disabled={restantes === 0} redondo largo className="mt-3">
                  {restantes === 0 ? 'Esgotado' : 'Inscrever dupla'}
                </Botao>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-areia-claro p-4 text-sm">
          <Gift className="size-5 text-sol-escuro shrink-0" />
          <p><b>Premiação:</b> {t.premiacao}. Frutas e hidratação para os atletas durante todo o dia.</p>
        </div>
      </div>
    </article>
  )
}
