// Coluna lateral da página de agendamento: preços, regras do dono e reservas do cliente
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Info, Lightbulb, Tag, Ticket, Trash2 } from 'lucide-react'
import { quadraPorId } from '../../config/estabelecimento'
import { useUsuario } from '../../lib/auth'
import { useDB } from '../../lib/banco'
import { DIAS_CURTOS, ORDEM_DIAS, dataDeISO, fmtDataCurta, fmtDiaSemana, fmtHora } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import { cancelarReserva, podeCancelar, reservasDoCliente } from './regras'

function Caixa({ titulo, icone, children, tom = 'branco' }: { titulo: string; icone?: ReactNode; children: ReactNode; tom?: 'branco' | 'onda' | 'sol' }) {
  const cores = { branco: 'bg-white border-petroleo/10', onda: 'bg-onda-claro/60 border-onda/20', sol: 'bg-sol/20 border-sol/40' }
  return (
    <div className={`rounded-2xl border p-5 ${cores[tom]}`}>
      <h3 className="titulo text-2xl text-petroleo flex items-center gap-2 [&>svg]:size-5">
        {icone} {titulo}
      </h3>
      {children}
    </div>
  )
}

const diasTexto = (dias: number[]) => ORDEM_DIAS.filter((d) => dias.includes(d)).map((d) => DIAS_CURTOS[d]).join(', ')

export function LateralAgendar() {
  const { db, set } = useDB()
  const { usuario } = useUsuario()
  const { proximas } = reservasDoCliente(db, usuario)
  const promocoes = db.promocoes.filter((p) => p.ativa)
  const vendePacotes = db.modulos.pacotes && db.pacotes.length > 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 self-start">
      <Caixa titulo="Valores por hora">
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between"><span>Seg–Sex até {db.precos.inicioPico}h</span><b>{fmtReais(db.precos.normal)}</b></li>
          <li className="flex justify-between"><span>Seg–Sex após {db.precos.inicioPico}h</span><b>{fmtReais(db.precos.pico)}</b></li>
          <li className="flex justify-between"><span>Sábado e domingo</span><b>{fmtReais(db.precos.pico)}</b></li>
        </ul>
        <p className="mt-3 text-xs text-petroleo-noite/70 flex gap-1.5">
          <Lightbulb className="size-4 shrink-0 text-sol-escuro" /> Iluminação noturna inclusa. Bolas e redes à disposição.
        </p>
      </Caixa>

      {promocoes.length > 0 && (
        <Caixa titulo="Promoções" icone={<Tag />} tom="sol">
          <ul className="mt-2 space-y-2 text-sm">
            {promocoes.map((p) => (
              <li key={p.id}>
                <b>{p.nome}</b>: {fmtReais(p.preco)}/h
                <span className="block text-xs text-petroleo-noite/70">{diasTexto(p.dias)} · {fmtHora(p.inicio)} às {fmtHora(p.fim)}</span>
              </li>
            ))}
          </ul>
        </Caixa>
      )}

      {vendePacotes && (
        <Caixa titulo="Pacotes de horas" icone={<Ticket />} tom="sol">
          <p className="mt-1 text-sm text-petroleo-noite/80">Joga sempre? Compre horas antecipadas e use quando quiser.</p>
          <Link to="/pacotes" className="mt-2 inline-block text-sm font-bold text-petroleo underline">Ver pacotes</Link>
        </Caixa>
      )}

      <Caixa titulo="Bom saber" icone={<Info />} tom="onda">
        <ul className="mt-2 space-y-1.5 text-sm text-petroleo-noite/80">
          <li>• Cancele ou remarque pelo site até <b>{db.politica.cancelamentoHoras}h antes</b>.</li>
          <li>• Horário ocupado? Toque nele e entre na <b>lista de espera</b>.</li>
        </ul>
      </Caixa>

      <Caixa titulo="Suas reservas">
        {proximas.length === 0 ? (
          <p className="mt-2 text-sm text-petroleo-noite/70">Nenhuma reserva ainda. Toque num horário livre para reservar.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {proximas.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-xl bg-sol/15 px-3 py-2">
                <CalendarDays className="size-5 text-sol-escuro shrink-0" />
                <div className="flex-1 text-sm leading-tight">
                  <p className="font-bold first-letter:uppercase">
                    {fmtDiaSemana(dataDeISO(r.data))} {fmtDataCurta(dataDeISO(r.data))} · {fmtHora(r.hora)}
                  </p>
                  <p className="text-petroleo-noite/70 text-xs">{quadraPorId(r.quadraId).nome}</p>
                </div>
                {/* respeita o prazo de cancelamento do dono */}
                {podeCancelar(r, db.politica) && (
                  <button onClick={() => set((db) => cancelarReserva(db, r.id))} className="p-1.5 text-petroleo-noite/70 hover:text-red-600" aria-label="Cancelar reserva">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {usuario && proximas.length > 0 && (
          <Link to="/minha-conta" className="mt-3 inline-block text-sm font-semibold text-onda">Remarcar na minha conta</Link>
        )}
      </Caixa>
    </aside>
  )
}
