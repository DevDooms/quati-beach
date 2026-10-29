// Erro de regra de negócio, com mensagem pronta para mostrar ao usuário
// (ex.: "Esse horário acabou de ser reservado"). As funções de regras.ts lançam
// este erro; o `aplicar` do banco devolve a mensagem para a tela.
export class ErroRegra extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'ErroRegra'
  }
}

export function exigir(condicao: unknown, mensagem: string): asserts condicao {
  if (!condicao) throw new ErroRegra(mensagem)
}
