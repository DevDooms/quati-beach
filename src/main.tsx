import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
