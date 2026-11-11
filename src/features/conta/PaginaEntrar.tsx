import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import quadraAerea from '../../assets/quadra-aerea.jpg'
import { CLIENTE_DEMO } from '../../demo/dados'
import { useUsuario } from '../../lib/auth'
import { mascaraTelefone, soDigitos } from '../../lib/formatos'
import { Botao, Campo, Entrada, IconeWhatsApp, Logo, TituloSecao } from '../../ui'

const CODIGO_DEMO = '482915'

// Login só visual, sem senha: telefone → código "recebido" no WhatsApp → área do cliente.
export default function PaginaEntrar() {
  const { entrar } = useUsuario()
  const navegar = useNavigate()
  const [etapa, setEtapa] = useState<'telefone' | 'codigo'>('telefone')
  const [telefone, setTelefone] = useState(CLIENTE_DEMO.telefone)

  return (
    <section className="conteudo py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-xl bg-white md:grid-cols-2">
        <div className="relative hidden md:block bg-mar">
          <img src={quadraAerea} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-marinho via-marinho/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-8 text-white">
            <Logo className="size-20" />
            <p className="titulo text-5xl mt-4">Sua areia, <span className="text-sol">sua agenda.</span></p>
            <p className="mt-2 text-white/80 text-sm">Acompanhe reservas, turmas e inscrições em torneios num só lugar.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="md:hidden flex justify-center mb-4"><Logo className="size-16" /></div>
          <TituloSecao sobre="Área do cliente" titulo="Entrar" principal />

          {etapa === 'telefone' ? (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setEtapa('codigo')
              }}
            >
              <p className="text-sm text-marinho/70">Sem senha para lembrar: a gente manda um código no seu WhatsApp.</p>
              <Campo rotulo="Seu WhatsApp">
                <Entrada icone={<Phone />} value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} inputMode="tel" />
              </Campo>
              <Botao type="submit" variante="whatsapp" tamanho="lg" largo>
                <IconeWhatsApp /> Receber código no WhatsApp
              </Botao>
              <p className="text-center text-xs text-marinho/70">Primeira vez aqui? A conta é criada automaticamente.</p>
            </form>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                // demonstração: o número do cliente fictício entra com o histórico dele; outro número entra "zerado"
                entrar(soDigitos(telefone) === soDigitos(CLIENTE_DEMO.telefone) ? CLIENTE_DEMO : { nome: 'Novo cliente', telefone })
                navegar('/minha-conta')
              }}
            >
              <p className="text-sm text-marinho/70">
                Enviamos um código de 6 dígitos para <b>{telefone}</b>.
              </p>
              <div className="flex justify-between gap-2" role="group" aria-label="Código de verificação">
                {CODIGO_DEMO.split('').map((n, i) => (
                  <input
                    key={i}
                    defaultValue={n}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Dígito ${i + 1}`}
                    className="w-full aspect-square max-w-14 rounded-xl border-2 border-mar/20 text-center titulo text-3xl text-mar outline-none focus:border-onda"
                  />
                ))}
              </div>
              <Botao type="submit" variante="destaque" tamanho="lg" largo>Entrar</Botao>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setEtapa('telefone')} className="font-semibold text-marinho/70">Trocar número</button>
                <button type="button" className="font-semibold text-onda">Reenviar código</button>
              </div>
            </form>
          )}

          <p className="mt-6 rounded-xl bg-areia-claro p-3 text-center text-xs text-marinho/70">
            Demonstração: o código já vem preenchido, é só tocar nos botões. <Link to="/demo" className="underline">Trocar de visão</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
