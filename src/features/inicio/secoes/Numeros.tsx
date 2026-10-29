import { NEGOCIO, QUADRAS } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'

export function Numeros() {
  const { db } = useDB()
  const itens = [
    [String(QUADRAS.length), 'quadras de areia'],
    [String(db.professores.length), 'professores'],
    [String(db.aulas.length), 'aulas por semana'],
    [`${NEGOCIO.nota.toFixed(1).replace('.', ',')} ★`, 'no Google'],
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 -mt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {itens.map(([n, t]) => (
          <div key={t} className="rounded-2xl bg-white border border-petroleo/10 p-4 text-center">
            <p className="titulo text-4xl text-petroleo">{n}</p>
            <p className="text-xs text-petroleo-noite/60 font-medium">{t}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
