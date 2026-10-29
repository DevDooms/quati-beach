import { NEGOCIO } from '../../../config/estabelecimento'
import { FOTOS } from '../../../config/fotos'
import { IconeInstagram } from '../../../ui'

// Só aparece quando há fotos suficientes em src/assets/fotos/
export function Galeria() {
  if (FOTOS.length < 3) return null
  const fotos = FOTOS.slice(0, 7)
  return (
    <section className="bg-marinho">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
        {fotos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Foto ${i + 1} do ${NEGOCIO.nome}`}
            loading="lazy"
            className={`w-full h-full object-cover aspect-square ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
          />
        ))}
      </div>
      <a href={NEGOCIO.instagram} target="_blank" rel="noreferrer" className="conteudo flex items-center gap-2 py-4 text-sm font-semibold text-white/80 hover:text-sol">
        <IconeInstagram className="size-4" /> Mais fotos no {NEGOCIO.instagramUser}
      </a>
    </section>
  )
}
