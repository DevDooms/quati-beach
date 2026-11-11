import { Component, type ErrorInfo, type ReactNode } from 'react'

// Se algum componente quebrar, mostra esta tela em vez de deixar tudo em branco.
// (Com o Sentry configurado, o erro também seria enviado para a equipe.)
export class ErroInesperado extends Component<{ children: ReactNode }, { erro: Error | null }> {
  state = { erro: null as Error | null }

  static getDerivedStateFromError(erro: Error) {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error('Erro inesperado na tela:', erro, info.componentStack)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="min-h-dvh grid place-items-center bg-areia-claro px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center">
          <p className="titulo text-5xl text-mar">Ops!</p>
          <p className="mt-2 text-marinho/80">Algo deu errado nesta tela. Seus dados estão salvos.</p>
          <div className="mt-6 flex flex-col gap-2">
            <a href="/" className="rounded-full bg-mar text-white py-3 font-bold">Voltar ao início</a>
            <button
              onClick={() => {
                // dados da demonstração corrompidos: recomeça do zero
                localStorage.removeItem('quati:db')
                location.href = '/'
              }}
              className="rounded-full border border-mar/20 py-3 font-semibold text-mar"
            >
              Restaurar dados de exemplo
            </button>
          </div>
          <p className="mt-4 text-xs text-marinho/70">{this.state.erro.message}</p>
        </div>
      </div>
    )
  }
}
