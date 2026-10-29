import { CreditCard, QrCode, ShieldCheck, Store, Ticket } from 'lucide-react'
import type { FormaPagamento } from '../../../tipos'

type FormaSite = Extract<FormaPagamento, 'Pix' | 'Cartão' | 'Balcão' | 'Crédito'>

const FORMAS: { id: FormaSite; rotulo: string; detalhe: string; icone: typeof QrCode }[] = [
  { id: 'Pix', rotulo: 'Pix', detalhe: 'Aprovação na hora', icone: QrCode },
  { id: 'Cartão', rotulo: 'Cartão', detalhe: 'Crédito ou débito', icone: CreditCard },
  { id: 'Balcão', rotulo: 'No balcão', detalhe: 'Paga ao chegar', icone: Store },
  { id: 'Crédito', rotulo: 'Meus créditos', detalhe: 'Do pacote de horas', icone: Ticket },
]

const ROTULOS: Record<FormaPagamento, string> = { Pix: 'Pix', Cartão: 'Cartão', Dinheiro: 'Dinheiro', Crédito: 'Créditos do pacote', Balcão: 'No balcão' }
export const rotuloForma = (f: FormaPagamento) => ROTULOS[f]

// Na demonstração, Pix, cartão e créditos contam como pagos na hora
export const pagoNaHora = (f?: FormaPagamento) => f === 'Pix' || f === 'Cartão' || f === 'Crédito'

interface Props {
  forma: FormaPagamento
  onChange: (f: FormaPagamento) => void
  saldoHoras?: number // mostra "Meus créditos" quando a pessoa tem horas suficientes
  semBalcao?: boolean // compra de pacote: só Pix ou cartão
}

export function EscolhaPagamento({ forma, onChange, saldoHoras, semBalcao }: Props) {
  const opcoes = FORMAS.filter((f) => (f.id !== 'Crédito' || saldoHoras !== undefined) && (f.id !== 'Balcão' || !semBalcao))
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Forma de pagamento</legend>
      <div className={`mt-1 grid gap-2 ${opcoes.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : opcoes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {opcoes.map(({ id, rotulo, detalhe, icone: Icone }) => {
          const ativo = forma === id
          return (
            <label
              key={id}
              className={`cursor-pointer rounded-2xl border-2 px-2 py-3 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-onda ${
                ativo ? 'border-onda bg-onda-claro/60' : 'border-mar/10 hover:border-mar/30'
              }`}
            >
              <input type="radio" name="forma" value={id} checked={ativo} onChange={() => onChange(id)} className="sr-only" />
              <Icone className={`size-6 mx-auto ${ativo ? 'text-mar' : 'text-marinho/70'}`} />
              <span className="block mt-1 text-sm font-bold">{rotulo}</span>
              <span className="block text-[11px] text-marinho/70 leading-tight">{id === 'Crédito' ? `Saldo: ${saldoHoras}h` : detalhe}</span>
            </label>
          )
        })}
      </div>
      {forma === 'Cartão' && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-marinho/70">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" /> Pagamento seguro · Visa, Mastercard, Elo e Hipercard
        </p>
      )}
      {forma === 'Balcão' && <p className="mt-2 text-xs text-marinho/70">O horário fica reservado e você paga em dinheiro, Pix ou cartão ao chegar.</p>}
    </fieldset>
  )
}
