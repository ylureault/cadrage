import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl"
          style={{ backgroundColor: 'var(--color-accent)', color: '#0c1629' }}>I</div>
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
