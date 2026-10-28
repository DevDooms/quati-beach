import quadraAerea from '../assets/quadra-aerea.jpg'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { CLIENTE_DEMO } from '../data/mock'
import { useLoginDemo } from '../lib/store'
import { IconeWhatsApp, Logo } from '../components/Icones'
import { classeCampo, mascaraTelefone } from '../components/ModalReserva'

const CODIGO_DEMO = '482915'

// Login só visual, sem senha: telefone → código "recebido" no WhatsApp → área do cliente.
export default function Entrar() {
  const { entrar } = useLoginDemo('cliente')
  const navegar = useNavigate()
  const [etapa, setEtapa] = useState<'telefone' | 'codigo'>('telefone')
  const [telefone, setTelefone] = useState(CLIENTE_DEMO.telefone)
  const ir = () => {
    entrar()
    navegar('/minha-conta')
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="relative hidden md:block bg-petroleo">
          <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
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

          {etapa === 'telefone' ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setEtapa('codigo')
              }}
            >
              <p className="text-sm text-petroleo-noite/70">Sem senha para lembrar: a gente manda um código no seu WhatsApp.</p>
              <label className="block">
                <span className="text-sm font-semibold">Seu WhatsApp</span>
                <div className="relative">
                  <Phone className="size-4 absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 text-petroleo-noite/40" />
                  <input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} inputMode="tel" className={`${classeCampo} pl-10`} />
                </div>
              </label>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25d366] text-white py-3.5 font-extrabold hover:brightness-105"
              >
                <IconeWhatsApp /> Receber código no WhatsApp
              </button>
              <p className="text-center text-xs text-petroleo-noite/60">Primeira vez aqui? A conta é criada automaticamente.</p>
            </form>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                ir()
              }}
            >
              <p className="text-sm text-petroleo-noite/70">
                Enviamos um código de 6 dígitos para <b>{telefone}</b>.
              </p>
              <div className="flex justify-between gap-2" aria-label="Código de verificação">
                {CODIGO_DEMO.split('').map((n, i) => (
                  <input
                    key={i}
                    defaultValue={n}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Dígito ${i + 1}`}
                    className="w-full aspect-square max-w-14 rounded-xl border-2 border-petroleo/20 text-center titulo text-3xl text-petroleo outline-none focus:border-onda"
                  />
                ))}
              </div>
              <button type="submit" className="w-full rounded-full bg-sol text-petroleo-noite py-3.5 font-extrabold hover:brightness-105">
                Entrar
              </button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setEtapa('telefone')} className="font-semibold text-petroleo-noite/60">Trocar número</button>
                <button type="button" className="font-semibold text-onda">Reenviar código</button>
              </div>
            </form>
          )}

          <p className="mt-6 rounded-xl bg-areia-claro p-3 text-center text-xs text-petroleo-noite/60">
            Demonstração: o código já vem preenchido, é só tocar nos botões. <Link to="/demo" className="underline">Trocar de visão</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
