# Quati Beach Sport — protótipo do site + painel

Protótipo só de front-end (React + Vite + TypeScript + Tailwind) para apresentar ao Quati Beach Sport.
Não há backend nem login de verdade: os dados ficam salvos no navegador só para a demonstração.

## Rodar

```
npm install
npm run dev
```

O navegador abre em `/demo`, a tela para escolher entre o site e o painel.

## Visões

| Endereço | O que é |
|---|---|
| `/demo` | Escolher entre site e painel |
| `/` | Site público: mapa das quadras, agenda por quadra (horário fixo, Pix/cartão/balcão, dividir a conta, lista de espera), aulas e planos, professores, torneios, bar, eventos, privacidade |
| `/entrar` → `/minha-conta` | Área do cliente (login só visual, por código no WhatsApp) |
| `/admin` | Painel: visão geral, agenda (com aviso de chuva), reservas, mensalistas, solicitações, grade de aulas, torneios, professores, configurações |

Dica: abra o site e o painel em abas lado a lado — o que muda num aparece no outro na hora.
Em **Painel → Configurações** há um botão para restaurar os dados de exemplo.

## Estrutura

```
src/
  main.tsx              entrada: providers + rotas
  app/Rotas.tsx         todas as rotas (painel carregado sob demanda)
  tipos.ts              tipos do domínio (Reserva, Aula, DataISO…)
  config/
    estabelecimento.ts  tudo que é do Quati: contato, quadras, preços padrão, cardápio…
  demo/                 dados fictícios e a "semente" da base (some quando houver backend)
  lib/                  utilidades sem tela
    banco.tsx           base no navegador (useDB) com validação zod
    auth.tsx            login visual (useLogin)
    datas.ts formatos.ts whatsapp.ts mensagens.ts validacao.ts armazenamento.ts aleatorio.ts
  ui/                   design system: Botao, Campo, Janela, Selos, Cartao, Titulos, Icones…
  site/Layout.tsx       cabeçalho, menu e rodapé do site
  admin/                esqueleto do painel (layout, login, visão geral, configurações)
  features/
    reservas/           agenda.ts + regras.ts, página de agendar, mapa, janela de reserva, telas do painel
    mensalistas/        horários fixos
    aulas/              grade, planos, professores
    torneios/
    eventos/            pedidos de evento + caixa de solicitações do painel
    conta/              login e área do cliente
    bar/  inicio/  institucional/
```

Regra geral: **regras de negócio ficam em `features/*/regras.ts`** (funções puras: recebem o estado e devolvem o novo). As telas só chamam essas funções. Detalhes e motivos em [`docs/decisoes.md`](docs/decisoes.md).

Obs.: o `package.json` usa `@rollup/wasm-node` no lugar do Rollup nativo porque o Controle de Aplicativo do Windows bloqueou o binário nativo nesta máquina.
