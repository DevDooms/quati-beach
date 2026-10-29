import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { useDB } from '../../lib/banco'
import type { Pessoa } from '../../tipos'
import { TituloConta } from '../conta/TituloConta'
import { movimentosDe, saldoDe } from './regras'

// Saldo de horas do cliente (área do cliente)
export function CreditosCliente({ pessoa }: { pessoa: Pessoa }) {
  const { db } = useDB()
  const saldo = saldoDe(db, pessoa.telefone)
  const movimentos = movimentosDe(db, pessoa.telefone).slice(0, 5)
  return (
    <section>
      <TituloConta icone={<Ticket />}>Meus créditos</TituloConta>
      <div className="mt-3 rounded-2xl bg-white border border-petroleo/10 p-4">
        <p className="titulo text-4xl text-petroleo">{saldo} {saldo === 1 ? 'hora' : 'horas'}</p>
        <p className="text-xs text-petroleo-noite/70">Use na hora de reservar, escolhendo “Meus créditos”.</p>
        {movimentos.length > 0 && (
          <ul className="mt-3 divide-y divide-petroleo/10 text-sm">
            {movimentos.map((m) => (
              <li key={m.id} className="flex justify-between py-1.5">
                <span>{m.descricao}</span>
                <b className={m.horas > 0 ? 'text-emerald-700' : 'text-petroleo-noite/70'}>{m.horas > 0 ? '+' : ''}{m.horas}h</b>
              </li>
            ))}
          </ul>
        )}
        {db.pacotes.length > 0 && <Link to="/pacotes" className="mt-3 inline-block text-sm font-bold text-onda">Comprar mais horas</Link>}
      </div>
    </section>
  )
}
