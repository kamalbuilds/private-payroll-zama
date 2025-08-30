import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuditorDashboard } from './pages/AuditorDashboard';

// Components
import { RoleGuard } from './components/RoleGuard';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={<DashboardPage />}>
                    <Route 
                      path="employee" 
                      element={
                        <RoleGuard requireWallet={true}>
                          <EmployeeDashboard />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="employer" 
                      element={
                        <RoleGuard requireWallet={true}>
                          <EmployerDashboard />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="admin" 
                      element={
                        <RoleGuard requireWallet={true}>
                          <AdminDashboard />
                        </RoleGuard>
                      } 
                    />
                    <Route 
                      path="auditor" 
                      element={
                        <RoleGuard requireWallet={true}>
                          <AuditorDashboard />
                        </RoleGuard>
                      } 
                    />
                  </Route>
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  
                  {/* Catch all - redirect to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>

                {/* Global Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--toastify-color-light)',
                      color: 'var(--toastify-text-color-light)',
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
