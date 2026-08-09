import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { useAuthStore } from './store/useAuthStore';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PersonaProfile } from './pages/PersonaProfile';
import { LiveFeed } from './pages/LiveFeed';
import { TopicDiscovery } from './pages/TopicDiscovery';
import { EditorialDecisions } from './pages/EditorialDecisions';
import { MemoryViewer } from './pages/MemoryViewer';
import { SchedulerLogs } from './pages/SchedulerLogs';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { EvaluatorSimulation } from './pages/EvaluatorSimulation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  if (isAuthenticated || token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />
      <div className="flex flex-1 w-full min-w-0">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 w-full min-w-0 max-w-[1440px] mx-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/evaluator" element={<EvaluatorSimulation />} />
            <Route path="/feed" element={<LiveFeed />} />
            <Route path="/persona" element={<PersonaProfile />} />
            <Route path="/discovery" element={<TopicDiscovery />} />
            <Route path="/editorial" element={<EditorialDecisions />} />
            <Route path="/memory" element={<MemoryViewer />} />
            <Route path="/scheduler" element={<SchedulerLogs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <MobileNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
    </div>
  );
};

export const App: React.FC = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
