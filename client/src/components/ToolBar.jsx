import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import {
  Search, Sliders, Activity, BarChart3, Download, Sun, Moon,
  Lock, Unlock, Eye, EyeOff, Timer, Star, MessageSquare, Copy,
  QrCode, Link2, Archive, ArchiveRestore, Settings
} from 'lucide-react';

export default function ToolBar() {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [showSearch, setShowSearch] = useState(false);
  const [timerInput, setTimerInput] = useState('');
  const [showFacilitatorTools, setShowFacilitatorTools] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Lien copié', type: 'success' } });
  }

  function startTimer() {
    const mins = parseInt(timerInput);
    if (mins > 0 && mins <= 60) {
      socket.emit('start-timer', { duration: mins * 60 });
      setTimerInput('');
    }
  }

  function stopTimer() { socket.emit('stop-timer'); }

  function becomeFacilitator() {
    socket.emit('set-facilitator', { pseudo: state.pseudo, add: true });
  }

  function toggleArchive() {
    socket.emit('archive-space', { archived: !state.archived });
  }

  return (
    <div className="text-white no-print" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-2">
        {/* US-381: Logo Insuffle */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          aria-label="Retour à l'accueil Insuffle">
          <div className="w-7 h-7 rounded-btn flex items-center justify-center font-display font-bold text-sm"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>I</div>
          <span className="font-display font-bold text-sm hidden sm:block">Insuffle <span style={{ color: 'var(--color-accent)' }}>Cadrage Live</span></span>
        </button>

        {/* Tools */}
        <div className="flex items-center gap-1">
          {/* Search */}
          {showSearch ? (
            <div className="flex items-center gap-1">
              <input value={state.searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                placeholder="Rechercher..."
                className="bg-white/10 text-white px-2 py-1 rounded text-sm w-32 focus:outline-none focus:ring-1 focus:ring-insuffle-gold"
                autoFocus onBlur={() => { if (!state.searchQuery) setShowSearch(false); }}
              />
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="p-1.5 hover:bg-white/10 rounded" title="Rechercher">
              <Search size={18} />
            </button>
          )}

          <button onClick={() => dispatch({ type: 'TOGGLE_AXES' })}
            className={`p-1.5 hover:bg-white/10 rounded ${state.showAxes ? 'bg-white/20' : ''}`} title="8 axes de positionnement">
            <Sliders size={18} />
          </button>

          <button onClick={() => dispatch({ type: 'TOGGLE_ACTIVITY' })}
            className={`p-1.5 hover:bg-white/10 rounded ${state.showActivity ? 'bg-white/20' : ''}`} title="Activité récente">
            <Activity size={18} />
          </button>

          <button onClick={copyLink} className="p-1.5 hover:bg-white/10 rounded" title="Copier le lien">
            <Copy size={18} />
          </button>

          <button onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })}
            className={`p-1.5 hover:bg-white/10 rounded ${state.showExport ? 'bg-white/20' : ''}`} title="Exporter">
            <Download size={18} />
          </button>

          <button onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
            className="p-1.5 hover:bg-white/10 rounded" title="Mode sombre">
            {state.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Facilitator */}
          {!state.isFacilitator ? (
            <button onClick={becomeFacilitator} className="p-1.5 hover:bg-white/10 rounded text-xs flex items-center gap-1" title="Devenir facilitateur">
              <Settings size={18} />
            </button>
          ) : (
            <button onClick={() => setShowFacilitatorTools(!showFacilitatorTools)}
              className={`p-1.5 rounded text-insuffle-gold hover:bg-white/10 ${showFacilitatorTools ? 'bg-white/20' : ''}`} title="Outils facilitateur">
              <Settings size={18} />
            </button>
          )}
        </div>

        {/* Connection info */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: state.offline ? '#ef4444' : '#22c55e' }} />
            <span className="text-xs text-gray-400">{state.offline ? 'Hors ligne' : 'Connecté'}</span>
          </div>
        </div>
      </div>

      {/* US-406: Facilitator toolbar */}
      {state.isFacilitator && showFacilitatorTools && (
        <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-sm animate-slide-in"
          style={{ backgroundColor: 'rgba(255,222,89,0.1)' }}>
          <span className="font-semibold text-label uppercase" style={{ color: 'var(--color-accent)' }}>Facilitateur</span>

          {/* Phase controls */}
          {state.phases.map(phase => {
            const ps = state.phaseStates.find(p => p.phase === phase.key);
            return (
              <div key={phase.key} className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
                <span className="text-xs">{phase.name}</span>
                <button onClick={() => socket.emit('lock-phase', { phase: phase.key, locked: !ps?.locked })}
                  className="p-0.5 hover:bg-white/10 rounded" title={ps?.locked ? 'Déverrouiller' : 'Verrouiller'}>
                  {ps?.locked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
                <button onClick={() => socket.emit('hide-phase', { phase: phase.key, hidden: !ps?.hidden })}
                  className="p-0.5 hover:bg-white/10 rounded" title={ps?.hidden ? 'Afficher' : 'Masquer'}>
                  {ps?.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            );
          })}

          {/* Timer */}
          <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
            <Timer size={14} />
            <input value={timerInput} onChange={e => setTimerInput(e.target.value)}
              placeholder="min" className="w-10 bg-transparent text-white text-xs focus:outline-none" type="number" min="1" max="60" />
            <button onClick={startTimer} className="text-xs text-insuffle-gold hover:underline">Go</button>
            {state.timer && <button onClick={stopTimer} className="text-xs text-red-300 hover:underline ml-1">Stop</button>}
          </div>

          {/* Stats */}
          <button onClick={() => dispatch({ type: 'TOGGLE_STATS' })}
            className="flex items-center gap-1 bg-white/10 rounded px-2 py-1 hover:bg-white/20">
            <BarChart3 size={14} /> <span className="text-xs">Stats</span>
          </button>

          {/* Archive */}
          <button onClick={toggleArchive}
            className="flex items-center gap-1 bg-white/10 rounded px-2 py-1 hover:bg-white/20">
            {state.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            <span className="text-xs">{state.archived ? 'Réouvrir' : 'Archiver'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
