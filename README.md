# Quati Beach Sport — protótipo do site + painel

Protótipo só de front-end (React + Vite + TypeScript + Tailwind) para apresentar ao Quati Beach Sport.
Não há backend nem login de verdade: os dados ficam salvos no navegador só para a demonstração.

## Rodar

```
npm install
npm run dev
```

Abra http://localhost:5173/demo — a página de escolha entre as três visões.

## Visões

| Endereço | O que é |
|---|---|
| `/demo` | Escolher entre site, área do cliente e painel |
| `/` | Site público: mapa das quadras, agenda por quadra, aulas, professores, torneios |
| `/entrar` → `/minha-conta` | Área do cliente (login apenas visual) |
| `/admin` | Painel do Quati: visão geral, agenda, reservas, grade de aulas, torneios, professores, configurações |

Dica: abra o site e o painel em abas lado a lado — o que muda num aparece no outro na hora.
Em **Painel → Configurações** há um botão para restaurar os dados de exemplo.

## Onde mexer

- `src/data/mock.ts` — dados iniciais (quadras, professores, grade de aulas, torneio, preços, horários).
- `src/lib/store.tsx` — a "base" compartilhada (hoje `localStorage`; no futuro, API + bot de WhatsApp).
- `src/lib/agenda.ts` — regras de agenda (horários livres, preço por horário, links de WhatsApp).
- `src/components/MapaQuadras.tsx` — planta das quadras, clicável.
- `src/pages/` — site e área do cliente; `src/admin/` — painel.

Obs.: o `package.json` usa `@rollup/wasm-node` no lugar do Rollup nativo porque o Controle de Aplicativo do Windows bloqueou o binário nativo nesta máquina.
