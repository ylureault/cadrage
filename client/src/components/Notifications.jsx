import { useEffect } from 'react';
import { useStore } from '../store.jsx';
import { X } from 'lucide-react';

const COLORS = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-insuffle-gold text-insuffle-dark',
  error: 'bg-red-500',
};

export default function Notifications() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    if (state.notifications.length > 0) {
      const latest = state.notifications[state.notifications.length - 1];
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', id: latest.id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {state.notifications.slice(-3).map(n => (
        <div key={n.id} className={`${COLORS[n.type] || COLORS.info} text-white px-4 py-2 rounded-lg card-shadow flex items-center gap-2 text-sm animate-slide-in`}>
          <span>{n.message}</span>
          <button onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', id: n.id })}
            className="p-0.5 hover:bg-white/20 rounded"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
