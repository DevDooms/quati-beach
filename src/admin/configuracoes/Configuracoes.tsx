import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { Botao, Cartao } from '../../ui'
import { FormularioAjustes } from './FormularioAjustes'
import { SecaoDiasEspeciais } from './SecaoDiasEspeciais'
import { SecaoPacotes } from './SecaoPacotes'
import { SecaoPromocoes } from './SecaoPromocoes'

export default function Configuracoes() {
  const { db, resetar } = useDB()
  // muda quando os dados de exemplo são restaurados, para o formulário recomeçar com os valores novos
  const [versao, setVersao] = useState(0)
  const [restaurado, setRestaurado] = useState(false)

  return (
    <>
      <FormularioAjustes key={versao} />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SecaoDiasEspeciais />
        <SecaoPromocoes />
        {db.modulos.pacotes && <SecaoPacotes />}
      </div>

      <Cartao className="p-5 mt-6">
        <h2 className="titulo text-3xl text-mar">Dados de demonstração</h2>
        <p className="mt-2 text-sm text-marinho/70">Volta tudo ao estado inicial: reservas de exemplo, aulas, professores, torneio, preços e horários.</p>
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
