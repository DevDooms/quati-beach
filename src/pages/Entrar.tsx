import { Link, useNavigate } from 'react-router-dom'
import { Lock, Phone } from 'lucide-react'
import { CLIENTE_DEMO } from '../data/mock'
import { useLoginDemo } from '../lib/store'
import { IconeWhatsApp, Logo } from '../components/Icones'
import { classeCampo } from '../components/ModalReserva'

// Tela de login só visual: qualquer botão leva para a área do cliente.
export default function Entrar() {
  const { entrar } = useLoginDemo('cliente')
  const navegar = useNavigate()
  const ir = () => {
    entrar()
    navegar('/minha-conta')
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="relative hidden md:block bg-petroleo">
          <img src="/quadra-aerea.png" alt="" className="absolute inset-0 size-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-petroleo-noite via-petroleo-noite/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-8 text-white">
            <Logo className="size-20" />
            <p className="titulo text-5xl mt-4">Sua areia, <span className="text-sol">sua agenda.</span></p>
            <p className="mt-2 text-white/80 text-sm">Acompanhe reservas, turmas e inscrições em torneios num só lugar.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="md:hidden flex justify-center mb-4"><Logo className="size-16" /></div>
          <p className="text-onda font-semibold text-sm uppercase tracking-[0.2em]">Área do cliente</p>
          <h1 className="titulo text-5xl text-petroleo mt-1">Entrar</h1>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              ir()
            }}
          >
            <label className="block">
              <span className="text-sm font-semibold">WhatsApp</span>
              <div className="relative">
                <Phone className="size-4 absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
                <input defaultValue={CLIENTE_DEMO.telefone} inputMode="tel" className={`${classeCampo} pl-10`} />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Senha</span>
              <div className="relative">
                <Lock className="size-4 absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
                <input type="password" defaultValue="demonstracao" className={`${classeCampo} pl-10`} />
              </div>
            </label>
            <div className="flex justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-petroleo" /> Lembrar de mim
              </label>
              <button type="button" onClick={ir} className="font-semibold text-onda">Esqueci a senha</button>
            </div>
            <button type="submit" className="w-full rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold hover:brightness-105">
              Entrar
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-petroleo-noite/50">
            <span className="h-px flex-1 bg-petroleo/15" /> ou <span className="h-px flex-1 bg-petroleo/15" />
          </div>
          <button
            onClick={ir}
            className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-[#25d366] text-[#128c4a] py-3 font-bold hover:bg-[#25d366]/10"
          >
            <IconeWhatsApp /> Receber código no WhatsApp
          </button>

          <p className="mt-6 text-center text-sm text-petroleo-noite/70">
            Primeira vez aqui?{' '}
            <button onClick={ir} className="font-bold text-petroleo underline">Criar conta</button>
          </p>
          <p className="mt-6 rounded-xl bg-areia-claro p-3 text-center text-xs text-petroleo-noite/60">
            Demonstração: não é preciso preencher nada, é só tocar em <b>Entrar</b>. <Link to="/demo" className="underline">Trocar de visão</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
