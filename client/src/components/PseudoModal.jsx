import { useState, useEffect, useRef } from 'react';
import { Users, Sliders, FileText } from 'lucide-react';

/* Tim Brown : "Le sponsor comprend en 10 secondes ce qu'il doit faire."
   L'acte 1 — contextualiser avant de demander un pseudo. */

export default function PseudoModal({ onJoin, spaceName, welcomeMessage, facilitatorName }) {
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
      setError('Entrez votre prénom pour continuer');
      return;
    }
    if (pseudo.trim().length > 30) {
      setError('Votre nom est trop long (30 caractères max)');
      return;
    }
    onJoin(pseudo.trim());
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${mounted ? 'backdrop-blur-sm' : ''}`}
      style={{ backgroundColor: 'var(--color-primary)' }}>

      <div className={`rounded-modal w-full max-w-lg mx-4 transition-all duration-250 elevation-3 overflow-hidden ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ backgroundColor: 'var(--color-surface)' }}
        role="dialog" aria-modal="true" aria-label="Rejoindre le cadrage">

        {/* Header avec contexte — Tim Brown : Acte 1 */}
        <div className="p-8 pb-0 text-center">
          <div className="w-14 h-14 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>

          <h1 className="font-display text-h2-mobile md:text-h2 mb-2">
            {spaceName ? spaceName : 'Insuffle Cadrage Live'}
          </h1>

          {/* Contextualisation pour le sponsor */}
          <p className="text-body mb-1" style={{ color: 'var(--color-text-muted)' }}>
            {facilitatorName
              ? `${facilitatorName} vous invite à préparer votre temps collectif ensemble.`
              : 'Préparez votre temps collectif en direct.'}
          </p>

          {/* Ce qu'on va faire — 3 points clairs */}
          <div className="flex items-center justify-center gap-6 mt-5 mb-2 text-left">
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Co-construire</span>
            </div>
            <div className="flex items-center gap-2">
              <Sliders size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Calibrer</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Exporter</span>
            </div>
          </div>
        </div>

        {welcomeMessage && (
          <div className="mx-8 mt-4 rounded-btn p-3 text-body-sm highlight-accent">
            {welcomeMessage}
          </div>
        )}

        {/* Formulaire */}
        <div className="p-8 pt-5">
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
            <p className="text-caption mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Aucun compte requis. Visible par les autres participants.
            </p>
            <button type="submit" disabled={!pseudo.trim()} className="btn-primary w-full text-base h-12">
              Rejoindre le cadrage
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-label" style={{ color: 'var(--color-text-muted)' }}>
              Propulsé par <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Insuffle</span> · Cabinet de facilitation stratégique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
