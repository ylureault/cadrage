import { useState } from 'react';

export default function PseudoModal({ onJoin, spaceName, welcomeMessage }) {
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!pseudo.trim()) {
      setError('Le pseudo est requis');
      return;
    }
    if (pseudo.trim().length > 30) {
      setError('30 caractères maximum');
      return;
    }
    onJoin(pseudo.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-insuffle-dark">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-insuffle-gold rounded-xl mx-auto mb-3 flex items-center justify-center font-bold text-insuffle-dark text-xl">I</div>
          <h1 className="text-xl font-bold">Insuffle Cadrage Live</h1>
          {spaceName && <p className="text-gray-500 mt-1">Cadrage : {spaceName}</p>}
        </div>

        {welcomeMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            {welcomeMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-1">Choisissez un pseudo</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => { setPseudo(e.target.value); setError(''); }}
            placeholder="Votre prénom ou pseudo"
            className="input-field w-full mb-2"
            maxLength={30}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <p className="text-xs text-gray-400 mb-4">Aucun compte requis. Visible par les autres participants.</p>
          <button type="submit" className="btn-primary w-full text-lg py-3">
            Rejoindre
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-xs text-gray-400 hover:underline">CGU et politique de confidentialité</a>
        </div>
      </div>
    </div>
  );
}
