export const fmtReais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
export const fmtReaisCentavos = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const soDigitos = (v: string) => v.replace(/\D/g, '')
export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0]

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

// (11) 99999-9999 enquanto a pessoa digita
export function mascaraTelefone(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
