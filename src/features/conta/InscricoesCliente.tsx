import { Link } from 'react-router-dom'
import { CircleCheck, GraduationCap, Trophy } from 'lucide-react'
import { modalidadePorId, quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { DIAS_SEMANA, dataDeISO, dataISO, fmtDataCurta, fmtDiaSemana, fmtFaixa } from '../../lib/datas'
import { doCliente } from '../../lib/mensagens'
import { linkWhatsApp } from '../../lib/whatsapp'
import { soDigitos } from '../../lib/formatos'
import type { Aula, Pessoa } from '../../tipos'
import { Botao, SeloModalidade, Vazio } from '../../ui'
import { acharProfessor, proximaDataDaAula } from '../aulas/regras'
import { TituloConta } from './TituloConta'

export function TurmasCliente({ turmas, pessoa }: { turmas: Aula[]; pessoa: Pessoa }) {
  const { db } = useDB()
  return (
    <section>
      <TituloConta icone={<GraduationCap />}>Minhas turmas</TituloConta>
      <div className="mt-3 space-y-3">
        {turmas.length === 0 && (
          <Vazio>
            Você ainda não está em nenhuma turma. <Link to="/aulas" className="font-bold text-onda">Ver aulas</Link>
          </Vazio>
        )}
        {turmas.map((a) => {
          const prox = proximaDataDaAula(a)
          return (
            <article key={a.id} className="rounded-2xl bg-white border border-mar/10 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SeloModalidade id={a.modalidade} pequeno />
                  <span className="text-xs font-semibold text-marinho/70">{a.nivel}</span>
                </div>
                <p className="mt-1 font-bold">{DIAS_SEMANA[a.diaSemana]}s, {fmtFaixa(a.hora)}</p>
                <p className="text-sm text-marinho/70">
                  Prof. {acharProfessor(db, a.professorId).nome} · {quadraPorId(a.quadraId).nome}
                </p>
                <p className="text-xs text-onda font-semibold mt-1">Próxima: {fmtDiaSemana(prox)} {fmtDataCurta(prox)}</p>
              </div>
              <Botao
                href={linkWhatsApp(doCliente.avisarFalta(pessoa.nome, modalidadePorId(a.modalidade).nome, a.nivel, dataISO(prox)))}
                variante="secundario"
                tamanho="sm"
                redondo
              >
                Avisar falta
              </Botao>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function TorneiosCliente({ pessoa }: { pessoa: Pessoa }) {
  const { db } = useDB()
  const inscricoes = db.torneios.flatMap((t) => t.duplas.filter((d) => soDigitos(d.telefone) === soDigitos(pessoa.telefone)).map((d) => ({ t, d })))
  return (
    <section>
      <TituloConta icone={<Trophy />}>Torneios</TituloConta>
      <div className="mt-3 space-y-3">
        {inscricoes.length === 0 && (
          <Vazio>
            Nenhuma inscrição. <Link to="/torneios" className="font-bold text-onda">Ver torneios</Link>
          </Vazio>
        )}
        {inscricoes.map(({ t, d }) => (
          <article key={d.id} className="rounded-2xl bg-gradient-to-br from-sol to-laranja p-4 text-marinho">
            <p className="titulo text-2xl">{t.nome}</p>
            <p className="text-sm font-semibold">{fmtDataCurta(dataDeISO(t.data))} · Categoria {d.categoria}</p>
            <p className="text-sm">Dupla: {d.atleta1} & {d.atleta2}</p>
            <p className="mt-1 text-xs font-bold inline-flex items-center gap-1">
              {d.pago ? (
                <>
                  <CircleCheck className="size-4" /> Inscrição paga
                </>
              ) : (
                'Pagamento pendente'
              )}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
