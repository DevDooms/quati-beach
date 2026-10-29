import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fontes servidas pelo próprio site (sem depender do Google Fonts: mais rápido e sem enviar dados a terceiros)
import '@fontsource-variable/inter/wght.css'
import '@fontsource/bebas-neue/latin-400.css'
import './index.css'
import Rotas from './app/Rotas'
import { AuthProvider } from './lib/auth'
import { BancoProvider } from './lib/banco'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BancoProvider>
      <AuthProvider>
        <Rotas />
      </AuthProvider>
    </BancoProvider>
  </StrictMode>,
)
