import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { CORES_PROFESSOR, MODALIDADES, type ModalidadeId, type Professor } from '../data/mock'
import { linkWhatsApp, whatsDoTelefone } from '../lib/agenda'
import { novoId, useDB } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { mascaraTelefone } from '../components/ModalReserva'
import { Avatar, Janela, SeloModalidade } from '../components/Pecas'
import { Botao, Campo, Cartao, Confirmar, TituloPagina, classeInput } from './ui'

export default function ProfessoresAdmin() {
  const { db } = useDB()
  const [editando, setEditando] = useState<Professor | null>(null)

  const novo = (): Professor => ({
    id: '',
    nome: '',
    iniciais: '',
    modalidades: ['futevolei'],
    bio: '',
    destaque: '',
    cor: CORES_PROFESSOR[db.professores.length % CORES_PROFESSOR.length],
    telefone: '',
  })

  return (
    <>
      <TituloPagina titulo="Professores" sub={`${db.professores.length} professores na equipe`} acoes={<Botao onClick={() => setEditando(novo())}><Plus className="size-4" /> Novo professor</Botao>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.professores.map((p) => {
          const aulas = db.aulas.filter((a) => a.professorId === p.id)
          const alunos = aulas.reduce((s, a) => s + a.alunos.length, 0)
          return (
            <Cartao key={p.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar professorId={p.id} tamanho="size-14 text-lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-lg truncate">{p.nome}</p>
                  <p className="text-xs text-petroleo-noite/60">{p.telefone}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.modalidades.map((m) => <SeloModalidade key={m} id={m} pequeno />)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-areia-claro py-2"><p className="titulo text-3xl text-petroleo">{aulas.length}</p><p className="text-[11px] text-petroleo-noite/60">turmas/semana</p></div>
                <div className="rounded-xl bg-areia-claro py-2"><p className="titulo text-3xl text-petroleo">{alunos}</p><p className="text-[11px] text-petroleo-noite/60">alunos</p></div>
              </div>
              <div className="mt-3 flex gap-2">
                <Botao tipo="secundario" onClick={() => setEditando(p)}><Pencil className="size-4" /> Editar</Botao>
                {p.telefone && (
                  <a href={linkWhatsApp(`Olá, ${p.nome.split(' ')[0]}!`, whatsDoTelefone(p.telefone))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-[#25d366]/40 px-4 py-2.5 text-sm font-bold text-[#128c4a]">
                    <IconeWhatsApp className="size-4" /> WhatsApp
                  </a>
                )}
              </div>
            </Cartao>
          )
        })}
      </div>

      {editando && <JanelaProfessor professor={editando} onFechar={() => setEditando(null)} />}
    </>
  )
}

function JanelaProfessor({ professor, onFechar }: { professor: Professor; onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState(professor)
  const ehNovo = !professor.id
  const turmas = db.aulas.filter((a) => a.professorId === professor.id).length
  const valido = f.nome.trim().length >= 3 && f.modalidades.length > 0

  const alternar = (m: ModalidadeId) =>
    setF((x) => ({ ...x, modalidades: x.modalidades.includes(m) ? x.modalidades.filter((y) => y !== m) : [...x.modalidades, m] }))

  const salvar = () => {
    const nome = f.nome.trim()
    const partes = nome.split(/\s+/)
    const iniciais = (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
    const pronto = { ...f, nome, iniciais }
    set((db) => ({
      ...db,
      professores: ehNovo ? [...db.professores, { ...pronto, id: novoId() }] : db.professores.map((p) => (p.id === f.id ? pronto : p)),
    }))
    onFechar()
  }

  return (
    <Janela onFechar={onFechar} titulo={ehNovo ? 'Novo professor' : 'Editar professor'} largura="sm:max-w-lg">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Nome" className="col-span-2 sm:col-span-1">
            <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} className={classeInput} />
          </Campo>
          <Campo rotulo="WhatsApp" className="col-span-2 sm:col-span-1">
            <input value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} className={classeInput} inputMode="tel" />
          </Campo>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/60">Modalidades</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {MODALIDADES.map((m) => (
              <label key={m.id} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold cursor-pointer ${f.modalidades.includes(m.id) ? 'border-onda bg-onda-claro' : 'border-petroleo/15'}`}>
                <input type="checkbox" checked={f.modalidades.includes(m.id)} onChange={() => alternar(m.id)} className="accent-petroleo" /> {m.nome}
              </label>
            ))}
          </div>
        </div>
        <Campo rotulo="Destaque (aparece no site)">
          <input value={f.destaque} onChange={(e) => setF({ ...f, destaque: e.target.value })} placeholder="Ex.: Campeão estadual 2025" className={classeInput} />
        </Campo>
        <Campo rotulo="Apresentação">
          <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} className={classeInput} />
        </Campo>
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/60">Cor do avatar</span>
          <div className="mt-1 flex gap-2">
            {CORES_PROFESSOR.map((c) => (
              <button key={c} onClick={() => setF({ ...f, cor: c })} className={`size-9 rounded-full bg-gradient-to-br ${c} ${f.cor === c ? 'ring-4 ring-sol' : ''}`} aria-label="Escolher cor" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {!ehNovo ? (
          turmas > 0 ? (
            <p className="text-xs text-petroleo-noite/60 self-center">Tem {turmas} turma(s): troque o professor delas antes de remover.</p>
          ) : (
            <Confirmar
              rotulo="Remover"
              pergunta="Remover?"
              onConfirmar={() => {
                set((db) => ({ ...db, professores: db.professores.filter((p) => p.id !== professor.id) }))
                onFechar()
              }}
            />
          )
        ) : <span />}
        <div className="flex gap-2">
          <Botao tipo="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={!valido}>Salvar</Botao>
        </div>
      </div>
    </Janela>
  )
}
