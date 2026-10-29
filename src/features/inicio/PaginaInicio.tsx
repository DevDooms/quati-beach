import { Avaliacoes } from './secoes/Avaliacoes'
import { ComoChegar } from './secoes/ComoChegar'
import { BannerTorneio, BarEventos } from './secoes/Destaques'
import { Hero } from './secoes/Hero'
import { Modalidades } from './secoes/Modalidades'
import { NossoEspaco } from './secoes/NossoEspaco'
import { Numeros } from './secoes/Numeros'

export default function PaginaInicio() {
  return (
    <>
      <Hero />
      <Numeros />
      <Modalidades />
      <NossoEspaco />
      <BarEventos />
      <BannerTorneio />
      <Avaliacoes />
      <ComoChegar />
    </>
  )
}
