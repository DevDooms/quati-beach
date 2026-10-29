import { CreditCard, QrCode, ShieldCheck, Store } from 'lucide-react'
import type { FormaPagamento } from '../../../tipos'

export const FORMAS_PAGAMENTO: { id: FormaPagamento; rotulo: string; detalhe: string; icone: typeof QrCode }[] = [
  { id: 'Pix', rotulo: 'Pix', detalhe: 'Aprovação na hora', icone: QrCode },
  { id: 'Cartão', rotulo: 'Cartão', detalhe: 'Crédito ou débito', icone: CreditCard },
  { id: 'Balcão', rotulo: 'No balcão', detalhe: 'Paga ao chegar', icone: Store },
]

export const rotuloForma = (f: FormaPagamento) => FORMAS_PAGAMENTO.find((x) => x.id === f)!.rotulo

// Na demonstração, Pix e cartão contam como pagos na hora
export const pagoNaHora = (f?: FormaPagamento) => f === 'Pix' || f === 'Cartão'

export function EscolhaPagamento({ forma, onChange }: { forma: FormaPagamento; onChange: (f: FormaPagamento) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Forma de pagamento</legend>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {FORMAS_PAGAMENTO.map(({ id, rotulo, detalhe, icone: Icone }) => {
          const ativo = forma === id
          return (
            <label
              key={id}
              className={`cursor-pointer rounded-2xl border-2 px-2 py-3 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-onda ${
                ativo ? 'border-onda bg-onda-claro/60' : 'border-petroleo/10 hover:border-petroleo/30'
              }`}
            >
              <input type="radio" name="forma" value={id} checked={ativo} onChange={() => onChange(id)} className="sr-only" />
              <Icone className={`size-6 mx-auto ${ativo ? 'text-petroleo' : 'text-petroleo-noite/50'}`} />
              <span className="block mt-1 text-sm font-bold">{rotulo}</span>
              <span className="block text-[11px] text-petroleo-noite/60 leading-tight">{detalhe}</span>
            </label>
          )
        })}
      </div>
      {forma === 'Cartão' && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-petroleo-noite/60">
          <ShieldCheck className="size-4 text-emerald-600 shrink-0" /> Pagamento seguro · Visa, Mastercard, Elo e Hipercard
        </p>
      )}
      {forma === 'Balcão' && <p className="mt-2 text-xs text-petroleo-noite/60">O horário fica reservado e você paga em dinheiro, Pix ou cartão ao chegar.</p>}
    </fieldset>
  )
}
