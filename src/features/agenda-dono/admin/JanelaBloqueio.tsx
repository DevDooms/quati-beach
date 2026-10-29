import { useState } from 'react'
import { QUADRAS, ehQuadraId, type QuadraId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtHora, paraDataISO } from '../../../lib/datas'
import type { DataISO } from '../../../tipos'
import { Aviso, Botao, Campo, Entrada, Janela, Selecao } from '../../../ui'
import { horarioDoDia } from '../../reservas/agenda'
import { criarBloqueio, reservasAtingidas } from '../regras'

const MEIAS_HORAS = Array.from({ length: 37 }, (_, i) => 5 + i / 2) // 5h às 23h, de meia em meia hora

// Fechar um período para manutenção, evento particular etc.
export function JanelaBloqueio({ data: dataInicial, onFechar }: { data: DataISO; onFechar: () => void }) {
  const { db, aplicar } = useDB()
  const horario = horarioDoDia(db, dataDeISO(dataInicial)) ?? [8, 22]
  const [f, setF] = useState({ data: dataInicial, inicio: horario[0], fim: horario[1], quadraId: null as QuadraId | null, motivo: '' })
  const [erro, setErro] = useState<string | null>(null)
  const atingidas = f.fim > f.inicio ? reservasAtingidas(db, f) : []

  return (
    <Janela onFechar={onFechar} titulo="Bloquear horário" largura="sm:max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Data" compacto>
          <Entrada compacto type="date" value={f.data} onChange={(e) => e.target.value && setF({ ...f, data: paraDataISO(e.target.value) })} />
        </Campo>
        <Campo rotulo="Quadra" compacto>
          <Selecao compacto value={f.quadraId ?? ''} onChange={(e) => setF({ ...f, quadraId: ehQuadraId(e.target.value) ? e.target.value : null })}>
            <option value="">Todas as quadras</option>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="De" compacto>
          <Selecao compacto value={f.inicio} onChange={(e) => setF({ ...f, inicio: Number(e.target.value) })}>
            {MEIAS_HORAS.map((h) => <option key={h} value={h}>{fmtHora(h)}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Até" compacto>
          <Selecao compacto value={f.fim} onChange={(e) => setF({ ...f, fim: Number(e.target.value) })}>
            {MEIAS_HORAS.filter((h) => h > f.inicio).map((h) => <option key={h} value={h}>{fmtHora(h)}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Motivo (só a equipe vê)" compacto className="col-span-2">
          <Entrada compacto value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Ex.: manutenção da areia" />
        </Campo>
      </div>
      <div className="mt-3 space-y-2">
        {atingidas.length > 0 && <Aviso>Há {atingidas.length} reserva(s) nesse período. Cancele ou remarque antes de bloquear.</Aviso>}
        {erro && <Aviso>{erro}</Aviso>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Botao variante="secundario" onClick={onFechar}>Cancelar</Botao>
        <Botao
          disabled={atingidas.length > 0}
          onClick={() => {
            const resultado = aplicar((db) => criarBloqueio(db, f))
            if (resultado) setErro(resultado)
            else onFechar()
          }}
        >
          Bloquear
        </Botao>
      </div>
    </Janela>
  )
}
