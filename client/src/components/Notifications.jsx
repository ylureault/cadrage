import { useEffect } from 'react';
import { useStore } from '../store.jsx';
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';

/* US-373: Toasts de notification non intrusifs */
const TOAST_CONFIG = {
  info: { icon: Info, bg: 'var(--color-surface)', border: 'var(--color-border)', iconColor: 'var(--color-text-muted)' },
  success: { icon: Check, bg: 'var(--color-surface)', border: 'var(--color-success)', iconColor: 'var(--color-success)' },
  warning: { icon: AlertTriangle, bg: 'var(--color-surface)', border: 'var(--color-warning)', iconColor: 'var(--color-warning)' },
  error: { icon: AlertCircle, bg: 'var(--color-surface)', border: 'var(--color-error)', iconColor: 'var(--color-error)' },
};

export default function Notifications() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const timers = [];
    for (const n of state.notifications) {
      // Errors don't auto-dismiss (US-373)
      if (n.type === 'error') continue;
      timers.push(setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id });
      }, 3000));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [state.notifications, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
      {state.notifications.slice(-3).map(n => {
        const config = TOAST_CONFIG[n.type] || TOAST_CONFIG.info;
        const Icon = config.icon;
        return (
          <div key={n.id}
            className="flex items-center gap-3 px-4 py-3 rounded-card elevation-2 animate-slide-in max-w-sm"
            style={{
              backgroundColor: config.bg,
              borderLeft: `4px solid ${config.border}`,
            }}>
            <Icon size={18} style={{ color: config.iconColor }} strokeWidth={2} />
            <span className="text-body-sm flex-1" style={{ color: 'var(--color-text)' }}>{n.message}</span>
            <button onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
              className="p-1 rounded-btn transition-colors shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Fermer">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
