import { useState } from 'react'
import { useDB } from '../../../lib/banco'
import { paraDataISO } from '../../../lib/datas'
import type { Torneio } from '../../../tipos'
import { AreaTexto, Botao, Campo, Cartao, Confirmar, Entrada } from '../../../ui'
import { removerTorneio, salvarTorneio } from '../regras'

const paraFormulario = (t: Torneio) => {
  const { duplas: _duplas, ...resto } = t
  return { ...resto, categoriasTexto: t.categorias.join(', ') }
}

export function FormTorneio({ torneio, onExcluir }: { torneio: Torneio; onExcluir: () => void }) {
  const { set } = useDB()
  const [f, setF] = useState(() => paraFormulario(torneio))
  const salvo = JSON.stringify(paraFormulario(torneio)) === JSON.stringify(f)

  const salvar = () => {
    const { categoriasTexto, ...resto } = f
    const categorias = categoriasTexto.split(',').map((c) => c.trim()).filter(Boolean)
    set((db) => salvarTorneio(db, { ...resto, categorias }))
  }

  return (
    <Cartao className="p-5 space-y-3 self-start">
      <h2 className="titulo text-3xl text-mar">Dados do torneio</h2>
      <Campo rotulo="Nome" compacto>
        <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data" compacto>
          <Entrada compacto type="date" value={f.data} onChange={(e) => e.target.value && setF({ ...f, data: paraDataISO(e.target.value) })} />
        </Campo>
        <Campo rotulo="Horário" compacto>
          <Entrada compacto value={f.horario} onChange={(e) => setF({ ...f, horario: e.target.value })} />
        </Campo>
        <Campo rotulo="Valor por atleta (R$)" compacto>
          <Entrada compacto type="number" min={0} value={f.valor} onChange={(e) => setF({ ...f, valor: Number(e.target.value) })} />
        </Campo>
        <Campo rotulo="Duplas por categoria" compacto>
          <Entrada compacto type="number" min={1} value={f.vagasPorCategoria} onChange={(e) => setF({ ...f, vagasPorCategoria: Number(e.target.value) })} />
        </Campo>
      </div>
      <Campo rotulo="Categorias (separadas por vírgula)" compacto>
        <Entrada compacto value={f.categoriasTexto} onChange={(e) => setF({ ...f, categoriasTexto: e.target.value })} />
      </Campo>
      <Campo rotulo="Premiação" compacto>
        <AreaTexto compacto value={f.premiacao} onChange={(e) => setF({ ...f, premiacao: e.target.value })} rows={2} />
      </Campo>
      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <Confirmar
          rotulo="Excluir"
          pergunta="Excluir torneio?"
          onConfirmar={() => {
            set((db) => removerTorneio(db, torneio.id))
            onExcluir()
          }}
        />
        <Botao onClick={salvar} disabled={salvo}>{salvo ? 'Salvo' : 'Salvar alterações'}</Botao>
      </div>
    </Cartao>
  )
}
