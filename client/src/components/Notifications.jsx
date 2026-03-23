import { useEffect } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import { X, Check, AlertTriangle, Info, AlertCircle, MessageSquare, ThumbsUp, Eye } from 'lucide-react';

const TOAST_CONFIG = {
  info: { icon: Info, bg: 'var(--color-surface)', border: 'var(--color-border)', iconColor: 'var(--color-text-muted)' },
  success: { icon: Check, bg: 'var(--color-surface)', border: 'var(--color-success)', iconColor: 'var(--color-success)' },
  warning: { icon: AlertTriangle, bg: 'var(--color-surface)', border: 'var(--color-warning)', iconColor: 'var(--color-warning)' },
  error: { icon: AlertCircle, bg: 'var(--color-surface)', border: 'var(--color-error)', iconColor: 'var(--color-error)' },
};

function ActivityToast({ n, dispatch }) {
  function handleReact() {
    if (n.cardId) socket.emit('react', { cardId: n.cardId, emoji: '👍' });
    dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id });
  }
  function handleView() {
    // Scroll to card if visible
    const el = document.querySelector(`[role="listitem"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id });
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3 rounded-card elevation-2 animate-slide-in max-w-sm"
      style={{ backgroundColor: 'var(--color-surface)', borderLeft: '4px solid var(--color-accent)' }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ backgroundColor: n.color || 'var(--color-primary)' }}>
          {n.author?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm">
            <span className="font-semibold">{n.author}</span>{' '}
            <span style={{ color: 'var(--color-text-muted)' }}>{n.message}</span>
          </p>
          {n.preview && (
            <p className="text-caption truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {n.preview.startsWith('[Q] ') ? n.preview.slice(4) : n.preview}
            </p>
          )}
        </div>
        <button onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
          className="p-1 rounded-btn shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          <X size={14} />
        </button>
      </div>
      {/* Action buttons */}
      <div className="flex items-center gap-1.5 ml-9">
        <button onClick={handleReact}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-btn transition-colors hover:bg-[rgba(255,222,89,0.15)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <ThumbsUp size={12} /> J'aime
        </button>
        <button onClick={handleView}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-btn transition-colors hover:bg-[rgba(255,222,89,0.15)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <Eye size={12} /> Voir
        </button>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const timers = [];
    for (const n of state.notifications) {
      if (n.type === 'error') continue;
      const delay = n.type === 'activity' ? 6000 : 3000;
      timers.push(setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id });
      }, delay));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [state.notifications, dispatch]);

  // Split notifications: activity goes top-right, others bottom-right
  const activityNotifs = state.notifications.filter(n => n.type === 'activity').slice(-3);
  const otherNotifs = state.notifications.filter(n => n.type !== 'activity').slice(-3);

  return (
    <>
      {/* Activity notifications — top right */}
      {activityNotifs.length > 0 && (
        <div className="fixed top-16 right-4 z-50 space-y-2" role="status" aria-live="polite">
          {activityNotifs.map(n => (
            <ActivityToast key={n.id} n={n} dispatch={dispatch} />
          ))}
        </div>
      )}

      {/* System notifications — bottom right */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
        {otherNotifs.map(n => {
          const config = TOAST_CONFIG[n.type] || TOAST_CONFIG.info;
          const Icon = config.icon;
          return (
            <div key={n.id}
              className="flex items-center gap-3 px-4 py-3 rounded-card elevation-2 animate-slide-in max-w-sm"
              style={{ backgroundColor: config.bg, borderLeft: `4px solid ${config.border}` }}>
              <Icon size={18} style={{ color: config.iconColor }} strokeWidth={2} />
              <span className="text-body-sm flex-1" style={{ color: 'var(--color-text)' }}>{n.message}</span>
              <button onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
                className="p-1 rounded-btn transition-colors shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
