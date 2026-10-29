import { modalidadePorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { fmtHora } from '../../../lib/datas'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { Aula } from '../../../tipos'
import { Botao, IconeWhatsApp, Janela, SeloModalidade } from '../../../ui'
import { acharProfessor } from '../regras'

// Aula vista a partir da agenda: quem é o professor e quem vem, com lembrete por WhatsApp
export function JanelaAlunos({ aula, onFechar }: { aula: Aula; onFechar: () => void }) {
  const { db } = useDB()
  const a = db.aulas.find((x) => x.id === aula.id) ?? aula
  return (
    <Janela onFechar={onFechar} titulo={`${modalidadePorId(a.modalidade).nome} · ${a.nivel}`} etiqueta={<SeloModalidade id={a.modalidade} />}>
      <p className="text-sm text-petroleo-noite/70">
        Prof. {acharProfessor(db, a.professorId).nome} · {fmtHora(a.hora)} · {a.alunos.length}/{a.vagas} alunos
      </p>
      <ul className="mt-4 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10">
        {a.alunos.length === 0 && <li className="p-3 text-sm text-petroleo-noite/60">Nenhum aluno matriculado.</li>}
        {a.alunos.map((p, i) => (
          <li key={`${p.telefone}-${i}`} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 min-w-0">
              <b className="block truncate">{p.nome}</b>
              <span className="text-xs text-petroleo-noite/60">{p.telefone}</span>
            </span>
            <a href={whatsPara(p, doEstabelecimento.lembreteAula(p.nome, a.hora))} target="_blank" rel="noreferrer" className="p-2 text-whatsapp-escuro" aria-label={`WhatsApp de ${p.nome}`}>
              <IconeWhatsApp />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <Botao para={`/admin/aulas?editar=${a.id}`}>Editar turma</Botao>
      </div>
    </Janela>
  )
}
