// Ajustes salvos de uma vez (botão "Salvar"): módulos, regras, preços, planos e funcionamento
import { useState } from 'react'
import { useDB } from '../../lib/banco'
import { DIAS_SEMANA, ORDEM_DIAS, dataDeISO, fmtDataCurta, fmtDuracao, fmtHora } from '../../lib/datas'
import { fmtReais } from '../../lib/formatos'
import type { DB, Modulos } from '../../tipos'
import { Aviso, Botao, Campo, Entrada, IconeWhatsApp, Selecao, TituloPagina } from '../../ui'
import { reservasForaDoHorario } from '../../features/reservas/agenda'
import { HORAS_CHEIAS, Secao } from './Secao'

const MODULOS: { id: keyof Modulos; nome: string; descricao: string }[] = [
  { id: 'aulas', nome: 'Aulas e professores', descricao: 'Grade de aulas, planos mensais e página de professores.' },
  { id: 'torneios', nome: 'Torneios', descricao: 'Página do torneio com inscrição de duplas.' },
  { id: 'bar', nome: 'Cardápio do bar', descricao: 'Página com porções, lanches e bebidas.' },
  { id: 'eventos', nome: 'Eventos', descricao: 'Formulário de orçamento para festas e empresas.' },
  { id: 'pacotes', nome: 'Pacotes de horas', descricao: 'Vender horas antecipadas. Só ligue se vocês já trabalham assim.' },
]

const DURACOES = [1, 1.5, 2]

type Ajustes = Pick<DB, 'precos' | 'funcionamento' | 'modulos' | 'planos' | 'politica'>
const ajustesDe = ({ precos, funcionamento, modulos, planos, politica }: DB): Ajustes => ({ precos, funcionamento, modulos, planos, politica })

export function FormularioAjustes() {
  const { db, set } = useDB()
  const [f, setF] = useState(() => ajustesDe(db))
  const alterado = JSON.stringify(f) !== JSON.stringify(ajustesDe(db))
  const { precos, funcionamento, modulos, planos, politica } = f

  // reservas já marcadas que ficariam fora do horário se salvar assim
  const foraAntes = new Set(reservasForaDoHorario(db).map((r) => r.id))
  const foraDepois = reservasForaDoHorario({ ...db, ...f }).filter((r) => !foraAntes.has(r.id))

  return (
    <>
      <TituloPagina
        titulo="Configurações"
        sub="Como vocês trabalham: horários, preços, regras e o que aparece no site."
        acoes={
          <Botao onClick={() => set((db) => ({ ...db, ...f }))} disabled={!alterado}>
            {alterado ? (foraDepois.length ? 'Salvar mesmo assim' : 'Salvar alterações') : 'Tudo salvo'}
          </Botao>
        }
      />

      {foraDepois.length > 0 && (
        <div className="mb-4" role="alert">
          <Aviso>
            Com esse horário, {foraDepois.length} reserva(s) já marcada(s) ficam fora do funcionamento (ex.: {foraDepois[0].nome},{' '}
            {fmtDataCurta(dataDeISO(foraDepois[0].data))} às {fmtHora(foraDepois[0].hora)}). Elas continuam valendo e aparecem em vermelho na agenda; avise esses clientes.
          </Aviso>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Secao titulo="Módulos do site" descricao="Ligue só o que o estabelecimento usa. O agendamento de quadra está sempre ativo." className="xl:col-span-2">
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {MODULOS.map(({ id, nome, descricao }) => {
              const ativo = modulos[id]
              return (
                <label key={id} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${ativo ? 'border-onda bg-onda-claro/50' : 'border-mar/10 opacity-75'}`}>
                  <span className="flex items-center justify-between gap-2">
                    <b>{nome}</b>
                    <input type="checkbox" checked={ativo} onChange={() => setF({ ...f, modulos: { ...modulos, [id]: !ativo } })} className="accent-mar size-5" />
                  </span>
                  <span className="block mt-1 text-xs text-marinho/70">{descricao}</span>
                </label>
              )
            })}
          </div>
        </Secao>

        <Secao titulo="Regras de reserva" descricao="Definidas por vocês; o site mostra exatamente isso para o cliente.">
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Campo rotulo="Duração de cada reserva" compacto>
              <Selecao compacto value={politica.duracaoReserva} onChange={(e) => setF({ ...f, politica: { ...politica, duracaoReserva: Number(e.target.value) } })}>
                {DURACOES.map((d) => <option key={d} value={d}>{fmtDuracao(d)}</option>)}
              </Selecao>
            </Campo>
            <Campo rotulo="Cancelar pelo site até" compacto>
              <Selecao compacto value={politica.cancelamentoHoras} onChange={(e) => setF({ ...f, politica: { ...politica, cancelamentoHoras: Number(e.target.value) } })}>
                {[0, 2, 6, 12, 24, 48].map((h) => <option key={h} value={h}>{h === 0 ? 'a hora do jogo' : `${h}h antes`}</option>)}
              </Selecao>
            </Campo>
          </div>
          <p className="mt-2 text-xs text-marinho/70">Mudar a duração vale para as reservas novas; as já marcadas mantêm a duração delas.</p>
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
                {HORAS_CHEIAS.map((h) => <option key={h} value={h}>{h}h</option>)}
              </Selecao>
            </Campo>
          </div>
          <p className="mt-3 text-xs text-marinho/70">
            Seg–Sex: {fmtReais(precos.normal)} até {precos.inicioPico}h e {fmtReais(precos.pico)} depois. Fim de semana: {fmtReais(precos.pico)}. Mudar o preço não altera reservas já feitas.
          </p>
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
                    {HORAS_CHEIAS.map((h) => <option key={h} value={h}>{h}h</option>)}
                  </Selecao>
                  <span className="text-marinho/70">às</span>
                  <Selecao compacto value={fecha} onChange={(e) => mudar([abre, Number(e.target.value)])} aria-label={`Fecha ${DIAS_SEMANA[d]}`}>
                    {HORAS_CHEIAS.filter((h) => h > abre).map((h) => <option key={h} value={h}>{h}h</option>)}
                  </Selecao>
                </div>
              )
            })}
          </div>
        </Secao>

        {modulos.aulas && (
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
        )}

        <Secao titulo={<><IconeWhatsApp className="size-6 text-whatsapp-escuro" /> Bot de WhatsApp</>}>
          <p className="mt-2 text-sm text-marinho/70">
            Em breve: o cliente manda mensagem, o bot mostra os horários livres, confirma a reserva e ela aparece direto na agenda deste painel. Lembretes automáticos antes do jogo.
          </p>
          <div className="mt-3">
            <Aviso>Próxima etapa do projeto</Aviso>
          </div>
        </Secao>
      </div>
    </>
  )
}
