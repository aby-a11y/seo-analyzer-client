import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RequireAuth from './components/RequireAuth';
import { installAuthInterceptors } from './lib/auth';

installAuthInterceptors();

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/share/:shareToken" element={<ReportPage shared />} />

          {/* Admin only */}
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/report/:reportId" element={<RequireAuth><ReportPage /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
