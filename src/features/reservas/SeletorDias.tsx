import { dataISO, fmtDataCurta, fmtDiaSemana } from '../../lib/datas'

// Faixa de dias rolável (Hoje, Amanhã, sex 30…)
export function SeletorDias({ dias, selecionado, onEscolher }: { dias: Date[]; selecionado: Date; onEscolher: (d: Date) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto sem-scrollbar -mx-4 px-4 pb-2">
      {dias.map((d, i) => {
        const ativo = dataISO(d) === dataISO(selecionado)
        return (
          <button
            key={dataISO(d)}
            onClick={() => onEscolher(d)}
            aria-pressed={ativo}
            className={`shrink-0 w-16 rounded-2xl py-2.5 text-center border transition ${
              ativo ? 'bg-petroleo text-white border-petroleo shadow-lg shadow-petroleo/25' : 'bg-white border-petroleo/10 hover:border-onda'
            }`}
          >
            <span className={`block text-[11px] uppercase font-semibold ${ativo ? 'text-sol' : 'text-petroleo-noite/70'}`}>
              {i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : fmtDiaSemana(d)}
            </span>
            <span className="titulo block text-3xl">{d.getDate()}</span>
            <span className={`block text-[11px] ${ativo ? 'text-white/70' : 'text-petroleo-noite/70'}`}>{fmtDataCurta(d).slice(3)}</span>
          </button>
        )
      })}
    </div>
  )
}
