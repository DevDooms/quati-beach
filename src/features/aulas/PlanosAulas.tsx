import { useDB } from '../../lib/banco'
import { fmtReais } from '../../lib/formatos'
import { doCliente } from '../../lib/mensagens'
import { linkWhatsApp } from '../../lib/whatsapp'
import { Botao, IconeWhatsApp, TituloSecao } from '../../ui'

const DESTAQUE = 1 // posição do plano "mais escolhido"

export function PlanosAulas() {
  const { db } = useDB()
  return (
    <section className="mt-14">
      <TituloSecao sobre="Gostou da aula experimental?" titulo="Planos mensais" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {db.planos.map((pl, i) => {
          const destaque = i === DESTAQUE
          return (
            <div key={pl.id} className={`relative rounded-xl p-6 flex flex-col ${destaque ? 'bg-mar text-white' : 'bg-white border border-mar/10'}`}>
              {destaque && <span className="absolute -top-3 left-6 rounded-full bg-sol text-marinho px-3 py-1 text-xs font-extrabold uppercase">Mais escolhido</span>}
              <h3 className="titulo text-3xl">{pl.nome}</h3>
              <p className={`text-sm ${destaque ? 'text-white/75' : 'text-marinho/70'}`}>{pl.descricao}</p>
              <p className="mt-4 flex-1">
                <span className={`titulo text-5xl ${destaque ? 'text-sol' : 'text-mar'}`}>{fmtReais(pl.preco)}</span>
                <span className={`text-sm ${destaque ? 'text-white/70' : 'text-marinho/70'}`}> /mês</span>
              </p>
              <Botao href={linkWhatsApp(doCliente.plano(pl.nome, pl.preco))} variante={destaque ? 'destaque' : 'primario'} tamanho="lg" largo className="mt-5">
                <IconeWhatsApp className="size-4" /> Quero esse plano
              </Botao>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-marinho/70">Vale para qualquer modalidade. Valores ilustrativos.</p>
    </section>
  )
}
