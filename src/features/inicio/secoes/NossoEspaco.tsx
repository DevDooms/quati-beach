import { useNavigate } from 'react-router-dom'
import { TituloSecao } from '../../../ui'
import MapaQuadras from '../../reservas/MapaQuadras'
import { linkAgendar } from '../../reservas/PaginaAgendar'

const PASSOS = ['Toque na quadra que você quer', 'Escolha o dia e um horário livre', 'Confirme com nome e WhatsApp']

export function NossoEspaco() {
  const navegar = useNavigate()
  return (
    <section className="bg-areia textura-areia">
      <div className="conteudo py-16 grid gap-10 lg:grid-cols-[1fr_1.4fr] items-center">
        <div>
          <TituloSecao sobre="Nosso espaço" titulo="Escolha a quadra pelo mapa" />
          <p className="mt-3 text-marinho/75 max-w-md">
            Duas quadras de areia com iluminação noturna, bar com petiscos e área de mesas para a família. Toque em uma quadra para ver os horários dela.
          </p>
          <ol className="mt-8 space-y-4">
            {PASSOS.map((t, i) => (
              <li key={t} className="flex items-baseline gap-4">
                <span className="titulo text-4xl text-mar w-6">{i + 1}</span>
                <span className="font-semibold">{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <MapaQuadras selecionada={null} onEscolher={(id) => navegar(linkAgendar(id))} />
      </div>
    </section>
  )
}
