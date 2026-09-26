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
import DarkboardPromo from './DarkboardPromo.jsx';
import DarkboardTab from './DarkboardTab.jsx';
import RecapTab from './RecapTab.jsx';
import ConceptionPage from './planning/ConceptionPage.jsx';
import AgendaA4Page from './planning/AgendaA4Page.jsx';
import SuccessPage, { VoteCard } from './success/SuccessPage.jsx';
import ReperesDrawer from './ReperesDrawer.jsx';
import Logo from './brand/Logo.jsx';

export default function SpacePage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  // Vue active : 'phase' (le canvas de cadrage) | 'conception' | 'agenda' | 'succes' | 'recap' | 'darkboard'
  const VIEWS = ['phase', 'conception', 'agenda', 'succes', 'recap', 'darkboard'];
  const [view, setViewState] = useState(() => {
    const h = (typeof window !== 'undefined' && window.location.hash.slice(1)) || '';
    return VIEWS.includes(h) ? h : 'phase';
  });
  const setView = useCallback((v) => {
    setViewState(v);
    try { window.history.replaceState(null, '', v === 'phase' ? window.location.pathname : `#${v}`); } catch (_) { /* navigation indisponible */ }
    window.scrollTo({ top: 0 });
  }, []);
  const [hideVote, setHideVote] = useState({});

  // Session persistence: restore pseudo from sessionStorage on mount
  const sessionKey = `insuffle-session-${spaceId}`;
  let savedPseudo = null;
  try { savedPseudo = sessionStorage.getItem(sessionKey); } catch (_) { /* sessionStorage unavailable */ }
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
      case 'axes': setView('phase'); setTimeout(() => document.querySelector('[data-section="polarites"]')?.scrollIntoView({ behavior: 'smooth' }), 100); break;
      case 'activity': dispatch({ type: 'TOGGLE_ACTIVITY' }); break;
      case 'facilitator': socket.emit('set-facilitator', { pseudo: state.pseudo, add: true }); break;
      case 'help': setShowCommandPalette(true); break;
      case 'conception': setView('conception'); break;
      case 'agenda': setView('agenda'); break;
      case 'succes': setView('succes'); break;
      case 'reperes': dispatch({ type: 'TOGGLE_REPERES' }); break;
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
      try {
        const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]');
        const idx = recent.findIndex(r => r.id === spaceId);
        if (idx >= 0) recent.splice(idx, 1);
        recent.unshift({ id: spaceId, date: new Date().toISOString(), client: state.space?.client_name || '' });
        localStorage.setItem('recentSpaces', JSON.stringify(recent.slice(0, 20)));
      } catch (_) { /* localStorage unavailable */ }
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
    socket.on('setting-updated', ({ key, value }) => dispatch({ type: 'UPDATE_SETTING', key, value }));

    // Planning et succès : l'état complet arrive à chaque modification
    socket.on('planning-sync', (d) => dispatch({ type: 'PLANNING_SYNC', ...d }));
    socket.on('success-sync', (d) => dispatch({ type: 'SUCCESS_SYNC', success: d }));
    socket.on('block-comment-added', (comment) => dispatch({ type: 'ADD_BLOCK_COMMENT', comment }));

    socket.on('notification', ({ message }) => dispatch({ type: 'ADD_NOTIFICATION', notification: { message, type: 'info' } }));
    socket.on('activity-notification', (data) => dispatch({ type: 'ADD_NOTIFICATION', notification: { ...data, type: 'activity' } }));
    socket.on('error', ({ message }) => dispatch({ type: 'ADD_NOTIFICATION', notification: { message, type: 'error' } }));

    socket.on('disconnect', () => dispatch({ type: 'SET_OFFLINE', offline: true }));
    socket.on('connect', () => {
      dispatch({ type: 'SET_OFFLINE', offline: false });
      // Reconnexion : on rejoint à nouveau la salle et on recharge l'état (rien n'est perdu entre-temps)
      if (socket.__joinedOnce) {
        socket.emit('join-space', { spaceId, pseudo: state.pseudo });
        api.getSpace(spaceId).then(d => dispatch({ type: 'LOAD_SPACE', data: d })).catch(() => {});
      }
      socket.__joinedOnce = true;
    });

    return () => {
      socket.off();
      socket.disconnect();
      socket.__joinedOnce = false;
    };
  }, [state.pseudo, spaceId, dispatch]);

  // Sync space name to localStorage whenever it changes (fix "Sans nom" on landing)
  useEffect(() => {
    if (!state.space?.client_name || !spaceId) return;
    try {
      const recent = JSON.parse(localStorage.getItem('recentSpaces') || '[]');
      const idx = recent.findIndex(r => r.id === spaceId);
      if (idx >= 0) {
        recent[idx].client = state.space.client_name;
        localStorage.setItem('recentSpaces', JSON.stringify(recent));
      }
    } catch (_) { /* localStorage unavailable */ }
  }, [state.space?.client_name, spaceId]);

  function handleJoin(pseudo) {
    dispatch({ type: 'SET_PSEUDO', pseudo, color: null });
    try { sessionStorage.setItem(sessionKey, pseudo); } catch (_) { /* sessionStorage unavailable */ }
    setShowPseudo(false);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: `Bienvenue ${pseudo} !`, type: 'success' } });
  }

  /* US-393: Loading screen avec animation Insuffle */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#141e37' }}>
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-5 flex justify-center"><Logo height={44} color="#F2C245" /></div>
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-white/20 border-t-[#f2c245] rounded-full animate-spin" />
          <p className="text-body-sm text-white/60">Chargement de votre cadrage...</p>
        </div>
      </div>
    );
  }

  /* US-372: Error empty state */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="text-center animate-scale-in">
          <div className="mx-auto mb-5 flex justify-center"><Logo height={40} color="var(--color-text)" /></div>
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
          Connexion perdue. Vos modifications seront synchronisées au retour.
        </div>
      )}

      {/* Archived banner */}
      {!!state.archived && (
        <div className="px-4 py-2 text-center text-body-sm font-medium" role="status"
          style={{ backgroundColor: 'var(--color-text-muted)', color: 'white' }}>
          Cadrage archivé : lecture seule
        </div>
      )}

      {/* Timer */}
      {state.timer && <TimerDisplay timer={state.timer} isFacilitator={state.isFacilitator} />}

      {/* Top bar */}
      <ToolBar />

      {/* En-tête du cadrage : utile sur le canvas ; ailleurs, la fiche du temps collectif le remplace */}
      {view === 'phase' && <CanvasHeader />}

      {/* Participants */}
      <ParticipantsBar />

      {/* Onglets : le cadrage (4 phases), puis la conception, l'agenda, le succès */}
      <div className="border-b sticky top-0 z-20 no-print" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        role="tablist" aria-label="Espaces du cadrage">
        <div className="max-w-[1600px] mx-auto flex overflow-x-auto items-stretch">
          <span className="hidden md:flex items-center pl-4 pr-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Cadrer</span>
          {state.phases.map(phase => {
            const ps = state.phaseStates.find(p => p.phase === phase.key);
            if (ps?.hidden && !state.isFacilitator) return null;
            const isActive = view === 'phase' && state.activePhase === phase.key;
            const cardCount = state.cards.filter(c => c.phase === phase.key).length;
            return (
              <Tab key={phase.key} active={isActive} dim={ps?.hidden}
                onClick={() => { setView('phase'); dispatch({ type: 'SET_ACTIVE_PHASE', phase: phase.key }); }}
                badge={cardCount > 0 ? cardCount : null}>
                {ps?.locked ? '🔒 ' : null}{phase.name}
              </Tab>
            );
          })}
          <span className="w-px my-2.5 mx-1 shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
          <span className="hidden md:flex items-center pl-2 pr-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Concevoir</span>
          <Tab active={view === 'conception'} onClick={() => setView('conception')} badge={state.blocks.length || null}>CONCEPTION</Tab>
          <Tab active={view === 'agenda'} onClick={() => setView('agenda')}
            badge={state.agendaDays.length ? `${state.agendaDays.length} j` : null}>AGENDA A4</Tab>
          <Tab active={view === 'succes'} onClick={() => setView('succes')}
            badge={state.success?.votesOpen?.length ? 'vote' : (state.success?.criteria?.length || null)}>SUCCÈS</Tab>
          <span className="flex-1" />
          <Tab active={view === 'recap'} onClick={() => setView('recap')}>Fiche récap</Tab>
          <Tab active={view === 'darkboard'} onClick={() => setView('darkboard')} accent="#38bdf8">Atelier</Tab>
        </div>
      </div>

      {/* US-417: Progress bar */}
      <div className="progress-bar no-print">
        <div className="progress-bar-fill" style={{ width: `${Math.round((state.phases.reduce((acc, p) => acc + (state.cards.some(c => c.phase === p.key) ? 1 : 0), 0) / Math.max(state.phases.length, 1)) * 100)}%` }} />
      </div>

      <main className="flex-1 overflow-auto" role="main" aria-label="Cadrage">
        {view === 'darkboard' ? (
          <DarkboardTab spaceId={spaceId} />
        ) : view === 'recap' ? (
          <RecapTab />
        ) : view === 'conception' ? (
          <ConceptionPage onOpenAgenda={() => setView('agenda')} />
        ) : view === 'agenda' ? (
          <AgendaA4Page />
        ) : view === 'succes' ? (
          <SuccessPage />
        ) : (
          <>
            {state.phases.map(phase => (
              state.activePhase === phase.key && <PhaseView key={phase.key} phase={phase} />
            ))}

            <DarkboardPromo spaceId={spaceId} onOpenTab={() => setView('darkboard')} />

            {/* Les 8 polarités, en bas du canvas */}
            <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              <AxesPanel />
            </div>
          </>
        )}
      </main>

      {/* Vote ouvert : chaque participant le voit, où qu'il soit */}
      {view !== 'succes' && (state.success?.votesOpen || []).filter(k => !hideVote[k] && !state.success.votes.some(v => v.kind === k && v.pseudo === state.pseudo)).slice(0, 1).map(k => (
        <div key={k} className="fixed bottom-4 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-card p-4 elevation-3 animate-slide-up no-print" style={{ backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-accent)' }}>
          <button type="button" className="absolute top-2 right-2 text-caption opacity-50 hover:opacity-100" onClick={() => setHideVote(h => ({ ...h, [k]: true }))} aria-label="Masquer">✕</button>
          <VoteCard kind={k} compact />
        </div>
      ))}

      {/* Side panels (axes removed from here — now inline) */}
      {state.showActivity && <ActivityPanel />}
      {state.showStats && <StatsPanel />}
      {state.showExport && <ExportPanel onNavigate={setView} />}
      {state.showReperes && <ReperesDrawer onClose={() => dispatch({ type: 'TOGGLE_REPERES' })} />}

      {/* Spotlight overlay */}
      {state.spotlight && <SpotlightOverlay />}

      {/* US-411: Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} onAction={handleCommandAction} />
      )}

      {/* Notifications */}
      <Notifications />

      <footer className="border-t py-2.5 px-4 no-print" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-label" style={{ color: 'var(--color-text-muted)' }}>
          <a href="https://insuffle.com" target="_blank" rel="noopener" aria-label="Insuffle" className="flex items-center"><Logo height={16} color="var(--color-text)" /></a>
          <span>Cadrage de temps collectif</span>
          <span>·</span>
          <a href="https://insuffle.com" target="_blank" rel="noopener" className="hover:underline">insuffle.com</a>
          <span>·</span>
          <a href="https://insuffle-academie.com" target="_blank" rel="noopener" className="hover:underline" style={{ color: 'var(--color-academie)' }}>Insuffle Académie</a>
          <span>·</span>
          <span>v2.0</span>
        </div>
      </footer>
    </div>
  );
}

function Tab({ active, onClick, children, badge, dim, accent }) {
  return (
    <button role="tab" aria-selected={active} onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-body-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${active ? '' : 'border-transparent hover:border-[var(--color-border)]'} ${dim ? 'opacity-40' : ''}`}
      style={{ borderBottomColor: active ? (accent || 'var(--color-accent)') : undefined, color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
      {children}
      {badge != null && (
        <span className="text-label px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: active ? 'rgba(242,194,69,0.25)' : 'var(--color-surface-alt)', color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
          {badge}
        </span>
      )}
    </button>
  );
}
