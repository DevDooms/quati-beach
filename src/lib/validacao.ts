import { z } from 'zod'
import { soDigitos } from './formatos'

// Regras de formulário num lugar só (site e painel usam as mesmas)

export const esquemaNome = z.string().trim().min(2, 'Informe o nome')
export const esquemaTelefone = z
  .string()
  .refine((v) => soDigitos(v).length >= 10 && soDigitos(v).length <= 11, 'WhatsApp com DDD')

export const esquemaContato = z.object({ nome: esquemaNome, telefone: esquemaTelefone })

export const esquemaPedidoEvento = esquemaContato.extend({
  tipo: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha a data'),
  pessoas: z.number().int().min(2).max(300),
  obs: z.string(),
})

// true quando o valor passa no esquema (para habilitar botões)
export const valido = <T,>(esquema: z.ZodType<T>, valor: unknown) => esquema.safeParse(valor).success
