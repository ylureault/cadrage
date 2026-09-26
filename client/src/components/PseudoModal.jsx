import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from './brand/Logo.jsx';
import { Avatar } from '../live/Avatars.jsx';
import { useStore } from '../store.jsx';

// L'écran d'arrivée : la question du temps collectif, et qui est déjà là, en direct.
export default function PseudoModal({ onJoin, spaceName, welcomeMessage, facilitatorName }) {
  const { spaceId } = useParams();
  const { state } = useStore();
  const [pseudo, setPseudo] = useState(() => { try { return localStorage.getItem('insuffle-pseudo') || ''; } catch { return ''; } });
  const [error, setError] = useState('');
  const [here, setHere] = useState([]);
  const inputRef = useRef(null);
  const question = state.planning?.question;
  const intention = state.planning?.intention;
  const academie = state.planning?.charte === 'academie';

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  // Qui est déjà là : rafraîchi toutes les 4 secondes
  useEffect(() => {
    let alive = true;
    const load = () => fetch(`${import.meta.env.DEV ? 'http://localhost:3001' : ''}/api/spaces/${spaceId}/presence`)
      .then(r => (r.ok ? r.json() : [])).then(d => { if (alive) setHere(Array.isArray(d) ? d : []); }).catch(() => {});
    load();
    const t = setInterval(load, 4000);
    return () => { alive = false; clearInterval(t); };
  }, [spaceId]);

  function handleSubmit(e) {
    e.preventDefault();
    const name = pseudo.trim();
    if (!name) { setError('Votre prénom, pour que les autres vous reconnaissent.'); return; }
    if (name.length > 30) { setError('30 caractères au plus.'); return; }
    try { localStorage.setItem('insuffle-pseudo', name); } catch { /* stockage indisponible */ }
    onJoin(name);
  }

  const names = here.map(p => p.pseudo);
  const hereText = names.length === 0 ? 'Personne pour l\'instant. Vous ouvrez la séance.'
    : names.length === 1 ? `${names[0]} est déjà là.`
      : names.length === 2 ? `${names[0]} et ${names[1]} sont déjà là.`
        : `${names.slice(0, 2).join(', ')} et ${names.length - 2} autre${names.length - 2 > 1 ? 's' : ''} sont déjà là.`;

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="hero-glow text-white relative overflow-hidden flex flex-col p-8 sm:p-12 lg:p-16 min-h-[46vh]">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="relative"><Logo height={30} color="#F2C245" academie={academie} /></div>
        <div className="relative my-auto py-10 max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#F2C245' }}>{spaceName || 'Cadrage de temps collectif'}</p>
          <h1 className="font-display font-bold text-[30px] sm:text-[42px] leading-[1.08] mb-5">
            {question || 'Préparons ce temps collectif, ensemble.'}
          </h1>
          <div className="w-16 h-1.5 rounded-full mb-5" style={{ backgroundColor: '#F2C245' }} />
          {intention && <p className="text-white/75 text-lg leading-relaxed">{intention}</p>}
          {welcomeMessage && <p className="mt-5 text-white/80 text-body leading-relaxed rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>{welcomeMessage}</p>}
        </div>
        <div className="relative flex items-center gap-3">
          <span className="live-dot" />
          <div className="flex -space-x-2">{here.slice(0, 6).map(p => <Avatar key={p.pseudo} p={p} size={30} ring={false} />)}</div>
          <span className="text-white/75 text-body-sm">{hereText}</span>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-slide-up">
          <h2 className="font-display font-bold text-[26px] mb-2">Rejoindre</h2>
          <p className="text-body-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            {facilitatorName ? `Animé par ${facilitatorName}. ` : ''}Pas de compte. Votre prénom suffit, il sera visible des autres.
          </p>
          <label htmlFor="pseudo" className="block text-[13px] font-semibold mb-2">Votre prénom</label>
          <input id="pseudo" ref={inputRef} type="text" value={pseudo} maxLength={30} autoComplete="given-name"
            onChange={(e) => { setPseudo(e.target.value); setError(''); }}
            placeholder="Claire" className="input-field w-full !h-12 !text-[16px] mb-2" aria-required="true" />
          {error && <p className="text-body-sm mb-2" style={{ color: 'var(--color-error)' }} role="alert">{error}</p>}
          <button type="submit" disabled={!pseudo.trim()} className="btn-primary w-full !h-12 !text-[15px] mt-3">
            Entrer dans le cadrage <ArrowRight size={17} />
          </button>
          <p className="text-[12px] mt-8" style={{ color: 'var(--color-text-muted)' }}>
            Insuffle · cabinet de facilitation stratégique. Insuffle Académie · organisme de formation certifié Qualiopi.
          </p>
        </form>
      </div>
    </div>
  );
}
