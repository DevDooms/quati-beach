import { useState } from 'react'
import { Ticket, X } from 'lucide-react'
import { useDB } from '../../lib/banco'
import { fmtReais } from '../../lib/formatos'
import type { Pacote } from '../../tipos'
import { Aviso, Botao, Campo, Entrada } from '../../ui'
import { precoPorHoraDoPacote, removerPacote, salvarPacote } from '../../features/pacotes/regras'
import { Secao } from './Secao'

const VAZIO: Pacote = { id: '', nome: '', horas: 10, preco: 800 }

// Pacotes que o dono decide vender (só aparece com o módulo "Pacotes de horas" ligado)
export function SecaoPacotes() {
  const { db, set, aplicar } = useDB()
  const [f, setF] = useState(VAZIO)
  const [erro, setErro] = useState<string | null>(null)

  return (
    <Secao titulo={<><Ticket className="size-6" /> Pacotes de horas</>} descricao="O cliente compra no site e usa as horas ao reservar.">
      <ul className="mt-3 space-y-2">
        {db.pacotes.length === 0 && <li className="text-sm text-marinho/70">Nenhum pacote criado: a página de pacotes fica escondida até ter um.</li>}
        {db.pacotes.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl bg-areia-claro px-3 py-2 text-sm">
            <span className="flex-1">
              <b>{p.nome}</b> · {p.horas}h por {fmtReais(p.preco)} <span className="text-marinho/70">({fmtReais(precoPorHoraDoPacote(p))}/h)</span>
            </span>
            <button onClick={() => set((db) => removerPacote(db, p.id))} className="text-marinho/70 hover:text-red-600" aria-label={`Remover ${p.nome}`}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 grid grid-cols-[1fr_80px_100px] gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const resultado = aplicar((db) => salvarPacote(db, f))
          setErro(resultado)
          if (!resultado) setF(VAZIO)
        }}
      >
        <Campo rotulo="Nome" compacto>
          <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Ex.: 10 horas" />
        </Campo>
        <Campo rotulo="Horas" compacto>
          <Entrada compacto type="number" min={1} value={f.horas} onChange={(e) => setF({ ...f, horas: Number(e.target.value) })} />
        </Campo>
        <Campo rotulo="Preço R$" compacto>
          <Entrada compacto type="number" min={0} value={f.preco} onChange={(e) => setF({ ...f, preco: Number(e.target.value) })} />
        </Campo>
        <div className="col-span-3 flex items-center justify-between gap-2">
          {erro ? <Aviso>{erro}</Aviso> : <span />}
          <Botao type="submit" variante="secundario">Criar pacote</Botao>
        </div>
      </form>
    </Secao>
  )
}
