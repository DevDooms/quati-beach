import { useState } from 'react'
import { Plus } from 'lucide-react'
import { novoId } from '../../../lib/aleatorio'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataCurta } from '../../../lib/datas'
import { Botao, Cartao, Chip, TituloPagina } from '../../../ui'
import { novoTorneio } from '../regras'
import { FormTorneio } from './FormTorneio'
import { Inscricoes } from './Inscricoes'

export default function TorneiosAdmin() {
  const { db, set } = useDB()
  const [selId, setSelId] = useState(db.torneios[0]?.id ?? '')
  const t = db.torneios.find((x) => x.id === selId)

  const criar = () => {
    const id = novoId()
    set((db) => novoTorneio(db, id))
    setSelId(id)
  }

  return (
    <>
      <TituloPagina
        titulo="Torneios"
        sub="O próximo torneio aparece automaticamente na página inicial e na página de torneios."
        acoes={<Botao onClick={criar}><Plus className="size-4" /> Novo torneio</Botao>}
      />

      <div className="flex gap-2 overflow-x-auto sem-scrollbar mb-4">
        {db.torneios.map((x) => (
          <Chip key={x.id} ativo={x.id === selId} onClick={() => setSelId(x.id)}>
            {x.nome} · {fmtDataCurta(dataDeISO(x.data))}
          </Chip>
        ))}
      </div>

      {!t ? (
        <Cartao className="p-10 text-center text-marinho/70">Nenhum torneio cadastrado.</Cartao>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <FormTorneio key={t.id} torneio={t} onExcluir={() => setSelId(db.torneios.find((x) => x.id !== t.id)?.id ?? '')} />
          <Inscricoes torneio={t} />
        </div>
      )}
    </>
  )
}
