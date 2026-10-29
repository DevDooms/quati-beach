import { useMemo, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { quadraPorId } from '../../config/estabelecimento'
import { useUsuario } from '../../lib/auth'
import { useDB } from '../../lib/banco'
import { dataDeISO, dataISO, fmtDataCurta, fmtDataLonga, fmtFaixa, proximosDias } from '../../lib/datas'
import type { Hora, Reserva } from '../../tipos'
import { Aviso, Botao, EtiquetaJanela, Janela } from '../../ui'
import { horasReservaveis, slotDe } from '../reservas/agenda'
import { remarcarReserva } from '../reservas/regras'
import { SeletorDias } from '../reservas/SeletorDias'

// Escolhe outro dia/horário livre na mesma quadra (o valor combinado se mantém)
export function JanelaRemarcar({ reserva, onFechar }: { reserva: Reserva; onFechar: () => void }) {
  const { db, aplicar } = useDB()
  const { usuario } = useUsuario()
  const dias = useMemo(() => proximosDias(14), [])
  const [dia, setDia] = useState(() => dataDeISO(reserva.data))
  const [hora, setHora] = useState<Hora | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [feito, setFeito] = useState(false)

  const livres = horasReservaveis(db, dia).filter((h) => slotDe(db, dia, h, reserva.quadraId, { usuario }).status === 'livre')
  const antes = `${fmtDataCurta(dataDeISO(reserva.data))}, ${fmtFaixa(reserva.hora, reserva.duracao)}`

  if (feito) {
    return (
      <Janela onFechar={onFechar}>
        <div className="text-center py-2">
          <CircleCheck className="size-16 mx-auto text-emerald-500" strokeWidth={1.5} />
          <h2 className="titulo text-4xl mt-4 text-mar">Remarcado!</h2>
          <p className="mt-2 text-sm text-marinho/70 first-letter:uppercase">
            {fmtDataLonga(dia)}, {hora !== null && fmtFaixa(hora, reserva.duracao)} · {quadraPorId(reserva.quadraId).nome}
          </p>
          <Botao onClick={onFechar} tamanho="lg" largo className="mt-6">Fechar</Botao>
        </div>
      </Janela>
    )
  }

  return (
    <Janela onFechar={onFechar} titulo="Remarcar" etiqueta={<EtiquetaJanela>Antes: {antes}</EtiquetaJanela>} largura="sm:max-w-lg">
      <SeletorDias
        dias={dias}
        selecionado={dia}
        onEscolher={(d) => {
          setDia(d)
          setHora(null)
        }}
      />
      <p className="mt-3 text-sm font-semibold first-letter:uppercase">{fmtDataLonga(dia)}</p>
      {livres.length === 0 ? (
        <p className="mt-2 text-sm text-marinho/70">Nenhum horário livre na {quadraPorId(reserva.quadraId).nome} neste dia.</p>
      ) : (
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Horários livres">
          {livres.map((h) => (
            <button
              key={h}
              role="radio"
              aria-checked={hora === h}
              onClick={() => setHora(h)}
              className={`rounded-xl border-2 py-2 titulo text-xl transition ${hora === h ? 'bg-onda text-white border-onda' : 'border-onda/30 text-mar hover:border-onda'}`}
            >
              {fmtFaixa(h, reserva.duracao).replace(' – ', '–')}
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-marinho/70">O valor combinado da reserva continua o mesmo.</p>
      {erro && (
        <div role="alert" className="mt-3">
          <Aviso>{erro}</Aviso>
        </div>
      )}
      <Botao
        variante="destaque"
        tamanho="lg"
        largo
        className="mt-4"
        disabled={hora === null}
        onClick={() => {
          if (hora === null) return
          const resultado = aplicar((db) => remarcarReserva(db, reserva.id, { data: dataISO(dia), hora, quadraId: reserva.quadraId }))
          if (resultado) setErro(resultado)
          else setFeito(true)
        }}
      >
        Confirmar novo horário
      </Botao>
    </Janela>
  )
}
