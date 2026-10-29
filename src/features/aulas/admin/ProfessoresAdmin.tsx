import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { CORES_PROFESSOR } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { Professor } from '../../../tipos'
import { Avatar, Botao, Cartao, IconeWhatsApp, MiniNumero, SeloModalidade, TituloPagina } from '../../../ui'
import { turmasDoProfessor } from '../regras'
import { JanelaProfessor } from './JanelaProfessor'

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
      <TituloPagina
        titulo="Professores"
        sub={`${db.professores.length} professores na equipe`}
        acoes={<Botao onClick={() => setEditando(novo())}><Plus className="size-4" /> Novo professor</Botao>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.professores.map((p) => {
          const turmas = turmasDoProfessor(db, p.id)
          return (
            <Cartao key={p.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar professor={p} tamanho="size-14 text-lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-lg truncate">{p.nome}</p>
                  <p className="text-xs text-marinho/70">{p.telefone}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.modalidades.map((m) => <SeloModalidade key={m} id={m} pequeno />)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniNumero valor={turmas.length} rotulo="turmas/semana" />
                <MiniNumero valor={turmas.reduce((s, a) => s + a.alunos.length, 0)} rotulo="alunos" />
              </div>
              <div className="mt-3 flex gap-2">
                <Botao variante="secundario" onClick={() => setEditando(p)}><Pencil className="size-4" /> Editar</Botao>
                {p.telefone && (
                  <Botao href={whatsPara(p, doEstabelecimento.professor(p.nome))} variante="whatsapp-contorno">
                    <IconeWhatsApp className="size-4" /> WhatsApp
                  </Botao>
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
