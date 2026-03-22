import { Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store.jsx';
import LandingPage from './components/LandingPage.jsx';
import SpacePage from './components/SpacePage.jsx';
import NotFound from './components/NotFound.jsx';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:spaceId" element={<SpacePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </StoreProvider>
  );
}
