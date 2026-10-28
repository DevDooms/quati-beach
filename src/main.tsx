import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { DBProvider, useDB, type Modulos } from './lib/store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Agendar from './pages/Agendar'
import Aulas from './pages/Aulas'
import Professores from './pages/Professores'
import Torneios from './pages/Torneios'
import Bar from './pages/Bar'
import Eventos from './pages/Eventos'
import Privacidade from './pages/Privacidade'
import Entrar from './pages/Entrar'
import MinhaConta from './pages/MinhaConta'
import Demo from './pages/Demo'
import AdminLayout from './admin/AdminLayout'
import VisaoGeral from './admin/VisaoGeral'
import Agenda from './admin/Agenda'
import Reservas from './admin/Reservas'
import Mensalistas from './admin/Mensalistas'
import Solicitacoes from './admin/Solicitacoes'
import AulasAdmin from './admin/AulasAdmin'
import TorneiosAdmin from './admin/TorneiosAdmin'
import ProfessoresAdmin from './admin/ProfessoresAdmin'
import Config from './admin/Config'

// Página de um módulo desligado no painel volta para o início
function Modulo({ nome, children }: { nome: keyof Modulos; children: ReactNode }) {
  const { db } = useDB()
  return db.modulos[nome] ? children : <Navigate to="/" replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DBProvider>
      <BrowserRouter>
        <Routes>
          <Route path="demo" element={<Demo />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<VisaoGeral />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="mensalistas" element={<Mensalistas />} />
            <Route path="solicitacoes" element={<Solicitacoes />} />
            <Route path="aulas" element={<AulasAdmin />} />
            <Route path="torneios" element={<TorneiosAdmin />} />
            <Route path="professores" element={<ProfessoresAdmin />} />
            <Route path="config" element={<Config />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="agendar" element={<Agendar />} />
            <Route path="aulas" element={<Modulo nome="aulas"><Aulas /></Modulo>} />
            <Route path="professores" element={<Modulo nome="aulas"><Professores /></Modulo>} />
            <Route path="torneios" element={<Modulo nome="torneios"><Torneios /></Modulo>} />
            <Route path="bar" element={<Modulo nome="bar"><Bar /></Modulo>} />
            <Route path="eventos" element={<Modulo nome="eventos"><Eventos /></Modulo>} />
            <Route path="privacidade" element={<Privacidade />} />
            <Route path="entrar" element={<Entrar />} />
            <Route path="minha-conta" element={<MinhaConta />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DBProvider>
  </StrictMode>,
)
