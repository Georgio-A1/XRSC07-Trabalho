import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CadastrarUsuario from './pages/CadastrarUsuario';
import CriarEdital from './pages/CriarEdital';
import ExcluirEdital from './pages/ExcluirEdital';
import EditarEdital from './pages/EditarEdital';
import ListaEditais from './pages/ListaEditais';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CadastrarDocumentos from './pages/CadastrarDocumentos';
import AvaliarDocumentos from './pages/AvaliarDocumento';
import ListarEditais from './pages/ListarEditais';
import RealizarInscricao from './pages/RealizarInscricao';
import CancelarInscricao from './pages/CancelarInscricao';
import ListarInscricoes from './pages/ListarInscricoes';
import AvaliarInscricao from './pages/AvaliarInscricao';
import FecharEdital from './pages/FecharEdital';
import VerificarStatusInscricoes from './pages/VerificarStatus';
import Perfil from './pages/Perfil';

import Header from './components/Header';
import Footer from './components/Footer';

// Componente que controla a renderização do Header e Footer baseado na rota e autenticação
function Layout({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Rotas públicas onde não quer mostrar Header/Footer
  const rotasSemHeaderFooter = ['/', '/login', '/reset-password'];

  const mostrarHeaderFooter = token && !rotasSemHeaderFooter.includes(location.pathname);

  return (
    <>
      {mostrarHeaderFooter && <Header />}
      <main>{children}</main>
      {mostrarHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : <HomePage />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/cadastrar-usuario" element={<ProtectedRoute element={<CadastrarUsuario />} />} />
          <Route path="/criar-edital" element={<ProtectedRoute element={<CriarEdital />} />} />
          <Route path="/excluir-edital" element={<ProtectedRoute element={<ExcluirEdital />} />} />
          <Route path="/fechar-edital" element={<ProtectedRoute element={<FecharEdital />} />} />

          <Route path="/realizar-inscricao" element={<ProtectedRoute element={<ListarEditais />} />} />
          <Route path="/realizar-inscricao/:id" element={<ProtectedRoute element={<RealizarInscricao />} />} />

          <Route path="/cancelar-inscricao" element={<ProtectedRoute element={<CancelarInscricao />} />} />

          <Route path="/avaliar-inscricao" element={<ProtectedRoute element={<ListarInscricoes />} />} />
          <Route path="/avaliar-inscricao/:id" element={<ProtectedRoute element={<AvaliarInscricao />} />} />

          <Route path="/editar-edital" element={<ProtectedRoute element={<ListaEditais />} />} />
          <Route path="/editar-edital/:id" element={<ProtectedRoute element={<EditarEdital />} />} />

          <Route path="/responder-chamados" element={<ProtectedRoute element={<AdminPage />} />} />
          <Route path="/avaliar-documentos" element={<ProtectedRoute element={<AvaliarDocumentos />} />} />

          <Route path="/perfil" element={<ProtectedRoute element={<Perfil />} />} />
          <Route path="/cadastrar-documentos" element={<ProtectedRoute element={<CadastrarDocumentos />} />} />
          <Route path="/verificar-status" element={<ProtectedRoute element={<VerificarStatusInscricoes />} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
