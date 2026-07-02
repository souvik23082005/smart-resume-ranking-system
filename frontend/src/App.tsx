import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import JDPage from './pages/JDPage';
import ResumesPage from './pages/ResumesPage';
import RankingConfigPage from './pages/RankingConfigPage';
import ResultsPage from './pages/ResultsPage';
import CustomCursor from './components/CustomCursor';

function Dashboard() {
  const { step } = useApp();
  return (
    <Layout>
      {step === 'jd' && <JDPage />}
      {step === 'resumes' && <ResumesPage />}
      {step === 'config' && <RankingConfigPage />}
      {step === 'results' && <ResultsPage />}
    </Layout>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CustomCursor />
        <AnimatedRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

