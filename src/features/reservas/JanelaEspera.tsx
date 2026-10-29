import { useState } from 'react'
import type { Pessoa } from '../../tipos'
import { Botao, Detalhes, EtiquetaJanela, Janela } from '../../ui'
import { CamposContato, useContato } from '../conta/CamposContato'

interface Props {
  detalhes: { rotulo: string; valor: string }[]
  naFila: number // quantos já estavam esperando antes desta pessoa
  onFechar: () => void
  onConfirmar: (p: Pessoa) => void
}

export function JanelaEspera({ detalhes, naFila, onFechar, onConfirmar }: Props) {
  const { contato, setContato, ok } = useContato()
  // posição guardada na hora de entrar (depois disso `naFila` já inclui a própria pessoa)
  const [posicao, setPosicao] = useState<number | null>(null)
  const feito = posicao !== null

  return (
    <Janela onFechar={onFechar} titulo={feito ? 'Você está na lista!' : 'Avise-me se vagar'} etiqueta={<EtiquetaJanela>Lista de espera</EtiquetaJanela>}>
      <Detalhes itens={detalhes} />
      {feito ? (
        <>
          <p className="mt-4 text-sm text-petroleo-noite/70">
            Se esse horário for cancelado, a gente te chama no WhatsApp na hora. Você é o <b>{posicao}º</b> da fila.
          </p>
          <Botao onClick={onFechar} tamanho="lg" largo className="mt-5">Fechar</Botao>
        </>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!ok) return
            setPosicao(naFila + 1)
            onConfirmar(contato)
          }}
        >
          <p className="text-sm text-petroleo-noite/70">
            Esse horário está ocupado{naFila > 0 && ` e ${naFila} ${naFila === 1 ? 'pessoa já está' : 'pessoas já estão'} na fila`}. Deixe seu contato que
            avisamos se vagar.
          </p>
          <CamposContato contato={contato} onChange={setContato} />
          <Botao type="submit" variante="destaque" tamanho="lg" largo disabled={!ok}>
            Entrar na lista de espera
          </Botao>
        </form>
      )}
    </Janela>
  )
}
