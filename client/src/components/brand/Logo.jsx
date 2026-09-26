import logoSvg from '../../assets/logo-insuffle.svg?raw';

const markup = logoSvg.replace(/<\?xml.*?\?>/, '').replace('<svg ', '<svg aria-hidden="true" focusable="false" ');

// Logo Insuffle vectoriel. La couleur suit `color` (currentColor).
export default function Logo({ height = 24, color = 'currentColor', academie = false, className = '', title = 'Insuffle' }) {
  return (
    <span className={`inline-flex items-end gap-1.5 shrink-0 ${className}`} style={{ color, height }} role="img" aria-label={academie ? 'Insuffle Académie' : title}>
      <span className="insuffle-logo" style={{ height, display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: markup }} />
      {academie && (
        <span className="font-display font-bold uppercase leading-none" style={{ fontSize: Math.max(9, height * 0.34), letterSpacing: '0.14em', paddingBottom: 1 }}>
          Académie
        </span>
      )}
    </span>
  );
}
