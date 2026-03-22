import { useState } from 'react';
import { useStore } from '../store.jsx';
import { api } from '../api.js';
import { X, FileText, Copy, QrCode, Download } from 'lucide-react';

export default function ExportPanel() {
  const { state, dispatch } = useStore();
  const [snapshotName, setSnapshotName] = useState('');
  const [showQR, setShowQR] = useState(false);

  function exportText() {
    let text = `CADRAGE D'ATELIER INSUFFLE\n`;
    text += `=============================\n\n`;
    text += `Client: ${state.space?.client_name || '—'}\n`;
    text += `Sponsor: ${state.space?.sponsor || '—'}\n`;
    text += `Facilitateur: ${state.space?.facilitator || '—'}\n`;
    text += `Date: ${state.space?.session_date || '—'}\n\n`;

    for (const phase of state.phases) {
      text += `\n${'='.repeat(50)}\n`;
      text += `${phase.name}\n`;
      text += `${'='.repeat(50)}\n\n`;

      for (const col of phase.columns) {
        const cards = state.cards.filter(c => c.phase === phase.key && c.column_key === col.key);
        text += `--- ${col.name} (${cards.length} cartes) ---\n`;
        for (const card of cards) {
          text += `  [${card.author}] ${card.content}\n`;
          const comments = state.comments.filter(c => c.card_id === card.id);
          for (const com of comments) {
            text += `    → [${com.author}] ${com.content}\n`;
          }
        }
        text += '\n';
      }
    }

    // Axes
    text += `\n${'='.repeat(50)}\n`;
    text += `8 AXES DE POSITIONNEMENT\n`;
    text += `${'='.repeat(50)}\n\n`;
    for (const axis of state.axesDef) {
      const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null);
      const finalPos = state.axesFinal.find(a => a.axis_key === axis.key);
      text += `${axis.left} / ${axis.right}`;
      if (finalPos) text += ` → Position finale: ${finalPos.position}`;
      text += '\n';
      for (const p of positions) {
        text += `  ${p.pseudo}: position ${p.position}${p.explanation ? ` (${p.explanation})` : ''}\n`;
      }
      text += '\n';
    }

    text += `\n---\nOutil de cadrage Insuffle | insuffle.com\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadrage-${state.space?.client_name || 'insuffle'}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Export texte téléchargé', type: 'success' } });
  }

  async function exportPDF() {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Page de garde
      doc.setFillColor(26, 42, 74); // insuffle-dark
      doc.rect(0, 0, 297, 210, 'F');
      doc.setTextColor(245, 197, 24); // insuffle-gold
      doc.setFontSize(36);
      doc.text('INSUFFLE', 148.5, 60, { align: 'center' });
      doc.setFontSize(18);
      doc.text('Cadrage Live', 148.5, 75, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(state.space?.client_name || 'Cadrage', 148.5, 110, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Facilitateur: ${state.space?.facilitator || '—'}`, 148.5, 130, { align: 'center' });
      doc.text(`Sponsor: ${state.space?.sponsor || '—'}`, 148.5, 140, { align: 'center' });
      doc.text(`Date: ${state.space?.session_date || '—'}`, 148.5, 150, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Outil de cadrage Insuffle | insuffle.com', 148.5, 200, { align: 'center' });

      // Content pages
      for (const phase of state.phases) {
        doc.addPage();
        doc.setFillColor(26, 42, 74);
        doc.rect(0, 0, 297, 15, 'F');
        doc.setTextColor(245, 197, 24);
        doc.setFontSize(14);
        doc.text(phase.name, 10, 10);
        doc.setTextColor(45, 45, 45);

        let y = 25;
        for (const col of phase.columns) {
          const cards = state.cards.filter(c => c.phase === phase.key && c.column_key === col.key);
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.text(col.name, 10, y);
          y += 6;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          for (const card of cards) {
            if (y > 190) { doc.addPage(); y = 20; }
            doc.text(`[${card.author}] ${card.content}`, 15, y, { maxWidth: 260 });
            y += Math.ceil(card.content.length / 80) * 4 + 4;
          }
          y += 4;
        }

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Outil de cadrage Insuffle | insuffle.com', 148.5, 205, { align: 'center' });
      }

      doc.save(`cadrage-${state.space?.client_name || 'insuffle'}-${new Date().toISOString().slice(0, 10)}.pdf`);
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'PDF exporté', type: 'success' } });
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Erreur export PDF: ' + e.message, type: 'error' } });
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Lien copié', type: 'success' } });
  }

  async function duplicateSpace() {
    try {
      const { id } = await api.duplicateSpace(state.spaceId, false);
      window.open(`/${id}`, '_blank');
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Espace dupliqué', type: 'success' } });
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: e.message, type: 'error' } });
    }
  }

  async function saveSnapshot() {
    if (!snapshotName.trim()) return;
    try {
      await api.createSnapshot(state.spaceId, snapshotName.trim());
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Snapshot sauvegardé', type: 'success' } });
      setSnapshotName('');
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: e.message, type: 'error' } });
    }
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[350px] max-w-[90vw] bg-white card-shadow z-40 flex flex-col animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold">Export et partage</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <button onClick={exportPDF} className="w-full btn-primary flex items-center justify-center gap-2">
          <Download size={18} /> Exporter en PDF
        </button>
        <button onClick={exportText} className="w-full btn-secondary flex items-center justify-center gap-2">
          <FileText size={18} /> Exporter en texte
        </button>
        <button onClick={copyLink} className="w-full btn-ghost border border-gray-200 flex items-center justify-center gap-2">
          <Copy size={18} /> Copier le lien
        </button>
        <button onClick={() => window.print()} className="w-full btn-ghost border border-gray-200 flex items-center justify-center gap-2">
          🖨 Imprimer
        </button>

        <hr className="my-4" />

        <button onClick={duplicateSpace} className="w-full btn-ghost border border-gray-200 flex items-center justify-center gap-2">
          📋 Dupliquer cet espace
        </button>

        <hr className="my-4" />

        <div>
          <h3 className="text-sm font-semibold mb-2">Sauvegarder un snapshot</h3>
          <div className="flex gap-1">
            <input value={snapshotName} onChange={e => setSnapshotName(e.target.value)}
              placeholder="Nom du snapshot" className="input-field flex-1 text-sm" />
            <button onClick={saveSnapshot} className="btn-primary text-sm px-3">Sauver</button>
          </div>
        </div>
      </div>
    </div>
  );
}
