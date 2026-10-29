import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useDB } from '../lib/banco'
import type { Modulos } from '../tipos'
import Layout from '../site/Layout'
import { ErroInesperado } from './ErroInesperado'
import PaginaInicio from '../features/inicio/PaginaInicio'
import PaginaAgendar from '../features/reservas/PaginaAgendar'
import PaginaAulas from '../features/aulas/PaginaAulas'
import PaginaProfessores from '../features/aulas/PaginaProfessores'
import PaginaTorneios from '../features/torneios/PaginaTorneios'
import PaginaBar from '../features/bar/PaginaBar'
import PaginaEventos from '../features/eventos/PaginaEventos'
import PaginaPacotes from '../features/pacotes/PaginaPacotes'
import PaginaPrivacidade from '../features/institucional/PaginaPrivacidade'
import PaginaNaoEncontrada from '../features/institucional/PaginaNaoEncontrada'
import PaginaEntrar from '../features/conta/PaginaEntrar'
import PaginaMinhaConta from '../features/conta/PaginaMinhaConta'

// Demonstração e painel só são baixados quando alguém abre essas telas (o site fica mais leve)
const PaginaDemo = lazy(() => import('../features/institucional/PaginaDemo'))
const LayoutAdmin = lazy(() => import('../admin/LayoutAdmin'))
const VisaoGeral = lazy(() => import('../admin/visao-geral/VisaoGeral'))
const Configuracoes = lazy(() => import('../admin/configuracoes/Configuracoes'))
const Caixa = lazy(() => import('../admin/caixa/Caixa'))
const Relatorio = lazy(() => import('../admin/relatorio/Relatorio'))
const AgendaAdmin = lazy(() => import('../features/reservas/admin/AgendaAdmin'))
const ReservasAdmin = lazy(() => import('../features/reservas/admin/ReservasAdmin'))
const SolicitacoesAdmin = lazy(() => import('../features/eventos/admin/SolicitacoesAdmin'))
const AulasAdmin = lazy(() => import('../features/aulas/admin/AulasAdmin'))
const ProfessoresAdmin = lazy(() => import('../features/aulas/admin/ProfessoresAdmin'))
const TorneiosAdmin = lazy(() => import('../features/torneios/admin/TorneiosAdmin'))

const Carregando = () => <div className="min-h-dvh grid place-items-center text-marinho/70">Carregando…</div>

// Página de um módulo desligado no painel volta para o início
function Modulo({ nome, children }: { nome: keyof Modulos; children: ReactNode }) {
  const { db } = useDB()
  return db.modulos[nome] ? children : <Navigate to="/" replace />
}

export default function Rotas() {
  return (
    <BrowserRouter>
      <ErroInesperado>
        <Suspense fallback={<Carregando />}>
          <Routes>
            <Route path="demo" element={<PaginaDemo />} />

            <Route path="admin" element={<LayoutAdmin />}>
              <Route index element={<VisaoGeral />} />
              <Route path="agenda" element={<AgendaAdmin />} />
              <Route path="reservas" element={<ReservasAdmin />} />
              <Route path="caixa" element={<Caixa />} />
              <Route path="relatorio" element={<Relatorio />} />
              <Route path="solicitacoes" element={<SolicitacoesAdmin />} />
              <Route path="aulas" element={<AulasAdmin />} />
              <Route path="torneios" element={<TorneiosAdmin />} />
              <Route path="professores" element={<ProfessoresAdmin />} />
              <Route path="config" element={<Configuracoes />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            <Route element={<Layout />}>
              <Route index element={<PaginaInicio />} />
              <Route path="agendar" element={<PaginaAgendar />} />
              <Route path="aulas" element={<Modulo nome="aulas"><PaginaAulas /></Modulo>} />
              <Route path="professores" element={<Modulo nome="aulas"><PaginaProfessores /></Modulo>} />
              <Route path="torneios" element={<Modulo nome="torneios"><PaginaTorneios /></Modulo>} />
              <Route path="bar" element={<Modulo nome="bar"><PaginaBar /></Modulo>} />
              <Route path="eventos" element={<Modulo nome="eventos"><PaginaEventos /></Modulo>} />
              <Route path="pacotes" element={<Modulo nome="pacotes"><PaginaPacotes /></Modulo>} />
              <Route path="privacidade" element={<PaginaPrivacidade />} />
              <Route path="entrar" element={<PaginaEntrar />} />
              <Route path="minha-conta" element={<PaginaMinhaConta />} />
              <Route path="*" element={<PaginaNaoEncontrada />} />
            </Route>
          </Routes>
        </Suspense>
      </ErroInesperado>
    </BrowserRouter>
  )
}
