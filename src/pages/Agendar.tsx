import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, CalendarDays, CloudRain, Lightbulb, MousePointerClick, Repeat, Trash2 } from 'lucide-react'
import { CLIENTE_DEMO, POLITICA, QUADRAS, modalidadePorId, quadraPorId } from '../data/mock'
import {
  chaveData,
  dataDeChave,
  fmtDataCurta,
  fmtDataLonga,
  fmtDiaSemana,
  fmtFaixa,
  fmtHora,
  fmtReais,
  horasDoDia,
  precoDoHorario,
  proximosDias,
  slotDe,
  type Slot,
} from '../lib/agenda'
import { acharProfessor, ehDoCliente, novoId, reservasDoFixo, useDB, useLoginDemo, type Mensalista } from '../lib/store'
import ModalReserva, { classeCampo, mascaraTelefone } from '../components/ModalReserva'
import MapaQuadras from '../components/MapaQuadras'
import { CabecalhoPagina, Detalhes, Janela, SeloModalidade } from '../components/Pecas'

export default function Agendar() {
  const [params, setParams] = useSearchParams()
  const dias = useMemo(() => proximosDias(14), [])
  const { db, set } = useDB()
  const calendario = useRef<HTMLDivElement>(null)

  const dataParam = params.get('data')
  const dia = dataParam && dias.some((d) => chaveData(d) === dataParam) ? dataDeChave(dataParam) : dias[0]
  const quadraParam = params.get('quadra')
  const quadraId = QUADRAS.some((q) => q.id === quadraParam) ? quadraParam! : null
  // horário com a janela de reserva aberta; vindo da página inicial (?hora=), só abre se estiver livre
  const [hora, setHora] = useState<number | null>(() => {
    const h = Number(params.get('hora'))
    return h && quadraId && horasDoDia(db, dia).includes(h) && slotDe(db, dia, h, quadraId).status === 'livre' ? h : null
  })
  // horário ocupado em que a pessoa quer entrar na lista de espera
  const [esperaHora, setEsperaHora] = useState<number | null>(null)

  const livresHoje = Object.fromEntries(
    QUADRAS.map((q) => [q.id, horasDoDia(db, dias[0]).filter((h) => slotDe(db, dias[0], h, q.id).status === 'livre').length]),
  )

  const ehHoje = chaveData(dia) === chaveData(new Date())
  const slots = quadraId
    ? horasDoDia(db, dia)
        .filter((h) => !ehHoje || h > new Date().getHours())
        .map((h) => slotDe(db, dia, h, quadraId))
    : []
  const livresNoDia = slots.filter((s) => s.status === 'livre').length
  const minhasFuturas = db.reservas
    .filter((r) => ehDoCliente(r) && r.data >= chaveData(dias[0]))
    .sort((a, b) => (a.data + fmtHora(a.hora)).localeCompare(b.data + fmtHora(b.hora)))

  const atualizar = (mudancas: Record<string, string | null>) => {
    for (const [k, v] of Object.entries(mudancas)) {
      if (v === null) params.delete(k)
      else params.set(k, v)
    }
    params.delete('hora')
    setParams(params, { replace: true })
  }

  const escolherQuadra = (id: string) => {
    atualizar({ quadra: id })
    setTimeout(() => calendario.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  // vindo do atalho da página inicial (?quadra=&hora=), já rola até o calendário
  useEffect(() => {
    // espera o Layout rolar para o topo antes de descer até o calendário
    if (quadraParam && (params.get('hora') || params.get('ir'))) {
      const t = setTimeout(() => calendario.current?.scrollIntoView({ block: 'start' }), 80)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <>
      <CabecalhoPagina sobre="Reserva online" titulo={<>Agende sua <span className="text-sol">quadra</span></>}>
        Escolha a quadra no mapa, depois o dia e o horário. Cada reserva é de 1 hora.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {/* 1. Mapa */}
          <Passo n={1} titulo="Escolha a quadra" />
          <div className="mt-3 rounded-3xl bg-white border border-petroleo/10 p-2 sm:p-4 shadow-sm">
            <MapaQuadras selecionada={quadraId} onEscolher={escolherQuadra} livres={livresHoje} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUADRAS.map((q) => (
              <button
                key={q.id}
                onClick={() => escolherQuadra(q.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  quadraId === q.id ? 'bg-petroleo text-white border-petroleo' : 'bg-white border-petroleo/10 hover:border-onda'
                }`}
              >
                <p className="titulo text-2xl">{q.nome}</p>
                <p className={`text-xs ${quadraId === q.id ? 'text-white/70' : 'text-petroleo-noite/60'}`}>{q.descricao}</p>
              </button>
            ))}
          </div>

          {/* 2. Calendário da quadra */}
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

                <div className="mt-4 flex gap-2 overflow-x-auto sem-scrollbar -mx-4 px-4 pb-2">
                  {dias.map((d, i) => {
                    const ativo = chaveData(d) === chaveData(dia)
                    return (
                      <button
                        key={chaveData(d)}
                        onClick={() => atualizar({ data: chaveData(d) })}
                        className={`shrink-0 w-16 rounded-2xl py-2.5 text-center border transition ${
                          ativo ? 'bg-petroleo text-white border-petroleo shadow-lg shadow-petroleo/25' : 'bg-white border-petroleo/10 hover:border-onda'
                        }`}
                      >
                        <span className={`block text-[11px] uppercase font-semibold ${ativo ? 'text-sol' : 'text-petroleo-noite/50'}`}>
                          {i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : fmtDiaSemana(d)}
                        </span>
                        <span className="titulo block text-3xl">{d.getDate()}</span>
                        <span className={`block text-[11px] ${ativo ? 'text-white/70' : 'text-petroleo-noite/50'}`}>{fmtDataCurta(d).slice(3)}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="titulo text-3xl text-petroleo first-letter:uppercase">{fmtDataLonga(dia)}</h2>
                  <p className="text-sm text-petroleo-noite/60">{livresNoDia} {livresNoDia === 1 ? 'horário livre' : 'horários livres'}</p>
                </div>
                <Legenda />

                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <Celula
                      key={s.hora}
                      slot={s}
                      preco={precoDoHorario(db, dia, s.hora)}
                      onEscolher={() => setHora(s.hora)}
                      onAvisar={() => setEsperaHora(s.hora)}
                    />
                  ))}
                </div>
                {slots.length === 0 && (
                  <p className="mt-4 rounded-2xl bg-white p-6 text-center text-petroleo-noite/60">Não há mais horários hoje. Escolha outro dia.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lateral */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl bg-white border border-petroleo/10 p-5">
            <h3 className="titulo text-2xl text-petroleo">Valores por hora</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>Seg–Sex até 17h</span><b>{fmtReais(db.precos.normal)}</b></li>
              <li className="flex justify-between"><span>Seg–Sex após 17h</span><b>{fmtReais(db.precos.pico)}</b></li>
              <li className="flex justify-between"><span>Sábado e domingo</span><b>{fmtReais(db.precos.pico)}</b></li>
            </ul>
            <p className="mt-3 text-xs text-petroleo-noite/60 flex gap-1.5">
              <Lightbulb className="size-4 shrink-0 text-sol-escuro" /> Iluminação noturna inclusa. Bolas e redes à disposição.
            </p>
          </div>

          <div className="rounded-2xl bg-onda-claro/60 border border-onda/20 p-5">
            <h3 className="titulo text-2xl text-petroleo flex items-center gap-2"><CloudRain className="size-5" /> Chuva e cancelamento</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-petroleo-noite/80">
              <li>• Cancelamento grátis até <b>{POLITICA.cancelamentoHoras}h antes</b>.</li>
              <li>• Choveu forte? A gente <b>remarca sem custo</b> e avisa pelo WhatsApp.</li>
              <li>• Horário ocupado? Toque nele e entre na <b>lista de espera</b>.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-sol/20 border border-sol/40 p-5">
            <h3 className="titulo text-2xl text-petroleo flex items-center gap-2"><Repeat className="size-5" /> Horário fixo</h3>
            <p className="mt-1 text-sm text-petroleo-noite/80">Joga toda semana com a mesma turma? Marque “Repetir toda semana” na reserva e o horário fica garantido para o seu grupo.</p>
          </div>

          <div className="rounded-2xl bg-white border border-petroleo/10 p-5">
            <h3 className="titulo text-2xl text-petroleo">Suas reservas</h3>
            {minhasFuturas.length === 0 ? (
              <p className="mt-2 text-sm text-petroleo-noite/60">Nenhuma reserva ainda. Toque num horário livre para reservar.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {minhasFuturas.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl bg-sol/15 px-3 py-2">
                    <CalendarDays className="size-5 text-sol-escuro shrink-0" />
                    <div className="flex-1 text-sm leading-tight">
                      <p className="font-bold first-letter:uppercase">
                        {fmtDiaSemana(dataDeChave(r.data))} {fmtDataCurta(dataDeChave(r.data))} · {fmtHora(r.hora)}
                      </p>
                      <p className="text-petroleo-noite/60 text-xs">{quadraPorId(r.quadraId).nome}</p>
                    </div>
                    <button
                      onClick={() => set((db) => ({ ...db, reservas: db.reservas.filter((x) => x.id !== r.id) }))}
                      className="p-1.5 text-petroleo-noite/40 hover:text-red-600"
                      aria-label="Cancelar reserva"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* não depende do horário continuar livre: depois de confirmar, a janela mostra o Pix/sucesso */}
      {quadraId && hora !== null && (
        <ModalReserva
          onFechar={() => setHora(null)}
          titulo="Confirmar reserva"
          etiqueta={<span className="text-xs font-bold uppercase tracking-widest text-onda">Reserva de quadra</span>}
          detalhes={[
            { rotulo: 'Quadra', valor: quadraPorId(quadraId).nome },
            { rotulo: 'Data', valor: fmtDataLonga(dia) },
            { rotulo: 'Horário', valor: fmtFaixa(hora) },
          ]}
          preco={fmtReais(precoDoHorario(db, dia, hora))}
          valor={precoDoHorario(db, dia, hora)}
          resumoParaGrupo={`${fmtDiaSemana(dia)} ${fmtDataCurta(dia)}, ${fmtFaixa(hora)} · ${quadraPorId(quadraId).nome}`}
          pagamento
          fixo
          textoConfirmar="Confirmar reserva"
          textoSucesso="Quadra reservada!"
          mensagemWhatsApp={(nome) =>
            `Olá! ${nome ? `Sou ${nome} e ` : ''}gostaria de reservar a ${quadraPorId(quadraId).nome} no dia ${fmtDataCurta(dia)} das ${fmtFaixa(hora)}.`
          }
          onConfirmar={({ nome, telefone, forma, repetir }) =>
            set((db) => {
              const agora = new Date().toISOString()
              // na demo, Pix e cartão contam como pagos na hora (só a primeira semana, no caso de horário fixo)
              const pago = forma === 'Pix' || forma === 'Cartão'
              if (!repetir) {
                return {
                  ...db,
                  reservas: [
                    ...db.reservas,
                    { id: novoId(), data: chaveData(dia), hora, quadraId, nome, telefone, origem: 'Site', pago, formaPagamento: forma, minha: true, criadaEm: agora },
                  ],
                }
              }
              const m: Mensalista = { id: novoId(), nome, telefone, diaSemana: dia.getDay(), hora, quadraId, desde: chaveData(dia) }
              const fixas = reservasDoFixo(db, m, dia).map((r, i) => ({
                ...r,
                minha: true,
                criadaEm: agora,
                ...(i === 0 ? { pago, formaPagamento: forma } : {}),
              }))
              return { ...db, mensalistas: [...db.mensalistas, m], reservas: [...db.reservas, ...fixas] }
            })
          }
        />
      )}

      {quadraId && esperaHora !== null && (
        <JanelaEspera
          detalhes={[
            { rotulo: 'Quadra', valor: quadraPorId(quadraId).nome },
            { rotulo: 'Data', valor: fmtDataLonga(dia) },
            { rotulo: 'Horário', valor: fmtFaixa(esperaHora) },
          ]}
          naFila={db.espera.filter((e) => e.data === chaveData(dia) && e.hora === esperaHora && e.quadraId === quadraId).length}
          onFechar={() => setEsperaHora(null)}
          onConfirmar={(nome, telefone) =>
            set((db) => ({
              ...db,
              espera: [...db.espera, { id: novoId(), data: chaveData(dia), hora: esperaHora, quadraId, nome, telefone, criadaEm: new Date().toISOString() }],
            }))
          }
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

function Legenda() {
  const itens = [
    ['bg-white border border-onda', 'Livre'],
    ['bg-sol', 'Sua reserva'],
    ['bg-onda-claro', 'Aula'],
    ['bg-petroleo/10', 'Ocupado'],
  ]
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-petroleo-noite/70">
      {itens.map(([cor, nome]) => (
        <span key={nome} className="inline-flex items-center gap-1.5">
          <span className={`size-3 rounded ${cor}`} /> {nome}
        </span>
      ))}
    </div>
  )
}

function JanelaEspera({
  detalhes,
  naFila,
  onFechar,
  onConfirmar,
}: {
  detalhes: { rotulo: string; valor: string }[]
  naFila: number
  onFechar: () => void
  onConfirmar: (nome: string, telefone: string) => void
}) {
  const { logado } = useLoginDemo('cliente')
  const [nome, setNome] = useState(logado ? CLIENTE_DEMO.nome : '')
  const [telefone, setTelefone] = useState(logado ? CLIENTE_DEMO.telefone : '')
  const [feito, setFeito] = useState(false)
  const valido = nome.trim().length >= 2 && telefone.replace(/\D/g, '').length >= 10

  return (
    <Janela onFechar={onFechar} titulo={feito ? 'Você está na lista!' : 'Avise-me se vagar'} etiqueta={<span className="text-xs font-bold uppercase tracking-widest text-onda">Lista de espera</span>}>
      <Detalhes itens={detalhes} />
      {feito ? (
        <>
          <p className="mt-4 text-sm text-petroleo-noite/70">
            Se esse horário for cancelado, a gente te chama no WhatsApp na hora. Você é o <b>{naFila}º</b> da fila.
          </p>
          <button onClick={onFechar} className="mt-5 w-full rounded-full bg-petroleo text-white py-3 font-bold">Fechar</button>
        </>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valido) return
            onConfirmar(nome.trim(), telefone)
            setFeito(true)
          }}
        >
          <p className="text-sm text-petroleo-noite/70">
            Esse horário está ocupado{naFila > 0 && ` e ${naFila} ${naFila === 1 ? 'pessoa já está' : 'pessoas já estão'} na fila`}. Deixe seu contato que avisamos se vagar.
          </p>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={classeCampo} />
          <input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="WhatsApp" inputMode="tel" className={classeCampo} />
          <button type="submit" disabled={!valido} className="w-full rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold disabled:opacity-40">
            Entrar na lista de espera
          </button>
        </form>
      )}
    </Janela>
  )
}

function Celula({ slot, preco, onEscolher, onAvisar }: { slot: Slot; preco: number; onEscolher: () => void; onAvisar: () => void }) {
  const { db } = useDB()
  const base = 'w-full h-20 rounded-2xl text-center px-2 flex flex-col items-center justify-center gap-0.5'
  const horaEl = <span className="titulo text-2xl leading-none">{fmtFaixa(slot.hora).replace(' – ', '–')}</span>
  switch (slot.status) {
    case 'livre':
      return (
        <button onClick={onEscolher} className={`${base} bg-white border-2 border-onda/40 text-petroleo hover:bg-onda hover:text-white hover:border-onda transition group`}>
          {horaEl}
          <span className="text-xs font-semibold text-emerald-700 group-hover:text-white">Livre · {fmtReais(preco)}</span>
        </button>
      )
    case 'minha':
      return (
        <div className={`${base} bg-sol text-petroleo-noite`}>
          {horaEl}
          <span className="text-xs font-bold">Sua reserva</span>
        </div>
      )
    case 'aula': {
      const a = slot.aula!
      return (
        <div className={`${base} bg-onda-claro text-petroleo`} title={`Aula com ${acharProfessor(db, a.professorId).nome}`}>
          {horaEl}
          <span className="text-[11px] font-semibold truncate max-w-full">
            Aula de {modalidadePorId(a.modalidade).curto} · {acharProfessor(db, a.professorId).nome.split(' ')[0]}
          </span>
        </div>
      )
    }
    case 'reservado':
      return (
        <button
          onClick={onAvisar}
          title="Entrar na lista de espera"
          className={`${base} group text-petroleo-noite/40 bg-[repeating-linear-gradient(135deg,#0f5c6314_0_6px,transparent_6px_12px)] hover:text-petroleo hover:ring-2 hover:ring-petroleo/20`}
        >
          {horaEl}
          <span className="text-xs inline-flex items-center gap-1">
            {slot.reserva?.fixoId ? 'Horário fixo' : 'Ocupado'} · <Bell className="size-3" /> avise-me
          </span>
        </button>
      )
    default:
      return null
  }
}
