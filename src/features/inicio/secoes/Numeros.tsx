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
    <section className="relative mx-auto max-w-6xl px-4 -mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {itens.map(([n, t]) => (
          <div key={t} className="rounded-2xl bg-white border border-mar/10 border-b-4 border-b-sol p-4 text-center shadow-lg shadow-areia-escura/30">
            <p className="titulo text-5xl text-mar">{n}</p>
            <p className="text-xs text-marinho/70 font-bold uppercase tracking-wider">{t}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
