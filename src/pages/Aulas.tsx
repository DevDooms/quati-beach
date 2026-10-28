import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, X } from 'lucide-react'
import { MODALIDADES, NIVEIS, modalidadePorId, quadraPorId } from '../data/mock'
import { DIAS_CURTOS, DIAS_SEMANA, ORDEM_DIAS, fmtDataCurta, fmtDataLonga, fmtFaixa, fmtHora, proximaDataDaAula } from '../lib/agenda'
import { acharProfessor, useDB } from '../lib/store'
import ModalReserva from '../components/ModalReserva'
import { CabecalhoPagina, CartaoAula, Chip, SeloModalidade } from '../components/Pecas'

export default function Aulas() {
  const { db, set } = useDB()
  const [params, setParams] = useSearchParams()
  const modalidade = params.get('modalidade') ?? ''
  const professor = params.get('professor') ?? ''
  const nivel = params.get('nivel') ?? ''
  const [visao, setVisao] = useState<'dia' | 'semana'>('dia')
  const [dia, setDia] = useState(new Date().getDay())
  const [aulaId, setAulaId] = useState<string | null>(null)

  const filtrar = (chave: string, valor: string) => {
    if (valor) params.set(chave, valor)
    else params.delete(chave)
    setParams(params, { replace: true })
  }

  const filtradas = db.aulas
    .filter((a) => (!modalidade || a.modalidade === modalidade) && (!professor || a.professorId === professor) && (!nivel || a.nivel === nivel))
    .sort((a, b) => a.hora - b.hora)
  const temFiltro = modalidade || professor || nivel
  const doDia = filtradas.filter((a) => a.diaSemana === dia)
  const horasSemana = [...new Set(filtradas.map((a) => a.hora))].sort((a, b) => a - b)

  const aula = db.aulas.find((a) => a.id === aulaId)
  const dataAula = aula ? proximaDataDaAula(aula.diaSemana, aula.hora) : null
  const lotada = aula ? aula.alunos.length >= aula.vagas : false

  return (
    <>
      <CabecalhoPagina sobre="Grade semanal" titulo={<>Aulas e <span className="text-sol">turmas</span></>}>
        Do primeiro toque na bola ao avançado. Escolha a modalidade, o nível e o professor — a primeira aula é experimental.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl bg-white border border-petroleo/10 p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto sem-scrollbar">
            <Chip ativo={!modalidade} onClick={() => filtrar('modalidade', '')}>Todas</Chip>
            {MODALIDADES.map((m) => (
              <Chip key={m.id} ativo={modalidade === m.id} onClick={() => filtrar('modalidade', m.id)}>{m.nome}</Chip>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <select value={nivel} onChange={(e) => filtrar('nivel', e.target.value)} className="rounded-xl border border-petroleo/15 bg-white px-3 py-2.5 text-sm font-medium" aria-label="Nível">
              <option value="">Todos os níveis</option>
              {NIVEIS.map((n) => <option key={n}>{n}</option>)}
            </select>
            <select value={professor} onChange={(e) => filtrar('professor', e.target.value)} className="rounded-xl border border-petroleo/15 bg-white px-3 py-2.5 text-sm font-medium" aria-label="Professor">
              <option value="">Todos os professores</option>
              {db.professores.map((p) => <option key={p.id} value={p.id}>Prof. {p.nome}</option>)}
            </select>
            <div className="flex rounded-xl border border-petroleo/15 p-1 text-sm font-semibold">
              <button onClick={() => setVisao('dia')} className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 ${visao === 'dia' ? 'bg-petroleo text-white' : ''}`}>
                <List className="size-4" /> Por dia
              </button>
              <button onClick={() => setVisao('semana')} className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 ${visao === 'semana' ? 'bg-petroleo text-white' : ''}`}>
                <LayoutGrid className="size-4" /> Semana
              </button>
            </div>
          </div>
          {temFiltro && (
            <button onClick={() => setParams({}, { replace: true })} className="text-sm text-onda font-semibold inline-flex items-center gap-1">
              <X className="size-4" /> Limpar filtros
            </button>
          )}
        </div>

        {visao === 'dia' ? (
          <>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {ORDEM_DIAS.map((d) => {
                const qtd = filtradas.filter((a) => a.diaSemana === d).length
                return (
                  <button
                    key={d}
                    onClick={() => setDia(d)}
                    className={`rounded-xl py-2 text-center border transition ${dia === d ? 'bg-petroleo text-white border-petroleo' : 'bg-white border-petroleo/10 hover:border-onda'}`}
                  >
                    <span className="block text-sm font-bold">{DIAS_CURTOS[d]}</span>
                    <span className={`block text-[11px] ${dia === d ? 'text-sol' : 'text-petroleo-noite/50'}`}>{qtd} aula{qtd !== 1 && 's'}</span>
                  </button>
                )
              })}
            </div>

            <h2 className="titulo text-3xl text-petroleo mt-6">{DIAS_SEMANA[dia]}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {doDia.map((a) => <CartaoAula key={a.id} aula={a} onParticipar={() => setAulaId(a.id)} />)}
            </div>
            {doDia.length === 0 && (
              <p className="mt-3 rounded-2xl bg-white border border-dashed border-petroleo/20 p-8 text-center text-petroleo-noite/60">
                Nenhuma aula neste dia com esses filtros. Que tal reservar uma quadra e jogar com a galera?
              </p>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-2xl bg-white border border-petroleo/10 overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-petroleo-noite text-white">
                  <th className="w-16 py-3" />
                  {ORDEM_DIAS.map((d) => (
                    <th key={d} className={`py-3 titulo text-xl font-normal ${d === new Date().getDay() ? 'text-sol' : ''}`}>{DIAS_CURTOS[d]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horasSemana.map((h) => (
                  <tr key={h} className="border-t border-petroleo/10 align-top">
                    <td className="py-2 text-center font-bold text-petroleo-noite/70">{fmtHora(h)}</td>
                    {ORDEM_DIAS.map((d) => (
                      <td key={d} className="p-1 border-l border-petroleo/10 space-y-1">
                        {filtradas
                          .filter((a) => a.diaSemana === d && a.hora === h)
                          .map((a) => <CartaoAula key={a.id} aula={a} compacto onParticipar={() => setAulaId(a.id)} />)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {horasSemana.length === 0 && <p className="p-8 text-center text-petroleo-noite/60">Nenhuma aula com esses filtros.</p>}
          </div>
        )}
      </div>

      {aula && dataAula && (
        <ModalReserva
          onFechar={() => setAulaId(null)}
          titulo={lotada ? 'Lista de espera' : 'Aula experimental'}
          etiqueta={<SeloModalidade id={aula.modalidade} />}
          detalhes={[
            { rotulo: 'Turma', valor: aula.nivel },
            { rotulo: 'Professor', valor: acharProfessor(db, aula.professorId).nome },
            { rotulo: 'Próxima aula', valor: fmtDataLonga(dataAula) },
            { rotulo: 'Horário', valor: fmtFaixa(aula.hora) },
            { rotulo: 'Local', valor: quadraPorId(aula.quadraId).nome },
          ]}
          preco="Grátis (1ª aula)"
          textoConfirmar={lotada ? 'Entrar na lista de espera' : 'Garantir minha vaga'}
          textoSucesso={lotada ? 'Você está na lista!' : 'Vaga garantida!'}
          mensagemWhatsApp={(nome) =>
            `Olá! ${nome ? `Sou ${nome} e ` : ''}quero fazer uma aula experimental de ${modalidadePorId(aula.modalidade).nome} (${aula.nivel}) com o prof. ${acharProfessor(db, aula.professorId).nome.split(' ')[0]} no dia ${fmtDataCurta(dataAula)} às ${fmtHora(aula.hora)}.`
          }
          onConfirmar={(nome, telefone) => {
            if (lotada) return
            set((db) => ({ ...db, aulas: db.aulas.map((a) => (a.id === aula.id ? { ...a, alunos: [...a.alunos, { nome, telefone }] } : a)) }))
          }}
        />
      )}
    </>
  )
}
