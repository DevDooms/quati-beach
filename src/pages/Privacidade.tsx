import type { ReactNode } from 'react'
import { NEGOCIO } from '../data/mock'
import { CabecalhoPagina } from '../components/Pecas'

// Modelo simples de política de privacidade (LGPD). Revisar com o dono antes de publicar.
export default function Privacidade() {
  return (
    <>
      <CabecalhoPagina sobre="LGPD" titulo={<>Política de <span className="text-sol">privacidade</span></>}>
        Como o {NEGOCIO.nome} usa os seus dados.
      </CabecalhoPagina>

      <article className="mx-auto max-w-3xl px-4 py-10 space-y-6 text-petroleo-noite/80 leading-relaxed">
        <Bloco titulo="Quais dados coletamos">
          Só o necessário para a sua reserva: <b>nome</b> e <b>número de WhatsApp</b>. Em pedidos de evento, também a data e o número de pessoas.
          Não pedimos CPF, endereço nem dados de cartão: pagamentos com cartão são processados por um parceiro de pagamento.
        </Bloco>
        <Bloco titulo="Para que usamos">
          Para confirmar e lembrar reservas e aulas, avisar sobre remarcações por chuva, lista de espera e inscrições em torneios. Só mandamos
          mensagens relacionadas ao que você reservou ou pediu.
        </Bloco>
        <Bloco titulo="Com quem compartilhamos">
          Com ninguém para fins de propaganda. Os dados ficam com a equipe do {NEGOCIO.nome} e com os serviços que fazem o site e os pagamentos
          funcionarem.
        </Bloco>
        <Bloco titulo="Por quanto tempo guardamos">
          Enquanto você for cliente. Se pedir, apagamos seus dados em até 15 dias, exceto o que a lei obriga a manter (como registros de pagamento).
        </Bloco>
        <Bloco titulo="Seus direitos">
          Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados, ou para não receber mais mensagens. É só chamar no WhatsApp{' '}
          <b>{NEGOCIO.telefone}</b>.
        </Bloco>
        <p className="text-xs text-petroleo-noite/50">Modelo para a demonstração. Antes de publicar, revisar o texto com o responsável pelo negócio.</p>
      </article>
    </>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="titulo text-3xl text-petroleo">{titulo}</h2>
      <p className="mt-1">{children}</p>
    </section>
  )
}
