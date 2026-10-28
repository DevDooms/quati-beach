import quadraAerea from '../assets/quadra-aerea.png'
import { Link } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { useLoginDemo } from '../lib/store'
import { Logo } from '../components/Icones'
import { classeInput } from './ui'

// Login só visual: o botão entra direto no painel.
export default function AdminLogin() {
  const { entrar } = useLoginDemo('admin')
  return (
    <div className="min-h-dvh grid place-items-center bg-petroleo-noite px-4 py-10 relative overflow-hidden">
      <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-20" aria-hidden />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <Logo className="size-20 mx-auto" />
          <h1 className="titulo text-4xl text-petroleo mt-4">Painel Quati</h1>
          <p className="text-sm text-petroleo-noite/60">Acesso da equipe do Quati Beach Sport</p>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            entrar()
          }}
        >
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/60">E-mail</span>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
              <input defaultValue="admin@quatibeach.com.br" className={`${classeInput} pl-9`} />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-petroleo-noite/60">Senha</span>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
              <input type="password" defaultValue="demonstracao" className={`${classeInput} pl-9`} />
            </div>
          </label>
          <button type="submit" className="w-full rounded-xl bg-sol text-petroleo-noite py-3 font-extrabold hover:brightness-105">
            Entrar no painel
          </button>
        </form>
        <p className="mt-6 rounded-xl bg-areia-claro p-3 text-center text-xs text-petroleo-noite/60">
          Demonstração: é só tocar em <b>Entrar no painel</b>. <Link to="/demo" className="underline">Trocar de visão</Link>
        </p>
      </div>
    </div>
  )
}
