import { Link } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import quadraAerea from '../assets/quadra-aerea.jpg'
import { NEGOCIO } from '../config/estabelecimento'
import { useAdmin } from '../lib/auth'
import { Botao, Campo, Entrada, Logo } from '../ui'

// Login só visual: o botão entra direto no painel.
export default function LoginAdmin() {
  const { entrar } = useAdmin()
  return (
    <div className="min-h-dvh grid place-items-center bg-petroleo-noite px-4 py-10 relative overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-20" aria-hidden />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <Logo className="size-20 mx-auto" />
          <h1 className="titulo text-4xl text-petroleo mt-4">Painel {NEGOCIO.apelido}</h1>
          <p className="text-sm text-petroleo-noite/70">Acesso da equipe do {NEGOCIO.nome}</p>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            entrar()
          }}
        >
          <Campo rotulo="E-mail" compacto>
            <Entrada compacto icone={<Mail />} defaultValue="admin@quatibeach.com.br" autoComplete="username" />
          </Campo>
          <Campo rotulo="Senha" compacto>
            <Entrada compacto icone={<Lock />} type="password" defaultValue="demonstracao" autoComplete="current-password" />
          </Campo>
          <Botao type="submit" variante="destaque" largo className="py-3">Entrar no painel</Botao>
        </form>
        <p className="mt-6 rounded-xl bg-areia-claro p-3 text-center text-xs text-petroleo-noite/70">
          Demonstração: é só tocar em <b>Entrar no painel</b>. <Link to="/demo" className="underline">Trocar de visão</Link>
        </p>
      </div>
    </div>
  )
}
