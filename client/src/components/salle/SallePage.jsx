import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, Timer, X } from 'lucide-react';
import { useStore } from '../../store.jsx';
import socket from '../../socket.js';
import Logo from '../brand/Logo.jsx';
import { Avatar } from '../../live/Avatars.jsx';
import { computeDay, fmtDur, hm, sortByPos, dayLabel } from '../../planning/utils.js';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

// Grand compte à rebours circulaire, synchronisé avec le timer du serveur
function BigTimer({ timer }) {
  if (!timer) return null;
  const r = Math.max(0, timer.remaining);
  const pct = timer.duration ? r / timer.duration : 0;
  const mm = Math.floor(r / 60);
  const ss = String(r % 60).padStart(2, '0');
  const warn = r <= 60;
  return (
    <div className="relative w-[210px] h-[210px] shrink-0" role="timer" aria-live="off">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={warn ? '#F87171' : '#F2C245'} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${pct * 339.3} 339.3`} style={{ transition: 'stroke-dasharray 1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[52px] tabular-nums leading-none" style={{ color: warn ? '#FCA5A5' : '#fff' }}>{mm}:{ss}</span>
        <span className="text-[12px] uppercase tracking-[0.2em] text-white/50 mt-2">restantes</span>
      </div>
    </div>
  );
}

function VoteBoard({ kind, success, question }) {
  const max = kind === 'roti' ? 5 : 10;
  const votes = success.votes.filter(v => v.kind === kind);
  const counts = Array.from({ length: max }, (_, i) => votes.filter(v => v.value === i + 1).length);
  const top = Math.max(1, ...counts);
  const avg = votes.length ? votes.reduce((a, v) => a + v.value, 0) / votes.length : null;
  const avant = success.votes.filter(v => v.kind === 'avant');
  const avgAvant = avant.length ? avant.reduce((a, v) => a + v.value, 0) / avant.length : null;
  const label = kind === 'avant' ? 'Avant' : kind === 'apres' ? 'Après' : 'ROTI';
  return (
    <div className="rounded-3xl p-7 h-full flex flex-col" style={{ backgroundColor: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
      <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#6EE7B7' }}><span className="live-dot" /> Vote {label} en direct</p>
      <p className="font-display font-semibold text-[22px] leading-snug mb-6">{kind === 'roti' ? 'Le temps passé valait-il le coup ?' : question}</p>
      <div className="flex items-end gap-2 flex-1 min-h-[160px]">
        {counts.map((n, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[13px] font-semibold text-white/70 mb-1 tabular-nums">{n || ''}</span>
            <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${Math.max(3, (n / top) * 100)}%`, backgroundColor: n ? (kind === 'apres' ? '#C185BB' : '#F2C245') : 'rgba(255,255,255,.08)' }} />
            <span className="text-[13px] text-white/50 mt-2 tabular-nums">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline gap-4 mt-6">
        <span className="font-display font-bold text-[56px] leading-none tabular-nums">{avg == null ? '·' : avg.toFixed(1).replace('.', ',')}</span>
        <span className="text-white/60 text-[15px]">{votes.length} vote{votes.length > 1 ? 's' : ''}{kind === 'apres' && avgAvant != null && avg != null ? ` · ${avg - avgAvant >= 0 ? '+' : ''}${(avg - avgAvant).toFixed(1).replace('.', ',')} depuis le début` : ''}</span>
      </div>
    </div>
  );
}

export default function SallePage() {
  const { state, dispatch } = useStore();
  const now = useClock();
  const [qr, setQr] = useState('');
  const [full, setFull] = useState(false);
  const admin = state.isFacilitator || (state.facilitators || []).length === 0;
  const url = window.location.href.split('#')[0];
  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: '#141E37', light: '#ffffff' } }).then(setQr).catch(() => {}); }, [url]);

  const days = sortByPos(state.agendaDays);
  const all = useMemo(() => days.flatMap((d, di) => computeDay(d, state.blocks).seqs.map(s => ({ ...s, day: d, di }))), [days, state.blocks]);

  // Étape par défaut : ce qui se passe maintenant si le jour est aujourd'hui, sinon la première
  const liveNow = useMemo(() => {
    const d = days.find(x => x.date === todayStr());
    if (!d) return null;
    const mins = now.getHours() * 60 + now.getMinutes();
    return all.find(s => s.day.id === d.id && mins >= s.start && mins < s.end) || null;
  }, [days, all, now]);
  const current = all.find(s => s.id === state.stage?.seqId) || liveNow || all[0] || null;
  const idx = current ? all.findIndex(s => s.id === current.id) : -1;

  const go = useCallback((delta) => {
    if (!admin || idx < 0) return;
    const next = all[Math.max(0, Math.min(all.length - 1, idx + delta))];
    if (next) socket.emit('stage', { seqId: next.id });
  }, [admin, idx, all]);

  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    dispatch({ type: 'SET_SALLE', open: false });
  }, [dispatch]);

  function startTimer() {
    if (!current) return;
    socket.emit('start-timer', { duration: Math.min(3600, current.duration_minutes * 60) });
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !document.fullscreenElement) close();
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
      if (e.key.toLowerCase() === 'f') toggleFull();
      if (e.key === ' ' && admin) { e.preventDefault(); if (state.timer) socket.emit('stop-timer'); else startTimer(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const openVote = state.success?.votesOpen?.[0];
  const people = state.participants || [];
  const dayEnc = current?.day?.encadre;
  const question = state.success?.scaleQuestion || state.planning?.scale_question || (state.planning?.question ? `Sur « ${state.planning.question} », où en est le groupe ?` : 'Où en est le groupe ?');
  const daySeqs = current ? all.filter(s => s.day.id === current.day.id) : [];
  const dayStart = daySeqs[0]?.start ?? 0;
  const dayEnd = daySeqs[daySeqs.length - 1]?.end ?? 1;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = current?.day?.date === todayStr();

  return (
    <div className="fixed inset-0 z-[80] hero-glow text-white flex flex-col overflow-hidden" role="dialog" aria-label="Mode salle">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <header className="relative flex items-center gap-4 px-8 h-20 shrink-0">
        <Logo height={28} color="#F2C245" academie={state.planning?.charte === 'academie'} />
        <span className="w-px h-8 bg-white/15" />
        <p className="font-display font-semibold text-[17px] text-white/85 truncate flex-1">{state.planning?.question || state.space?.client_name}</p>
        <span className="font-display font-semibold text-[22px] tabular-nums text-white/80">{hm(nowMin)}</span>
        {admin && (
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => go(-1)} disabled={idx <= 0} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30" aria-label="Étape précédente"><ChevronLeft size={20} /></button>
            <button onClick={() => go(1)} disabled={idx >= all.length - 1} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30" aria-label="Étape suivante"><ChevronRight size={20} /></button>
            {state.timer
              ? <button onClick={() => socket.emit('stop-timer')} className="h-10 px-4 rounded-xl flex items-center gap-2 font-semibold hover:bg-white/10"><Pause size={17} /> Arrêter</button>
              : <button onClick={startTimer} disabled={!current} className="btn-primary !h-10"><Play size={16} /> Timer {current ? fmtDur(current.duration_minutes) : ''}</button>}
          </div>
        )}
        <button onClick={toggleFull} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10" aria-label="Plein écran">{full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
        <button onClick={close} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10" aria-label="Quitter le mode salle"><X size={20} /></button>
      </header>

      <main className="relative flex-1 grid lg:grid-cols-[1.35fr_1fr] gap-10 px-8 lg:px-14 pb-6 min-h-0">
        <section className="flex flex-col justify-center min-h-0">
          {current ? (
            <>
              <p className="text-[14px] font-bold uppercase tracking-[0.22em] mb-5" style={{ color: '#F2C245' }}>
                {dayLabel(current.day, current.di)} · {hm(current.start)} à {hm(current.end)} · étape {idx + 1} sur {all.length}
              </p>
              {current.kind === 'pause'
                ? <h1 className="font-display font-bold text-[64px] lg:text-[88px] leading-[1] tracking-[-0.03em] text-white/85">{current.title}</h1>
                : (
                  <>
                    <h1 className="font-display font-bold text-[48px] lg:text-[72px] leading-[1.02] tracking-[-0.03em] mb-7">{current.title}</h1>
                    {current.intention && <p className="text-[24px] lg:text-[30px] leading-snug text-white/85 max-w-4xl mb-6">{current.intention}</p>}
                    <div className="flex flex-wrap gap-3">
                      {current.format && <span className="text-[17px] px-4 py-2 rounded-xl text-white/80" style={{ backgroundColor: 'rgba(255,255,255,.07)' }}>{current.format}</span>}
                      {current.production && <span className="text-[17px] font-semibold px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(242,194,69,.15)', color: '#F2C245' }}>→ {current.production}</span>}
                    </div>
                  </>
                )}
              {state.timer && <div className="mt-10"><BigTimer timer={state.timer} /></div>}
            </>
          ) : (
            <p className="font-display text-[40px] text-white/70">Le déroulé est vide. Concevez-le dans l'onglet Concevoir.</p>
          )}
        </section>

        <aside className="flex flex-col gap-6 justify-center min-h-0">
          {openVote ? <VoteBoard kind={openVote} success={state.success} question={question} /> : (
            <div className="rounded-3xl p-7 flex items-center gap-7" style={{ backgroundColor: 'rgba(255,255,255,.05)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.1)' }}>
              {qr && <img src={qr} alt="QR code pour rejoindre" className="w-40 h-40 lg:w-48 lg:h-48 rounded-2xl shrink-0" />}
              <div className="min-w-0">
                <p className="text-[13px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#F2C245' }}>Rejoignez</p>
                <p className="font-display font-semibold text-[24px] leading-tight mb-3">Scannez, tapez votre prénom. C'est tout.</p>
                <p className="flex items-center gap-2 text-white/70 text-[15px]"><span className="live-dot" /> {people.length} en ligne</p>
                <div className="flex flex-wrap gap-1.5 mt-3">{people.slice(0, 24).map(p => <Avatar key={p.pseudo} p={p} size={30} ring={false} />)}</div>
              </div>
            </div>
          )}
          {dayEnc && (dayEnc.titre || dayEnc.items?.length) && (
            <div className="rounded-3xl p-7" style={{ backgroundColor: 'rgba(242,194,69,.08)', boxShadow: 'inset 3px 0 0 #F2C245' }}>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#F2C245' }}>{dayEnc.titre}</p>
              <ul className="grid gap-2">
                {(dayEnc.items || []).map((it, i) => <li key={i} className="text-[16px] leading-snug"><b>{it.label}</b> <span className="text-white/75">{it.texte}</span></li>)}
              </ul>
            </div>
          )}
        </aside>
      </main>

      {/* Frise du jour : chaque séquence à sa taille, l'étape en cours en jaune, l'heure qu'il est */}
      {daySeqs.length > 0 && (
        <footer className="relative px-8 lg:px-14 pb-8 shrink-0">
          <div className="relative flex gap-1 h-3">
            {daySeqs.map(s => (
              <button key={s.id} onClick={() => admin && socket.emit('stage', { seqId: s.id })} title={`${hm(s.start)} · ${s.title}`}
                className="h-full rounded-full transition-all"
                style={{ flex: s.duration_minutes, backgroundColor: s.id === current?.id ? '#F2C245' : s.kind === 'pause' ? 'rgba(255,255,255,.08)' : s.kind === 'apport' ? 'rgba(242,194,69,.35)' : 'rgba(255,255,255,.25)' }} />
            ))}
            {isToday && nowMin >= dayStart && nowMin <= dayEnd && (
              <span className="absolute -top-2 -bottom-2 w-0.5 rounded-full bg-white" style={{ left: `${((nowMin - dayStart) / (dayEnd - dayStart)) * 100}%` }} />
            )}
          </div>
          <div className="flex justify-between text-[12px] text-white/45 mt-2 tabular-nums"><span>{hm(dayStart)}</span><span className="flex items-center gap-1.5"><Timer size={12} /> {dayLabel(current.day, current.di)}</span><span>{hm(dayEnd)}</span></div>
        </footer>
      )}
    </div>
  );
}
