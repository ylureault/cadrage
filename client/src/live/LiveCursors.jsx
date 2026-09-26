import { useEffect, useRef, useState } from 'react';
import socket from '../socket.js';

// Les curseurs des autres, façon tableau blanc partagé. Position : x en proportion de la largeur, y en pixels du contenu.
export default function LiveCursors({ view, children }) {
  const root = useRef(null);
  const [cursors, setCursors] = useState({});
  const last = useRef(0);

  useEffect(() => {
    const onCursor = (c) => setCursors(prev => ({ ...prev, [c.id]: { ...c, t: Date.now() } }));
    const onLeave = ({ id }) => setCursors(prev => { const n = { ...prev }; delete n[id]; return n; });
    socket.on('cursor', onCursor);
    socket.on('cursor-leave', onLeave);
    const gc = setInterval(() => setCursors(prev => {
      const now = Date.now();
      const n = {};
      for (const [k, v] of Object.entries(prev)) if (now - v.t < 12000) n[k] = v;
      return n;
    }), 2000);
    return () => { socket.off('cursor', onCursor); socket.off('cursor-leave', onLeave); clearInterval(gc); };
  }, []);

  function onMove(e) {
    const now = performance.now();
    if (now - last.current < 45 || !root.current) return;
    last.current = now;
    const r = root.current.getBoundingClientRect();
    socket.emit('cursor', { x: (e.clientX - r.left) / Math.max(1, r.width), y: e.clientY - r.top, view });
  }

  const width = root.current?.clientWidth || 0;
  const now = Date.now();
  return (
    <div ref={root} className="relative" onMouseMove={onMove}>
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-hidden no-print" aria-hidden>
        {Object.values(cursors).filter(c => c.view === view).map(c => (
          <div key={c.id} className="live-cursor" style={{ transform: `translate(${c.x * width}px, ${c.y}px)`, opacity: now - c.t > 8000 ? 0 : 1 }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none"><path d="M1 1l6.5 17 2.6-7.1L17 8.3 1 1z" fill={c.color} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            <span className="tag" style={{ backgroundColor: c.color }}>{c.pseudo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
