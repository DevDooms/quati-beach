import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useOcultarValores } from '../../../admin/useOcultarValores'
import { useDB } from '../../../lib/banco'
import { fmtReais, mascaraTelefone } from '../../../lib/formatos'
import { doEstabelecimento } from '../../../lib/mensagens'
import { esquemaNome, valido } from '../../../lib/validacao'
import { whatsPara } from '../../../lib/whatsapp'
import type { Torneio } from '../../../tipos'
import { Botao, Cartao, Chip, Entrada, IconeWhatsApp, SeloPago } from '../../../ui'
import { alternarPagoDupla, arrecadacao, duplasDaCategoria, inscreverDupla, removerDupla, vagasNaCategoria } from '../regras'

const VAZIA = { atleta1: '', atleta2: '', telefone: '' }

export function Inscricoes({ torneio: t }: { torneio: Torneio }) {
  const { set } = useDB()
  const { valor } = useOcultarValores()
  const [cat, setCat] = useState(t.categorias[0] ?? '')
  const [nova, setNova] = useState(VAZIA)
  const categoria = t.categorias.includes(cat) ? cat : (t.categorias[0] ?? '')
  const duplas = duplasDaCategoria(t, categoria)
  const { recebido, previsto } = arrecadacao(t)

  return (
    <Cartao className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="titulo text-3xl text-mar">Inscrições</h2>
        <p className="text-sm text-marinho/70">
          {t.duplas.length} duplas · <b className="text-emerald-700">{valor(fmtReais(recebido))}</b> recebido de {valor(fmtReais(previsto))}
        </p>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto sem-scrollbar">
        {t.categorias.map((c) => (
          <Chip key={c} ativo={c === categoria} onClick={() => setCat(c)}>
            {c} · {duplasDaCategoria(t, c).length}/{t.vagasPorCategoria}
          </Chip>
        ))}
      </div>

      <ol className="mt-4 divide-y divide-mar/10 rounded-2xl border border-mar/10">
        {duplas.length === 0 && <li className="p-4 text-sm text-marinho/70">Nenhuma dupla nesta categoria.</li>}
        {duplas.map((d, i) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-6 text-marinho/70 font-bold">{i + 1}</span>
            <span className="flex-1 min-w-40">
              <b>{d.atleta1}</b> & <b>{d.atleta2}</b>
              <span className="block text-xs text-marinho/70">{d.telefone}</span>
            </span>
            <SeloPago pago={d.pago} onClick={() => set((db) => alternarPagoDupla(db, t.id, d.id))} />
            <a href={whatsPara(d, doEstabelecimento.inscricaoTorneio(d.atleta1, t.nome))} target="_blank" rel="noreferrer" className="text-whatsapp-escuro" aria-label="WhatsApp">
              <IconeWhatsApp />
            </a>
            <button onClick={() => set((db) => removerDupla(db, t.id, d.id))} className="p-1 text-marinho/70 hover:text-red-600" aria-label="Remover dupla">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ol>

      {categoria && (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valido(esquemaNome, nova.atleta1)) return
            set((db) => inscreverDupla(db, t.id, { ...nova, categoria, pago: false }))
            setNova(VAZIA)
          }}
        >
          <Entrada compacto value={nova.atleta1} onChange={(e) => setNova({ ...nova, atleta1: e.target.value })} placeholder="Atleta 1" />
          <Entrada compacto value={nova.atleta2} onChange={(e) => setNova({ ...nova, atleta2: e.target.value })} placeholder="Atleta 2" />
          <Entrada compacto value={nova.telefone} onChange={(e) => setNova({ ...nova, telefone: mascaraTelefone(e.target.value) })} placeholder="WhatsApp" />
          <Botao type="submit" disabled={vagasNaCategoria(t, categoria) === 0}><Plus className="size-4" /> Adicionar</Botao>
        </form>
      )}
    </Cartao>
  )
}
