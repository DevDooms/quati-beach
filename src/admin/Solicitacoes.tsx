import { useSearchParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CalendarDays, CircleCheck, PartyPopper, Trash2, Users } from 'lucide-react'
import { quadraPorId } from '../data/mock'
import { chaveData, dataDeChave, fmtDataCurta, fmtDataLonga, fmtDiaSemana, fmtFaixa, linkWhatsApp, slotDe, whatsDoTelefone } from '../lib/agenda'
import { useDB, type Espera } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { Chip } from '../components/Pecas'
import { Cartao, TituloPagina } from './ui'

export default function Solicitacoes() {
  const { db, set } = useDB()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'espera' ? 'espera' : 'eventos'
  const hoje = chaveData(new Date())

  const eventos = [...db.eventos].sort((a, b) => Number(a.respondido) - Number(b.respondido) || b.criadoEm.localeCompare(a.criadoEm))
  const espera = db.espera.filter((e) => e.data >= hoje)
  // agrupa a fila por horário
  const grupos = Object.values(
    espera.reduce<Record<string, Espera[]>>((acc, e) => {
      const k = `${e.data}|${e.hora}|${e.quadraId}`
      ;(acc[k] ??= []).push(e)
      return acc
    }, {}),
  ).sort((a, b) => (a[0].data + a[0].hora).localeCompare(b[0].data + b[0].hora))

  const novosEventos = db.eventos.filter((e) => !e.respondido).length

  return (
    <>
      <TituloPagina titulo="Solicitações" sub="Pedidos de evento e lista de espera de horários ocupados." />

      <div className="flex gap-2 mb-4">
        <Chip ativo={aba === 'eventos'} onClick={() => setParams({}, { replace: true })}>
          Eventos{novosEventos > 0 && ` · ${novosEventos} novo${novosEventos > 1 ? 's' : ''}`}
        </Chip>
        <Chip ativo={aba === 'espera'} onClick={() => setParams({ aba: 'espera' }, { replace: true })}>
          Lista de espera · {espera.length}
        </Chip>
      </div>

      {aba === 'eventos' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {eventos.length === 0 && <Cartao className="p-10 text-center text-petroleo-noite/60">Nenhum pedido de evento.</Cartao>}
          {eventos.map((e) => (
            <Cartao key={e.id} className={`p-5 ${e.respondido ? 'opacity-70' : 'ring-2 ring-sol'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-11 shrink-0 rounded-2xl bg-laranja/15 text-laranja grid place-items-center"><PartyPopper className="size-6" /></span>
                  <div className="min-w-0">
                    <p className="font-extrabold truncate">{e.nome}</p>
                    <p className="text-xs text-petroleo-noite/60">{e.telefone} · {formatDistanceToNow(new Date(e.criadoEm), { locale: ptBR, addSuffix: true })}</p>
                  </div>
                </div>
                {e.respondido ? (
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CircleCheck className="size-4" /> Respondido</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-sol px-2 py-0.5 text-[11px] font-extrabold">NOVO</span>
                )}
              </div>
              <p className="mt-3 font-bold text-petroleo">{e.tipo}</p>
              <p className="text-sm text-petroleo-noite/70 flex flex-wrap gap-x-4">
                <span className="inline-flex items-center gap-1 first-letter:uppercase"><CalendarDays className="size-4" /> {fmtDataLonga(dataDeChave(e.data))}</span>
                <span className="inline-flex items-center gap-1"><Users className="size-4" /> {e.pessoas} pessoas</span>
              </p>
              {e.obs && <p className="mt-2 rounded-xl bg-areia-claro p-3 text-sm">{e.obs}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={linkWhatsApp(`Olá, ${e.nome.split(' ')[0]}! Aqui é do Quati Beach Sport, sobre o seu pedido de ${e.tipo.toLowerCase()} para ${fmtDataCurta(dataDeChave(e.data))}.`, whatsDoTelefone(e.telefone))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => set((db) => ({ ...db, eventos: db.eventos.map((x) => (x.id === e.id ? { ...x, respondido: true } : x)) }))}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] text-white px-4 py-2.5 text-sm font-bold"
                >
                  <IconeWhatsApp className="size-4" /> Responder
                </a>
                <button
                  onClick={() => set((db) => ({ ...db, eventos: db.eventos.map((x) => (x.id === e.id ? { ...x, respondido: !x.respondido } : x)) }))}
                  className="rounded-xl border border-petroleo/20 px-4 py-2.5 text-sm font-bold text-petroleo"
                >
                  {e.respondido ? 'Marcar como novo' : 'Marcar respondido'}
                </button>
                <button
                  onClick={() => set((db) => ({ ...db, eventos: db.eventos.filter((x) => x.id !== e.id) }))}
                  className="p-2.5 text-petroleo-noite/40 hover:text-red-600"
                  aria-label="Apagar pedido"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Cartao>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.length === 0 && (
            <Cartao className="p-10 text-center text-petroleo-noite/60">
              Ninguém na lista de espera. No site, o cliente toca num horário ocupado para entrar na fila.
            </Cartao>
          )}
          {grupos.map((fila) => {
            const { data, hora, quadraId } = fila[0]
            const d = dataDeChave(data)
            const status = slotDe(db, d, hora, quadraId).status
            const vagou = status === 'livre'
            return (
              <Cartao key={`${data}|${hora}|${quadraId}`} className={`p-5 ${vagou ? 'ring-2 ring-emerald-400' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold">
                    <span className="capitalize">{fmtDiaSemana(d)}</span> {fmtDataCurta(d)} · {fmtFaixa(hora)} · {quadraPorId(quadraId).nome}
                  </p>
                  {vagou ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-extrabold">
                      <Bell className="size-3.5" /> Vagou! Avise a fila
                    </span>
                  ) : (
                    <span className="rounded-full bg-petroleo/10 px-2.5 py-1 text-xs font-bold text-petroleo-noite/60">Ainda ocupado</span>
                  )}
                </div>
                <ol className="mt-3 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
                  {fila.map((e, i) => (
                    <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="w-6 font-bold text-petroleo-noite/40">{i + 1}º</span>
                      <span className="flex-1 min-w-0">
                        <b className="truncate">{e.nome}</b> <span className="text-xs text-petroleo-noite/60">{e.telefone}</span>
                      </span>
                      <a
                        href={linkWhatsApp(
                          vagou
                            ? `Olá, ${e.nome.split(' ')[0]}! Vagou o horário de ${fmtDataCurta(d)} às ${hora}h na ${quadraPorId(quadraId).nome}. Quer ficar com ele?`
                            : `Olá, ${e.nome.split(' ')[0]}! Você está na lista de espera de ${fmtDataCurta(d)} às ${hora}h. Avisamos se vagar!`,
                          whatsDoTelefone(e.telefone),
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#128c4a] p-1"
                        aria-label={`WhatsApp de ${e.nome}`}
                      >
                        <IconeWhatsApp />
                      </a>
                      <button onClick={() => set((db) => ({ ...db, espera: db.espera.filter((x) => x.id !== e.id) }))} className="p-1 text-petroleo-noite/40 hover:text-red-600" aria-label="Tirar da fila">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ol>
              </Cartao>
            )
          })}
        </div>
      )}
    </>
  )
}
