import { NEGOCIO } from '../config/estabelecimento'
import { soDigitos } from './formatos'

// Conversa com o Quati (padrão) ou com outro número (cliente, professor…)
export function linkWhatsApp(texto: string, numero = NEGOCIO.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

// Abre o WhatsApp para a pessoa escolher o contato ou grupo
export const linkCompartilhar = (texto: string) => `https://wa.me/?text=${encodeURIComponent(texto)}`

// (11) 98765-4321 → 5511987654321
export const whatsDoTelefone = (tel: string) => `55${soDigitos(tel)}`

// Atalho para falar com uma pessoa usando uma das mensagens prontas
export const whatsPara = (pessoa: { telefone: string }, texto: string) => linkWhatsApp(texto, whatsDoTelefone(pessoa.telefone))
