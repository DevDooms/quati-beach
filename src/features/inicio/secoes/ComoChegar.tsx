import type { ReactNode } from 'react'
import { Clock, MapPin, Phone, Users } from 'lucide-react'
import { NEGOCIO } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { doCliente } from '../../../lib/mensagens'
import { linkWhatsApp } from '../../../lib/whatsapp'
import { Botao, IconeInstagram, IconeWhatsApp, Onda, TituloSecao } from '../../../ui'

const Item = ({ icone, children }: { icone: ReactNode; children: ReactNode }) => (
  <li className="flex gap-3 [&>svg]:size-5 [&>svg]:text-sol [&>svg]:shrink-0 [&>svg]:mt-0.5">
    {icone}
    <span>{children}</span>
  </li>
)

export function ComoChegar() {
  const { db } = useDB()
  const f = db.funcionamento
  return (
    <section className="bg-mar-fundo text-white">
      <Onda cor="var(--color-areia-claro)" className="block w-full h-10 sm:h-14 rotate-180 -mt-px" />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 grid gap-8 lg:grid-cols-2">
        <div>
          <TituloSecao sobre="Como chegar" titulo="Venha jogar com a gente" claro />
          <ul className="mt-6 space-y-4">
            <Item icone={<MapPin />}>
              {NEGOCIO.endereco}
              <br />
              <span className="text-white/60">{NEGOCIO.cidade}</span>
            </Item>
            <Item icone={<Clock />}>
              Seg a sex: {f[1][0]}h às {f[1][1]}h
              <br />
              Sábado: {f[6][0]}h às {f[6][1]}h
              <br />
              Domingo: {f[0][0]}h às {f[0][1]}h
            </Item>
            <Item icone={<Phone />}>
              <a href={`tel:+${NEGOCIO.whatsapp}`}>{NEGOCIO.telefone}</a>
            </Item>
            <Item icone={<Users />}>Ambiente familiar, com bar, petiscos e área de descanso.</Item>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Botao href={linkWhatsApp(doCliente.informacoes())} variante="whatsapp" redondo>
              <IconeWhatsApp /> WhatsApp
            </Botao>
            <Botao href={NEGOCIO.instagram} variante="contorno-claro" redondo>
              <IconeInstagram /> Instagram
            </Botao>
            <Botao href={NEGOCIO.mapaLink} variante="contorno-claro" redondo>
              <MapPin className="size-5" /> Abrir no Maps
            </Botao>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden min-h-72 bg-mar">
          <iframe title={`Mapa ${NEGOCIO.nome}`} src={NEGOCIO.mapaEmbed} className="w-full h-full min-h-72 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  )
}
