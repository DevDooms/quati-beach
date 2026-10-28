import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CalendarDays, CalendarPlus, CircleCheck, Clock, GraduationCap, History, LogOut, MapPin, Trophy, X } from 'lucide-react'
import { CLIENTE_DEMO, modalidadePorId, quadraPorId } from '../data/mock'
import {
  DIAS_SEMANA,
  chaveData,
  dataDeChave,
  fmtDataCurta,
  fmtDataLonga,
  fmtDiaSemana,
  fmtFaixa,
  fmtHora,
  fmtReais,
  linkWhatsApp,
  precoDoHorario,
  proximaDataDaAula,
} from '../lib/agenda'
import { acharProfessor, ehDoCliente, useDB, useLoginDemo } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { SeloModalidade } from '../components/Pecas'

export default function MinhaConta() {
  const { db, set } = useDB()
  const { logado, sair } = useLoginDemo('cliente')
  const navegar = useNavigate()
  if (!logado) return <Navigate to="/entrar" replace />

  const hoje = chaveData(new Date())
  const minhas = db.reservas.filter(ehDoCliente).sort((a, b) => (a.data + fmtHora(a.hora)).localeCompare(b.data + fmtHora(b.hora)))
  const proximas = minhas.filter((r) => r.data >= hoje)
  const passadas = minhas.filter((r) => r.data < hoje).reverse()
  const turmas = db.aulas.filter((a) => a.alunos.some((p) => p.telefone === CLIENTE_DEMO.telefone))
  const torneios = db.torneios.flatMap((t) => t.duplas.filter((d) => d.telefone === CLIENTE_DEMO.telefone).map((d) => ({ t, d })))
  const primeiroNome = CLIENTE_DEMO.nome.split(' ')[0]

  return (
    <>
      <section className="bg-petroleo text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-wrap items-center gap-5">
          <span className="size-16 rounded-full bg-sol text-petroleo-noite grid place-items-center titulo text-3xl">
            {CLIENTE_DEMO.nome.split(' ').map((p) => p[0]).join('')}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sol font-semibold text-sm uppercase tracking-[0.2em]">Área do cliente</p>
            <h1 className="titulo text-5xl">Olá, {primeiroNome}!</h1>
            <p className="text-white/70 text-sm">{CLIENTE_DEMO.telefone}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/agendar" className="inline-flex items-center gap-2 rounded-full bg-sol text-petroleo-noite px-5 py-2.5 font-bold">
              <CalendarPlus className="size-4" /> Nova reserva
            </Link>
            <button
              onClick={() => {
                sair()
                navegar('/entrar')
              }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-4 py-2.5 font-bold hover:bg-white/10"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid grid-cols-3 gap-3">
          {[
            [proximas.length, 'próximas reservas'],
            [turmas.length, turmas.length === 1 ? 'turma' : 'turmas'],
            [passadas.length, 'jogos no histórico'],
          ].map(([n, t]) => (
            <div key={t} className="rounded-2xl bg-white border border-petroleo/10 p-4 text-center">
              <p className="titulo text-4xl text-petroleo">{n}</p>
              <p className="text-xs text-petroleo-noite/60">{t}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Próximas reservas */}
          <section>
            <Titulo icone={<CalendarDays />}>Próximas reservas</Titulo>
            <div className="mt-3 space-y-3">
              {proximas.length === 0 && <Vazio>Nenhuma reserva marcada. <Link to="/agendar" className="font-bold text-onda">Reservar agora</Link></Vazio>}
              {proximas.map((r) => {
                const d = dataDeChave(r.data)
                return (
                  <article key={r.id} className="rounded-2xl bg-white border border-petroleo/10 p-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-petroleo text-white text-center px-3 py-2 shrink-0">
                        <p className="text-[11px] uppercase text-sol font-semibold">{fmtDiaSemana(d)}</p>
                        <p className="titulo text-3xl leading-none">{d.getDate()}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold first-letter:uppercase">{fmtDataLonga(d)}</p>
                        <p className="text-sm text-petroleo-noite/70 flex flex-wrap gap-x-3">
                          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{fmtFaixa(r.hora)}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{quadraPorId(r.quadraId).nome}</span>
                        </p>
                        <p className={`mt-1 text-xs font-bold ${r.pago ? 'text-emerald-700' : 'text-laranja'}`}>
                          {r.pago ? 'Pago' : `A pagar no local · ${fmtReais(precoDoHorario(db, d, r.hora))}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={linkWhatsApp(`Olá! Sou ${CLIENTE_DEMO.nome} e gostaria de remarcar minha reserva de ${fmtDataCurta(d)} às ${fmtHora(r.hora)} (${quadraPorId(r.quadraId).nome}).`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-petroleo/15 py-2 text-sm font-semibold"
                      >
                        <IconeWhatsApp className="size-4 text-[#128c4a]" /> Remarcar
                      </a>
                      <button
                        onClick={() => set((db) => ({ ...db, reservas: db.reservas.filter((x) => x.id !== r.id) }))}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 text-red-600 py-2 text-sm font-semibold hover:bg-red-50"
                      >
                        <X className="size-4" /> Cancelar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="space-y-8">
            {/* Turmas */}
            <section>
              <Titulo icone={<GraduationCap />}>Minhas turmas</Titulo>
              <div className="mt-3 space-y-3">
                {turmas.length === 0 && <Vazio>Você ainda não está em nenhuma turma. <Link to="/aulas" className="font-bold text-onda">Ver aulas</Link></Vazio>}
                {turmas.map((a) => {
                  const prox = proximaDataDaAula(a.diaSemana, a.hora)
                  return (
                    <article key={a.id} className="rounded-2xl bg-white border border-petroleo/10 p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <SeloModalidade id={a.modalidade} pequeno />
                          <span className="text-xs font-semibold text-petroleo-noite/70">{a.nivel}</span>
                        </div>
                        <p className="mt-1 font-bold">
                          {DIAS_SEMANA[a.diaSemana]}s, {fmtFaixa(a.hora)}
                        </p>
                        <p className="text-sm text-petroleo-noite/60">
                          Prof. {acharProfessor(db, a.professorId).nome} · {quadraPorId(a.quadraId).nome}
                        </p>
                        <p className="text-xs text-onda font-semibold mt-1">Próxima: {fmtDiaSemana(prox)} {fmtDataCurta(prox)}</p>
                      </div>
                      <a
                        href={linkWhatsApp(`Olá! Sou ${CLIENTE_DEMO.nome}, da turma de ${modalidadePorId(a.modalidade).nome} ${a.nivel}. Não vou conseguir ir na aula de ${fmtDataCurta(prox)}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-full border border-petroleo/15 px-3 py-2 text-xs font-semibold"
                      >
                        Avisar falta
                      </a>
                    </article>
                  )
                })}
              </div>
            </section>

            {/* Torneios */}
            <section>
              <Titulo icone={<Trophy />}>Torneios</Titulo>
              <div className="mt-3 space-y-3">
                {torneios.length === 0 && <Vazio>Nenhuma inscrição. <Link to="/torneios" className="font-bold text-onda">Ver torneios</Link></Vazio>}
                {torneios.map(({ t, d }) => (
                  <article key={d.id} className="rounded-2xl bg-gradient-to-br from-sol to-laranja p-4 text-petroleo-noite">
                    <p className="titulo text-2xl">{t.nome}</p>
                    <p className="text-sm font-semibold">
                      {fmtDataCurta(dataDeChave(t.data))} · Categoria {d.categoria}
                    </p>
                    <p className="text-sm">Dupla: {d.atleta1} & {d.atleta2}</p>
                    <p className="mt-1 text-xs font-bold inline-flex items-center gap-1">
                      {d.pago ? <><CircleCheck className="size-4" /> Inscrição paga</> : 'Pagamento pendente'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Histórico */}
        <section>
          <Titulo icone={<History />}>Histórico</Titulo>
          <div className="mt-3 rounded-2xl bg-white border border-petroleo/10 divide-y divide-petroleo/10">
            {passadas.length === 0 && <p className="p-4 text-sm text-petroleo-noite/60">Nada por aqui ainda.</p>}
            {passadas.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="first-letter:uppercase">
                  {fmtDiaSemana(dataDeChave(r.data))} {fmtDataCurta(dataDeChave(r.data))} · {fmtFaixa(r.hora)}
                </span>
                <span className="text-petroleo-noite/60">{quadraPorId(r.quadraId).nome}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function Titulo({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-petroleo [&>svg]:size-6">
      {icone}
      <span className="titulo text-3xl">{children}</span>
    </h2>
  )
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-petroleo/15 p-5 text-center text-sm text-petroleo-noite/60">{children}</p>
}
