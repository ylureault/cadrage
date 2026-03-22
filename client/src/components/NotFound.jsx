import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-insuffle-gold rounded-xl mx-auto mb-4 flex items-center justify-center font-bold text-insuffle-dark text-2xl">I</div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-gray-600 mb-6">Cet espace de cadrage n'existe pas ou a été supprimé.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Créer un nouveau cadrage</button>
        <p className="mt-4 text-sm text-gray-500">
          <a href="https://insuffle.com" target="_blank" rel="noopener noreferrer" className="hover:underline">En savoir plus sur Insuffle</a>
        </p>
      </div>
    </div>
  );
}
