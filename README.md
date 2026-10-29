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
| `/` | Site público: mapa das quadras, agenda por quadra (Pix/cartão/balcão, dividir a conta, lista de espera, adicionar à agenda), aulas e planos, professores, torneios, bar, eventos, pacotes (se ligado), privacidade |
| `/entrar` → `/minha-conta` | Área do cliente (login só visual): remarcar e cancelar dentro da regra do dono, créditos |
| `/admin` | Painel: visão geral, agenda (bloqueios, feriados), reservas, caixa do dia, relatório do mês, solicitações, grade de aulas, torneios, professores, configurações |

Dica: abra o site e o painel em abas lado a lado — o que muda num aparece no outro na hora.
Em **Painel → Configurações** há um botão para restaurar os dados de exemplo (a base também se renova sozinha depois de 7 dias).

**O que é decisão do dono começa desligado ou vazio:** pacotes de horas, promoções, feriados e bloqueios. Duração da reserva e prazo para cancelar ficam em Configurações → Regras de reserva.

`.env` tem `VITE_URL_SITE`, usado nas tags de compartilhamento (WhatsApp/Instagram). Troque pelo domínio real antes de publicar.

## Estrutura

```
src/
  main.tsx              entrada: providers + rotas
  app/Rotas.tsx         todas as rotas (painel carregado sob demanda)
  tipos.ts              tipos do domínio (Reserva, Aula, DataISO…)
  config/
    estabelecimento.ts  tudo que é do Quati: contato, quadras, preços e regras padrão, cardápio…
  demo/                 dados fictícios e a "semente" da base (some quando houver backend)
  lib/                  utilidades sem tela
    banco.tsx           base no navegador (useDB: db, set, aplicar) com validação zod
    erros.ts            ErroRegra: regra recusada vira mensagem na tela
    auth.tsx            login visual (useUsuario, useAdmin)
    datas.ts formatos.ts whatsapp.ts mensagens.ts validacao.ts calendario.ts armazenamento.ts aleatorio.ts
  ui/                   design system: Botao, Campo, Janela, Selos, Cartao, Titulos, Icones…
  site/Layout.tsx       cabeçalho, menu e rodapé do site
  admin/                painel: layout, login, visão geral, caixa, relatório, configurações
  features/
    reservas/           agenda.ts + regras.ts, página de agendar, mapa, janela de reserva, telas do painel
    agenda-dono/        bloqueios, feriados/dias especiais, promoções
    pacotes/            pacotes de horas e créditos do cliente
    aulas/              grade, planos, professores
    torneios/
    eventos/            pedidos de evento + caixa de solicitações do painel
    conta/              login e área do cliente
    bar/  inicio/  institucional/
```

Regra geral: **regras de negócio ficam em `features/*/regras.ts`** (funções puras: recebem o estado e devolvem o novo). As telas só chamam essas funções. Detalhes e motivos em [`docs/decisoes.md`](docs/decisoes.md).

Obs.: o `package.json` usa `@rollup/wasm-node` no lugar do Rollup nativo porque o Controle de Aplicativo do Windows bloqueou o binário nativo nesta máquina.
