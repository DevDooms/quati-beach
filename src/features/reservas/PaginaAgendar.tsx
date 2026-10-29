import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MousePointerClick } from 'lucide-react'
import { QUADRAS, ehQuadraId, quadraPorId, type QuadraId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { dataISO, diaDaSemana, fmtDataCurta, fmtDataLonga, fmtDiaSemana, fmtFaixa, proximosDias } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import { CabecalhoPagina, EtiquetaJanela, SeloModalidade } from '../../ui'
import { criarHorarioFixo } from '../mensalistas/regras'
import { estaLivre, horasReservaveis, livresNoDia, precoDoHorario, slotDe } from './agenda'
import { HorariosDaQuadra, Legenda } from './HorariosDaQuadra'
import { JanelaEspera } from './JanelaEspera'
import { LateralAgendar } from './LateralAgendar'
import MapaQuadras from './MapaQuadras'
import ModalReserva, { type Confirmacao } from './modal/ModalReserva'
import { pagoNaHora } from './modal/EscolhaPagamento'
import { criarReserva, entrarNaEspera, filaDoHorario } from './regras'
import { SeletorDias } from './SeletorDias'

const DIAS_VISIVEIS = 14

export default function PaginaAgendar() {
  const { db, set } = useDB()
  const [params, setParams] = useSearchParams()
  const dias = useMemo(() => proximosDias(DIAS_VISIVEIS), [])
  const calendario = useRef<HTMLDivElement>(null)

  // dia e quadra vêm da URL (links da página inicial e do mapa)
  const dataParam = params.get('data')
  const dia = dias.find((d) => dataISO(d) === dataParam) ?? dias[0]
  const quadraParam = params.get('quadra')
  const quadraId = ehQuadraId(quadraParam) ? quadraParam : null

  // janela de reserva aberta; vindo da página inicial (?hora=), só abre se o horário estiver livre
  const [hora, setHora] = useState<number | null>(() => {
    const h = Number(params.get('hora'))
    return h && quadraId && estaLivre(db, dia, h, quadraId) ? h : null
  })
  const [esperaHora, setEsperaHora] = useState<number | null>(null)

  const livresHoje = Object.fromEntries(QUADRAS.map((q) => [q.id, livresNoDia(db, dias[0], q.id)]))
  const slots = quadraId ? horasReservaveis(db, dia).map((h) => slotDe(db, dia, h, quadraId)) : []
  const qtdLivres = slots.filter((s) => s.status === 'livre').length

  const mudarFiltro = (mudancas: Record<string, string>) => {
    for (const [k, v] of Object.entries(mudancas)) params.set(k, v)
    params.delete('hora')
    setParams(params, { replace: true })
  }

  const rolarParaCalendario = (suave = true) => calendario.current?.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })

  const escolherQuadra = (id: QuadraId) => {
    mudarFiltro({ quadra: id })
    requestAnimationFrame(() => rolarParaCalendario())
  }

  // vindo do mapa da página inicial ou de um "próximo horário livre", desce direto ao calendário
  // (o Layout rola para o topo num layout effect, que roda antes deste)
  useEffect(() => {
    if (quadraParam && (params.has('hora') || params.has('ir'))) rolarParaCalendario(false)
  }, [])

  const reservar = (h: number, c: Confirmacao) =>
    set((db) => {
      if (!quadraId) return db
      const pagamento = { pago: pagoNaHora(c.forma), formaPagamento: c.forma }
      if (c.repetir) {
        return criarHorarioFixo(db, { ...c, diaSemana: diaDaSemana(dia), hora: h, quadraId, desde: dataISO(dia), origem: 'Site', primeira: pagamento, minha: true })
      }
      return criarReserva(db, { ...c, data: dataISO(dia), hora: h, quadraId, origem: 'Site', ...pagamento, minha: true })
    })

  const detalhesDoHorario = (h: number) => [
    { rotulo: 'Quadra', valor: quadraId ? quadraPorId(quadraId).nome : '' },
    { rotulo: 'Data', valor: fmtDataLonga(dia) },
    { rotulo: 'Horário', valor: fmtFaixa(h) },
  ]

  return (
    <>
      <CabecalhoPagina sobre="Reserva online" titulo={<>Agende sua <span className="text-sol">quadra</span></>}>
        Escolha a quadra no mapa, depois o dia e o horário. Cada reserva é de 1 hora.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <Passo n={1} titulo="Escolha a quadra" />
          <div className="mt-3 rounded-3xl bg-white border border-petroleo/10 p-2 sm:p-4 shadow-sm">
            <MapaQuadras selecionada={quadraId} onEscolher={escolherQuadra} livres={livresHoje} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUADRAS.map((q) => {
              const ativa = quadraId === q.id
              return (
                <button
                  key={q.id}
                  onClick={() => escolherQuadra(q.id)}
                  aria-pressed={ativa}
                  className={`rounded-2xl border p-3 text-left transition ${ativa ? 'bg-petroleo text-white border-petroleo' : 'bg-white border-petroleo/10 hover:border-onda'}`}
                >
                  <p className="titulo text-2xl">{q.nome}</p>
                  <p className={`text-xs ${ativa ? 'text-white/70' : 'text-petroleo-noite/60'}`}>{q.descricao}</p>
                </button>
              )
            })}
          </div>

          <div ref={calendario} className="scroll-mt-24 mt-10">
            <Passo n={2} titulo={quadraId ? `Horários da ${quadraPorId(quadraId).nome}` : 'Escolha o dia e o horário'} />
            {!quadraId ? (
              <div className="mt-3 rounded-3xl border-2 border-dashed border-petroleo/20 p-10 text-center text-petroleo-noite/60">
                <MousePointerClick className="size-10 mx-auto text-onda" />
                <p className="mt-3 font-semibold">Toque em uma quadra no mapa para ver o calendário dela.</p>
              </div>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quadraPorId(quadraId).modalidades.map((m) => <SeloModalidade key={m} id={m} pequeno />)}
                </div>
                <div className="mt-4">
                  <SeletorDias dias={dias} selecionado={dia} onEscolher={(d) => mudarFiltro({ data: dataISO(d) })} />
                </div>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="titulo text-3xl text-petroleo first-letter:uppercase">{fmtDataLonga(dia)}</h2>
                  <p className="text-sm text-petroleo-noite/60">{qtdLivres} {qtdLivres === 1 ? 'horário livre' : 'horários livres'}</p>
                </div>
                <Legenda />
                <HorariosDaQuadra dia={dia} slots={slots} onReservar={setHora} onAvisar={setEsperaHora} />
              </>
            )}
          </div>
        </div>

        <LateralAgendar />
      </div>

      {/* não depende do horário continuar livre: depois de confirmar, a janela mostra o Pix/sucesso */}
      {quadraId && hora !== null && (
        <ModalReserva
          onFechar={() => setHora(null)}
          titulo="Confirmar reserva"
          etiqueta={<EtiquetaJanela>Reserva de quadra</EtiquetaJanela>}
          detalhes={detalhesDoHorario(hora)}
          preco={fmtReais(precoDoHorario(db, dia, hora))}
          valor={precoDoHorario(db, dia, hora)}
          resumoParaGrupo={`${fmtDiaSemana(dia)} ${fmtDataCurta(dia)}, ${fmtFaixa(hora)} · ${quadraPorId(quadraId).nome}`}
          pagamento
          fixo
          textoConfirmar="Confirmar reserva"
          textoSucesso="Quadra reservada!"
          mensagemWhatsApp={(nome) => doCliente.reservarQuadra(nome, quadraPorId(quadraId).nome, dataISO(dia), hora)}
          onConfirmar={(c) => reservar(hora, c)}
        />
      )}

      {quadraId && esperaHora !== null && (
        <JanelaEspera
          detalhes={detalhesDoHorario(esperaHora)}
          naFila={filaDoHorario(db, { data: dataISO(dia), hora: esperaHora, quadraId }).length}
          onFechar={() => setEsperaHora(null)}
          onConfirmar={(p) => set((db) => entrarNaEspera(db, { ...p, data: dataISO(dia), hora: esperaHora, quadraId }))}
        />
      )}
    </>
  )
}

function Passo({ n, titulo }: { n: number; titulo: string }) {
  return (
    <h2 className="flex items-center gap-3">
      <span className="size-8 rounded-full bg-sol text-petroleo-noite grid place-items-center font-extrabold">{n}</span>
      <span className="titulo text-3xl text-petroleo">{titulo}</span>
    </h2>
  )
}

// usado pela página inicial para montar os links
export const linkAgendar = (quadraId: QuadraId, data?: Date, hora?: number) =>
  `/agendar?quadra=${quadraId}${data ? `&data=${dataISO(data)}` : ''}${hora ? `&hora=${hora}` : '&ir=1'}`
