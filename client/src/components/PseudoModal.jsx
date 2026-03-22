import { useState, useEffect, useRef } from 'react';

/* US-418: Transition de la modale de pseudo qui impressionne */
export default function PseudoModal({ onJoin, spaceName, welcomeMessage }) {
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    inputRef.current?.focus();
  }, []);

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
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${mounted ? 'backdrop-blur-sm' : ''}`}
      style={{ backgroundColor: 'var(--color-primary)' }}>
      {/* US-383: Branding dans le lien partagé */}
      <div className={`rounded-modal p-8 w-full max-w-md mx-4 transition-all duration-250 elevation-3 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ backgroundColor: 'var(--color-surface)' }}
        role="dialog" aria-modal="true" aria-label="Rejoindre le cadrage">

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
          <h1 className="font-display text-h2-mobile md:text-h2">Insuffle Cadrage Live</h1>
          {spaceName && <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Cadrage : {spaceName}</p>}
        </div>

        {welcomeMessage && (
          <div className="rounded-btn p-3 mb-4 text-body-sm highlight-accent">
            {welcomeMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-caption font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Comment souhaitez-vous apparaître ?
          </label>
          <input
            ref={inputRef}
            type="text"
            value={pseudo}
            onChange={(e) => { setPseudo(e.target.value); setError(''); }}
            placeholder="Votre prénom"
            className="input-field w-full mb-2"
            maxLength={30}
            autoFocus
            aria-label="Pseudo"
            aria-required="true"
          />
          {error && <p className="text-body-sm mb-2" style={{ color: 'var(--color-error)' }} role="alert">{error}</p>}
          <p className="text-caption mb-5" style={{ color: 'var(--color-text-muted)' }}>Aucun compte requis. Visible par les autres participants.</p>
          <button type="submit" disabled={!pseudo.trim()} className="btn-primary w-full text-base h-12">
            Rejoindre
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-label" style={{ color: 'var(--color-text-muted)' }}>
            Propulsé par <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Insuffle</span>
          </p>
          <a href="#" className="text-label hover:underline" style={{ color: 'var(--color-text-muted)' }}>CGU et politique de confidentialité</a>
        </div>
      </div>
    </div>
  );
}
