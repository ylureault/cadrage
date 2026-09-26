import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Activity, Archive, ArchiveRestore, BarChart3, CalendarRange, Check, Compass, Copy, Download, FileText, LayoutList,
  Lock, Menu, Sparkles, Presentation, CheckCircle2, Circle, Moon, MonitorPlay, Search, Settings2, Share2, Sun, Target, Timer, Unlock, X, Eye, EyeOff, Columns,
} from 'lucide-react';
import { useStore } from '../../store.jsx';
import socket from '../../socket.js';
import Logo from '../brand/Logo.jsx';
import { AvatarStack, Avatar } from '../../live/Avatars.jsx';
import { Drawer } from '../ui/Overlay.jsx';
import { readiness } from '../../planning/readiness.js';

export const NAV = [
  { key: 'phase', label: 'Cadrer', icon: Compass },
  { key: 'conception', label: 'Concevoir', icon: LayoutList },
  { key: 'agenda', label: 'Agenda A4', icon: CalendarRange },
  { key: 'succes', label: 'Succès', icon: Target },
  { key: 'recap', label: 'Récap', icon: FileText },
];

function useOutside(ref, onOut) {
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onOut(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOut]);
}

function SharePopover({ onClose }) {
  const { dispatch } = useStore();
  const ref = useRef(null);
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  useOutside(ref, onClose);
  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#141E37', light: '#ffffff' } }).then(setQr).catch(() => {}); }, [url]);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { dispatch({ type: 'ADD_NOTIFICATION', notification: { message: url, type: 'info' } }); }
  }
  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 z-50 w-[320px] rounded-modal p-5 elevation-3 animate-scale-in"
      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      <p className="font-display font-semibold text-body mb-1">Inviter la salle</p>
      <p className="text-caption mb-4" style={{ color: 'var(--color-text-muted)' }}>Un lien, un prénom, et chacun travaille en direct. Sans compte.</p>
      {qr && <img src={qr} alt="QR code du cadrage" className="w-44 h-44 mx-auto rounded-xl mb-4" style={{ boxShadow: 'var(--shadow-1)' }} />}
      <div className="flex gap-2">
        <input readOnly value={url} className="input-field flex-1 text-caption" onFocus={e => e.target.select()} aria-label="Lien du cadrage" />
        <button onClick={copy} className="btn-primary !h-[38px] !px-3" aria-label="Copier le lien">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
      </div>
      <p className="text-[11px] mt-3" style={{ color: 'var(--color-text-muted)' }}>Projetez ce QR code en ouverture : toute la salle vote l'échelle Avant / Après depuis son téléphone.</p>
    </div>
  );
}

function MenuItem({ icon: Icon, children, onClick, active, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm text-left transition-colors hover:bg-[var(--color-surface-alt)]"
      style={{ color: danger ? 'var(--color-error)' : 'var(--color-text)' }}>
      <Icon size={16} style={{ color: active ? 'var(--color-accent-dark)' : 'var(--color-text-muted)' }} />
      <span className="flex-1">{children}</span>
      {active && <Check size={14} style={{ color: 'var(--color-accent-dark)' }} />}
    </button>
  );
}

function MoreMenu({ onClose, onFacilitator, onSearch }) {
  const { state, dispatch } = useStore();
  const ref = useRef(null);
  useOutside(ref, onClose);
  const admin = state.isFacilitator || (state.facilitators || []).length === 0;
  const act = (fn) => () => { fn(); onClose(); };
  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 z-50 w-64 rounded-card p-1.5 elevation-3 animate-scale-in"
      style={{ backgroundColor: 'var(--color-surface)' }}>
      <MenuItem icon={Search} onClick={act(onSearch)}>Rechercher dans les cartes</MenuItem>
      <MenuItem icon={Compass} onClick={act(() => dispatch({ type: 'TOGGLE_REPERES' }))}>Repères Insuffle</MenuItem>
      <MenuItem icon={Activity} active={state.showActivity} onClick={act(() => dispatch({ type: 'TOGGLE_ACTIVITY' }))}>Activité récente</MenuItem>
      <MenuItem icon={Download} onClick={act(() => dispatch({ type: 'TOGGLE_EXPORT' }))}>Exporter</MenuItem>
      <MenuItem icon={state.darkMode ? Sun : Moon} onClick={act(() => dispatch({ type: 'TOGGLE_DARK' }))}>{state.darkMode ? 'Mode clair' : 'Mode sombre'}</MenuItem>
      <MenuItem icon={MonitorPlay} onClick={act(() => window.open(`https://darkboard.insuffle.com/board/cadrage-${state.spaceId}`, '_blank', 'noopener'))}>Ouvrir le DarkBoard</MenuItem>
      <div className="h-px my-1.5" style={{ backgroundColor: 'var(--color-border)' }} />
      <MenuItem icon={Sparkles} onClick={act(() => dispatch({ type: 'TOGGLE_INSUFFLE' }))}>Travailler avec Insuffle</MenuItem>
      {state.isFacilitator
        ? <MenuItem icon={Settings2} onClick={act(onFacilitator)}>Outils du facilitateur</MenuItem>
        : <MenuItem icon={Settings2} onClick={act(() => socket.emit('set-facilitator', { pseudo: state.pseudo, add: true }))}>
            {admin ? 'Devenir facilitateur' : 'Demander à être facilitateur'}
          </MenuItem>}
    </div>
  );
}

// Outils d'animation : phases, timer, colonnes, statistiques, archivage
export function FacilitatorPanel({ onClose }) {
  const { state, dispatch } = useStore();
  const [mins, setMins] = useState('10');
  const hidden = state.hiddenColumns || [];
  return (
    <Drawer title="Outils du facilitateur" onClose={onClose} width={460}>
      <section className="mb-6">
        <h3 className="text-label font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Timer projeté</h3>
        <div className="flex gap-2 flex-wrap">
          {[3, 5, 10, 15, 20].map(m => (
            <button key={m} className="btn-outline !h-9" onClick={() => socket.emit('start-timer', { duration: m * 60 })}>{m} min</button>
          ))}
          <div className="flex items-center gap-1">
            <input type="number" min={1} max={60} value={mins} onChange={e => setMins(e.target.value)} className="input-field w-16" aria-label="Minutes" />
            <button className="btn-primary !h-9" onClick={() => { const m = parseInt(mins, 10); if (m > 0 && m <= 60) socket.emit('start-timer', { duration: m * 60 }); }}><Timer size={15} /> Lancer</button>
          </div>
          {state.timer && <button className="btn-ghost" style={{ color: 'var(--color-error)' }} onClick={() => socket.emit('stop-timer')}>Arrêter</button>}
        </div>
      </section>
      <section className="mb-6">
        <h3 className="text-label font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Les phases du cadrage</h3>
        <div className="grid gap-1.5">
          {state.phases.map(ph => {
            const ps = state.phaseStates.find(p => p.phase === ph.key);
            return (
              <div key={ph.key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ph.color }} />
                <span className="flex-1 text-body-sm font-medium">{ph.name}</span>
                <button className="btn-ghost !px-2 !py-1 text-caption" onClick={() => socket.emit('lock-phase', { phase: ph.key, locked: !ps?.locked })}>
                  {ps?.locked ? <><Unlock size={14} /> Rouvrir</> : <><Lock size={14} /> Verrouiller</>}
                </button>
                <button className="btn-ghost !px-2 !py-1 text-caption" onClick={() => socket.emit('hide-phase', { phase: ph.key, hidden: !ps?.hidden })}>
                  {ps?.hidden ? <><Eye size={14} /> Montrer</> : <><EyeOff size={14} /> Masquer</>}
                </button>
              </div>
            );
          })}
        </div>
      </section>
      <section className="mb-6">
        <h3 className="text-label font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}><Columns size={13} /> Colonnes visibles</h3>
        {state.phases.map(ph => (
          <div key={ph.key} className="mb-2">
            <p className="text-caption font-semibold mb-1" style={{ color: ph.color }}>{ph.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {ph.columns.map(col => {
                const on = !hidden.includes(col.key);
                return (
                  <button key={col.key} onClick={() => socket.emit('update-setting', { key: 'hidden_columns', value: on ? [...hidden, col.key] : hidden.filter(k => k !== col.key) })}
                    className="text-caption px-2.5 py-1 rounded-full font-medium transition-colors"
                    style={{ backgroundColor: on ? 'var(--color-accent-soft)' : 'var(--color-surface-alt)', color: on ? 'var(--color-text)' : 'var(--color-text-muted)', textDecoration: on ? 'none' : 'line-through' }}>
                    {col.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>
      <section className="grid gap-2">
        <button className="btn-outline justify-start" onClick={() => { dispatch({ type: 'TOGGLE_STATS' }); onClose(); }}><BarChart3 size={16} /> Statistiques du cadrage</button>
        <button className="btn-outline justify-start" onClick={() => { if (state.archived || confirm('Archiver ce cadrage ? Il passera en lecture seule pour tout le monde.')) socket.emit('archive-space', { archived: !state.archived }); }}>
          {state.archived ? <><ArchiveRestore size={16} /> Rouvrir le cadrage</> : <><Archive size={16} /> Archiver (lecture seule)</>}
        </button>
      </section>
    </Drawer>
  );
}

function ReadinessButton({ setView }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const r = readiness(state);
  const color = r.pct === 100 ? '#10B981' : r.pct >= 60 ? '#F2C245' : '#F87171';
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button onClick={() => setOpen(!open)} className="h-9 pl-1.5 pr-3 rounded-lg flex items-center gap-2 hover:bg-white/10 text-[12px] font-semibold" title="Préparation du temps collectif">
        <svg width="26" height="26" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="4" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${r.pct * 0.88} 88`} transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray .6s ease' }} />
        </svg>
        <span className="hidden xl:inline text-white/80">Prêt à</span> {r.pct} %
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-card p-2 elevation-3 animate-scale-in" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
          <div className="px-3 pt-2 pb-3">
            <p className="font-display font-semibold text-body">Prêt à {r.pct} %</p>
            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{r.pct === 100 ? 'Tout est posé. Il ne reste qu\'à le vivre.' : `${r.total - r.done} point${r.total - r.done > 1 ? 's' : ''} avant d'entrer dans la salle.`}</p>
            <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}><div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, backgroundColor: color }} /></div>
          </div>
          {r.items.map(i => (
            <button key={i.key} onClick={() => { setView(i.view); setOpen(false); }} className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[var(--color-surface-alt)]">
              {i.done ? <CheckCircle2 size={17} className="shrink-0 mt-0.5" style={{ color: '#10B981' }} /> : <Circle size={17} className="shrink-0 mt-0.5" style={{ color: 'var(--color-border-strong)' }} />}
              <span className="flex-1">
                <span className="block text-body-sm" style={{ color: i.done ? 'var(--color-text-muted)' : 'var(--color-text)', textDecoration: i.done ? 'line-through' : 'none' }}>{i.label}</span>
                {i.hint && !i.done && <span className="block text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{i.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppHeader({ view, setView }) {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [share, setShare] = useState(false);
  const [more, setMore] = useState(false);
  const [facil, setFacil] = useState(false);
  const [search, setSearch] = useState(false);
  const people = state.participants || [];
  const client = state.space?.client_name;
  useEffect(() => {
    const onShare = () => setShare(true);
    window.addEventListener('insuffle:share', onShare);
    return () => window.removeEventListener('insuffle:share', onShare);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 no-print text-white" style={{ background: 'rgba(20,30,55,0.97)', backdropFilter: 'saturate(180%) blur(12px)', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1600px] mx-auto h-14 px-3 sm:px-5 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center shrink-0 hover:opacity-90" aria-label="Accueil Insuffle">
            <Logo height={22} color="#F2C245" academie={state.planning?.charte === 'academie'} />
          </button>
          <span className="hidden sm:block w-px h-6 bg-white/15" />
          <div className="min-w-0 hidden sm:block">
            <p className="text-[13px] font-semibold truncate max-w-[260px] leading-tight">{client || 'Nouveau cadrage'}</p>
            <p className="text-[11px] text-white/50 truncate max-w-[260px] leading-tight">{state.planning?.reference || 'Cadrage de temps collectif'}</p>
          </div>

          <nav className="hidden md:flex items-center gap-1 mx-auto p-1 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} aria-label="Espaces du cadrage">
            {NAV.map(n => {
              const here = people.filter(p => p.view === n.key && p.pseudo !== state.pseudo);
              const active = view === n.key;
              return (
                <button key={n.key} onClick={() => setView(n.key)} aria-current={active ? 'page' : undefined}
                  className="relative flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-semibold transition-all"
                  style={{ backgroundColor: active ? '#fff' : 'transparent', color: active ? '#141E37' : 'rgba(255,255,255,0.72)', boxShadow: active ? '0 1px 2px rgba(0,0,0,.2)' : 'none' }}>
                  <n.icon size={15} style={{ color: active ? '#A67C00' : undefined }} />
                  {n.label}
                  {n.key === 'succes' && state.success?.votesOpen?.length > 0 && <span className="live-dot" title="Vote ouvert" />}
                  {here.length > 0 && (
                    <span className="flex -space-x-1.5 ml-0.5">{here.slice(0, 3).map(p => <Avatar key={p.pseudo} p={p} size={16} ring={false} />)}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
            <span className="hidden lg:flex items-center gap-2 h-8 px-2.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#6EE7B7' }}
              title={state.offline ? 'Connexion perdue' : 'Synchronisé en direct'}>
              <span className={`live-dot ${state.offline ? 'off' : ''}`} /> {state.offline ? 'Hors ligne' : 'Live'}
            </span>
            <ReadinessButton setView={setView} />
            {people.length > 0 && <AvatarStack people={people} me={state.pseudo} size={28} max={4} />}
            <button onClick={() => dispatch({ type: 'SET_SALLE', open: true })} className="hidden md:flex h-9 px-3 rounded-lg items-center gap-2 text-[13px] font-semibold hover:bg-white/10" title="Mode salle : projeter le jour J">
              <Presentation size={16} /> <span className="hidden xl:inline">Projeter</span>
            </button>
            <div className="relative">
              <button onClick={() => setShare(!share)} className="btn-primary !h-9 !px-3 sm:!px-4"><Share2 size={15} /><span className="hidden sm:inline">Partager</span></button>
              {share && <SharePopover onClose={() => setShare(false)} />}
            </div>
            <div className="relative">
              <button onClick={() => setMore(!more)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10" aria-label="Menu" aria-expanded={more}><Menu size={18} /></button>
              {more && <MoreMenu onClose={() => setMore(false)} onFacilitator={() => setFacil(true)} onSearch={() => { setView('phase'); setSearch(true); }} />}
            </div>
          </div>
        </div>
        {search && (
          <div className="border-t border-white/10">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex items-center gap-2">
              <Search size={16} className="text-white/60" />
              <input autoFocus value={state.searchQuery} onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                placeholder="Rechercher dans les cartes du cadrage…" className="flex-1 bg-transparent text-white text-body-sm outline-none placeholder:text-white/40" />
              {state.searchQuery && <span className="text-caption text-white/60">{state.cards.filter(c => (c.content + c.author).toLowerCase().includes(state.searchQuery.toLowerCase())).length} résultat(s)</span>}
              <button onClick={() => { setSearch(false); dispatch({ type: 'SET_SEARCH', query: '' }); }} className="p-1 rounded hover:bg-white/10" aria-label="Fermer la recherche"><X size={16} /></button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile : navigation en bas, comme une app */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 no-print border-t flex" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Navigation">
        {NAV.map(n => {
          const active = view === n.key;
          return (
            <button key={n.key} onClick={() => setView(n.key)} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold relative"
              style={{ color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {active && <span className="absolute top-0 inset-x-6 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
              <n.icon size={19} style={{ color: active ? 'var(--color-accent-dark)' : undefined }} />
              {n.label}
            </button>
          );
        })}
      </nav>

      {facil && <FacilitatorPanel onClose={() => setFacil(false)} />}
    </>
  );
}

