import { useState } from 'react'
import { QUADRAS, ehQuadraId, type QuadraId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtFaixa, paraDataISO } from '../../../lib/datas'
import { fmtReais, mascaraTelefone } from '../../../lib/formatos'
import { esquemaNome, valido } from '../../../lib/validacao'
import type { DataISO, FormaRecebida, Origem } from '../../../tipos'
import { Aviso, Botao, Campo, Entrada, EtiquetaJanela, Janela, Selecao } from '../../../ui'
import { VER_TUDO, horasDoDia, precoDoHorario, slotDe } from '../agenda'
import { criarReserva } from '../regras'

const ORIGENS: Origem[] = ['Balcão', 'WhatsApp', 'Site']
const RECEBIMENTOS: FormaRecebida[] = ['Dinheiro', 'Pix', 'Cartão']

// Lançamento manual de reserva (balcão, telefone…)
export function JanelaNovaReserva({ inicial, onFechar }: { inicial: { data: DataISO; hora?: number; quadraId?: QuadraId }; onFechar: () => void }) {
  const { db, aplicar } = useDB()
  const [erro, setErro] = useState<string | null>(null)
  const [recebido, setRecebido] = useState<FormaRecebida>('Dinheiro')
  const [f, setF] = useState({
    data: inicial.data,
    hora: inicial.hora ?? horasDoDia(db, dataDeISO(inicial.data))[0] ?? 8,
    quadraId: inicial.quadraId ?? QUADRAS[0].id,
    nome: '',
    telefone: '',
    origem: 'Balcão' as Origem,
    pago: false,
  })

  const d = dataDeISO(f.data)
  const horas = horasDoDia(db, d)
  const slot = slotDe(db, d, f.hora, f.quadraId, VER_TUDO)
  const ocupado = slot.status !== 'livre'
  const pode = valido(esquemaNome, f.nome) && !ocupado && horas.includes(f.hora)

  return (
    <Janela onFechar={onFechar} titulo="Nova reserva" etiqueta={<EtiquetaJanela>Lançamento manual</EtiquetaJanela>}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!pode) return
          // no painel dá para lançar horários que já passaram (só o site bloqueia o passado)
          const resultado = aplicar((db) => criarReserva(db, { ...f, formaPagamento: f.pago ? recebido : 'Balcão' }))
          if (resultado) setErro(resultado)
          else onFechar()
        }}
      >
        <Campo rotulo="Data" compacto>
          <Entrada compacto type="date" value={f.data} onChange={(e) => e.target.value && setF({ ...f, data: paraDataISO(e.target.value) })} />
        </Campo>
        <Campo rotulo="Horário" compacto>
          <Selecao compacto value={f.hora} onChange={(e) => setF({ ...f, hora: Number(e.target.value) })}>
            {horas.map((h) => <option key={h} value={h}>{fmtFaixa(h, db.politica.duracaoReserva)}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Quadra" compacto>
          <Selecao compacto value={f.quadraId} onChange={(e) => ehQuadraId(e.target.value) && setF({ ...f, quadraId: e.target.value })}>
            {QUADRAS.map((q) => <option key={q.id} value={q.id}>{q.nome}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Origem" compacto>
          <Selecao compacto value={f.origem} onChange={(e) => setF({ ...f, origem: e.target.value as Origem })}>
            {ORIGENS.map((o) => <option key={o}>{o}</option>)}
          </Selecao>
        </Campo>
        <Campo rotulo="Nome do cliente" compacto className="col-span-2">
          <Entrada compacto value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Nome completo" />
        </Campo>
        <Campo rotulo="WhatsApp" compacto className="col-span-2">
          <Entrada compacto value={f.telefone} onChange={(e) => setF({ ...f, telefone: mascaraTelefone(e.target.value) })} placeholder="(11) 99999-9999" inputMode="tel" />
        </Campo>
        <label className="col-span-2 inline-flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={f.pago} onChange={(e) => setF({ ...f, pago: e.target.checked })} className="accent-petroleo size-4" /> Já foi pago (
          {fmtReais(precoDoHorario(db, d, f.hora))})
        </label>
        {f.pago && (
          <Campo rotulo="Recebido em" compacto className="col-span-2">
            <Selecao compacto value={recebido} onChange={(e) => setRecebido(e.target.value as FormaRecebida)}>
              {RECEBIMENTOS.map((r) => <option key={r}>{r}</option>)}
            </Selecao>
          </Campo>
        )}
        {ocupado && (
          <div className="col-span-2">
            <Aviso>
              Este horário já está {slot.status === 'aula' ? 'ocupado por uma aula' : slot.status === 'bloqueado' ? 'bloqueado' : 'reservado'}. Escolha outro.
            </Aviso>
          </div>
        )}
        {erro && (
          <div className="col-span-2" role="alert">
            <Aviso>{erro}</Aviso>
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Botao variante="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao type="submit" disabled={!pode}>Salvar reserva</Botao>
        </div>
      </form>
    </Janela>
  )
}
