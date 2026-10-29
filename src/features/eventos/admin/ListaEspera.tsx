import { Bell, Trash2 } from 'lucide-react'
import { quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataCurta, fmtDiaSemana, fmtFaixa } from '../../../lib/datas'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import { Cartao, IconeWhatsApp, Selo, Vazio } from '../../../ui'
import { slotDe } from '../../reservas/agenda'
import { filasPorHorario, sairDaEspera } from '../../reservas/regras'

// Lista de espera agrupada por horário; destaca quando o horário vagou
export function ListaEspera() {
  const { db, set } = useDB()
  const filas = filasPorHorario(db)
  if (filas.length === 0) return <Vazio>Ninguém na lista de espera. No site, o cliente toca num horário ocupado para entrar na fila.</Vazio>

  return (
    <div className="space-y-4">
      {filas.map((fila) => {
        const { data, hora, quadraId } = fila[0]
        const d = dataDeISO(data)
        const quadra = quadraPorId(quadraId).nome
        const vagou = slotDe(db, d, hora, quadraId).status === 'livre'
        return (
          <Cartao key={`${data}|${hora}|${quadraId}`} className={`p-5 ${vagou ? 'ring-2 ring-emerald-400' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-extrabold">
                <span className="capitalize">{fmtDiaSemana(d)}</span> {fmtDataCurta(d)} · {fmtFaixa(hora)} · {quadra}
              </p>
              {vagou ? (
                <Selo pequeno={false} className="bg-emerald-100 text-emerald-800 font-extrabold"><Bell className="size-3.5" /> Vagou! Avise a fila</Selo>
              ) : (
                <Selo pequeno={false} className="bg-petroleo/10 text-petroleo-noite/70">Ainda ocupado</Selo>
              )}
            </div>
            <ol className="mt-3 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
              {fila.map((e, i) => (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="w-6 font-bold text-petroleo-noite/70">{i + 1}º</span>
                  <span className="flex-1 min-w-0">
                    <b className="truncate">{e.nome}</b> <span className="text-xs text-petroleo-noite/70">{e.telefone}</span>
                  </span>
                  <a
                    href={whatsPara(e, vagou ? doEstabelecimento.vagouHorario(e.nome, data, hora, quadra) : doEstabelecimento.naFila(e.nome, data, hora))}
                    target="_blank"
                    rel="noreferrer"
                    className="text-whatsapp-escuro p-1"
                    aria-label={`WhatsApp de ${e.nome}`}
                  >
                    <IconeWhatsApp />
                  </a>
                  <button onClick={() => set((db) => sairDaEspera(db, e.id))} className="p-1 text-petroleo-noite/70 hover:text-red-600" aria-label="Tirar da fila">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ol>
          </Cartao>
        )
      })}
    </div>
  )
}
