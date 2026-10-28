import { useState } from 'react'
import { addDays } from 'date-fns'
import { Plus, Repeat } from 'lucide-react'
import { QUADRAS, quadraPorId } from '../data/mock'
import { DIAS_SEMANA, ORDEM_DIAS, chaveData, dataDeChave, fmtDataCurta, fmtFaixa, fmtReais, linkWhatsApp, precoDoHorario, whatsDoTelefone } from '../lib/agenda'
import { SEMANAS_FIXO, novoId, reservasDoFixo, useDB, type Mensalista } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { mascaraTelefone } from '../components/ModalReserva'
import { Janela } from '../components/Pecas'
import { Botao, Campo, Cartao, Confirmar, TituloPagina, classeInput } from './ui'

export default function Mensalistas() {
  const { db, set } = useDB()
  const [novo, setNovo] = useState(false)
  const hoje = chaveData(new Date())

  const linhas = db.mensalistas
    .map((m) => {
      const futuras = db.reservas.filter((r) => r.fixoId === m.id && r.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))
      const proxima = futuras[0]
      // estimativa: 4 jogos por mês no preço do horário
      const mensal = 4 * precoDoHorario(db, proxima ? dataDeChave(proxima.data) : new Date(), m.hora)
      return { m, futuras, proxima, mensal }
    })
    .sort((a, b) => ORDEM_DIAS.indexOf(a.m.diaSemana) - ORDEM_DIAS.indexOf(b.m.diaSemana) || a.m.hora - b.m.hora)
  const receita = linhas.reduce((s, l) => s + l.mensal, 0)

  const renovar = (m: Mensalista, ultimas: string | undefined) =>
    set((db) => {
      const de = ultimas ? addDays(dataDeChave(ultimas), 1) : new Date()
      return { ...db, reservas: [...db.reservas, ...reservasDoFixo(db, m, de)] }
    })

  const encerrar = (m: Mensalista) =>
    set((db) => ({
      ...db,
      mensalistas: db.mensalistas.filter((x) => x.id !== m.id),
      reservas: db.reservas.filter((r) => !(r.fixoId === m.id && r.data >= hoje)),
    }))

  return (
    <>
      <TituloPagina
        titulo="Mensalistas"
        sub={`${db.mensalistas.length} horários fixos · cerca de ${fmtReais(receita)} por mês garantidos`}
        acoes={<Botao onClick={() => setNovo(true)}><Plus className="size-4" /> Novo horário fixo</Botao>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {linhas.map(({ m, futuras, proxima, mensal }) => (
          <Cartao key={m.id} className="p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <span className="size-12 shrink-0 rounded-2xl bg-sol/30 grid place-items-center text-petroleo"><Repeat className="size-6" /></span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-lg truncate">{m.nome}</p>
                <p className="text-xs text-petroleo-noite/60">{m.telefone}</p>
              </div>
            </div>
            <p className="mt-3 titulo text-3xl text-petroleo">{DIAS_SEMANA[m.diaSemana]}s · {fmtFaixa(m.hora)}</p>
            <p className="text-sm text-petroleo-noite/70">{quadraPorId(m.quadraId).nome} · desde {fmtDataCurta(dataDeChave(m.desde))}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-areia-claro py-2">
                <p className="titulo text-2xl text-petroleo">{futuras.length}</p>
                <p className="text-[11px] text-petroleo-noite/60">semanas reservadas</p>
              </div>
              <div className="rounded-xl bg-areia-claro py-2">
                <p className="titulo text-2xl text-petroleo">{fmtReais(mensal)}</p>
                <p className="text-[11px] text-petroleo-noite/60">por mês (aprox.)</p>
              </div>
            </div>
            {proxima && <p className="mt-2 text-xs text-onda font-semibold">Próximo jogo: {fmtDataCurta(dataDeChave(proxima.data))}</p>}
            {futuras.length <= 2 && <p className="mt-1 text-xs font-semibold text-amber-700">Acabando: renove para manter o horário.</p>}
            <div className="mt-4 flex flex-wrap gap-2 flex-1 items-end">
              <Botao tipo="secundario" onClick={() => renovar(m, futuras.at(-1)?.data)}>+{SEMANAS_FIXO} semanas</Botao>
              <a
                href={linkWhatsApp(`Olá, ${m.nome}! Aqui é do Quati Beach Sport, sobre o horário fixo de ${DIAS_SEMANA[m.diaSemana].toLowerCase()} às ${m.hora}h.`, whatsDoTelefone(m.telefone))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#25d366]/40 px-3 py-2.5 text-sm font-bold text-[#128c4a]"
              >
                <IconeWhatsApp className="size-4" />
              </a>
              <Confirmar rotulo="Encerrar" pergunta="Encerrar?" onConfirmar={() => encerrar(m)} />
            </div>
          </Cartao>
        ))}
      </div>
      {linhas.length === 0 && <Cartao className="p-10 text-center text-petroleo-noite/60">Nenhum horário fixo ainda.</Cartao>}

      {novo && <JanelaNovoFixo onFechar={() => setNovo(false)} />}
    </>
  )
}

function JanelaNovoFixo({ onFechar }: { onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState({ nome: '', telefone: '', diaSemana: 2, hora: 20, quadraId: 'q1' })
  const [abre, fecha] = db.funcionamento[f.diaSemana]
  const horas = Array.from({ length: fecha - abre }, (_, i) => abre + i)
  const conflitoFixo = db.mensalistas.some((m) => m.diaSemana === f.diaSemana && m.hora === f.hora && m.quadraId === f.quadraId)
  const conflitoAula = db.aulas.some((a) => a.diaSemana === f.diaSemana && a.hora === f.hora && a.quadraId === f.quadraId)
  const m: Mensalista = { id: '', ...f, desde: chaveData(new Date()) }
  const previa = conflitoFixo || conflitoAula ? [] : reservasDoFixo(db, m, new Date())
  const valido = f.nome.trim().length >= 2 && previa.length > 0 && horas.includes(f.hora)

  return (
    <Janela onFechar={onFechar} titulo="Novo horário fixo" largura="sm:max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Nome do grupo / responsável" className="col-span-2">
          <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={classeInput} />
        </Campo>
        <Campo rotulo="WhatsApp" className="col-span-2">
          <input value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} className={classeInput} inputMode="tel" />
        </Campo>
        <Campo rotulo="Dia">
          <select value={f.diaSemana} onChange={(e) => setF({ ...f, diaSemana: Number(e.target.value) })} className={classeInput}>
            {ORDEM_DIAS.map((d) => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Horário">
          <select value={f.hora} onChange={(e) => setF({ ...f, hora: Number(e.target.value) })} className={classeInput}>
            {horas.map((h) => <option key={h} value={h}>{fmtFaixa(h)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Quadra" className="col-span-2">
          <select value={f.quadraId} onChange={(e) => setF({ ...f, quadraId: e.target.value })} className={classeInput}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </select>
        </Campo>
      </div>

      <p className="mt-4 rounded-xl bg-areia-claro p-3 text-sm">
        {conflitoFixo
          ? 'Já existe um mensalista nesse dia, horário e quadra.'
          : conflitoAula
            ? 'Esse horário tem aula toda semana nessa quadra.'
            : `Vai reservar ${previa.length} das próximas ${SEMANAS_FIXO} semanas${previa.length < SEMANAS_FIXO ? ' (algumas já estavam ocupadas)' : ''}.`}
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <Botao tipo="secundario" onClick={onFechar}>Cancelar</Botao>
        <Botao
          disabled={!valido}
          onClick={() => {
            const id = novoId()
            const novoFixo = { ...m, id, nome: f.nome.trim() }
            set((db) => ({
              ...db,
              mensalistas: [...db.mensalistas, novoFixo],
              reservas: [...db.reservas, ...reservasDoFixo(db, novoFixo, new Date()).map((r) => ({ ...r, origem: 'Balcão' as const, criadaEm: new Date().toISOString() }))],
            }))
            onFechar()
          }}
        >
          Criar horário fixo
        </Botao>
      </div>
    </Janela>
  )
}
