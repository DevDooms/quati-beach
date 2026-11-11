import { Avaliacoes } from './secoes/Avaliacoes'
import { ComoChegar } from './secoes/ComoChegar'
import { BannerTorneio, BarEventos } from './secoes/Destaques'
import { Galeria } from './secoes/Galeria'
import { Hero } from './secoes/Hero'
import { Modalidades } from './secoes/Modalidades'
import { NossoEspaco } from './secoes/NossoEspaco'

export default function PaginaInicio() {
  return (
    <>
      <Hero />
      <Modalidades />
      <NossoEspaco />
      <Galeria />
      <BarEventos />
      <BannerTorneio />
      <Avaliacoes />
      <ComoChegar />
    </>
  )
}
