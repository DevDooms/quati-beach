import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { type Dupla, type Torneio } from '../data/mock'
import { dataDeChave, fmtDataCurta, fmtReais, linkWhatsApp, whatsDoTelefone } from '../lib/agenda'
import { novoId, useDB } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { mascaraTelefone } from '../components/ModalReserva'
import { Chip } from '../components/Pecas'
import { Botao, Campo, Cartao, Confirmar, SeloPago, TituloPagina, classeInput } from './ui'

export default function TorneiosAdmin() {
  const { db, set } = useDB()
  const [selId, setSelId] = useState(db.torneios[0]?.id ?? '')
  const t = db.torneios.find((x) => x.id === selId)

  const criar = () => {
    const id = novoId()
    set((db) => ({
      ...db,
      torneios: [
        ...db.torneios,
        { id, nome: 'Novo torneio', data: '2027-03-06', horario: 'a partir das 8h', categorias: ['Iniciante', 'Intermediário'], valor: 120, vagasPorCategoria: 12, premiacao: 'Troféu para os 3 primeiros', duplas: [] },
      ],
    }))
    setSelId(id)
  }

  return (
    <>
      <TituloPagina titulo="Torneios" sub="O próximo torneio aparece automaticamente na página inicial e na página de torneios." acoes={<Botao onClick={criar}><Plus className="size-4" /> Novo torneio</Botao>} />

      <div className="flex gap-2 overflow-x-auto sem-scrollbar mb-4">
        {db.torneios.map((x) => (
          <Chip key={x.id} ativo={x.id === selId} onClick={() => setSelId(x.id)}>
            {x.nome} · {fmtDataCurta(dataDeChave(x.data))}
          </Chip>
        ))}
      </div>

      {!t ? (
        <Cartao className="p-10 text-center text-petroleo-noite/60">Nenhum torneio cadastrado.</Cartao>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <FormTorneio key={t.id} torneio={t} onExcluir={() => setSelId(db.torneios.find((x) => x.id !== t.id)?.id ?? '')} />
          <Inscricoes torneio={t} />
        </div>
      )}
    </>
  )
}

function FormTorneio({ torneio, onExcluir }: { torneio: Torneio; onExcluir: () => void }) {
  const { set } = useDB()
  const [f, setF] = useState({ ...torneio, categoriasTexto: torneio.categorias.join(', ') })
  const salvo = JSON.stringify({ ...torneio, categoriasTexto: torneio.categorias.join(', ') }) === JSON.stringify(f)

  const salvar = () => {
    const { categoriasTexto, ...resto } = f
    const categorias = categoriasTexto.split(',').map((c) => c.trim()).filter(Boolean)
    set((db) => ({ ...db, torneios: db.torneios.map((x) => (x.id === torneio.id ? { ...resto, categorias, duplas: x.duplas } : x)) }))
  }

  return (
    <Cartao className="p-5 space-y-3 self-start">
      <h2 className="titulo text-3xl text-petroleo">Dados do torneio</h2>
      <Campo rotulo="Nome">
        <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={classeInput} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data">
          <input type="date" value={f.data} onChange={(e) => e.target.value && setF({ ...f, data: e.target.value })} className={classeInput} />
        </Campo>
        <Campo rotulo="Horário">
          <input value={f.horario} onChange={(e) => setF({ ...f, horario: e.target.value })} className={classeInput} />
        </Campo>
        <Campo rotulo="Valor por atleta (R$)">
          <input type="number" min={0} value={f.valor} onChange={(e) => setF({ ...f, valor: Number(e.target.value) })} className={classeInput} />
        </Campo>
        <Campo rotulo="Duplas por categoria">
          <input type="number" min={1} value={f.vagasPorCategoria} onChange={(e) => setF({ ...f, vagasPorCategoria: Number(e.target.value) })} className={classeInput} />
        </Campo>
      </div>
      <Campo rotulo="Categorias (separadas por vírgula)">
        <input value={f.categoriasTexto} onChange={(e) => setF({ ...f, categoriasTexto: e.target.value })} className={classeInput} />
      </Campo>
      <Campo rotulo="Premiação">
        <textarea value={f.premiacao} onChange={(e) => setF({ ...f, premiacao: e.target.value })} rows={2} className={classeInput} />
      </Campo>
      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <Confirmar
          rotulo="Excluir"
          pergunta="Excluir torneio?"
          onConfirmar={() => {
            set((db) => ({ ...db, torneios: db.torneios.filter((x) => x.id !== torneio.id) }))
            onExcluir()
          }}
        />
        <Botao onClick={salvar} disabled={salvo}>{salvo ? 'Salvo' : 'Salvar alterações'}</Botao>
      </div>
    </Cartao>
  )
}

function Inscricoes({ torneio: t }: { torneio: Torneio }) {
  const { set } = useDB()
  const [cat, setCat] = useState(t.categorias[0] ?? '')
  const [nova, setNova] = useState({ atleta1: '', atleta2: '', telefone: '' })
  const categoria = t.categorias.includes(cat) ? cat : t.categorias[0] ?? ''
  const duplas = t.duplas.filter((d) => d.categoria === categoria)
  const arrecadado = t.duplas.filter((d) => d.pago).length * t.valor * 2
  const previsto = t.duplas.length * t.valor * 2

  const mudarDuplas = (fn: (d: Dupla[]) => Dupla[]) =>
    set((db) => ({ ...db, torneios: db.torneios.map((x) => (x.id === t.id ? { ...x, duplas: fn(x.duplas) } : x)) }))

  return (
    <Cartao className="p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="titulo text-3xl text-petroleo">Inscrições</h2>
        <p className="text-sm text-petroleo-noite/60">
          {t.duplas.length} duplas · <b className="text-emerald-700">{fmtReais(arrecadado)}</b> recebido de {fmtReais(previsto)}
        </p>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto sem-scrollbar">
        {t.categorias.map((c) => {
          const qtd = t.duplas.filter((d) => d.categoria === c).length
          return <Chip key={c} ativo={c === categoria} onClick={() => setCat(c)}>{c} · {qtd}/{t.vagasPorCategoria}</Chip>
        })}
      </div>

      <ul className="mt-4 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
        {duplas.length === 0 && <li className="p-4 text-sm text-petroleo-noite/60">Nenhuma dupla nesta categoria.</li>}
        {duplas.map((d, i) => (
          <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-6 text-petroleo-noite/40 font-bold">{i + 1}</span>
            <span className="flex-1 min-w-40">
              <b>{d.atleta1}</b> & <b>{d.atleta2}</b>
              <span className="block text-xs text-petroleo-noite/60">{d.telefone}</span>
            </span>
            <SeloPago pago={d.pago} onClick={() => mudarDuplas((ds) => ds.map((x) => (x.id === d.id ? { ...x, pago: !x.pago } : x)))} />
            <a href={linkWhatsApp(`Olá, ${d.atleta1.split(' ')[0]}! Aqui é do Quati Beach Sport, sobre a inscrição no ${t.nome}.`, whatsDoTelefone(d.telefone))} target="_blank" rel="noreferrer" className="text-[#128c4a]" aria-label="WhatsApp">
              <IconeWhatsApp />
            </a>
            <button onClick={() => mudarDuplas((ds) => ds.filter((x) => x.id !== d.id))} className="p-1 text-petroleo-noite/40 hover:text-red-600" aria-label="Remover dupla">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {categoria && (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            if (nova.atleta1.trim().length < 2) return
            mudarDuplas((ds) => [...ds, { id: novoId(), categoria, atleta1: nova.atleta1.trim(), atleta2: nova.atleta2.trim() || 'A definir', telefone: nova.telefone, pago: false }])
            setNova({ atleta1: '', atleta2: '', telefone: '' })
          }}
        >
          <input value={nova.atleta1} onChange={(e) => setNova({ ...nova, atleta1: e.target.value })} placeholder="Atleta 1" className={`${classeInput} !mt-0`} />
          <input value={nova.atleta2} onChange={(e) => setNova({ ...nova, atleta2: e.target.value })} placeholder="Atleta 2" className={`${classeInput} !mt-0`} />
          <input value={nova.telefone} onChange={(e) => setNova({ ...nova, telefone: mascaraTelefone(e.target.value) })} placeholder="WhatsApp" className={`${classeInput} !mt-0`} />
          <Botao type="submit" disabled={duplas.length >= t.vagasPorCategoria}><Plus className="size-4" /> Adicionar</Botao>
        </form>
      )}
    </Cartao>
  )
}
