import { useState } from 'react'
import { CLIENTE_DEMO } from '../../demo/dados'
import { useLogin } from '../../lib/auth'
import { mascaraTelefone } from '../../lib/formatos'
import { esquemaContato, valido } from '../../lib/validacao'
import { Campo, Entrada } from '../../ui'
import type { Pessoa } from '../../tipos'

// Nome + WhatsApp de quem está reservando. Se a pessoa "entrou" na área do
// cliente, já vem preenchido.
export function useContato() {
  const { logado } = useLogin('cliente')
  const [contato, setContato] = useState<Pessoa>(logado ? CLIENTE_DEMO : { nome: '', telefone: '' })
  return { contato, setContato, ok: valido(esquemaContato, contato) }
}

export function CamposContato({ contato, onChange }: { contato: Pessoa; onChange: (c: Pessoa) => void }) {
  return (
    <>
      <Campo rotulo="Seu nome">
        <Entrada value={contato.nome} onChange={(e) => onChange({ ...contato, nome: e.target.value })} placeholder="Como podemos te chamar?" autoComplete="name" />
      </Campo>
      <Campo rotulo="WhatsApp">
        <Entrada
          value={contato.telefone}
          onChange={(e) => onChange({ ...contato, telefone: mascaraTelefone(e.target.value) })}
          placeholder="(11) 99999-9999"
          inputMode="tel"
          autoComplete="tel"
        />
      </Campo>
    </>
  )
}
