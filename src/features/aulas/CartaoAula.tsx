import { Clock, MapPin, Users } from 'lucide-react'
import { quadraPorId } from '../../config/estabelecimento'
import { fmtFaixa, fmtHora } from '../../lib/datas'
import { primeiroNome } from '../../lib/formatos'
import type { Aula, Professor } from '../../tipos'
import { Avatar, SeloModalidade } from '../../ui'
import { estaLotada, vagasRestantes } from './regras'

const corVagas = (a: Aula) => (estaLotada(a) ? 'text-red-600' : vagasRestantes(a) <= 1 ? 'text-laranja' : 'text-emerald-700')

// Versão completa (lista por dia)
export function CartaoAula({ aula, professor, onParticipar }: { aula: Aula; professor: Professor; onParticipar: () => void }) {
  const restantes = vagasRestantes(aula)
  const lotada = estaLotada(aula)
  return (
    <article className="rounded-2xl bg-white border border-mar/10 p-4 grid grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-3 items-center shadow-sm">
      <div className="text-center w-16 shrink-0">
        <p className="titulo text-4xl text-mar">{fmtHora(aula.hora)}</p>
        <p className="text-[11px] text-marinho/70">1 hora</p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <SeloModalidade id={aula.modalidade} pequeno />
          <span className="text-xs font-semibold text-marinho/70">{aula.nivel}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Avatar professor={professor} tamanho="size-7 text-[11px]" />
          <p className="font-semibold truncate">Prof. {professor.nome}</p>
        </div>
        <p className="mt-1.5 text-xs text-marinho/70 flex flex-wrap gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{quadraPorId(aula.quadraId).nome}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{fmtFaixa(aula.hora)}</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${corVagas(aula)}`}>
            <Users className="size-3.5" />
            {lotada ? 'Turma lotada' : `${restantes} de ${aula.vagas} vagas`}
          </span>
        </p>
      </div>
      <button
        onClick={onParticipar}
        className={`col-span-2 lg:col-span-1 rounded-full px-4 py-2.5 text-sm font-bold ${lotada ? 'bg-mar/10 text-mar' : 'bg-sol text-marinho hover:brightness-105'}`}
      >
        {lotada ? 'Lista de espera' : 'Participar'}
      </button>
    </article>
  )
}

// Versão compacta (grade da semana)
export function CartaoAulaCompacto({ aula, professor, onClick }: { aula: Aula; professor: Professor; onClick: () => void }) {
  const restantes = vagasRestantes(aula)
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl bg-white border border-mar/10 p-2.5 hover:border-onda hover:shadow-md transition">
      <SeloModalidade id={aula.modalidade} pequeno />
      <p className="mt-1.5 text-xs font-bold leading-tight">{aula.nivel}</p>
      <p className="text-[11px] text-marinho/70 leading-tight truncate">
        {primeiroNome(professor.nome)} · {quadraPorId(aula.quadraId).nome.replace('Quadra ', 'Q')}
      </p>
      <p className={`mt-1 text-[11px] font-semibold ${corVagas(aula)}`}>
        {estaLotada(aula) ? 'Lotada' : `${restantes}/${aula.vagas} vaga${restantes > 1 ? 's' : ''}`}
      </p>
    </button>
  )
}
