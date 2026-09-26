import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { Layout, ExternalLink, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Onglet DarkBoard — encapsule le board collaboratif en iframe dans le cadrage.
 * Crée automatiquement le board lié si nécessaire.
 */
export default function DarkboardTab({ spaceId }) {
  const [status, setStatus] = useState('checking'); // checking | creating | ready | error
  const [embedUrl, setEmbedUrl] = useState(null);
  const [boardUrl, setBoardUrl] = useState(null);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Check if board already exists
        const { exists } = await api.getBoardStatus(spaceId);

        if (exists) {
          const { embedUrl: url } = await api.getBoardEmbed(spaceId);
          if (!cancelled) {
            setEmbedUrl(url);
            setBoardUrl(url.replace('embed=true&', '').replace('&embed=true', ''));
            setStatus('ready');
          }
          return;
        }

        // Board doesn't exist yet — create it
        if (!cancelled) setStatus('creating');
        const result = await api.launchBoard(spaceId, { prefill: true });

        if (!cancelled) {
          const { embedUrl: url } = await api.getBoardEmbed(spaceId);
          setEmbedUrl(url);
          setBoardUrl(result.boardUrl);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [spaceId]);

  if (status === 'checking' || status === 'creating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            boxShadow: '0 0 30px rgba(56,189,248,0.3)',
          }}>
          <Layout size={28} color="white" />
        </div>
        <div className="flex items-center gap-2 text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Loader2 size={16} className="animate-spin" />
          {status === 'checking' ? 'Connexion à DarkBoard...' : 'Création du tableau collaboratif...'}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <AlertCircle size={28} style={{ color: 'var(--color-warning)' }} />
        </div>
        <div className="text-center">
          <p className="text-body-sm font-medium mb-1">Impossible de charger DarkBoard</p>
          <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        </div>
        <button onClick={() => { setStatus('checking'); setError(null); }}
          className="btn-primary text-body-sm px-4 py-2">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}
      style={fullscreen ? { backgroundColor: 'var(--color-surface)' } : { minHeight: 'calc(100vh - 120px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' }}>
            <Layout size={14} color="white" />
          </div>
          <span className="font-display font-semibold text-body-sm">DarkBoard</span>
          <span className="text-caption px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
            Temps réel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href={boardUrl} target="_blank" rel="noopener"
            className="flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-alt)]"
            style={{ color: 'var(--color-text-muted)' }}>
            <ExternalLink size={12} /> Ouvrir dans un nouvel onglet
          </a>
          <button onClick={() => setFullscreen(f => !f)}
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-alt)]"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* iframe — full height, no white space */}
      <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <iframe
          src={embedUrl}
          title="DarkBoard, tableau collaboratif"
          className="w-full border-0"
          style={{ flex: 1, height: fullscreen ? 'calc(100vh - 48px)' : 'calc(100vh - 160px)', minHeight: '400px' }}
          allow="clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
