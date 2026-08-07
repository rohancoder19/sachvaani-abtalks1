import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
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

const queryClient = new QueryClient();

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/persona" element={<PersonaProfile />} />
            <Route path="/feed" element={<LiveFeed />} />
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
