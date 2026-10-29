import { useState } from 'react'
import { gravarLocal, lerLocal } from '../lib/armazenamento'

const CHAVE = 'quati:ocultarValores'

// Esconde faturamento quando o painel fica aberto no balcão (vale só neste navegador)
export function useOcultarValores() {
  const [oculto, setOculto] = useState(() => lerLocal(CHAVE) === '1')
  const alternar = () =>
    setOculto((v) => {
      gravarLocal(CHAVE, v ? '0' : '1')
      return !v
    })
  // mostra o valor ou "R$ •••"
  const valor = (texto: string) => (oculto ? 'R$ •••' : texto)
  return { oculto, alternar, valor }
}
