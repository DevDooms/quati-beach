import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarDays, CircleCheck, PartyPopper, Trash2, Users } from 'lucide-react'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataLonga } from '../../../lib/datas'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import { Botao, Cartao, IconeWhatsApp, Selo, Vazio } from '../../../ui'
import { marcarRespondido, pedidosOrdenados, removerPedido } from '../regras'

export function ListaPedidos() {
  const { db, set } = useDB()
  const pedidos = pedidosOrdenados(db)
  if (pedidos.length === 0) return <Vazio>Nenhum pedido de evento.</Vazio>

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {pedidos.map((e) => (
        <Cartao key={e.id} className={`p-5 ${e.respondido ? 'opacity-70' : 'ring-2 ring-sol'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-11 shrink-0 rounded-2xl bg-laranja/15 text-laranja grid place-items-center"><PartyPopper className="size-6" /></span>
              <div className="min-w-0">
                <p className="font-extrabold truncate">{e.nome}</p>
                <p className="text-xs text-petroleo-noite/70">{e.telefone} · {formatDistanceToNow(new Date(e.criadoEm), { locale: ptBR, addSuffix: true })}</p>
              </div>
            </div>
            {e.respondido ? (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CircleCheck className="size-4" /> Respondido</span>
            ) : (
              <Selo className="bg-sol text-petroleo-noite font-extrabold">NOVO</Selo>
            )}
          </div>
          <p className="mt-3 font-bold text-petroleo">{e.tipo}</p>
          <p className="text-sm text-petroleo-noite/70 flex flex-wrap gap-x-4">
            <span className="inline-flex items-center gap-1 first-letter:uppercase"><CalendarDays className="size-4" /> {fmtDataLonga(dataDeISO(e.data))}</span>
            <span className="inline-flex items-center gap-1"><Users className="size-4" /> {e.pessoas} pessoas</span>
          </p>
          {e.obs && <p className="mt-2 rounded-xl bg-areia-claro p-3 text-sm">{e.obs}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Botao href={whatsPara(e, doEstabelecimento.respostaEvento(e.nome, e.tipo, e.data))} onClick={() => set((db) => marcarRespondido(db, e.id))} variante="whatsapp">
              <IconeWhatsApp className="size-4" /> Responder
            </Botao>
            <Botao variante="secundario" onClick={() => set((db) => marcarRespondido(db, e.id, !e.respondido))}>
              {e.respondido ? 'Marcar como novo' : 'Marcar respondido'}
            </Botao>
            <button onClick={() => set((db) => removerPedido(db, e.id))} className="p-2.5 text-petroleo-noite/70 hover:text-red-600" aria-label="Apagar pedido">
              <Trash2 className="size-4" />
            </button>
          </div>
        </Cartao>
      ))}
    </div>
  )
}
