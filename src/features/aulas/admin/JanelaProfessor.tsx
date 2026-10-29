import { useState } from 'react'
import { CORES_PROFESSOR, MODALIDADES } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { mascaraTelefone } from '../../../lib/formatos'
import { esquemaNome, valido } from '../../../lib/validacao'
import type { ModalidadeId, Professor } from '../../../tipos'
import { AreaTexto, Botao, Campo, Confirmar, Entrada, Janela } from '../../../ui'
import { removerProfessor, salvarProfessor, turmasDoProfessor } from '../regras'

const Rotulo = ({ children }: { children: string }) => <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/70">{children}</span>

export function JanelaProfessor({ professor, onFechar }: { professor: Professor; onFechar: () => void }) {
  const { db, set } = useDB()
  const [f, setF] = useState(professor)
  const ehNovo = !professor.id
  const turmas = turmasDoProfessor(db, professor.id).length
  const pode = valido(esquemaNome, f.nome) && f.modalidades.length > 0

  const alternar = (m: ModalidadeId) =>
    setF((x) => ({ ...x, modalidades: x.modalidades.includes(m) ? x.modalidades.filter((y) => y !== m) : [...x.modalidades, m] }))

  return (
    <Janela onFechar={onFechar} titulo={ehNovo ? 'Novo professor' : 'Editar professor'} largura="sm:max-w-lg">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Nome" compacto className="col-span-2 sm:col-span-1">
            <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="WhatsApp" compacto className="col-span-2 sm:col-span-1">
            <Entrada compacto value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} inputMode="tel" />
          </Campo>
        </div>
        <fieldset>
          <legend><Rotulo>Modalidades</Rotulo></legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {MODALIDADES.map((m) => {
              const marcada = f.modalidades.includes(m.id)
              return (
                <label key={m.id} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold cursor-pointer ${marcada ? 'border-onda bg-onda-claro' : 'border-petroleo/15'}`}>
                  <input type="checkbox" checked={marcada} onChange={() => alternar(m.id)} className="accent-petroleo" /> {m.nome}
                </label>
              )
            })}
          </div>
        </fieldset>
        <Campo rotulo="Destaque (aparece no site)" compacto>
          <Entrada compacto value={f.destaque} onChange={(e) => setF({ ...f, destaque: e.target.value })} placeholder="Ex.: Campeão estadual 2025" />
        </Campo>
        <Campo rotulo="Apresentação" compacto>
          <AreaTexto compacto value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} />
        </Campo>
        <fieldset>
          <legend><Rotulo>Cor do avatar</Rotulo></legend>
          <div className="mt-1 flex gap-2">
            {CORES_PROFESSOR.map((c) => (
              <button
                key={c}
                onClick={() => setF({ ...f, cor: c })}
                aria-pressed={f.cor === c}
                className={`size-9 rounded-full bg-gradient-to-br ${c} ${f.cor === c ? 'ring-4 ring-sol' : ''}`}
                aria-label="Escolher cor"
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        {ehNovo ? (
          <span />
        ) : turmas > 0 ? (
          <p className="text-xs text-petroleo-noite/70 self-center">Tem {turmas} turma(s): troque o professor delas antes de remover.</p>
        ) : (
          <Confirmar
            rotulo="Remover"
            pergunta="Remover?"
            onConfirmar={() => {
              set((db) => removerProfessor(db, professor.id))
              onFechar()
            }}
          />
        )}
        <div className="flex gap-2">
          <Botao variante="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao
            disabled={!pode}
            onClick={() => {
              set((db) => salvarProfessor(db, f))
              onFechar()
            }}
          >
            Salvar
          </Botao>
        </div>
      </div>
    </Janela>
  )
}
