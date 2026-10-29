# Decisões do projeto

Uma entrada por decisão importante: o que decidimos e por quê. Quando mudar de ideia, não apague: adicione uma entrada nova dizendo o que mudou.

---

### 2026-10 · Protótipo só de front-end, com dados no navegador
Para mostrar a ideia ao Quati sem custo de servidor. Os dados ficam no `localStorage` (`src/lib/banco.tsx`) e são recriados a partir de `src/demo/`. Login do cliente e do painel são **só visuais**.
**Quando muda:** ao fechar o primeiro contrato → backend (ver abaixo).

### 2026-10 · Organização por funcionalidade
Cada funcionalidade (`src/features/reservas`, `aulas`, `torneios`…) guarda suas telas, regras e a parte do painel juntas. Peças visuais genéricas ficam em `src/ui`.
**Por quê:** fica fácil achar tudo de um assunto e, no futuro, ligar/desligar módulos por cliente.

### 2026-10 · Regras de negócio em funções puras (`regras.ts`)
As telas não montam reservas nem calculam nada: chamam `criarReserva(db, dados)`, `podeCancelar(reserva)` etc., que recebem o estado e devolvem o novo.
**Por quê:** dá para testar sem navegador, o bot de WhatsApp vai usar as mesmas regras e a troca para o backend fica num lugar só.

### 2026-10 · Um design system só (`src/ui`)
Site e painel usam o mesmo `Botao`, `Campo`, `Janela`, `Selo`… As cores ficam no tema (`src/index.css`), inclusive as do WhatsApp.
**Por quê:** trocar as cores do tema muda a cara do site inteiro, o que é o primeiro passo para atender vários clientes com o mesmo sistema.

### 2026-10 · Mensagens de WhatsApp centralizadas (`src/lib/mensagens.ts`)
**Por quê:** na API oficial da Meta, as mensagens que o estabelecimento envia viram "modelos" que precisam de aprovação; ter todas num arquivo facilita revisar com o dono e cadastrar.

### 2026-10 · Reserva de 1 hora fixa
Simplifica a agenda e é como o Quati trabalha hoje. O valor está em `DURACAO_RESERVA` (`src/config/estabelecimento.ts`), mas a grade ainda assume 1h.
**Quando muda:** se algum cliente precisar de 1h30 ou meia hora.

### 2026-10 · Horário fixo (mensalista) reserva 8 semanas à frente
Em vez de uma regra "infinita", o mensalista gera reservas reais nas próximas 8 semanas, e o painel avisa quando está acabando para renovar.
**Por quê:** a agenda continua sendo uma lista simples de reservas, e o dono decide quando renovar (e cobrar).

### 2026-10 · Tipos fortes para datas e quadras
`DataISO` (yyyy-MM-dd) e `QuadraId` são tipos próprios: o TypeScript não deixa passar um telefone onde se espera uma data.
**Observação:** `QuadraId` hoje é `'q1' | 'q2'` porque as quadras estão no código. Quando vierem do banco (vários clientes), vira `string`.

### 2026-10 · Validação com zod
Formulários (`src/lib/validacao.ts`) e o que vem do `localStorage` (`src/lib/banco.tsx`) passam por esquemas zod. Se o armazenamento estiver corrompido, a base é recriada em vez de quebrar uma tela.

### 2026-10 · Painel carregado sob demanda
As telas do painel usam `React.lazy`: quem só visita o site não baixa o código do painel.

---

## Próximas decisões a tomar
- Backend: **Supabase** (Postgres + login + tempo real) é a sugestão; decidir antes do primeiro cliente real.
- Pagamentos: Mercado Pago ou Asaas para Pix com confirmação automática.
- WhatsApp: API oficial (Meta) ou provedor não oficial, considerando o risco de bloqueio do número.
- Idioma do código: hoje está em português. Se forem contratar ou abrir o código, considerar passar para inglês (os textos da tela continuam em português).
