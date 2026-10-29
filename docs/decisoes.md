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

### 2026-10 · Horário fixo (mensalista) removido
**Substitui** a entrada "Horário fixo reserva 8 semanas à frente". Reservar semanas à frente em nome do cliente empurrava um jeito de trabalhar que não é o do Quati. Quem quer jogar toda semana reserva como os outros.

### 2026-10 · O que é decisão do dono vem desligado
Pacotes de horas, promoções, feriados e bloqueios são ferramentas que o dono liga e preenche em Configurações. Na base inicial estão vazios.
**Por quê:** o sistema não deve inventar regra comercial. A gente mostra que existe, e o dono decide se usa.

### 2026-10 · Duração da reserva e prazo de cancelamento configuráveis
**Substitui** "Reserva de 1 hora fixa". Ficam em `db.politica` (`duracaoReserva`, `cancelamentoHoras`), com padrão de 1h e 12h em `POLITICA_PADRAO`. A grade passa a trabalhar com horas decimais (8.5 = 08h30) e checa sobreposição de intervalos (`sobrepoe`), não horário igual.

### 2026-10 · Regras recusam com erro, a tela mostra a mensagem
As funções de `regras.ts` lançam `ErroRegra` quando algo não pode (horário ocupado, bloqueado, turma cheia, crédito insuficiente). `aplicar(fn)` do `useDB` captura e devolve a mensagem.
**Por quê:** antes a tela mostrava "Reserva confirmada" mesmo quando outra aba tinha reservado o horário um instante antes.

### 2026-10 · A reserva guarda o próprio valor
`Reserva.valor` é gravado na criação, já com promoção ou pacote aplicados. Mudar a tabela de preços não reescreve o passado, e caixa e relatório batem com o que foi cobrado.

### 2026-10 · Troca de marca na demonstração
`src/config/marcas.ts` sobrescreve nome, apelido e cores ao iniciar. Serve para mostrar a outros comércios que o sistema é o mesmo. Quando houver backend, isso vem do cadastro do estabelecimento.

### 2026-10 · Troca de marca e aviso de chuva removidos
**Substitui** a entrada anterior. A troca de marca não acrescentava nada à demonstração para o Quati. O aviso de chuva (no site e no painel) supunha uma política que não sabemos se o Quati tem. O site agora só fala do prazo de cancelamento, que o dono configura.

### 2026-10 · Fontes no próprio site e tags de compartilhamento
As fontes vêm do `@fontsource` (sem depender do Google Fonts). `index.html` tem as tags `og:*` usando `VITE_URL_SITE` do `.env`, para o link aparecer com foto no WhatsApp e no Instagram.

---

## Próximas decisões a tomar
- Backend: **Supabase** (Postgres + login + tempo real) é a sugestão; decidir antes do primeiro cliente real.
- Pagamentos: Mercado Pago ou Asaas para Pix com confirmação automática.
- WhatsApp: API oficial (Meta) ou provedor não oficial, considerando o risco de bloqueio do número.
- Idioma do código: hoje está em português. Se forem contratar ou abrir o código, considerar passar para inglês (os textos da tela continuam em português).
