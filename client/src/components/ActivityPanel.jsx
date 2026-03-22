import { useState, useEffect } from 'react';
import { useStore } from '../store.jsx';
import { api } from '../api.js';
import { X } from 'lucide-react';

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
    <div className="fixed right-0 top-0 bottom-0 w-[350px] max-w-[90vw] bg-white card-shadow z-40 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold">Activité récente</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_ACTIVITY' })} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucune activité pour le moment</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 text-sm">
                <div className="w-1 bg-gray-200 rounded-full shrink-0" />
                <div>
                  <span className="font-medium">{log.pseudo}</span>
                  <span className="text-gray-500"> {actionLabels[log.action] || log.action}</span>
                  {log.target && <span className="text-gray-400"> dans {log.target}</span>}
                  {log.details && <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>}
                  <p className="text-xs text-gray-300">{new Date(log.created_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
