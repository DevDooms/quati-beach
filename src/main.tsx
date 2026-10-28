import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { DBProvider } from './lib/store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Agendar from './pages/Agendar'
import Aulas from './pages/Aulas'
import Professores from './pages/Professores'
import Torneios from './pages/Torneios'
import Entrar from './pages/Entrar'
import MinhaConta from './pages/MinhaConta'
import Demo from './pages/Demo'
import AdminLayout from './admin/AdminLayout'
import VisaoGeral from './admin/VisaoGeral'
import Agenda from './admin/Agenda'
import Reservas from './admin/Reservas'
import AulasAdmin from './admin/AulasAdmin'
import TorneiosAdmin from './admin/TorneiosAdmin'
import ProfessoresAdmin from './admin/ProfessoresAdmin'
import Config from './admin/Config'

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
            <Route path="aulas" element={<AulasAdmin />} />
            <Route path="torneios" element={<TorneiosAdmin />} />
            <Route path="professores" element={<ProfessoresAdmin />} />
            <Route path="config" element={<Config />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="agendar" element={<Agendar />} />
            <Route path="aulas" element={<Aulas />} />
            <Route path="professores" element={<Professores />} />
            <Route path="torneios" element={<Torneios />} />
            <Route path="entrar" element={<Entrar />} />
            <Route path="minha-conta" element={<MinhaConta />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DBProvider>
  </StrictMode>,
)
