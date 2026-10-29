// Regras de formulário num lugar só (site e painel usam as mesmas).
// Usa a versão "mini" do zod, bem menor no pacote final.
import * as z from 'zod/v4-mini'
import { soDigitos } from './formatos'

export const esquemaNome = z.string().check(z.refine((v) => v.trim().length >= 2, 'Informe o nome'))
export const esquemaTelefone = z.string().check(z.refine((v) => [10, 11].includes(soDigitos(v).length), 'WhatsApp com DDD'))

export const esquemaContato = z.object({ nome: esquemaNome, telefone: esquemaTelefone })

export const esquemaPedidoEvento = z.object({
  nome: esquemaNome,
  telefone: esquemaTelefone,
  tipo: z.string().check(z.minLength(1)),
  data: z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/, 'Escolha a data')),
  pessoas: z.number().check(z.int(), z.gte(2), z.lte(300)),
  obs: z.string(),
})

// true quando o valor passa no esquema (para habilitar botões)
export const valido = (esquema: z.ZodMiniType, valor: unknown) => esquema.safeParse(valor).success
