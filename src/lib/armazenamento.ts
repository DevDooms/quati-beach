// localStorage pode falhar (navegação privada, bloqueio de cookies). Nestes
// casos tudo continua funcionando, só não fica salvo.

export function lerLocal(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

export function gravarLocal(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {
    // sem armazenamento: vale só nesta visita
  }
}
