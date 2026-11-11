import { NEGOCIO } from '../../../config/estabelecimento'
import { FOTOS } from '../../../config/fotos'
import { IconeInstagram } from '../../../ui'

// Faixa de fotos. Só aparece quando há fotos suficientes em src/assets/fotos/.
// A largura total é limitada para as fotos não serem esticadas além do tamanho real
// (as de celular/Instagram têm ~500px); no celular vira um carrossel de arrastar.
export function Galeria() {
  // a primeira foto já é o fundo do topo; com 4 ou mais, ela não se repete aqui
  const fotos = (FOTOS.length >= 4 ? FOTOS.slice(1) : FOTOS).slice(0, 4)
  if (fotos.length < 3) return null
  return (
    <section className="bg-marinho">
      <div className={`mx-auto max-w-[92.5rem] flex gap-1 overflow-x-auto snap-x snap-mandatory sem-scrollbar sm:grid ${fotos.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {fotos.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Foto ${i + 1} do ${NEGOCIO.nome}`}
            loading="lazy"
            className="w-[82%] shrink-0 snap-center sm:w-full aspect-square object-cover"
          />
        ))}
      </div>
      <a href={NEGOCIO.instagram} target="_blank" rel="noreferrer" className="conteudo flex items-center gap-2 py-4 text-sm font-semibold text-white/80 hover:text-sol">
        <IconeInstagram className="size-4" /> Mais fotos no {NEGOCIO.instagramUser}
      </a>
    </section>
  )
}
