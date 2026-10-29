import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, X } from 'lucide-react'
import { MODALIDADES, NIVEIS, modalidadePorId, quadraPorId } from '../../config/estabelecimento'
import { useDB } from '../../lib/banco'
import { DIAS_CURTOS, DIAS_SEMANA, ORDEM_DIAS, dataISO, diaDaSemana, fmtDataLonga, fmtFaixa, fmtHora } from '../../lib/datas'
import { doCliente } from '../../lib/mensagens'
import type { Aula, DiaSemana } from '../../tipos'
import { CabecalhoPagina, Cartao, Chip, SeloModalidade, Selecao, Vazio } from '../../ui'
import ModalReserva from '../reservas/modal/ModalReserva'
import { CartaoAula, CartaoAulaCompacto } from './CartaoAula'
import { PlanosAulas } from './PlanosAulas'
import { acharProfessor, estaLotada, matricular, proximaDataDaAula } from './regras'

export default function PaginaAulas() {
  const { db, aplicar } = useDB()
  const [params, setParams] = useSearchParams()
  const filtros = { modalidade: params.get('modalidade') ?? '', professor: params.get('professor') ?? '', nivel: params.get('nivel') ?? '' }
  const [visao, setVisao] = useState<'dia' | 'semana'>('dia')
  const [dia, setDia] = useState<DiaSemana>(diaDaSemana(new Date()))
  const [aulaId, setAulaId] = useState<string | null>(null)

  const filtrar = (chave: keyof typeof filtros, valor: string) => {
    if (valor) params.set(chave, valor)
    else params.delete(chave)
    setParams(params, { replace: true })
  }

  const filtradas = db.aulas
    .filter(
      (a) =>
        (!filtros.modalidade || a.modalidade === filtros.modalidade) &&
        (!filtros.professor || a.professorId === filtros.professor) &&
        (!filtros.nivel || a.nivel === filtros.nivel),
    )
    .sort((a, b) => a.hora - b.hora)
  const aula = db.aulas.find((a) => a.id === aulaId)

  return (
    <>
      <CabecalhoPagina sobre="Grade semanal" titulo={<>Aulas e <span className="text-sol">turmas</span></>}>
        Do primeiro toque na bola ao avançado. Escolha a modalidade, o nível e o professor — a primeira aula é experimental.
      </CabecalhoPagina>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Cartao className="p-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto sem-scrollbar">
            <Chip ativo={!filtros.modalidade} onClick={() => filtrar('modalidade', '')}>Todas</Chip>
            {MODALIDADES.map((m) => (
              <Chip key={m.id} ativo={filtros.modalidade === m.id} onClick={() => filtrar('modalidade', m.id)}>{m.nome}</Chip>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Selecao compacto value={filtros.nivel} onChange={(e) => filtrar('nivel', e.target.value)} aria-label="Nível">
              <option value="">Todos os níveis</option>
              {NIVEIS.map((n) => <option key={n}>{n}</option>)}
            </Selecao>
            <Selecao compacto value={filtros.professor} onChange={(e) => filtrar('professor', e.target.value)} aria-label="Professor">
              <option value="">Todos os professores</option>
              {db.professores.map((p) => <option key={p.id} value={p.id}>Prof. {p.nome}</option>)}
            </Selecao>
            <AlternarVisao visao={visao} onChange={setVisao} />
          </div>
          {(filtros.modalidade || filtros.professor || filtros.nivel) && (
            <button onClick={() => setParams({}, { replace: true })} className="text-sm text-onda font-semibold inline-flex items-center gap-1">
              <X className="size-4" /> Limpar filtros
            </button>
          )}
        </Cartao>

        {visao === 'dia' ? (
          <VisaoDia aulas={filtradas} dia={dia} onDia={setDia} onEscolher={setAulaId} />
        ) : (
          <VisaoSemana aulas={filtradas} onEscolher={setAulaId} />
        )}

        <PlanosAulas />
      </div>

      {aula && <ModalAula aula={aula} onFechar={() => setAulaId(null)} onConfirmar={(p) => aplicar((db) => matricular(db, aula.id, p))} />}
    </>
  )
}

function AlternarVisao({ visao, onChange }: { visao: 'dia' | 'semana'; onChange: (v: 'dia' | 'semana') => void }) {
  const botao = (v: 'dia' | 'semana', icone: ReactNode, texto: string) => (
    <button
      onClick={() => onChange(v)}
      aria-pressed={visao === v}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 ${visao === v ? 'bg-mar text-white' : ''}`}
    >
      {icone} {texto}
    </button>
  )
  return (
    <div className="flex rounded-xl border border-mar/15 p-1 text-sm font-semibold">
      {botao('dia', <List className="size-4" />, 'Por dia')}
      {botao('semana', <LayoutGrid className="size-4" />, 'Semana')}
    </div>
  )
}

function VisaoDia({ aulas, dia, onDia, onEscolher }: { aulas: Aula[]; dia: DiaSemana; onDia: (d: DiaSemana) => void; onEscolher: (id: string) => void }) {
  const { db } = useDB()
  const doDia = aulas.filter((a) => a.diaSemana === dia)
  return (
    <>
      <div className="mt-6 grid grid-cols-7 gap-1.5">
        {ORDEM_DIAS.map((d) => {
          const qtd = aulas.filter((a) => a.diaSemana === d).length
          return (
            <button
              key={d}
              onClick={() => onDia(d)}
              aria-pressed={dia === d}
              className={`rounded-xl py-2 text-center border transition ${dia === d ? 'bg-mar text-white border-mar' : 'bg-white border-mar/10 hover:border-onda'}`}
            >
              <span className="block text-sm font-bold">{DIAS_CURTOS[d]}</span>
              <span className={`block text-[11px] ${dia === d ? 'text-sol' : 'text-marinho/70'}`}>{qtd} aula{qtd !== 1 && 's'}</span>
            </button>
          )
        })}
      </div>
      <h2 className="titulo text-3xl text-mar mt-6">{DIAS_SEMANA[dia]}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {doDia.map((a) => <CartaoAula key={a.id} aula={a} professor={acharProfessor(db, a.professorId)} onParticipar={() => onEscolher(a.id)} />)}
      </div>
      {doDia.length === 0 && (
        <div className="mt-3">
          <Vazio>Nenhuma aula neste dia com esses filtros. Que tal reservar uma quadra e jogar com a galera?</Vazio>
        </div>
      )}
    </>
  )
}

function VisaoSemana({ aulas, onEscolher }: { aulas: Aula[]; onEscolher: (id: string) => void }) {
  const { db } = useDB()
  const horas = [...new Set(aulas.map((a) => a.hora))].sort((a, b) => a - b)
  const hoje = diaDaSemana(new Date())
  return (
    <Cartao className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
        <thead>
          <tr className="bg-marinho text-white">
            <th className="w-16 py-3" />
            {ORDEM_DIAS.map((d) => (
              <th key={d} className={`py-3 titulo text-xl font-normal ${d === hoje ? 'text-sol' : ''}`}>{DIAS_CURTOS[d]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((h) => (
            <tr key={h} className="border-t border-mar/10 align-top">
              <td className="py-2 text-center font-bold text-marinho/70">{fmtHora(h)}</td>
              {ORDEM_DIAS.map((d) => (
                <td key={d} className="p-1 border-l border-mar/10 space-y-1">
                  {aulas
                    .filter((a) => a.diaSemana === d && a.hora === h)
                    .map((a) => <CartaoAulaCompacto key={a.id} aula={a} professor={acharProfessor(db, a.professorId)} onClick={() => onEscolher(a.id)} />)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {horas.length === 0 && <p className="p-8 text-center text-marinho/70">Nenhuma aula com esses filtros.</p>}
    </Cartao>
  )
}

function ModalAula({ aula, onFechar, onConfirmar }: { aula: Aula; onFechar: () => void; onConfirmar: (p: { nome: string; telefone: string }) => string | null }) {
  const { db } = useDB()
  // data e lotação calculadas ao abrir: depois de confirmar, a turma pode lotar com a própria pessoa
  const [data] = useState(() => proximaDataDaAula(aula))
  const [lotada] = useState(() => estaLotada(aula))
  const professor = acharProfessor(db, aula.professorId).nome
  const modalidade = modalidadePorId(aula.modalidade).nome

  return (
    <ModalReserva
      onFechar={onFechar}
      titulo={lotada ? 'Lista de espera' : 'Aula experimental'}
      etiqueta={<SeloModalidade id={aula.modalidade} />}
      detalhes={[
        { rotulo: 'Turma', valor: aula.nivel },
        { rotulo: 'Professor', valor: professor },
        { rotulo: 'Próxima aula', valor: fmtDataLonga(data) },
        { rotulo: 'Horário', valor: fmtFaixa(aula.hora) },
        { rotulo: 'Local', valor: quadraPorId(aula.quadraId).nome },
      ]}
      preco="Grátis (1ª aula)"
      textoConfirmar={lotada ? 'Entrar na lista de espera' : 'Garantir minha vaga'}
      textoSucesso={lotada ? 'Você está na lista!' : 'Vaga garantida!'}
      mensagemWhatsApp={(nome) => doCliente.aulaExperimental(nome, modalidade, aula.nivel, professor, dataISO(data), aula.hora)}
      onConfirmar={(c) => (lotada ? null : onConfirmar(c))}
    />
  )
}
