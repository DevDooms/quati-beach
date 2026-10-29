import { Navigate, useNavigate } from 'react-router-dom'
import { CalendarPlus, LogOut } from 'lucide-react'
import { CLIENTE_DEMO } from '../../demo/dados'
import { useDB } from '../../lib/banco'
import { useLogin } from '../../lib/auth'
import { iniciais, primeiroNome } from '../../lib/formatos'
import { Botao } from '../../ui'
import { turmasDoAluno } from '../aulas/regras'
import { reservasDoCliente } from '../reservas/regras'
import { Historico, ProximasReservas } from './ReservasCliente'
import { TorneiosCliente, TurmasCliente } from './InscricoesCliente'

export default function PaginaMinhaConta() {
  const { db } = useDB()
  const { logado, sair } = useLogin('cliente')
  const navegar = useNavigate()
  if (!logado) return <Navigate to="/entrar" replace />

  const { proximas, passadas } = reservasDoCliente(db)
  const turmas = turmasDoAluno(db, CLIENTE_DEMO.telefone)

  return (
    <>
      <section className="bg-petroleo text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 flex flex-wrap items-center gap-5">
          <span className="size-16 rounded-full bg-sol text-petroleo-noite grid place-items-center titulo text-3xl">{iniciais(CLIENTE_DEMO.nome)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sol font-semibold text-sm uppercase tracking-[0.2em]">Área do cliente</p>
            <h1 className="titulo text-5xl">Olá, {primeiroNome(CLIENTE_DEMO.nome)}!</h1>
            <p className="text-white/70 text-sm">{CLIENTE_DEMO.telefone}</p>
          </div>
          <div className="flex gap-2">
            <Botao para="/agendar" variante="destaque" redondo>
              <CalendarPlus className="size-4" /> Nova reserva
            </Botao>
            <Botao
              variante="contorno-claro"
              redondo
              onClick={() => {
                sair()
                navegar('/entrar')
              }}
            >
              <LogOut className="size-4" /> Sair
            </Botao>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid grid-cols-3 gap-3">
          <Numero valor={proximas.length} rotulo="próximas reservas" />
          <Numero valor={turmas.length} rotulo={turmas.length === 1 ? 'turma' : 'turmas'} />
          <Numero valor={passadas.length} rotulo="jogos no histórico" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <ProximasReservas reservas={proximas} />
          <div className="space-y-8">
            <TurmasCliente turmas={turmas} />
            <TorneiosCliente />
          </div>
        </div>

        <Historico reservas={passadas} />
      </div>
    </>
  )
}

function Numero({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="rounded-2xl bg-white border border-petroleo/10 p-4 text-center">
      <p className="titulo text-4xl text-petroleo">{valor}</p>
      <p className="text-xs text-petroleo-noite/60">{rotulo}</p>
    </div>
  )
}
