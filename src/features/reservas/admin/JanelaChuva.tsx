import { useState } from 'react'
import { quadraPorId } from '../../../config/estabelecimento'
import { useDB } from '../../../lib/banco'
import { dataDeISO, fmtDataLonga, fmtHora } from '../../../lib/datas'
import { doEstabelecimento } from '../../../lib/mensagens'
import { whatsPara } from '../../../lib/whatsapp'
import type { DataISO } from '../../../tipos'
import { Aviso, Botao, Confirmar, EtiquetaJanela, IconeWhatsApp, Janela } from '../../../ui'
import { cancelarReservas, reservasRestantesDoDia } from '../regras'

// Choveu: avisa cada cliente do dia pelo WhatsApp e libera as reservas sem custo
export function JanelaChuva({ data, onFechar }: { data: DataISO; onFechar: () => void }) {
  const { db, set } = useDB()
  const [afetadas] = useState(() => reservasRestantesDoDia(db, data)) // lista fixa enquanto a janela está aberta
  const [feito, setFeito] = useState(false)

  return (
    <Janela onFechar={onFechar} titulo="Aviso de chuva" etiqueta={<EtiquetaJanela>{fmtDataLonga(dataDeISO(data))}</EtiquetaJanela>} largura="sm:max-w-lg">
      {feito ? (
        <Aviso tom="sucesso">Reservas canceladas sem custo. Os horários voltaram a ficar livres no site.</Aviso>
      ) : afetadas.length === 0 ? (
        <p className="text-sm text-petroleo-noite/60">Nenhuma reserva restante neste dia.</p>
      ) : (
        <>
          <p className="text-sm text-petroleo-noite/70">
            Mande a mensagem para cada cliente oferecendo remarcar sem custo. Com o bot de WhatsApp, isso vai sair para todos de uma vez.
          </p>
          <ul className="mt-3 divide-y divide-petroleo/10 rounded-2xl border border-petroleo/10 max-h-72 overflow-y-auto">
            {afetadas.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="titulo text-xl text-petroleo w-10">{fmtHora(r.hora)}</span>
                <span className="flex-1 min-w-0">
                  <b className="block truncate">{r.nome}</b>
                  <span className="text-xs text-petroleo-noite/60">{quadraPorId(r.quadraId).nome} · {r.telefone}</span>
                </span>
                <Botao href={whatsPara(r, doEstabelecimento.chuva(r.nome, r.data, r.hora))} variante="whatsapp" tamanho="sm">
                  <IconeWhatsApp className="size-3.5" /> Avisar
                </Botao>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <Confirmar
              rotulo={`Cancelar as ${afetadas.length} sem custo`}
              pergunta="Liberar todas?"
              onConfirmar={() => {
                set((db) => cancelarReservas(db, afetadas.map((r) => r.id)))
                setFeito(true)
              }}
            />
          </div>
        </>
      )}
    </Janela>
  )
}
