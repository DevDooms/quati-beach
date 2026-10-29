import { useSearchParams } from 'react-router-dom'
import { useDB } from '../../../lib/banco'
import { Chip, TituloPagina } from '../../../ui'
import { esperaFutura } from '../../reservas/regras'
import { pedidosNovos } from '../regras'
import { ListaEspera } from './ListaEspera'
import { ListaPedidos } from './ListaPedidos'

// Caixa de entrada do Quati: pedidos de evento e lista de espera
export default function SolicitacoesAdmin() {
  const { db } = useDB()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'espera' ? 'espera' : 'eventos'
  const novos = pedidosNovos(db).length

  return (
    <>
      <TituloPagina titulo="Solicitações" sub="Pedidos de evento e lista de espera de horários ocupados." />

      <div className="flex gap-2 mb-4 overflow-x-auto sem-scrollbar">
        <Chip ativo={aba === 'eventos'} onClick={() => setParams({}, { replace: true })}>
          Eventos{novos > 0 && ` · ${novos} novo${novos > 1 ? 's' : ''}`}
        </Chip>
        <Chip ativo={aba === 'espera'} onClick={() => setParams({ aba: 'espera' }, { replace: true })}>
          Lista de espera · {esperaFutura(db).length}
        </Chip>
      </div>

      {aba === 'eventos' ? <ListaPedidos /> : <ListaEspera />}
    </>
  )
}
