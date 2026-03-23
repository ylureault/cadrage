import { useState, useEffect } from 'react';
import { useStore } from '../store.jsx';
import { api } from '../api.js';
import { X, Activity } from 'lucide-react';

export default function ActivityPanel() {
  const { state, dispatch } = useStore();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (state.spaceId) {
      api.getActivity(state.spaceId).then(setLogs).catch(() => {});
    }
  }, [state.spaceId]);

  const actionLabels = {
    'join': 'a rejoint le cadrage',
    'leave': 'a quitté le cadrage',
    'create-card': 'a ajouté une carte',
    'delete-card': 'a supprimé une carte',
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[350px] max-w-[90vw] z-40 flex flex-col animate-slide-in elevation-3"
      style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-body">Activité récente</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_ACTIVITY' })}
          className="p-1 rounded-btn transition-colors" style={{ color: 'var(--color-text-muted)' }}
          aria-label="Fermer"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={32} className="mx-auto mb-3" style={{ color: 'var(--color-border)' }} />
            <p className="text-body-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Pas encore d'activité</p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Les actions des participants apparaîtront ici en temps réel
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-border)' }} />
                <div>
                  <span className="font-medium">{log.pseudo}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}> {actionLabels[log.action] || log.action}</span>
                  {log.target && <span style={{ color: 'var(--color-text-muted)' }}> dans {log.target}</span>}
                  {log.details && <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{log.details}</p>}
                  <p className="text-caption" style={{ color: 'var(--color-border)' }}>
                    {new Date(log.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
