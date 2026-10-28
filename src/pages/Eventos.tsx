import { useState } from 'react'
import { CircleCheck, Music, PartyPopper, Trophy, UtensilsCrossed } from 'lucide-react'
import { TIPOS_EVENTO } from '../data/mock'
import { chaveData } from '../lib/agenda'
import { novoId, useDB } from '../lib/store'
import { CabecalhoPagina } from '../components/Pecas'
import { classeCampo, mascaraTelefone } from '../components/ModalReserva'

const DESTAQUES = [
  { icone: PartyPopper, titulo: 'Quadras exclusivas', texto: 'Uma ou as duas quadras só para o seu grupo, no horário que combinar.' },
  { icone: UtensilsCrossed, titulo: 'Bar e porções', texto: 'Pacotes de porções e bebidas para a turma toda, servidos na mesa.' },
  { icone: Trophy, titulo: 'Torneio organizado', texto: 'Montamos chaves, arbitragem e premiação para o seu torneio entre amigos.' },
  { icone: Music, titulo: 'Clima de praia', texto: 'Área de mesas, som ambiente e iluminação para ir até a noite.' },
]

export default function Eventos() {
  const { set } = useDB()
  const [f, setF] = useState({ nome: '', telefone: '', tipo: TIPOS_EVENTO[0], data: '', pessoas: 20, obs: '' })
  const [enviado, setEnviado] = useState(false)
  const valido = f.nome.trim().length >= 2 && f.telefone.replace(/\D/g, '').length >= 10 && !!f.data

  return (
    <>
      <CabecalhoPagina sobre="Eventos e aniversários" titulo={<>Sua festa <span className="text-sol">na areia</span></>}>
        Aniversários, confraternizações de empresa e torneios entre amigos. Conte o que você imagina e a gente monta a proposta.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4 sm:grid-cols-2 self-start">
          {DESTAQUES.map(({ icone: Icone, titulo, texto }) => (
            <div key={titulo} className="rounded-3xl bg-white border border-petroleo/10 p-6">
              <Icone className="size-8 text-laranja" />
              <h2 className="titulo text-3xl text-petroleo mt-3">{titulo}</h2>
              <p className="text-sm text-petroleo-noite/70 mt-1">{texto}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white border border-petroleo/10 p-6 shadow-lg self-start">
          {enviado ? (
            <div className="text-center py-6">
              <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
              <h2 className="titulo text-4xl text-petroleo mt-3">Pedido enviado!</h2>
              <p className="mt-2 text-sm text-petroleo-noite/70">A equipe do Quati vai te chamar no WhatsApp com a proposta.</p>
              <button onClick={() => setEnviado(false)} className="mt-5 rounded-full border border-petroleo/20 px-5 py-2.5 font-semibold">
                Enviar outro pedido
              </button>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!valido) return
                set((db) => ({
                  ...db,
                  eventos: [...db.eventos, { id: novoId(), ...f, nome: f.nome.trim(), criadoEm: new Date().toISOString(), respondido: false }],
                }))
                setEnviado(true)
              }}
            >
              <h2 className="titulo text-4xl text-petroleo">Pedir orçamento</h2>
              <label className="block">
                <span className="text-sm font-semibold">Seu nome</span>
                <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={classeCampo} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">WhatsApp</span>
                <input value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} inputMode="tel" placeholder="(11) 99999-9999" className={classeCampo} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Tipo de evento</span>
                <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={classeCampo}>
                  {TIPOS_EVENTO.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Data</span>
                  <input type="date" min={chaveData(new Date())} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} className={classeCampo} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Pessoas</span>
                  <input type="number" min={2} max={300} value={f.pessoas} onChange={(e) => setF({ ...f, pessoas: Number(e.target.value) })} className={classeCampo} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Conte um pouco mais</span>
                <textarea value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} rows={3} placeholder="Horário, se quer bar, torneio…" className={classeCampo} />
              </label>
              <button type="submit" disabled={!valido} className="w-full rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold disabled:opacity-40">
                Enviar pedido
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
