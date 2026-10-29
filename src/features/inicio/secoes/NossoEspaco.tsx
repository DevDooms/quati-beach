import { NEGOCIO } from '../../../config/estabelecimento'
import { useNavigate } from 'react-router-dom'
import quadraAerea from '../../../assets/quadra-aerea.jpg'
import { TituloSecao } from '../../../ui'
import MapaQuadras from '../../reservas/MapaQuadras'
import { linkAgendar } from '../../reservas/PaginaAgendar'

const PASSOS = ['Toque na quadra que você quer', 'Escolha o dia e um horário livre', 'Confirme com nome e WhatsApp']

export function NossoEspaco() {
  const navegar = useNavigate()
  return (
    <section className="bg-areia/60">
      <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center">
        <div>
          <TituloSecao sobre="Nosso espaço" titulo="Escolha a quadra pelo mapa" />
          <p className="mt-3 text-petroleo-noite/75">
            Duas quadras de areia com iluminação noturna, bar com petiscos e área de mesas para a família. Toque em uma quadra para ver os horários dela.
          </p>
          <ol className="mt-6 space-y-3">
            {PASSOS.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="titulo text-4xl text-sol w-8">{i + 1}</span>
                <span className="font-semibold">{t}</span>
              </li>
            ))}
          </ol>
          <img src={quadraAerea} alt={`Vista aérea das quadras do ${NEGOCIO.nome}`} className="mt-6 rounded-3xl shadow-lg w-full max-h-60 object-cover" />
        </div>
        <div className="rounded-3xl bg-white p-3 sm:p-5 shadow-xl">
          <MapaQuadras selecionada={null} onEscolher={(id) => navegar(linkAgendar(id))} />
        </div>
      </div>
    </section>
  )
}
