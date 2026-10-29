import { useState, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useDB } from '../lib/banco'
import { DIAS_SEMANA, ORDEM_DIAS } from '../lib/datas'
import { fmtReais } from '../lib/formatos'
import type { DB, Modulos } from '../tipos'
import { Aviso, Botao, Campo, Cartao, Entrada, IconeWhatsApp, Selecao, TituloPagina } from '../ui'

const MODULOS: { id: keyof Modulos; nome: string; descricao: string }[] = [
  { id: 'aulas', nome: 'Aulas e professores', descricao: 'Grade de aulas, planos mensais e página de professores.' },
  { id: 'torneios', nome: 'Torneios', descricao: 'Página do torneio com inscrição de duplas.' },
  { id: 'bar', nome: 'Cardápio do bar', descricao: 'Página com porções, lanches e bebidas.' },
  { id: 'eventos', nome: 'Eventos', descricao: 'Formulário de orçamento para festas e empresas.' },
]

const HORAS = Array.from({ length: 19 }, (_, i) => i + 5) // 5h às 23h

type Ajustes = Pick<DB, 'precos' | 'funcionamento' | 'modulos' | 'planos'>
const ajustesDe = ({ precos, funcionamento, modulos, planos }: DB): Ajustes => ({ precos, funcionamento, modulos, planos })

export default function Configuracoes() {
  const { resetar } = useDB()
  // muda quando os dados de exemplo são restaurados, para o formulário recomeçar com os valores novos
  const [versao, setVersao] = useState(0)
  const [restaurado, setRestaurado] = useState(false)
  return (
    <>
      <FormularioAjustes key={versao} />
      <Cartao className="p-5 mt-6">
        <h2 className="titulo text-3xl text-petroleo">Dados de demonstração</h2>
        <p className="mt-2 text-sm text-petroleo-noite/70">Volta tudo ao estado inicial: reservas de exemplo, grade de aulas, professores, torneio, preços e horários.</p>
        <div className="mt-3 flex items-center gap-3">
          <Botao
            variante="secundario"
            onClick={() => {
              resetar()
              setVersao((v) => v + 1)
              setRestaurado(true)
            }}
          >
            <RotateCcw className="size-4" /> Restaurar dados de exemplo
          </Botao>
          {restaurado && <span className="text-sm text-emerald-700 font-semibold">Restaurado!</span>}
        </div>
      </Cartao>
    </>
  )
}

function Secao({ titulo, children, className = '' }: { titulo: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Cartao className={`p-5 ${className}`}>
      <h2 className="titulo text-3xl text-petroleo flex items-center gap-2">{titulo}</h2>
      {children}
    </Cartao>
  )
}

function FormularioAjustes() {
  const { db, set } = useDB()
  const [f, setF] = useState(() => ajustesDe(db))
  const alterado = JSON.stringify(f) !== JSON.stringify(ajustesDe(db))
  const { precos, funcionamento, modulos, planos } = f

  return (
    <>
      <TituloPagina
        titulo="Configurações"
        sub="Preços, horários e o que aparece no site."
        acoes={
          <Botao onClick={() => set((db) => ({ ...db, ...f }))} disabled={!alterado}>
            {alterado ? 'Salvar alterações' : 'Tudo salvo'}
          </Botao>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Secao titulo="Módulos do site" className="xl:col-span-2">
          <p className="text-sm text-petroleo-noite/60">Ligue só o que o cliente contratou. Agendamento de quadra está sempre ativo; o resto aparece ou some do menu do site.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MODULOS.map(({ id, nome, descricao }) => {
              const ativo = modulos[id]
              return (
                <label key={id} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${ativo ? 'border-onda bg-onda-claro/50' : 'border-petroleo/10 opacity-70'}`}>
                  <span className="flex items-center justify-between gap-2">
                    <b>{nome}</b>
                    <input type="checkbox" checked={ativo} onChange={() => setF({ ...f, modulos: { ...modulos, [id]: !ativo } })} className="accent-petroleo size-5" />
                  </span>
                  <span className="block mt-1 text-xs text-petroleo-noite/60">{descricao}</span>
                </label>
              )
            })}
          </div>
        </Secao>

        <Secao titulo="Preço da hora">
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Campo rotulo="Normal" compacto>
              <Entrada compacto type="number" min={0} value={precos.normal} onChange={(e) => setF({ ...f, precos: { ...precos, normal: Number(e.target.value) } })} />
            </Campo>
            <Campo rotulo="Pico" compacto>
              <Entrada compacto type="number" min={0} value={precos.pico} onChange={(e) => setF({ ...f, precos: { ...precos, pico: Number(e.target.value) } })} />
            </Campo>
            <Campo rotulo="Pico começa" compacto>
              <Selecao compacto value={precos.inicioPico} onChange={(e) => setF({ ...f, precos: { ...precos, inicioPico: Number(e.target.value) } })}>
                {HORAS.map((h) => <option key={h} value={h}>{h}h</option>)}
              </Selecao>
            </Campo>
          </div>
          <p className="mt-3 text-xs text-petroleo-noite/60">
            Seg–Sex: {fmtReais(precos.normal)} até {precos.inicioPico}h e {fmtReais(precos.pico)} depois. Fim de semana: {fmtReais(precos.pico)} o dia todo.
          </p>
        </Secao>

        <Secao titulo="Planos de aula">
          <div className="mt-3 space-y-3">
            {planos.map((pl, i) => {
              const mudar = (m: Partial<typeof pl>) => setF({ ...f, planos: planos.map((x, j) => (j === i ? { ...x, ...m } : x)) })
              return (
                <div key={pl.id} className="grid grid-cols-[1fr_110px] gap-3">
                  <Campo rotulo="Plano" compacto>
                    <Entrada compacto value={pl.nome} onChange={(e) => mudar({ nome: e.target.value })} />
                  </Campo>
                  <Campo rotulo="R$ / mês" compacto>
                    <Entrada compacto type="number" min={0} value={pl.preco} onChange={(e) => mudar({ preco: Number(e.target.value) })} />
                  </Campo>
                </div>
              )
            })}
          </div>
        </Secao>

        <Secao titulo="Horário de funcionamento">
          <div className="mt-3 space-y-2">
            {ORDEM_DIAS.map((d) => {
              const [abre, fecha] = funcionamento[d]
              const mudar = (novo: [number, number]) => setF({ ...f, funcionamento: { ...funcionamento, [d]: novo } })
              return (
                <div key={d} className="grid grid-cols-[100px_1fr_auto_1fr] items-center gap-2 text-sm">
                  <span className="font-semibold">{DIAS_SEMANA[d]}</span>
                  <Selecao compacto value={abre} onChange={(e) => mudar([Number(e.target.value), Math.max(fecha, Number(e.target.value) + 1)])} aria-label={`Abre ${DIAS_SEMANA[d]}`}>
                    {HORAS.map((h) => <option key={h} value={h}>{h}h</option>)}
                  </Selecao>
                  <span className="text-petroleo-noite/50">às</span>
                  <Selecao compacto value={fecha} onChange={(e) => mudar([abre, Number(e.target.value)])} aria-label={`Fecha ${DIAS_SEMANA[d]}`}>
                    {HORAS.filter((h) => h > abre).map((h) => <option key={h} value={h}>{h}h</option>)}
                  </Selecao>
                </div>
              )
            })}
          </div>
        </Secao>

        <Secao titulo={<><IconeWhatsApp className="size-6 text-whatsapp-escuro" /> Bot de WhatsApp</>}>
          <p className="mt-2 text-sm text-petroleo-noite/70">
            Em breve: o cliente manda mensagem, o bot mostra os horários livres, confirma a reserva e ela aparece direto na agenda deste painel. Lembretes automáticos 2h antes do jogo.
          </p>
          <div className="mt-3">
            <Aviso>Próxima etapa do projeto</Aviso>
          </div>
        </Secao>
      </div>
    </>
  )
}
