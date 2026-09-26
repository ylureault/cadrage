import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

function useEscape(onClose) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

export function Modal({ title, subtitle, onClose, children, footer, width = 720 }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/50 animate-fade-in" onMouseDown={onClose}>
      <div className="w-full rounded-modal elevation-3 flex flex-col max-h-[92vh] animate-scale-in"
        style={{ maxWidth: width, backgroundColor: 'var(--color-surface)' }}
        role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-h2-mobile leading-tight">{title}</h2>
            {subtitle && <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-btn hover:bg-black/5 shrink-0" aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t flex flex-wrap justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ title, onClose, children, footer, width = 560 }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/30 animate-fade-in" onMouseDown={onClose}>
      <div className="h-full w-full flex flex-col elevation-3 animate-slide-in"
        style={{ maxWidth: width, backgroundColor: 'var(--color-surface)' }}
        role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-body truncate">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-btn hover:bg-black/5" aria-label="Fermer"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 border-t flex flex-wrap justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>{footer}</div>}
      </div>
    </div>
  );
}

// Champ texte qui enregistre à la sortie (blur) ou sur Entrée, et suit les mises à jour venues des autres.
export function AutoField({ value, onSave, placeholder, multiline = false, rows = 2, className = '', style, disabled, maxLength, ariaLabel, inputType = 'text', autoGrow = false }) {
  const [local, setLocal] = useState(value ?? '');
  const focused = useRef(false);
  const area = useRef(null);
  useEffect(() => { if (!focused.current) setLocal(value ?? ''); }, [value]);
  useEffect(() => {
    if (!autoGrow || !area.current) return;
    area.current.style.height = 'auto';
    area.current.style.height = `${area.current.scrollHeight + 2}px`;
  }, [local, autoGrow]);
  function commit() {
    focused.current = false;
    if ((local ?? '') !== (value ?? '')) onSave(local);
  }
  const common = {
    value: local ?? '',
    placeholder, disabled, maxLength,
    'aria-label': ariaLabel || placeholder,
    onFocus: () => { focused.current = true; },
    onChange: e => setLocal(e.target.value),
    onBlur: commit,
    className: `input-field w-full ${className}`,
    style,
  };
  if (multiline) {
    return <textarea ref={area} rows={rows} {...common} className={`${common.className} ${autoGrow ? 'resize-none overflow-hidden' : 'resize-y'}`}
      onKeyDown={e => { if (e.key === 'Enter' && (autoGrow || e.metaKey || e.ctrlKey)) { e.preventDefault(); e.currentTarget.blur(); } }} />;
  }
  return <input type={inputType} {...common} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} />;
}

export function Segmented({ options, value, onChange, size = 'sm', disabled }) {
  return (
    <div className="inline-flex rounded-btn p-0.5 gap-0.5 flex-wrap" style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} type="button" disabled={disabled} onClick={() => onChange(o.value)}
            title={o.title}
            className={`rounded-[6px] font-medium transition-colors ${size === 'sm' ? 'px-2.5 py-1 text-caption' : 'px-3 py-1.5 text-body-sm'}`}
            style={{
              backgroundColor: active ? 'var(--color-surface)' : 'transparent',
              color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: active ? 'var(--shadow-1)' : 'none',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Label({ children, hint, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block mb-1">
      <span className="text-label font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{children}</span>
      {hint && <span className="block text-caption font-normal mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>}
    </label>
  );
}
