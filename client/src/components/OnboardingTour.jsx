import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, X, Users, Sliders, FileText, HelpCircle, Layout, MessageSquare } from 'lucide-react';

/*
 * Visite guidée de Cadrage Live — Insuffle
 *
 * Splash screen au premier lancement puis tooltips positionnés
 * avec flèches pointant vers les éléments clés.
 *
 * Les 6 étapes de la méthode de cadrage :
 * 1. Bienvenue — comprendre l'outil
 * 2. Les 4 phases du canvas
 * 3. Les questions-guides
 * 4. Ajouter des cartes
 * 5. Les 8 axes de positionnement
 * 6. Exporter et partager
 */

const TOUR_STEPS = [
  {
    id: 'welcome',
    type: 'splash',
    icon: Layout,
    title: 'Bienvenue sur Insuffle Cadrage Live',
    content: 'Préparez vos temps collectifs avec vos clients en direct. Cet outil vous guide en 4 phases pour cadrer une facilitation, un atelier ou un séminaire.',
    detail: 'Développé par Insuffle, cabinet de facilitation stratégique.',
  },
  {
    id: 'phases',
    type: 'tooltip',
    target: '[role="tablist"]',
    position: 'bottom',
    icon: Layout,
    title: '4 phases de cadrage',
    content: 'Le canvas est structuré en 4 phases : AVANT (préparer), PENDANT Facilitation (piloter), PENDANT Risques (anticiper), CONCLUSION (projeter). Naviguez entre elles avec ces onglets.',
    detail: 'C\'est la même structure que le canvas papier Insuffle.',
  },
  {
    id: 'questions',
    type: 'tooltip',
    target: '[aria-label="Questions-guides Insuffle"]',
    position: 'right',
    icon: HelpCircle,
    title: 'Questions-guides Insuffle',
    content: 'Chaque colonne contient des questions puissantes issues de la méthode Insuffle. Utilisez-les pour guider la conversation avec votre sponsor. Elles restent toujours visibles.',
    detail: '100+ questions issues de 15 ans de terrain.',
  },
  {
    id: 'cards',
    type: 'tooltip',
    target: '[role="region"]',
    position: 'right',
    icon: MessageSquare,
    title: 'Ajoutez des cartes',
    content: 'Cliquez sur "+ Ajouter" en bas de chaque colonne pour contribuer. Chaque participant voit les cartes des autres en temps réel. Le facilitateur peut activer le brainstorming silencieux.',
    detail: 'Raccourci : touche N pour créer une carte.',
  },
  {
    id: 'axes',
    type: 'tooltip',
    target: '[aria-label="8 axes de positionnement"]',
    position: 'top',
    icon: Sliders,
    title: 'Les 8 axes — Le cœur de la méthode',
    content: 'C\'est ici que se joue la conversation stratégique. Positionnez-vous sur chaque axe (1 à 5) et comparez votre lecture avec celle du sponsor. La divergence est un signal, pas un problème.',
    detail: 'Propriété intellectuelle Insuffle. Aucun autre outil ne propose ces axes.',
  },
  {
    id: 'export',
    type: 'tooltip',
    target: '[title="Exporter"]',
    position: 'bottom',
    icon: FileText,
    title: 'Exportez et partagez',
    content: 'Exportez le cadrage complet en PDF (avec les 8 axes), en texte, ou partagez le lien. Chaque cadrage a aussi un Darkboard Insuffle associé.',
    detail: 'Le PDF inclut la synthèse, les cartes et les axes.',
  },
];

function Arrow({ position }) {
  const base = 'absolute w-3 h-3 rotate-45';
  const style = { backgroundColor: 'var(--color-surface)' };
  switch (position) {
    case 'top': return <div className={`${base} -bottom-1.5 left-1/2 -translate-x-1/2`} style={style} />;
    case 'bottom': return <div className={`${base} -top-1.5 left-1/2 -translate-x-1/2`} style={style} />;
    case 'left': return <div className={`${base} -right-1.5 top-1/2 -translate-y-1/2`} style={style} />;
    case 'right': return <div className={`${base} -left-1.5 top-1/2 -translate-y-1/2`} style={style} />;
    default: return null;
  }
}

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState(null);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;

  // Position tooltip relative to target element
  const positionTooltip = useCallback(() => {
    if (current.type !== 'tooltip' || !current.target) return;
    const el = document.querySelector(current.target);
    if (!el) {
      // If target not found, show as centered popup
      setTooltipPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const pos = current.position || 'bottom';
    let top, left;

    switch (pos) {
      case 'bottom':
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2;
        break;
      case 'top':
        top = rect.top - 12;
        left = rect.left + rect.width / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 12;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 12;
        break;
    }

    // Scroll target into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTooltipPos({ top, left, position: pos, targetRect: rect });
  }, [current]);

  useEffect(() => {
    if (current.type === 'tooltip') {
      // Small delay to allow scroll
      const timer = setTimeout(positionTooltip, 300);
      window.addEventListener('resize', positionTooltip);
      return () => { clearTimeout(timer); window.removeEventListener('resize', positionTooltip); };
    }
  }, [step, positionTooltip, current.type]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { onComplete(); return; }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { isLast ? onComplete() : setStep(s => s + 1); }
      if (e.key === 'ArrowLeft' && !isFirst) { setStep(s => s - 1); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLast, isFirst, onComplete]);

  const Icon = current.icon;

  // ===== SPLASH SCREEN =====
  if (current.type === 'splash') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fade-in"
        style={{ backgroundColor: 'rgba(12,22,41,0.85)' }}>
        <div className="w-full max-w-lg mx-4 rounded-modal elevation-3 overflow-hidden animate-scale-in"
          style={{ backgroundColor: 'var(--color-surface)' }}>
          {/* Header */}
          <div className="p-8 text-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="w-16 h-16 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-3xl"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
            <h2 className="font-display text-h2-mobile md:text-h2 text-white mb-2">{current.title}</h2>
            <p className="text-body-sm text-white/70">{current.detail}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-body mb-6" style={{ color: 'var(--color-text)' }}>{current.content}</p>

            {/* Steps preview */}
            <div className="space-y-3 mb-8">
              {[
                { icon: Layout, text: 'Découvrir les 4 phases du canvas' },
                { icon: HelpCircle, text: 'Utiliser les questions-guides Insuffle' },
                { icon: MessageSquare, text: 'Ajouter des cartes collaboratives' },
                { icon: Sliders, text: 'Positionner les 8 axes stratégiques' },
                { icon: FileText, text: 'Exporter le cadrage complet en PDF' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(255,222,89,0.1)' }}>
                    <s.icon size={16} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <span className="text-body-sm">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button onClick={onComplete} className="btn-ghost text-body-sm">
                Passer la visite
              </button>
              <button onClick={() => setStep(1)} className="btn-primary flex items-center gap-2">
                Commencer la visite <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-4">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{ backgroundColor: i === step ? 'var(--color-accent)' : 'var(--color-border)', transform: i === step ? 'scale(1.3)' : 'scale(1)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== TOOLTIP STEP =====
  // Clamp tooltip inside viewport so navigation buttons are always reachable
  const tooltipStyle = (() => {
    if (!tooltipPos) {
      return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 80 };
    }
    const pad = 12; // min distance from viewport edge
    const tooltipW = 320; // w-80 = 20rem = 320px
    const tooltipH = 280; // estimated max height
    let { top, left, position: pos } = tooltipPos;

    // Compute raw position (before transform)
    let rawTop = pos === 'top' ? top - 8 - tooltipH : top;
    let rawLeft = pos === 'bottom' || pos === 'top' ? left - tooltipW / 2 :
                  pos === 'right' ? left : left - tooltipW;

    // Clamp horizontally
    rawLeft = Math.max(pad, Math.min(rawLeft, window.innerWidth - tooltipW - pad));
    // Clamp vertically — if tooltip would go above viewport, flip to below target
    if (rawTop < pad) rawTop = pad;
    if (rawTop + tooltipH > window.innerHeight - pad) rawTop = window.innerHeight - tooltipH - pad;

    return { position: 'fixed', top: rawTop, left: rawLeft, zIndex: 80, maxHeight: `calc(100vh - ${pad * 2}px)`, overflowY: 'auto' };
  })();

  return (
    <>
      {/* Overlay — click to dismiss */}
      <div className="fixed inset-0 z-[70]" style={{ backgroundColor: 'rgba(12,22,41,0.4)' }} onClick={onComplete} />

      {/* Highlight target element */}
      {tooltipPos?.targetRect && (
        <div className="fixed z-[71] pointer-events-none rounded-btn ring-2 animate-pulse-glow"
          style={{
            top: tooltipPos.targetRect.top - 4,
            left: tooltipPos.targetRect.left - 4,
            width: tooltipPos.targetRect.width + 8,
            height: tooltipPos.targetRect.height + 8,
            ringColor: 'var(--color-accent)',
          }} />
      )}

      {/* Tooltip */}
      <div style={tooltipStyle} className="animate-scale-in">
        <div className="relative w-80 rounded-card elevation-3 overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)' }}
          onClick={e => e.stopPropagation()}>

          {tooltipPos && <Arrow position={tooltipPos.position} />}

          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,222,89,0.15)' }}>
              <Icon size={16} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-body-sm">{current.title}</h3>
              <p className="text-label" style={{ color: 'var(--color-text-muted)' }}>Étape {step} sur {TOUR_STEPS.length - 1}</p>
            </div>
            <button onClick={onComplete} className="p-1 rounded-btn" style={{ color: 'var(--color-text-muted)' }} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-body-sm mb-2" style={{ color: 'var(--color-text)' }}>{current.content}</p>
            {current.detail && (
              <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{current.detail}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-4 pt-0">
            <button onClick={onComplete} className="text-caption hover:underline" style={{ color: 'var(--color-text-muted)' }}>
              Passer
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button onClick={() => setStep(s => s - 1)} className="btn-ghost text-body-sm flex items-center gap-1">
                  <ArrowLeft size={14} /> Précédent
                </button>
              )}
              <button onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
                className="btn-primary flex items-center gap-1">
                {isLast ? 'Commencer' : 'Suivant'} {isLast ? null : <ArrowRight size={14} />}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === step ? 'var(--color-accent)' : 'var(--color-border)' }} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
