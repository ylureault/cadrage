import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { initAnalytics, trackPage } from './analytics.js';
import ConsentBanner from './components/ConsentBanner.jsx';
import { StoreProvider } from './store.jsx';
import NotFound from './components/NotFound.jsx';

// Chaque page se charge quand on l'ouvre
const LandingPage = lazy(() => import('./components/LandingPage.jsx'));
const SpacePage = lazy(() => import('./components/SpacePage.jsx'));

function Loading() {
  return <div className="min-h-screen" style={{ backgroundColor: '#141E37' }} aria-busy="true" />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { initAnalytics(); }, []);
  useEffect(() => { trackPage(); }, [pathname]);
  return (
    <StoreProvider>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:spaceId" element={<SpacePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <ConsentBanner />
    </StoreProvider>
  );
}
