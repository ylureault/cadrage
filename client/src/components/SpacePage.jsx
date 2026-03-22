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

export default function SpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPseudo, setShowPseudo] = useState(true);

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
    setShowPseudo(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-insuffle-gold rounded-lg animate-pulse-slow mx-auto mb-4 flex items-center justify-center font-bold text-insuffle-dark text-xl">I</div>
          <p className="text-gray-500">Chargement du cadrage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-insuffle-gold rounded-xl mx-auto mb-4 flex items-center justify-center font-bold text-insuffle-dark text-2xl">I</div>
          <h1 className="text-2xl font-bold mb-2">Espace introuvable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">Créer un nouveau cadrage</button>
          <p className="mt-4 text-sm text-gray-500">
            <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">En savoir plus sur Insuffle</a>
          </p>
        </div>
      </div>
    );
  }

  if (showPseudo || !state.pseudo) {
    return <PseudoModal onJoin={handleJoin} spaceName={state.space?.client_name} welcomeMessage={state.welcomeMessage} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${state.darkMode ? 'dark bg-gray-900' : 'bg-insuffle-light'}`}>
      {/* Offline banner */}
      {state.offline && (
        <div className="bg-insuffle-gold text-insuffle-dark px-4 py-2 text-center text-sm font-medium">
          Connexion perdue — vos modifications seront synchronisées au retour
        </div>
      )}

      {/* Archived banner */}
      {state.archived && (
        <div className="bg-gray-500 text-white px-4 py-2 text-center text-sm font-medium">
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

      {/* Phase tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto flex overflow-x-auto">
          {state.phases.map(phase => {
            const ps = state.phaseStates.find(p => p.phase === phase.key);
            if (ps?.hidden && !state.isFacilitator) return null;
            const isActive = state.activePhase === phase.key;
            const cardCount = state.cards.filter(c => c.phase === phase.key).length;
            return (
              <button key={phase.key}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PHASE', phase: phase.key })}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${isActive ? 'border-insuffle-gold text-insuffle-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}
                  ${ps?.hidden ? 'opacity-40' : ''}`}
                style={isActive ? { borderColor: phase.color } : {}}>
                {ps?.locked ? '🔒 ' : ''}{phase.name}
                {cardCount > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{cardCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <main className="flex-1 overflow-auto">
        {state.phases.map(phase => (
          state.activePhase === phase.key && <PhaseView key={phase.key} phase={phase} />
        ))}
      </main>

      {/* Side panels */}
      {state.showAxes && <AxesPanel />}
      {state.showActivity && <ActivityPanel />}
      {state.showStats && <StatsPanel />}
      {state.showExport && <ExportPanel />}

      {/* Spotlight overlay */}
      {state.spotlight && <SpotlightOverlay />}

      {/* Notifications */}
      <Notifications />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <span>Propulsé par</span>
        <span className="font-semibold text-insuffle-dark">Insuffle</span>
        <span>|</span>
        <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">insuffle.com</a>
        <span>|</span>
        <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">Insuffle Académie</a>
      </footer>
    </div>
  );
}
