import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuditoriaPage from './pages/AuditoriaPage';
import SociosPage from './pages/SociosPage';
import SocioFormPage from './pages/SocioFormPage';
import SocioEditPage from './pages/SocioEditPage';
import UserManagementPage from './pages/UserManagementPage';
import UserEditPage from './pages/UserEditPage';
import ParcelasPage from './pages/ParcelasPage';
import ParcelaFormPage from './pages/ParcelaFormPage';
import ParcelaDetailPage from './pages/ParcelaDetailPage';
import ParcelasSocioPage from './pages/ParcelasSocioPage';
import ReportesPage from './pages/ReportesPage';
import RolesPage from './pages/RolesPage';

// Componente protegido con layout
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Cargando...</span>
      </div>
    );
  }

  return isAuthenticated ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios"
              element={
                <ProtectedLayout>
                  <SociosPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/nuevo"
              element={
                <ProtectedLayout>
                  <SocioFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/editar/:id"
              element={
                <ProtectedLayout>
                  <SocioEditPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas"
              element={
                <ProtectedLayout>
                  <ParcelasPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/nueva"
              element={
                <ProtectedLayout>
                  <ParcelaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/ver/:id"
              element={
                <ProtectedLayout>
                  <ParcelaDetailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/parcelas/editar/:id"
              element={
                <ProtectedLayout>
                  <ParcelaFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/socios/:socioId/parcelas"
              element={
                <ProtectedLayout>
                  <ParcelasSocioPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedLayout>
                  <UserManagementPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/usuarios/editar/:id"
              element={
                <ProtectedLayout>
                  <UserEditPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedLayout>
                  <RolesPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedLayout>
                  <AuditoriaPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedLayout>
                  <ReportesPage />
                </ProtectedLayout>
              }
            />

            {/* Ruta por defecto - redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-emerald-100/80 mb-8">Página no encontrada</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
