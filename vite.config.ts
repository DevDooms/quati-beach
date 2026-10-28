import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ao rodar `npm run dev`, abre o navegador direto na tela de escolha da demonstração
  server: { open: '/demo' },
})
