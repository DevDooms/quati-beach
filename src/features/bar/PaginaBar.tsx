import { Beer, Sandwich, UtensilsCrossed } from 'lucide-react'
import { CARDAPIO } from '../../config/estabelecimento'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import { linkWhatsApp } from '../../lib/whatsapp'
import { Botao, CabecalhoPagina, IconeWhatsApp } from '../../ui'

const ICONES = [UtensilsCrossed, Sandwich, Beer]

export default function PaginaBar() {
  return (
    <>
      <CabecalhoPagina sobre="Bar do Quati" titulo={<>Pós-jogo é <span className="text-sol">aqui</span></>}>
        Porções, lanches e bebida gelada para a galera e para a família. Peça no balcão ou já deixe encomendado pelo WhatsApp.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3">
        {CARDAPIO.map((c, i) => {
          const Icone = ICONES[i % ICONES.length]
          return (
            <section key={c.categoria} className="rounded-3xl bg-white border border-petroleo/10 p-6">
              <h2 className="titulo text-3xl text-petroleo flex items-center gap-2">
                <Icone className="size-6 text-laranja" /> {c.categoria}
              </h2>
              <ul className="mt-4 space-y-3">
                {c.itens.map((item) => (
                  <li key={item.nome} className="flex items-baseline gap-2">
                    <span className="min-w-0">
                      <b className="block">{item.nome}</b>
                      {item.descricao && <span className="text-xs text-petroleo-noite/60">{item.descricao}</span>}
                    </span>
                    <span className="flex-1 border-b border-dotted border-petroleo/20 translate-y-[-4px]" />
                    <span className="font-extrabold text-petroleo whitespace-nowrap">{fmtReais(item.preco)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-3xl bg-laranja text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="titulo text-4xl">Vai jogar e quer tudo pronto?</p>
            <p className="text-white/90">Encomende a porção para o fim do seu horário e ela chega na mesa.</p>
          </div>
          <Botao href={linkWhatsApp(doCliente.encomendaBar())} variante="claro" tamanho="lg">
            <IconeWhatsApp className="size-5 text-whatsapp-escuro" /> Encomendar no WhatsApp
          </Botao>
        </div>
        <p className="mt-3 text-center text-xs text-petroleo-noite/50">Cardápio e preços ilustrativos para a demonstração.</p>
      </div>
    </>
  )
}
