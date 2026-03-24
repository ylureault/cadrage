import { useState } from 'react';
import { useStore } from '../store.jsx';
import { api } from '../api.js';
import { X, FileText, Copy, Download, Printer, ExternalLink, Layers, Table } from 'lucide-react';

export default function ExportPanel() {
  const { state, dispatch } = useStore();
  const [snapshotName, setSnapshotName] = useState('');
  const [exporting, setExporting] = useState(false);

  function exportText() {
    let text = `CADRAGE DE TEMPS COLLECTIF — INSUFFLE\n`;
    text += `========================================\n\n`;
    text += `Client: ${state.space?.client_name || '—'}\n`;
    text += `Sponsor: ${state.space?.sponsor || '—'}\n`;
    text += `Facilitateur: ${state.space?.facilitator || '—'}\n`;
    text += `Date: ${state.space?.session_date || '—'}\n\n`;

    for (const phase of state.phases) {
      text += `\n${'═'.repeat(50)}\n`;
      text += `  ${phase.name}\n`;
      text += `${'═'.repeat(50)}\n\n`;
      for (const col of phase.columns) {
        const cards = state.cards.filter(c => c.phase === phase.key && c.column_key === col.key);
        text += `── ${col.name} (${cards.length} carte${cards.length !== 1 ? 's' : ''}) ──\n`;
        for (const card of cards) {
          text += `  • [${card.author}] ${card.content}\n`;
          const comments = state.comments.filter(c => c.card_id === card.id);
          for (const com of comments) {
            text += `    ↳ [${com.author}] ${com.content}\n`;
          }
        }
        if (cards.length === 0) text += `  (vide)\n`;
        text += '\n';
      }
    }

    text += `\n${'═'.repeat(50)}\n`;
    text += `  8 AXES DE POSITIONNEMENT\n`;
    text += `${'═'.repeat(50)}\n\n`;
    for (const axis of state.axesDef) {
      const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null);
      const finalPos = state.axesFinal.find(a => a.axis_key === axis.key);
      const allPos = positions.map(p => p.position);
      const avg = allPos.length > 0 ? (allPos.reduce((a, b) => a + b, 0) / allPos.length).toFixed(1) : '—';
      const spread = allPos.length > 1 ? Math.max(...allPos) - Math.min(...allPos) : 0;
      const status = spread >= 3 ? '⚠ DIVERGENCE FORTE' : spread >= 2 ? '△ Écart modéré' : allPos.length > 0 ? '✓ Aligné' : '';
      text += `${axis.left} ←→ ${axis.right}  |  Moy: ${avg}  |  ${status}`;
      if (finalPos?.position) text += `  |  Position finale: ${finalPos.position}`;
      text += '\n';
      for (const p of positions) {
        text += `  ${p.pseudo}: ${p.position}${p.explanation ? ` — ${p.explanation}` : ''}\n`;
      }
      text += '\n';
    }

    // Déroulé
    const txtBlocks = [...(state.blocks || [])].sort((a, b) => a.position - b.position);
    if (txtBlocks.length > 0) {
      text += `\n${'═'.repeat(50)}\n`;
      text += `  DÉROULÉ DE L'ATELIER\n`;
      text += `${'═'.repeat(50)}\n\n`;
      let cumMin = 0;
      for (const b of txtBlocks) {
        cumMin += b.duration_minutes || 0;
        text += `  [${(b.block_type || '').toUpperCase()}] ${b.title || ''}  —  ${b.duration_minutes || 0} min (cumul: ${Math.floor(cumMin / 60)}h${String(cumMin % 60).padStart(2, '0')})\n`;
        if (b.intention) text += `    Intention: ${b.intention}\n`;
        if (b.format && b.format !== 'pleniere') text += `    Format: ${b.format}${b.format_detail ? ' (' + b.format_detail + ')' : ''}\n`;
        if (b.material) text += `    Matériel: ${b.material}\n`;
        if (b.deliverable) text += `    Livrable: ${b.deliverable}\n`;
        text += '\n';
      }
      text += `  Total: ${txtBlocks.length} blocs · ${Math.floor(cumMin / 60)}h${String(cumMin % 60).padStart(2, '0')}\n`;
    }

    // Agenda
    const txtDays = (state.agendaDays || []).sort((a, b) => a.position - b.position);
    const txtSlots = state.agendaSlots || [];
    if (txtDays.length > 0) {
      text += `\n${'═'.repeat(50)}\n`;
      text += `  AGENDA\n`;
      text += `${'═'.repeat(50)}\n\n`;
      for (const day of txtDays) {
        text += `── Jour ${day.day_number}${day.date ? ' — ' + day.date : ''} (${day.start_time} — ${day.end_time}) ──\n`;
        const daySlots = txtSlots.filter(s => s.day_id === day.id).sort((a, b) => a.position - b.position);
        for (const slot of daySlots) {
          const block = txtBlocks.find(b => b.id === slot.block_id);
          const [sh, sm] = (slot.start_time || '09:00').split(':').map(Number);
          const endTotal = sh * 60 + sm + (slot.duration_minutes || 0);
          const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;
          text += `  ${slot.start_time} — ${endTime}  ${block ? block.title : (slot.title || slot.slot_type)} (${slot.duration_minutes} min)\n`;
        }
        text += '\n';
      }
    }

    text += `\n────────────────────────────────────────\n`;
    text += `Cadrage réalisé avec Insuffle Cadrage Live\n`;
    text += `insuffle.com | Méthode de cadrage Insuffle\n`;

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
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297, H = 210;
      const navy = [12, 22, 41];
      const gold = [255, 222, 89];
      const white = [255, 255, 255];
      const muted = [107, 114, 128];
      const surface = [248, 249, 252];
      const success = [16, 185, 129];
      const warning = [245, 158, 11];
      const error = [239, 68, 68];

      function footer(doc) {
        doc.setFontSize(7);
        doc.setTextColor(...muted);
        doc.text('Cadrage réalisé avec Insuffle Cadrage Live | insuffle.com | Méthode de cadrage Insuffle', W / 2, H - 5, { align: 'center' });
      }

      function pageHeader(doc, title, color) {
        doc.setFillColor(...navy);
        doc.rect(0, 0, W, 16, 'F');
        // Left accent bar
        doc.setFillColor(...(color || gold));
        doc.rect(0, 0, 4, 16, 'F');
        doc.setTextColor(...white);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 12, 11);
        // Logo right
        doc.setTextColor(...gold);
        doc.setFontSize(9);
        doc.text('INSUFFLE', W - 10, 11, { align: 'right' });
      }

      // ===== PAGE 1: Couverture =====
      doc.setFillColor(...navy);
      doc.rect(0, 0, W, H, 'F');
      // Gold accent line
      doc.setFillColor(...gold);
      doc.rect(W / 2 - 30, 50, 60, 2, 'F');
      // Title
      doc.setTextColor(...gold);
      doc.setFontSize(14);
      doc.text('INSUFFLE CADRAGE LIVE', W / 2, 42, { align: 'center' });
      doc.setTextColor(...white);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      const clientName = state.space?.client_name || 'Cadrage de temps collectif';
      doc.text(clientName, W / 2, 72, { align: 'center', maxWidth: 240 });
      doc.setFont('helvetica', 'normal');
      // Info
      doc.setFontSize(12);
      doc.setTextColor(200, 200, 210);
      let infoY = 100;
      if (state.space?.facilitator) { doc.text(`Facilitateur : ${state.space.facilitator}`, W / 2, infoY, { align: 'center' }); infoY += 10; }
      if (state.space?.sponsor) { doc.text(`Sponsor : ${state.space.sponsor}`, W / 2, infoY, { align: 'center' }); infoY += 10; }
      if (state.space?.session_date) { doc.text(`Date : ${state.space.session_date}`, W / 2, infoY, { align: 'center' }); infoY += 10; }
      // Stats
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      const totalCards = state.cards.length;
      const totalParticipants = new Set(state.cards.map(c => c.author)).size;
      doc.text(`${totalCards} carte${totalCards !== 1 ? 's' : ''} · ${totalParticipants} participant${totalParticipants !== 1 ? 's' : ''}`, W / 2, infoY + 10, { align: 'center' });
      // Bottom gold line
      doc.setFillColor(...gold);
      doc.rect(W / 2 - 20, H - 30, 40, 1.5, 'F');
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 120);
      doc.text('Méthode de cadrage Insuffle | insuffle.com', W / 2, H - 15, { align: 'center' });

      // ===== PAGES PHASES =====
      const phaseColors = {
        avant: [30, 58, 95],
        pendant_facilitation: [42, 90, 58],
        pendant_risques: [122, 42, 42],
        conclusion: [74, 58, 106],
      };

      for (const phase of state.phases) {
        doc.addPage();
        const phaseColor = phaseColors[phase.key] || gold;
        pageHeader(doc, phase.name, phaseColor);

        let y = 24;
        const colWidth = (W - 20) / Math.min(phase.columns.length, 4);

        for (let ci = 0; ci < phase.columns.length; ci++) {
          const col = phase.columns[ci];
          const cards = state.cards.filter(c => c.phase === phase.key && c.column_key === col.key);
          const x = 10 + (ci % 4) * colWidth;

          // New row if needed
          if (ci > 0 && ci % 4 === 0) {
            y += 80;
            if (y > H - 30) { doc.addPage(); pageHeader(doc, `${phase.name} (suite)`, phaseColor); y = 24; }
          }

          // Column header
          doc.setFillColor(...surface);
          doc.roundedRect(x, y, colWidth - 4, 8, 2, 2, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...navy);
          doc.text(col.name, x + 3, y + 5.5, { maxWidth: colWidth - 10 });

          let cardY = y + 12;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);

          if (cards.length === 0) {
            doc.setTextColor(...muted);
            doc.text('(vide)', x + 3, cardY);
            cardY += 6;
          }

          for (const card of cards) {
            if (cardY > H - 25) { doc.addPage(); pageHeader(doc, `${phase.name} (suite)`, phaseColor); cardY = 24; }

            // Parse question-linked cards
            const isQuestionCard = card.content.startsWith('[Q] ');
            let questionText = '';
            let answerText = card.content;
            if (isQuestionCard) {
              const parts = card.content.slice(4).split('\n\n');
              questionText = parts[0];
              answerText = parts.slice(1).join('\n\n');
            }

            // Card background
            doc.setFillColor(255, 255, 255);
            const questionLines = isQuestionCard ? doc.splitTextToSize(questionText, colWidth - 16) : [];
            const answerLines = doc.splitTextToSize(answerText, colWidth - 14);
            const questionH = isQuestionCard ? questionLines.length * 3 + 4 : 0;
            const cardHeight = answerLines.length * 3.5 + 5 + questionH;
            doc.roundedRect(x + 1, cardY - 1, colWidth - 6, cardHeight, 1.5, 1.5, 'F');
            // Left accent
            doc.setFillColor(...gold);
            doc.rect(x + 1, cardY - 1, 1.5, cardHeight, 'F');
            // Author
            doc.setFontSize(6.5);
            doc.setTextColor(...muted);
            doc.text(card.author, x + 5, cardY + 2.5);

            let contentY = cardY + 6;
            // Question header if present
            if (isQuestionCard && questionText) {
              doc.setFillColor(255, 249, 224);
              doc.roundedRect(x + 4, contentY - 2, colWidth - 12, questionLines.length * 3 + 2, 1, 1, 'F');
              doc.setFontSize(6.5);
              doc.setFont('helvetica', 'italic');
              doc.setTextColor(...muted);
              doc.text(questionLines, x + 5.5, contentY + 1);
              doc.setFont('helvetica', 'normal');
              contentY += questionH;
            }

            // Content
            doc.setFontSize(8);
            doc.setTextColor(...navy);
            doc.text(answerLines, x + 5, contentY);
            cardY += cardHeight + 2;
          }
        }

        footer(doc);
      }

      // ===== PAGE 8 AXES =====
      doc.addPage();
      pageHeader(doc, '8 AXES DE POSITIONNEMENT — Méthode Insuffle');

      let axY = 24;
      const axW = (W - 30) / 2;

      for (let i = 0; i < state.axesDef.length; i++) {
        const axis = state.axesDef[i];
        const col = i % 2;
        if (i > 0 && i % 2 === 0) axY += 22;
        if (axY > H - 30) { doc.addPage(); pageHeader(doc, '8 AXES (suite)'); axY = 24; }

        const ax = 10 + col * (axW + 10);
        const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null);
        const finalPos = state.axesFinal.find(a => a.axis_key === axis.key);
        const allPos = positions.map(p => p.position);
        const avg = allPos.length > 0 ? allPos.reduce((a, b) => a + b, 0) / allPos.length : null;
        const spread = allPos.length > 1 ? Math.max(...allPos) - Math.min(...allPos) : 0;

        // Axis card background
        const bgColor = spread >= 3 ? [253, 242, 242] : surface;
        doc.setFillColor(...bgColor);
        doc.roundedRect(ax, axY, axW, 18, 2, 2, 'F');

        // Number badge
        doc.setFillColor(...gold);
        doc.circle(ax + 5, axY + 5, 3.5, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text(String(i + 1), ax + 5, axY + 6.2, { align: 'center' });

        // Axis label
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text(`${axis.left}  ---  ${axis.right}`, ax + 12, axY + 6);

        // Status
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        if (spread >= 3) {
          doc.setTextColor(...error);
          doc.text('DIVERGENCE FORTE', ax + axW - 5, axY + 6, { align: 'right' });
        } else if (spread >= 2) {
          doc.setTextColor(...warning);
          doc.text('Écart modéré', ax + axW - 5, axY + 6, { align: 'right' });
        } else if (allPos.length > 0) {
          doc.setTextColor(...success);
          doc.text('Aligné', ax + axW - 5, axY + 6, { align: 'right' });
        }

        // Scale visualization 1-5
        const scaleY = axY + 11;
        const scaleX = ax + 12;
        const scaleW = axW - 24;
        // Track line
        doc.setDrawColor(...muted);
        doc.setLineWidth(0.3);
        doc.line(scaleX, scaleY, scaleX + scaleW, scaleY);
        // Scale labels
        doc.setFontSize(6);
        doc.setTextColor(...muted);
        doc.text(axis.left, scaleX - 1, scaleY + 4, { maxWidth: 30 });
        doc.text(axis.right, scaleX + scaleW + 1, scaleY + 4, { maxWidth: 30, align: 'right' });

        // Position dots
        for (const p of [1, 2, 3, 4, 5]) {
          const dotX = scaleX + ((p - 1) / 4) * scaleW;
          const pCount = positions.filter(pos => pos.position === p).length;
          // Circle
          doc.setFillColor(pCount > 0 ? (finalPos?.position === p ? [...gold] : [...navy]) : [220, 220, 225]);
          doc.circle(dotX, scaleY, pCount > 0 ? 2.2 : 1.5, 'F');
          if (pCount > 0) {
            doc.setFontSize(5.5);
            doc.setTextColor(pCount > 0 ? (finalPos?.position === p ? [...navy] : [...white]) : [...muted]);
            doc.text(String(p), dotX, scaleY + 1.5, { align: 'center' });
          }
        }

        // Average marker
        if (avg !== null) {
          const avgX = scaleX + ((avg - 1) / 4) * scaleW;
          doc.setFillColor(...navy);
          // Small triangle
          doc.triangle(avgX - 1.5, scaleY - 4, avgX + 1.5, scaleY - 4, avgX, scaleY - 2, 'F');
        }

        // Final position
        if (finalPos?.position) {
          doc.setFontSize(6);
          doc.setTextColor(...gold);
          doc.setFont('helvetica', 'bold');
          doc.text(`Position finale : ${finalPos.position}`, ax + 12, axY + 16.5);
          doc.setFont('helvetica', 'normal');
        }

        // Respondents count
        doc.setFontSize(6);
        doc.setTextColor(...muted);
        doc.text(`${allPos.length} rép.`, ax + axW - 5, axY + 16.5, { align: 'right' });
      }

      footer(doc);

      // ===== PAGE DÉROULÉ =====
      const blocks = [...(state.blocks || [])].sort((a, b) => a.position - b.position);
      const dSections = [...(state.sections || [])].sort((a, b) => a.position - b.position);
      const blockTypeColors = {
        ouverture: [34, 197, 94], icebreaker: [245, 158, 11], production: [59, 130, 246],
        exploration: [139, 92, 246], debriefing: [236, 72, 153], decision: [239, 68, 68],
        pause: [107, 114, 128], cloture: [20, 184, 166], transition: [163, 163, 163], energizer: [249, 115, 22],
      };
      const blockTypeLabels = {
        ouverture: 'Ouverture', icebreaker: 'Icebreaker', production: 'Production',
        exploration: 'Exploration', debriefing: 'Débriefing', decision: 'Décision',
        pause: 'Pause', cloture: 'Clôture', transition: 'Transition', energizer: 'Energizer',
      };
      if (blocks.length > 0) {
        doc.addPage();
        pageHeader(doc, 'DÉROULÉ DE L\'ATELIER');
        let by = 24;
        let cumMin = 0;
        const secMap = {};
        dSections.forEach(s => { secMap[s.id] = s; });
        let lastSec = null;

        for (const block of blocks) {
          if (by > H - 30) { doc.addPage(); pageHeader(doc, 'DÉROULÉ (suite)'); by = 24; }

          // Section header
          if (block.section_id && block.section_id !== lastSec) {
            lastSec = block.section_id;
            const sec = secMap[block.section_id];
            if (sec) {
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(...navy);
              doc.text(sec.title, 12, by + 4);
              by += 8;
            }
          }

          cumMin += block.duration_minutes || 0;
          const tc = blockTypeColors[block.block_type] || muted;

          // Block row
          doc.setFillColor(...surface);
          doc.roundedRect(10, by, W - 20, 14, 1.5, 1.5, 'F');
          // Left accent
          doc.setFillColor(...tc);
          doc.rect(10, by, 2, 14, 'F');

          // Type badge
          doc.setFillColor(...tc);
          doc.roundedRect(15, by + 2, 28, 5, 1, 1, 'F');
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...white);
          doc.text(blockTypeLabels[block.block_type] || block.block_type, 16, by + 5.5, { maxWidth: 26 });

          // Title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...navy);
          doc.text(block.title || '', 46, by + 5.5, { maxWidth: 140 });

          // Duration
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...muted);
          doc.text(`${block.duration_minutes || 0} min`, W - 55, by + 5.5);
          doc.text(`${Math.floor(cumMin / 60)}h${String(cumMin % 60).padStart(2, '0')}`, W - 30, by + 5.5);

          // Intention
          if (block.intention) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...muted);
            const intLines = doc.splitTextToSize(block.intention, W - 60);
            doc.text(intLines[0], 15, by + 11, { maxWidth: W - 60 });
          }

          by += 17;
        }

        // Duration summary
        if (by > H - 20) { doc.addPage(); pageHeader(doc, 'DÉROULÉ (suite)'); by = 24; }
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...navy);
        doc.text(`Total : ${blocks.length} blocs · ${Math.floor(cumMin / 60)}h${String(cumMin % 60).padStart(2, '0')}`, 12, by + 4);
        footer(doc);
      }

      // ===== PAGE AGENDA =====
      const agendaDays = (state.agendaDays || []).sort((a, b) => a.position - b.position);
      const agendaSlots = state.agendaSlots || [];
      if (agendaDays.length > 0) {
        doc.addPage();
        pageHeader(doc, 'AGENDA');
        let ay = 24;

        for (const day of agendaDays) {
          if (ay > H - 30) { doc.addPage(); pageHeader(doc, 'AGENDA (suite)'); ay = 24; }
          const daySlots = agendaSlots.filter(s => s.day_id === day.id).sort((a, b) => a.position - b.position);

          // Day header
          doc.setFillColor(...navy);
          doc.roundedRect(10, ay, W - 20, 8, 2, 2, 'F');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...white);
          let dayLabel = `Jour ${day.day_number}`;
          if (day.date) {
            try { dayLabel += ` — ${new Date(day.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`; } catch { dayLabel += ` — ${day.date}`; }
          }
          doc.text(dayLabel, 14, ay + 5.5);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`${day.start_time} — ${day.end_time}`, W - 50, ay + 5.5);
          ay += 12;

          for (const slot of daySlots) {
            if (ay > H - 20) { doc.addPage(); pageHeader(doc, 'AGENDA (suite)'); ay = 24; }
            const block = blocks.find(b => b.id === slot.block_id);
            const [sh, sm] = (slot.start_time || '09:00').split(':').map(Number);
            const endTotal = sh * 60 + sm + (slot.duration_minutes || 0);
            const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...muted);
            doc.text(`${slot.start_time} — ${endTime}`, 14, ay + 3.5);

            if (block) {
              const tc = blockTypeColors[block.block_type] || muted;
              doc.setFillColor(...tc);
              doc.circle(55, ay + 2.5, 1.5, 'F');
              doc.setTextColor(...navy);
              doc.setFont('helvetica', 'bold');
              doc.text(block.title || '', 60, ay + 3.5, { maxWidth: 150 });
            } else {
              doc.setTextColor(...muted);
              doc.text(slot.title || slot.slot_type || '', 60, ay + 3.5);
            }

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...muted);
            doc.text(`${slot.duration_minutes} min`, W - 30, ay + 3.5);
            ay += 7;
          }
          ay += 5;
        }
        footer(doc);
      }

      // ===== PAGE SYNTHÈSE (optionnel si beaucoup de contenu) =====
      doc.addPage();
      pageHeader(doc, 'SYNTHÈSE DU CADRAGE');

      let sy = 26;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text('Avancement par phase', 10, sy);
      sy += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      for (const phase of state.phases) {
        const phaseCards = state.cards.filter(c => c.phase === phase.key);
        const filledCols = phase.columns.filter(col => state.cards.some(c => c.phase === phase.key && c.column_key === col.key)).length;
        const pct = Math.round((filledCols / phase.columns.length) * 100);

        doc.setTextColor(...navy);
        doc.text(`${phase.name}`, 15, sy);
        doc.setTextColor(...muted);
        doc.text(`${phaseCards.length} cartes · ${filledCols}/${phase.columns.length} colonnes`, 80, sy);

        // Progress bar
        doc.setFillColor(230, 230, 235);
        doc.roundedRect(160, sy - 3, 60, 4, 1, 1, 'F');
        if (pct > 0) {
          doc.setFillColor(...(pct === 100 ? success : gold));
          doc.roundedRect(160, sy - 3, 60 * (pct / 100), 4, 1, 1, 'F');
        }
        doc.setFontSize(7);
        doc.text(`${pct}%`, 225, sy, { align: 'left' });
        doc.setFontSize(9);
        sy += 8;
      }

      // Axes summary
      sy += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text('Points d\'attention sur les 8 axes', 10, sy);
      sy += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      let hasAlerts = false;
      for (const axis of state.axesDef) {
        const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null).map(a => a.position);
        if (positions.length > 1) {
          const spread = Math.max(...positions) - Math.min(...positions);
          if (spread >= 2) {
            hasAlerts = true;
            doc.setTextColor(spread >= 3 ? error[0] : warning[0], spread >= 3 ? error[1] : warning[1], spread >= 3 ? error[2] : warning[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(spread >= 3 ? '/!\\' : '/!\\', 15, sy);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...navy);
            doc.text(`${axis.left} / ${axis.right} — ${spread >= 3 ? 'Divergence forte' : 'Écart modéré'} (écart de ${spread})`, 22, sy);
            sy += 7;
          }
        }
      }
      if (!hasAlerts) {
        doc.setTextColor(...success);
        doc.text('OK - Alignement satisfaisant sur l\'ensemble des axes', 15, sy);
      }

      footer(doc);

      doc.save(`cadrage-${state.space?.client_name || 'insuffle'}-${new Date().toISOString().slice(0, 10)}.pdf`);
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'PDF exporté avec succès', type: 'success' } });
    } catch (e) {
      console.error('PDF export error:', e);
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Erreur export PDF: ' + e.message, type: 'error' } });
    } finally {
      setExporting(false);
    }
  }

  function exportExcel() {
    // CSV with BOM for Excel compatibility (handles accented characters)
    const BOM = '\uFEFF';
    const sep = ';'; // European Excel default
    const rows = [];

    // Header row
    rows.push(['Phase', 'Colonne', 'Auteur', 'Contenu', 'Tags', 'Votes', 'À discuter', 'Question liée'].join(sep));

    for (const phase of state.phases) {
      for (const col of phase.columns) {
        const cards = state.cards.filter(c => c.phase === phase.key && c.column_key === col.key);
        for (const card of cards) {
          const isQ = card.content.startsWith('[Q] ');
          const question = isQ ? card.content.slice(4).split('\n\n')[0] : '';
          const content = isQ ? card.content.slice(4).split('\n\n').slice(1).join(' ') : card.content;
          const voteCount = state.votes.filter(v => v.card_id === card.id).length;
          const csvRow = [
            phase.name,
            col.name,
            card.author,
            `"${content.replace(/"/g, '""')}"`,
            (card.tags || []).join(', '),
            voteCount,
            card.marked_discuss ? 'Oui' : '',
            question ? `"${question.replace(/"/g, '""')}"` : '',
          ];
          rows.push(csvRow.join(sep));
        }
      }
    }

    // Axes sheet
    rows.push('');
    rows.push(['Axe', 'Gauche', 'Droite', 'Participant', 'Position', 'Explication'].join(sep));
    for (const axis of state.axesDef) {
      const positions = state.axes.filter(a => a.axis_key === axis.key && a.position != null);
      for (const p of positions) {
        rows.push([
          `${axis.left} / ${axis.right}`,
          axis.left,
          axis.right,
          p.pseudo,
          p.position,
          p.explanation ? `"${p.explanation.replace(/"/g, '""')}"` : '',
        ].join(sep));
      }
    }

    // Déroulé sheet
    const csvBlocks = [...(state.blocks || [])].sort((a, b) => a.position - b.position);
    if (csvBlocks.length > 0) {
      rows.push('');
      rows.push(['Bloc', 'Type', 'Durée (min)', 'Intention', 'Format', 'Matériel', 'Livrable', 'Description'].join(sep));
      for (const b of csvBlocks) {
        rows.push([
          `"${(b.title || '').replace(/"/g, '""')}"`,
          b.block_type || '',
          b.duration_minutes || 0,
          `"${(b.intention || '').replace(/"/g, '""')}"`,
          b.format || '',
          `"${(b.material || '').replace(/"/g, '""')}"`,
          `"${(b.deliverable || '').replace(/"/g, '""')}"`,
          `"${(b.description || '').replace(/"/g, '""')}"`,
        ].join(sep));
      }
    }

    // Agenda sheet
    const csvDays = (state.agendaDays || []).sort((a, b) => a.position - b.position);
    const csvSlots = state.agendaSlots || [];
    if (csvDays.length > 0) {
      rows.push('');
      rows.push(['Jour', 'Date', 'Début', 'Fin', 'Bloc', 'Type créneau', 'Heure début', 'Durée (min)'].join(sep));
      for (const day of csvDays) {
        const daySlots = csvSlots.filter(s => s.day_id === day.id).sort((a, b) => a.position - b.position);
        for (const slot of daySlots) {
          const block = csvBlocks.find(b => b.id === slot.block_id);
          rows.push([
            `Jour ${day.day_number}`,
            day.date || '',
            day.start_time,
            day.end_time,
            block ? `"${(block.title || '').replace(/"/g, '""')}"` : (slot.title || ''),
            slot.slot_type,
            slot.start_time,
            slot.duration_minutes,
          ].join(sep));
        }
      }
    }

    const csv = BOM + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadrage-${state.space?.client_name || 'insuffle'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Export Excel (CSV) téléchargé', type: 'success' } });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Lien copié dans le presse-papier', type: 'success' } });
    } catch {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { message: window.location.href, type: 'info' } });
    }
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

  // Darkboard link
  const darkboardUrl = `https://darkboard.insuffle.com/board/cadrage-${state.spaceId}`;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[90vw] z-40 flex flex-col animate-slide-in elevation-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
      role="dialog" aria-label="Export et partage">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display font-bold text-body">Export et partage</h2>
        <button onClick={() => dispatch({ type: 'TOGGLE_EXPORT' })}
          className="p-1 rounded-btn transition-colors" style={{ color: 'var(--color-text-muted)' }}
          aria-label="Fermer"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* PDF Export */}
        <button onClick={exportPDF} disabled={exporting} className="w-full btn-primary flex items-center justify-center gap-2">
          <Download size={18} /> {exporting ? 'Génération du PDF...' : 'Exporter en PDF'}
        </button>
        <p className="text-label" style={{ color: 'var(--color-text-muted)' }}>
          Inclut les 4 phases, cartes, 8 axes, déroulé et agenda
        </p>

        {/* Text Export */}
        <button onClick={exportText} className="w-full btn-secondary flex items-center justify-center gap-2">
          <FileText size={18} /> Exporter en texte
        </button>

        {/* Excel Export */}
        <button onClick={exportExcel} className="w-full btn-ghost border flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-border)' }}>
          <Table size={18} /> Exporter en Excel (CSV)
        </button>

        {/* Copy link */}
        <button onClick={copyLink} className="w-full btn-ghost border flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-border)' }}>
          <Copy size={18} /> Copier le lien du cadrage
        </button>

        {/* Print */}
        <button onClick={() => window.print()} className="w-full btn-ghost border flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-border)' }}>
          <Printer size={18} /> Imprimer
        </button>

        <hr style={{ borderColor: 'var(--color-border)' }} />

        {/* Darkboard link */}
        <div className="p-3 rounded-card border" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-body-sm font-semibold mb-1 flex items-center gap-2">
            <ExternalLink size={14} style={{ color: 'var(--color-accent)' }} />
            Darkboard Insuffle
          </h3>
          <p className="text-caption mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Board collaboratif lié à ce cadrage
          </p>
          <a href={darkboardUrl} target="_blank" rel="noopener"
            className="inline-flex items-center gap-1 text-body-sm font-medium hover:underline"
            style={{ color: 'var(--color-accent)' }}>
            Ouvrir le Darkboard <ExternalLink size={12} />
          </a>
          <div className="mt-1.5">
            <button onClick={async () => {
              try {
                await navigator.clipboard.writeText(darkboardUrl);
                dispatch({ type: 'ADD_NOTIFICATION', notification: { message: 'Lien Darkboard copié', type: 'success' } });
              } catch {
                dispatch({ type: 'ADD_NOTIFICATION', notification: { message: darkboardUrl, type: 'info' } });
              }
            }} className="text-caption hover:underline" style={{ color: 'var(--color-text-muted)' }}>
              Copier le lien Darkboard
            </button>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--color-border)' }} />

        {/* Duplicate */}
        <button onClick={duplicateSpace} className="w-full btn-ghost border flex items-center justify-center gap-2"
          style={{ borderColor: 'var(--color-border)' }}>
          <Layers size={18} /> Dupliquer cet espace
        </button>

        {/* Snapshot */}
        <div>
          <h3 className="text-body-sm font-semibold mb-2">Sauvegarder un snapshot</h3>
          <div className="flex gap-1">
            <input value={snapshotName} onChange={e => setSnapshotName(e.target.value)}
              placeholder="Nom du snapshot" className="input-field flex-1 text-body-sm" />
            <button onClick={saveSnapshot} disabled={!snapshotName.trim()} className="btn-primary text-body-sm px-3">Sauver</button>
          </div>
        </div>
      </div>
    </div>
  );
}
