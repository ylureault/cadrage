import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { Avatar } from './Avatars.jsx';

// Un fil discret : « Claire a modifié « Tables tournantes » ». Se range tout seul.
export default function LiveTicker({ onOpen }) {
  const { state } = useStore();
  const [items, setItems] = useState([]);
  const flash = state.liveFlash;
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!flash?.n) return;
    const ids = Object.keys(flash.ids || {});
    const first = state.blocks.find(b => b.id === ids[0]);
    const p = state.participants.find(x => x.pseudo === flash.by) || { pseudo: flash.by, color: '#6B6E7B' };
    const text = ids.length > 1 ? `a modifié ${ids.length} séquences` : first ? `a modifié « ${first.title} »` : 'a modifié le déroulé';
    const item = { key: flash.n, p, text, seqId: ids.length === 1 ? ids[0] : null };
    setItems(prev => [...prev.filter(i => i.p.pseudo !== p.pseudo), item].slice(-3));
    // Chaque annonce a son propre minuteur : une nouvelle ne prolonge pas la précédente
    timers.current.push(setTimeout(() => setItems(prev => prev.filter(i => i.key !== item.key)), 4500));
  }, [flash?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length) return null;
  return (
    <div className="fixed right-4 bottom-20 md:bottom-4 z-40 grid gap-2 no-print" aria-live="polite">
      {items.map(i => (
        <button key={i.key} onClick={() => onOpen?.(i.seqId)} className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full text-[13px] animate-slide-up text-left"
          style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-3)' }}>
          <Avatar p={i.p} size={24} ring={false} />
          <span><b>{i.p.pseudo}</b> <span style={{ color: 'var(--color-text-muted)' }}>{i.text}</span></span>
          <span className="live-dot ml-1" />
        </button>
      ))}
    </div>
  );
}
