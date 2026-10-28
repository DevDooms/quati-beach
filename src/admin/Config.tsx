import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { DIAS_SEMANA, ORDEM_DIAS, fmtReais } from '../lib/agenda'
import { useDB, type Modulos } from '../lib/store'
import { IconeWhatsApp } from '../components/Icones'
import { Botao, Campo, Cartao, TituloPagina, classeInput } from './ui'

const MODULOS: { id: keyof Modulos; nome: string; descricao: string }[] = [
  { id: 'aulas', nome: 'Aulas e professores', descricao: 'Grade de aulas, planos mensais e página de professores.' },
  { id: 'torneios', nome: 'Torneios', descricao: 'Página do torneio com inscrição de duplas.' },
  { id: 'bar', nome: 'Cardápio do bar', descricao: 'Página com porções, lanches e bebidas.' },
  { id: 'eventos', nome: 'Eventos', descricao: 'Formulário de orçamento para festas e empresas.' },
]

export default function Config() {
  const { db, set, resetar } = useDB()
  const [precos, setPrecos] = useState(db.precos)
  const [func, setFunc] = useState(db.funcionamento)
  const [modulos, setModulos] = useState(db.modulos)
  const [planos, setPlanos] = useState(db.planos)
  const [resetado, setResetado] = useState(false)
  const alterado =
    JSON.stringify([precos, func, modulos, planos]) !== JSON.stringify([db.precos, db.funcionamento, db.modulos, db.planos])
  const horas = Array.from({ length: 19 }, (_, i) => i + 5)

  return (
    <>
      <TituloPagina
        titulo="Configurações"
        sub="Preços e horários usados no site e na agenda."
        acoes={
          <Botao onClick={() => set((db) => ({ ...db, precos, funcionamento: func, modulos, planos }))} disabled={!alterado}>
            {alterado ? 'Salvar alterações' : 'Tudo salvo'}
          </Botao>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Cartao className="p-5 xl:col-span-2">
          <h2 className="titulo text-3xl text-petroleo">Módulos do site</h2>
          <p className="text-sm text-petroleo-noite/60">
            Ligue só o que o cliente contratou. Agendamento de quadra está sempre ativo; o resto aparece ou some do menu do site.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MODULOS.map(({ id, nome, descricao }) => {
              const ativo = modulos[id]
              return (
                <label
                  key={id}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition ${ativo ? 'border-onda bg-onda-claro/50' : 'border-petroleo/10 opacity-70'}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <b>{nome}</b>
                    <input type="checkbox" checked={ativo} onChange={() => setModulos({ ...modulos, [id]: !ativo })} className="accent-petroleo size-5" />
                  </span>
                  <span className="block mt-1 text-xs text-petroleo-noite/60">{descricao}</span>
                </label>
              )
            })}
          </div>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo">Planos de aula</h2>
          <div className="mt-3 space-y-3">
            {planos.map((pl, i) => (
              <div key={pl.id} className="grid grid-cols-[1fr_110px] gap-3">
                <Campo rotulo="Plano">
                  <input value={pl.nome} onChange={(e) => setPlanos(planos.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} className={classeInput} />
                </Campo>
                <Campo rotulo="R$ / mês">
                  <input type="number" min={0} value={pl.preco} onChange={(e) => setPlanos(planos.map((x, j) => (j === i ? { ...x, preco: Number(e.target.value) } : x)))} className={classeInput} />
                </Campo>
              </div>
            ))}
          </div>
        </Cartao>
        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo">Preço da hora</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Campo rotulo="Seg–Sex até 17h">
              <input type="number" min={0} value={precos.normal} onChange={(e) => setPrecos({ ...precos, normal: Number(e.target.value) })} className={classeInput} />
            </Campo>
            <Campo rotulo="Após 17h e fim de semana">
              <input type="number" min={0} value={precos.pico} onChange={(e) => setPrecos({ ...precos, pico: Number(e.target.value) })} className={classeInput} />
            </Campo>
          </div>
          <p className="mt-3 text-xs text-petroleo-noite/60">No site: {fmtReais(precos.normal)} no horário normal e {fmtReais(precos.pico)} no horário de pico.</p>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo">Horário de funcionamento</h2>
          <div className="mt-3 space-y-2">
            {ORDEM_DIAS.map((d) => (
              <div key={d} className="grid grid-cols-[100px_1fr_auto_1fr] items-center gap-2 text-sm">
                <span className="font-semibold">{DIAS_SEMANA[d]}</span>
                <select value={func[d][0]} onChange={(e) => setFunc({ ...func, [d]: [Number(e.target.value), func[d][1]] })} className={`${classeInput} !mt-0`} aria-label={`Abre ${DIAS_SEMANA[d]}`}>
                  {horas.map((h) => <option key={h} value={h}>{h}h</option>)}
                </select>
                <span className="text-petroleo-noite/50">às</span>
                <select value={func[d][1]} onChange={(e) => setFunc({ ...func, [d]: [func[d][0], Number(e.target.value)] })} className={`${classeInput} !mt-0`} aria-label={`Fecha ${DIAS_SEMANA[d]}`}>
                  {horas.filter((h) => h > func[d][0]).map((h) => <option key={h} value={h}>{h}h</option>)}
                </select>
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo flex items-center gap-2"><IconeWhatsApp className="size-6 text-[#128c4a]" /> Bot de WhatsApp</h2>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            Em breve: o cliente manda mensagem, o bot mostra os horários livres, confirma a reserva e ela aparece direto na agenda deste painel. Lembretes automáticos 2h antes do jogo.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold">Próxima etapa do projeto</div>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="titulo text-3xl text-petroleo">Dados de demonstração</h2>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            Volta tudo ao estado inicial: reservas de exemplo, grade de aulas, professores, torneio, preços e horários.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Botao
              tipo="secundario"
              onClick={() => {
                resetar()
                setResetado(true)
                setTimeout(() => location.reload(), 600)
              }}
            >
              <RotateCcw className="size-4" /> Restaurar dados de exemplo
            </Botao>
            {resetado && <span className="text-sm text-emerald-700 font-semibold">Restaurado!</span>}
          </div>
        </Cartao>
      </div>
    </>
  )
}
