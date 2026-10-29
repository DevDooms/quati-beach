import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useDB } from '../lib/banco'
import type { Modulos } from '../tipos'
import Layout from '../site/Layout'
import PaginaInicio from '../features/inicio/PaginaInicio'
import PaginaAgendar from '../features/reservas/PaginaAgendar'
import PaginaAulas from '../features/aulas/PaginaAulas'
import PaginaProfessores from '../features/aulas/PaginaProfessores'
import PaginaTorneios from '../features/torneios/PaginaTorneios'
import PaginaBar from '../features/bar/PaginaBar'
import PaginaEventos from '../features/eventos/PaginaEventos'
import PaginaPrivacidade from '../features/institucional/PaginaPrivacidade'
import PaginaDemo from '../features/institucional/PaginaDemo'
import PaginaEntrar from '../features/conta/PaginaEntrar'
import PaginaMinhaConta from '../features/conta/PaginaMinhaConta'
// O painel só é baixado quando alguém abre /admin (o site do cliente fica mais leve)
const LayoutAdmin = lazy(() => import('../admin/LayoutAdmin'))
const VisaoGeral = lazy(() => import('../admin/visao-geral/VisaoGeral'))
const Configuracoes = lazy(() => import('../admin/Configuracoes'))
const AgendaAdmin = lazy(() => import('../features/reservas/admin/AgendaAdmin'))
const ReservasAdmin = lazy(() => import('../features/reservas/admin/ReservasAdmin'))
const MensalistasAdmin = lazy(() => import('../features/mensalistas/admin/MensalistasAdmin'))
const SolicitacoesAdmin = lazy(() => import('../features/eventos/admin/SolicitacoesAdmin'))
const AulasAdmin = lazy(() => import('../features/aulas/admin/AulasAdmin'))
const ProfessoresAdmin = lazy(() => import('../features/aulas/admin/ProfessoresAdmin'))
const TorneiosAdmin = lazy(() => import('../features/torneios/admin/TorneiosAdmin'))

const Carregando = () => <div className="min-h-dvh grid place-items-center text-petroleo-noite/50">Carregando…</div>

// Página de um módulo desligado no painel volta para o início
function Modulo({ nome, children }: { nome: keyof Modulos; children: ReactNode }) {
  const { db } = useDB()
  return db.modulos[nome] ? children : <Navigate to="/" replace />
}

export default function Rotas() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Carregando />}>
      <Routes>
        <Route path="demo" element={<PaginaDemo />} />

        <Route path="admin" element={<LayoutAdmin />}>
          <Route index element={<VisaoGeral />} />
          <Route path="agenda" element={<AgendaAdmin />} />
          <Route path="reservas" element={<ReservasAdmin />} />
          <Route path="mensalistas" element={<MensalistasAdmin />} />
          <Route path="solicitacoes" element={<SolicitacoesAdmin />} />
          <Route path="aulas" element={<AulasAdmin />} />
          <Route path="torneios" element={<TorneiosAdmin />} />
          <Route path="professores" element={<ProfessoresAdmin />} />
          <Route path="config" element={<Configuracoes />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<PaginaInicio />} />
          <Route path="agendar" element={<PaginaAgendar />} />
          <Route path="aulas" element={<Modulo nome="aulas"><PaginaAulas /></Modulo>} />
          <Route path="professores" element={<Modulo nome="aulas"><PaginaProfessores /></Modulo>} />
          <Route path="torneios" element={<Modulo nome="torneios"><PaginaTorneios /></Modulo>} />
          <Route path="bar" element={<Modulo nome="bar"><PaginaBar /></Modulo>} />
          <Route path="eventos" element={<Modulo nome="eventos"><PaginaEventos /></Modulo>} />
          <Route path="privacidade" element={<PaginaPrivacidade />} />
          <Route path="entrar" element={<PaginaEntrar />} />
          <Route path="minha-conta" element={<PaginaMinhaConta />} />
          <Route path="*" element={<PaginaInicio />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
