import { useState } from 'react';
import { X, ExternalLink, Layout, Users, ThumbsUp, Timer, EyeOff } from 'lucide-react';

/**
 * Bannière promotionnelle pour DarkBoard — outil complémentaire au cadrage.
 * S'affiche une fois par session, peut être fermée. Réapparaît à la prochaine session.
 */
export default function DarkboardPromo({ spaceId }) {
  const storageKey = `insuffle-darkboard-promo-dismissed-${spaceId}`;
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(storageKey) === 'true');

  if (dismissed) return null;

  const darkboardUrl = `https://darkboard.insuffle.com/${spaceId}`;

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem(storageKey, 'true');
  }

  return (
    <div className="no-print relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a16 0%, #0f1a3a 50%, #0a0a16 100%)',
        borderTop: '1px solid rgba(255,222,89,0.15)',
        borderBottom: '1px solid rgba(255,222,89,0.15)',
      }}>
      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/4 w-64 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.6) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-48 h-24 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(255,222,89,0.5) 0%, transparent 70%)' }} />

      <div className="relative max-w-[1400px] mx-auto px-6 py-5">
        {/* Close button */}
        <button onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          aria-label="Fermer la promotion">
          <X size={16} />
        </button>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left: Branding */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                boxShadow: '0 0 20px rgba(56,189,248,0.3)',
              }}>
              <Layout size={24} color="white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-lg tracking-tight">DarkBoard</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'rgba(255,222,89,0.15)', color: '#ffde59' }}>
                  Gratuit
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                by Insuffle × Insuffle Académie
              </p>
            </div>
          </div>

          {/* Center: Value prop + features */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium text-white mb-2">
              Votre cadrage est prêt ? Animez votre atelier avec DarkBoard.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span className="flex items-center gap-1">
                <Users size={12} style={{ color: '#38bdf8' }} /> 50 participants
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp size={12} style={{ color: '#a78bfa' }} /> Vote intégré
              </span>
              <span className="flex items-center gap-1">
                <Timer size={12} style={{ color: '#34d399' }} /> Timer visible
              </span>
              <span className="flex items-center gap-1">
                <EyeOff size={12} style={{ color: '#fbbf24' }} /> Mode isoloir
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span>Sans inscription · 8 templates · Canvas infini</span>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="https://darkboard.insuffle.com/" target="_blank" rel="noopener"
              className="text-xs hover:underline transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              En savoir plus
            </a>
            <a href={darkboardUrl} target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(56,189,248,0.3)',
              }}>
              Ouvrir DarkBoard <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
