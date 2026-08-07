import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

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

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router>
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
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
