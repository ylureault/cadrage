import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { api } from '../api.js';
import socket from '../socket.js';
import PseudoModal from './PseudoModal.jsx';
import CanvasHeader from './CanvasHeader.jsx';
import PhaseView from './PhaseView.jsx';
import ToolBar from './ToolBar.jsx';
import AxesPanel from './AxesPanel.jsx';
import ActivityPanel from './ActivityPanel.jsx';
import StatsPanel from './StatsPanel.jsx';
import ExportPanel from './ExportPanel.jsx';
import TimerDisplay from './TimerDisplay.jsx';
import SpotlightOverlay from './SpotlightOverlay.jsx';
import Notifications from './Notifications.jsx';
import ParticipantsBar from './ParticipantsBar.jsx';
import CommandPalette from './CommandPalette.jsx';
import OnboardingTour from './OnboardingTour.jsx';

export default function SpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Session persistence: restore pseudo from sessionStorage on mount
  const sessionKey = `insuffle-session-${spaceId}`;
  const savedPseudo = sessionStorage.getItem(sessionKey);
  const [showPseudo, setShowPseudo] = useState(!savedPseudo);

  // Restore pseudo into store on mount if we have a saved session
  useEffect(() => {
    if (savedPseudo && !state.pseudo) {
      dispatch({ type: 'SET_PSEUDO', pseudo: savedPseudo, color: null });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* US-408, US-411: Keyboard shortcuts */
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(true); }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setShowCommandPalette(true); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleCommandAction(actionId) {
    switch (actionId) {
      case 'export': dispatch({ type: 'TOGGLE_EXPORT' }); break;
      case 'axes': dispatch({ type: 'TOGGLE_AXES' }); break;
      case 'activity': dispatch({ type: 'TOGGLE_ACTIVITY' }); break;
      case 'facilitator': socket.emit('set-facilitator', { pseudo: state.pseudo, add: true }); break;
      case 'help': setShowCommandPalette(true); break;
    }
  }

  // Load canvas structure + space data
  useEffect(() => {
    async function load() {
      try {
        const [structure, spaceData] = await Promise.all([
          api.getStructure(),
          api.getSpace(spaceId)
        ]);
        dispatch({ type: 'LOAD_STRUCTURE', phases: structure.phases, axes: structure.axes });
        dispatch({ type: 'SET_SPACE_ID', spaceId });
        dispatch({ type: 'LOAD_SPACE', data: spaceData });
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    }
    load();
  }, [spaceId, dispatch]);

  // Socket setup
  useEffect(() => {
    if (!state.pseudo || !spaceId) return;

    socket.connect();
    socket.emit('join-space', { spaceId, pseudo: state.pseudo });

    socket.on('joined', ({ pseudo, color, archived }) => {
      dispatch({ type: 'SET_PSEUDO', pseudo, color });
      dispatch({ type: 'SET_CONNECTED', connected: true });
      dispatch({ type: 'SET_ARCHIVED', archived: !!archived });

      // Update recent spaces
      const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]');
      const idx = recent.findIndex(r => r.id === spaceId);
      if (idx >= 0) recent.splice(idx, 1);
      recent.unshift({ id: spaceId, date: new Date().toISOString(), client: state.space?.client_name || '' });
      localStorage.setItem('recentSpaces', JSON.stringify(recent.slice(0, 20)));
    });

    socket.on('participants', (p) => dispatch({ type: 'SET_PARTICIPANTS', participants: p }));
    socket.on('facilitators-updated', (f) => dispatch({ type: 'SET_FACILITATORS', facilitators: f }));
    socket.on('header-updated', ({ field, value }) => dispatch({ type: 'UPDATE_HEADER', field, value }));

    socket.on('card-created', (card) => dispatch({ type: 'ADD_CARD', card }));
    socket.on('card-updated', ({ cardId, content }) => dispatch({ type: 'UPDATE_CARD', cardId, content }));
    socket.on('card-deleted', ({ cardId }) => dispatch({ type: 'DELETE_CARD', cardId }));
    socket.on('card-moved', (d) => dispatch({ type: 'MOVE_CARD', ...d }));
    socket.on('card-marked-discuss', ({ cardId, marked }) => dispatch({ type: 'MARK_DISCUSS', cardId, marked }));
    socket.on('card-tags-updated', ({ cardId, tags }) => dispatch({ type: 'UPDATE_TAGS', cardId, tags }));
    socket.on('card-reactions-updated', ({ cardId, reactions }) => dispatch({ type: 'UPDATE_REACTIONS', cardId, reactions }));
    socket.on('votes-updated', (votes) => dispatch({ type: 'UPDATE_VOTES', votes }));
    socket.on('comment-added', (comment) => dispatch({ type: 'ADD_COMMENT', comment }));

    socket.on('axis-updated', ({ axisKey, positions }) => dispatch({ type: 'UPDATE_AXIS', axisKey, positions }));
    socket.on('axis-final-updated', ({ axisKey, position }) => dispatch({ type: 'UPDATE_AXIS_FINAL', axisKey, position }));
    socket.on('axis-lock-changed', ({ axisKey, locked }) => dispatch({ type: 'UPDATE_AXIS_LOCK', axisKey, locked }));

    socket.on('phase-state-changed', (d) => dispatch({ type: 'UPDATE_PHASE_STATE', ...d }));

    socket.on('timer-update', ({ remaining, duration }) => dispatch({ type: 'SET_TIMER', timer: { remaining, duration } }));
    socket.on('timer-stopped', () => dispatch({ type: 'CLEAR_TIMER' }));
    socket.on('timer-ended', () => {
      dispatch({ type: 'CLEAR_TIMER' });
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Temps écoulé !', type: 'warning' } });
    });

    socket.on('spotlight-changed', ({ cardId }) => dispatch({ type: 'SET_SPOTLIGHT', cardId }));
    socket.on('silent-mode-changed', ({ columnKey, active }) => dispatch({ type: 'SET_SILENT_MODE', columnKey, active }));
    socket.on('cards-revealed', ({ columnKey }) => dispatch({ type: 'REVEAL_COLUMN', columnKey }));
    socket.on('participant-focus', ({ pseudo, color, columnKey }) => dispatch({ type: 'SET_FOCUS', pseudo, columnKey }));
    socket.on('space-archived', ({ archived }) => dispatch({ type: 'SET_SPACE_ARCHIVED', archived }));
    socket.on('welcome-message-updated', ({ message }) => dispatch({ type: 'SET_WELCOME_MESSAGE', message }));

    socket.on('notification', ({ message }) => dispatch({ type: 'ADD_NOTIFICATION', notification: { message, type: 'info' } }));
    socket.on('error', ({ message }) => dispatch({ type: 'ADD_NOTIFICATION', notification: { message, type: 'error' } }));

    socket.on('disconnect', () => dispatch({ type: 'SET_OFFLINE', offline: true }));
    socket.on('connect', () => dispatch({ type: 'SET_OFFLINE', offline: false }));

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [state.pseudo, spaceId, dispatch]);

  function handleJoin(pseudo) {
    dispatch({ type: 'SET_PSEUDO', pseudo, color: null });
    sessionStorage.setItem(sessionKey, pseudo);
    setShowPseudo(false);
    // Show onboarding tour on first visit
    const onboardingKey = `insuffle-onboarding-done-${spaceId}`;
    if (!localStorage.getItem(onboardingKey)) {
      setTimeout(() => setShowOnboarding(true), 800); // Let canvas load first
    }
  }

  function handleOnboardingComplete() {
    setShowOnboarding(false);
    localStorage.setItem(`insuffle-onboarding-done-${spaceId}`, 'true');
  }

  /* US-393: Loading screen avec animation Insuffle */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl animate-pulse-glow"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
          <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  /* US-372: Error empty state */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-card mx-auto mb-4 flex items-center justify-center font-display font-bold text-2xl"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
          <h1 className="font-display text-h2-mobile mb-2">Espace introuvable</h1>
          <p className="text-body-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">Créer un nouveau cadrage</button>
          <p className="mt-4 text-caption">
            <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline" style={{ color: 'var(--color-text-muted)' }}>En savoir plus sur Insuffle</a>
          </p>
        </div>
      </div>
    );
  }

  if (showPseudo || !state.pseudo) {
    return <PseudoModal onJoin={handleJoin} spaceName={state.space?.client_name} welcomeMessage={state.welcomeMessage} facilitatorName={state.space?.facilitator} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${state.darkMode ? 'dark' : ''}`}
      style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)' }}>
      {/* US-441: Offline banner */}
      {state.offline && (
        <div className="px-4 py-2 text-center text-body-sm font-medium" role="alert"
          style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-primary)' }}>
          Connexion perdue — vos modifications seront synchronisées au retour
        </div>
      )}

      {/* Archived banner */}
      {state.archived && (
        <div className="px-4 py-2 text-center text-body-sm font-medium" role="status"
          style={{ backgroundColor: 'var(--color-text-muted)', color: 'white' }}>
          Cadrage archivé — lecture seule
        </div>
      )}

      {/* Timer */}
      {state.timer && <TimerDisplay timer={state.timer} isFacilitator={state.isFacilitator} />}

      {/* Top bar */}
      <ToolBar />

      {/* Header */}
      <CanvasHeader />

      {/* Participants */}
      <ParticipantsBar />

      {/* US-422: Phase tabs */}
      <div className="border-b sticky top-0 z-20" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        role="tablist" aria-label="Phases du cadrage">
        <div className="max-w-[1600px] mx-auto flex overflow-x-auto">
          {state.phases.map(phase => {
            const ps = state.phaseStates.find(p => p.phase === phase.key);
            if (ps?.hidden && !state.isFacilitator) return null;
            const isActive = state.activePhase === phase.key;
            const cardCount = state.cards.filter(c => c.phase === phase.key).length;
            return (
              <button key={phase.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`phase-${phase.key}`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PHASE', phase: phase.key })}
                className={`flex items-center gap-2 px-5 py-3 text-body-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200
                  ${isActive ? '' : 'border-transparent hover:border-[var(--color-border)]'}
                  ${ps?.hidden ? 'opacity-40' : ''}`}
                style={{
                  borderBottomColor: isActive ? 'var(--color-accent)' : undefined,
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                }}>
                {ps?.locked ? '🔒 ' : ''}{phase.name}
                {cardCount > 0 ? (
                  <span className="text-label px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: isActive ? 'rgba(255,222,89,0.2)' : 'var(--color-surface-alt)', color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {cardCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* US-417: Progress bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${Math.round((state.phases.reduce((acc, p) => acc + (state.cards.some(c => c.phase === p.key) ? 1 : 0), 0) / Math.max(state.phases.length, 1)) * 100)}%` }} />
      </div>

      {/* Canvas */}
      <main className="flex-1 overflow-auto" role="main" aria-label="Canvas de cadrage">
        {state.phases.map(phase => (
          state.activePhase === phase.key && <PhaseView key={phase.key} phase={phase} />
        ))}

        {/* 8 axes — section permanente en bas du canvas (Seth Godin : la pépite au centre, pas dans un tiroir) */}
        <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
          <AxesPanel />
        </div>
      </main>

      {/* Side panels (axes removed from here — now inline) */}
      {state.showActivity && <ActivityPanel />}
      {state.showStats && <StatsPanel />}
      {state.showExport && <ExportPanel />}

      {/* Spotlight overlay */}
      {state.spotlight && <SpotlightOverlay />}

      {/* US-411: Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} onAction={handleCommandAction} />
      )}

      {/* Onboarding tour */}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      {/* Notifications */}
      <Notifications />

      {/* US-381, US-459: Footer */}
      <footer className="border-t py-2 px-4 text-center no-print" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-center gap-2 text-label" style={{ color: 'var(--color-text-muted)' }}>
          <span>Propulsé par</span>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Insuffle</span>
          <span>·</span>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">insuffle.com</a>
          <span>·</span>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline" style={{ color: 'var(--color-academie)' }}>Insuffle Académie</a>
        </div>
      </footer>
    </div>
  );
}
