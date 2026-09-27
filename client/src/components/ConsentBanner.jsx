import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
import { GA_ID, getConsent, setConsent } from '../analytics.js';

// Le bandeau de consentement : deux boutons de même poids, pas de case pré-cochée, pas de mur
export default function ConsentBanner() {
  const [open, setOpen] = useState(() => !!GA_ID && getConsent() === null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const onOpen = () => { setMore(true); setOpen(true); };
    window.addEventListener('insuffle:consent-open', onOpen);
    return () => window.removeEventListener('insuffle:consent-open', onOpen);
  }, []);
  if (!open) return null;
  const choose = (v) => { setConsent(v); setOpen(false); };
  const current = getConsent();
  return (
    <div role="dialog" aria-live="polite" aria-label="Mesure d'audience" data-consent
      className="fixed z-[80] bottom-3 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:w-[420px] rounded-card p-4 elevation-3 animate-slide-up no-print"
      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
      <p className="font-display font-semibold text-body-sm mb-1 flex items-center gap-2"><Cookie size={16} style={{ color: 'var(--color-accent-dark)' }} /> On mesure l'audience, si vous êtes d'accord.</p>
      <p className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Google Analytics nous dit quelles pages servent et d'où viennent les visiteurs. Pas de publicité. Le contenu et l'adresse de vos cadrages ne sont jamais transmis.
      </p>
      {more && (
        <div className="text-caption mb-3 grid gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
          <p><b style={{ color: 'var(--color-text)' }}>Ce qui est mesuré :</b> pages vues (sans l'identifiant du cadrage), exports, ouverture de la démo, clics vers les sites Insuffle.</p>
          <p><b style={{ color: 'var(--color-text)' }}>Cookies :</b> _ga et _ga_*, déposés par Google Analytics, seulement si vous acceptez. Votre choix est gardé six mois.</p>
          <p><b style={{ color: 'var(--color-text)' }}>Toujours actif :</b> le stockage local du navigateur pour votre pseudo, vos préférences et vos clés de facilitateur. Il reste chez vous.</p>
          {current && <p>Choix actuel : <b style={{ color: 'var(--color-text)' }}>{current === 'granted' ? 'accepté' : 'refusé'}</b>.</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost text-body-sm flex-1 justify-center font-semibold" style={{ border: '1px solid var(--color-border)' }} onClick={() => choose('denied')}>Refuser</button>
        <button type="button" className="btn-ghost text-body-sm flex-1 justify-center font-semibold" style={{ border: '1px solid var(--color-border)' }} onClick={() => choose('granted')}>Accepter</button>
      </div>
      {!more && <button type="button" className="text-caption mt-2 hover:underline" style={{ color: 'var(--color-text-muted)' }} onClick={() => setMore(true)}>En savoir plus</button>}
    </div>
  );
}
