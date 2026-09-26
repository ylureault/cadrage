import { useNavigate } from 'react-router-dom';
import Logo from './brand/Logo.jsx';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-5"><Logo height={36} color="var(--color-text)" /></div>
        <h1 className="font-display text-h2-mobile mb-2">Page introuvable</h1>
        <p className="text-body-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Cet espace de cadrage n'existe pas ou a été supprimé.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary" title="Retour à l'accueil">
          Créer un nouveau cadrage
        </button>
        <p className="mt-4 text-caption">
          <a href="https://insuffle.com" target="_blank" rel="noopener noreferrer"
            className="hover:underline transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            En savoir plus sur Insuffle
          </a>
        </p>
      </div>
    </div>
  );
}
