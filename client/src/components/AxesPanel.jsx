import { useState, useMemo } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import { Lock, Unlock, ChevronDown, ChevronUp, AlertTriangle, HelpCircle } from 'lucide-react';

/* Axes questions — méthode Insuffle */
const AXES_QUESTIONS = {
  decider_murir: ['Le groupe a-t-il le pouvoir de décider, ou seulement de recommander ?', 'Qui valide les décisions après l\'atelier ?', 'Le sujet est-il assez mûr pour décider, ou faut-il d\'abord explorer ?'],
  agir_cap: ['Cherche-t-on à construire une vision commune ou à aligner derrière une vision existante ?', 'Le leader doit-il co-construire ou fixer le cap ?'],
  cadre_autonomie: ['Le groupe est-il mature pour s\'auto-organiser ?', 'Y a-t-il des sujets interdits ?'],
  produire_explorer: ['Faut-il sortir avec un plan d\'action chiffré ou des pistes ouvertes ?'],
  contenu_processus: ['Le problème est-il un problème de fond ou de fonctionnement ?'],
  recul_action: ['Y a-t-il urgence à agir ou urgence à comprendre ?'],
  ouvert_cible: ['L\'agenda est-il fixé ou peut-on accueillir ce qui émerge ?'],
  serieux_ludique: ['La culture de l\'entreprise tolère-t-elle le décalage ?'],
};

function AxisSlider({ axis, compact }) {
  const { state } = useStore();
  const [showDetail, setShowDetail] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [pulsePos, setPulsePos] = useState(null);

  const positions = state.axes.filter(a => a.axis_key === axis.key);
  const myPos = positions.find(p => p.pseudo === state.pseudo);
  const finalAxis = state.axesFinal.find(a => a.axis_key === axis.key);
  const isLocked = !!finalAxis?.locked;

  // Stats
  const allPositions = positions.filter(p => p.position != null).map(p => p.position);
  const avg = allPositions.length > 0 ? allPositions.reduce((a, b) => a + b, 0) / allPositions.length : null;
  const spread = allPositions.length > 1 ? Math.max(...allPositions) - Math.min(...allPositions) : 0;
  const dispLabel = spread >= 3 ? 'Divergence forte' : spread >= 2 ? 'Écart modéré' : allPositions.length > 0 ? 'Aligné' : '';

  function setPosition(pos) {
    if (isLocked || state.archived) return;
    socket.emit('set-axis-position', { axisKey: axis.key, position: pos, explanation });
    setPulsePos(pos);
    setTimeout(() => setPulsePos(null), 600);
  }

  function lockAxis() {
    socket.emit('lock-axis', { axisKey: axis.key, locked: !isLocked });
  }

  function setFinal(pos) {
    socket.emit('set-axis-final', { axisKey: axis.key, position: pos });
  }

  return (
    <div className={`p-3 rounded-card border transition-all ${
      isLocked ? 'opacity-80' : ''
    } ${spread >= 3 ? 'ring-2' : ''}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: spread >= 3 ? 'var(--color-error)' : 'var(--color-border)',
        ...(spread >= 3 ? { ringColor: 'rgba(239,68,68,0.2)' } : {}),
      }}
      role="slider"
      aria-label={`${axis.left} / ${axis.right}`}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={myPos?.position || undefined}>

      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setShowDetail(!showDetail)}
          className="flex items-center gap-1.5 text-body-sm font-semibold hover:opacity-80 transition-opacity">
          {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{axis.left}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span>{axis.right}</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Divergence alert — Adam Kahane : signal de tension */}
          {spread >= 3 && (
            <span className="flex items-center gap-1 text-label font-semibold"
              style={{ color: 'var(--color-error)' }}
              title="Tension non résolue — une conversation est nécessaire">
              <AlertTriangle size={12} /> Divergence forte
            </span>
          )}
          {spread >= 2 && spread < 3 && (
            <span className="text-label font-medium" style={{ color: 'var(--color-warning)' }}>Écart modéré</span>
          )}
          {spread < 2 && allPositions.length > 0 ? (
            <span className="text-label font-medium" style={{ color: 'var(--color-success)' }}>Aligné</span>
          ) : null}
          {isLocked && <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />}
          {state.isFacilitator && (
            <button onClick={lockAxis} className="p-0.5 rounded-btn transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={isLocked ? 'Déverrouiller' : 'Verrouiller'}>
              {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-caption min-w-[7rem] max-w-[10rem] text-right shrink-0" style={{ color: 'var(--color-text-muted)' }}>{axis.left}</span>
        <div className="flex-1 flex items-center justify-between px-2 relative">
          {/* Track line */}
          <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2" style={{ backgroundColor: 'var(--color-border)' }} />
          {/* Position circles */}
          {[1, 2, 3, 4, 5].map(pos => {
            const posParticipants = positions.filter(p => p.position === pos);
            const isMyPos = myPos?.position === pos;
            const isFinalPos = finalAxis?.position === pos;
            return (
              <button key={pos} onClick={() => setPosition(pos)}
                title={isLocked ? 'Axe verrouillé par le facilitateur' : isMyPos ? 'Votre position actuelle' : `Positionner sur ${pos}`}
                className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'}
                  ${pulsePos === pos ? 'animate-pulse-axis' : ''}`}
                style={{
                  borderColor: isMyPos ? 'var(--color-accent)' : isFinalPos ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: isMyPos ? 'var(--color-accent)' : isFinalPos ? 'rgba(255,222,89,0.3)' : 'var(--color-surface)',
                  color: isMyPos ? 'var(--color-primary)' : 'var(--color-text)',
                  ...(isMyPos ? { transform: 'scale(1.1)', boxShadow: '0 0 0 3px rgba(255,222,89,0.3)' } : {}),
                }}
                aria-label={`Position ${pos}`}>
                <span className="text-caption font-bold">{pos}</span>
                {/* Participant dots below */}
                {posParticipants.length > 0 && (
                  <div className="absolute -bottom-3 flex -space-x-1">
                    {posParticipants.slice(0, 5).map(p => (
                      <div key={p.pseudo} className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: p.color, borderColor: 'var(--color-surface)' }} title={p.pseudo} />
                    ))}
                    {posParticipants.length > 5 && <span className="text-[8px] ml-0.5">+{posParticipants.length - 5}</span>}
                  </div>
                )}
              </button>
            );
          })}
          {/* Average marker */}
          {avg !== null && (
            <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `calc(${((avg - 1) / 4) * 100}% + 8px)` }}>
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent -translate-x-1/2 -translate-y-3"
                style={{ borderBottomColor: 'var(--color-primary)' }}
                title={`Moyenne: ${avg.toFixed(1)}`} />
            </div>
          )}
        </div>
        <span className="text-caption min-w-[7rem] max-w-[10rem] shrink-0" style={{ color: 'var(--color-text-muted)' }}>{axis.right}</span>
      </div>

      {/* Respondents count */}
      <div className="text-label text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {allPositions.length} répondant{allPositions.length !== 1 ? 's' : ''}
      </div>

      {/* Detail panel */}
      {showDetail && (
        <div className="mt-3 pt-3 border-t space-y-2 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
          {/* Questions for this axis — méthode Insuffle */}
          {AXES_QUESTIONS[axis.key]?.map((q, i) => (
            <p key={i} className="text-body-sm italic highlight-accent py-0.5"
              style={{ color: 'var(--color-text-muted)' }}>
              {q}
            </p>
          ))}
          <p className="text-label" style={{ color: 'var(--color-text-muted)' }}>
            Méthode de cadrage Insuffle · <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">insuffle.com</a>
          </p>

          {/* Explanation input */}
          {!isLocked && !state.archived && (
            <div>
              <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                placeholder="Expliquer mon choix..."
                className="input-field w-full text-body-sm resize-none" rows={2} />
            </div>
          )}

          {/* Facilitator: set final position */}
          {state.isFacilitator && (
            <div className="flex items-center gap-2">
              <span className="text-caption font-medium">Position finale :</span>
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} onClick={() => setFinal(p)}
                  className="w-7 h-7 rounded-full text-caption font-bold transition-all"
                  style={{
                    backgroundColor: finalAxis?.position === p ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                    color: finalAxis?.position === p ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Individual positions */}
          <div className="space-y-1">
            {positions.filter(p => p.position != null).map(p => (
              <div key={p.pseudo} className="flex items-center gap-2 text-body-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-medium">{p.pseudo}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Position {p.position}</span>
                {p.explanation && <span className="italic" style={{ color: 'var(--color-text-muted)' }}>— {p.explanation}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Alertes de tension sur le cadrage — Adam Kahane ===== */
function CadrageAlerts({ axes, axesDef, cards }) {
  const alerts = [];

  // Divergence forte sur un axe
  for (const axisDef of axesDef) {
    const positions = axes.filter(a => a.axis_key === axisDef.key && a.position != null).map(a => a.position);
    if (positions.length > 1) {
      const spread = Math.max(...positions) - Math.min(...positions);
      if (spread >= 3) {
        alerts.push({
          type: 'error',
          message: `Divergence forte sur "${axisDef.left} / ${axisDef.right}". Une conversation est nécessaire avant le temps collectif.`,
        });
      }
    }
  }

  // Monopole : toutes les cartes par la même personne
  if (cards.length >= 5) {
    const authors = new Set(cards.map(c => c.author));
    if (authors.size === 1) {
      alerts.push({
        type: 'warning',
        message: `Toutes les cartes ont été créées par la même personne. Le cadrage gagne en qualité quand plusieurs voix s'expriment.`,
      });
    }
  }

  // Colonne Risques vide
  const riskCards = cards.filter(c => c.phase === 'pendant_risques');
  const otherCards = cards.filter(c => c.phase !== 'pendant_risques');
  if (otherCards.length >= 3 && riskCards.length === 0) {
    alerts.push({
      type: 'warning',
      message: `La phase "Risques" est vide. Identifier les risques avant le temps collectif est essentiel.`,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-2 p-3 rounded-btn text-body-sm"
          style={{
            backgroundColor: a.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            color: a.type === 'error' ? 'var(--color-error)' : 'var(--color-warning)',
          }}
          role="alert">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{a.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ===== Section permanente des 8 axes — Seth Godin : "la pépite au centre, pas dans un tiroir" ===== */
export default function AxesPanel() {
  const { state } = useStore();
  const [expanded, setExpanded] = useState(true);

  // Count axes with at least one position
  const axesWithPositions = state.axesDef.filter(ax =>
    state.axes.some(a => a.axis_key === ax.key && a.position != null)
  ).length;

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-6 py-6" aria-label="8 axes de positionnement">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 group">
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <div>
            <h2 className="font-display text-h2-mobile md:text-h2 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}>
              8 axes de positionnement
              {expanded ? <ChevronUp size={18} className="opacity-40" /> : <ChevronDown size={18} className="opacity-40" />}
            </h2>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Le cœur de la conversation sponsor / facilitateur · Méthode Insuffle
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-caption font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {axesWithPositions}/8 positionnés
          </span>
          {/* Mini progress */}
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(axesWithPositions / 8) * 100}%`, backgroundColor: 'var(--color-accent)' }} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in">
          {/* Alertes de tension — Adam Kahane */}
          <CadrageAlerts axes={state.axes} axesDef={state.axesDef} cards={state.cards} />

          {/* Axes grid — 2 colonnes sur desktop, 1 sur mobile */}
          <div className="grid md:grid-cols-2 gap-3">
            {state.axesDef.map(axis => (
              <AxisSlider key={axis.key} axis={axis} />
            ))}
          </div>

          {/* Attribution Insuffle */}
          <p className="text-label text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Les 8 axes encodent 15 ans de terrain · Méthode de cadrage Insuffle ·{' '}
            <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">insuffle.com</a>
          </p>
        </div>
      )}
    </section>
  );
}
