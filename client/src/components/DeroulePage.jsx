import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import {
  Plus, GripVertical, ChevronDown, ChevronRight, Trash2, Copy, MessageSquare,
  Clock, Users, AlertTriangle, Package, Target, Layers, FileText,
  Zap, Coffee, Sun, Sunset, Sparkles, ArrowRight, LayoutList, BarChart3,
  FolderPlus, X, Check, Edit3, ExternalLink
} from 'lucide-react';

// US-D006 : Types d'activité avec couleurs
const BLOCK_TYPES = [
  { key: 'ouverture', label: 'Ouverture', color: '#22c55e', icon: Sun },
  { key: 'icebreaker', label: 'Icebreaker', color: '#f59e0b', icon: Zap },
  { key: 'production', label: 'Production', color: '#3b82f6', icon: Target },
  { key: 'exploration', label: 'Exploration', color: '#8b5cf6', icon: Sparkles },
  { key: 'debriefing', label: 'Débriefing', color: '#ec4899', icon: MessageSquare },
  { key: 'decision', label: 'Décision', color: '#ef4444', icon: Check },
  { key: 'pause', label: 'Pause', color: '#6b7280', icon: Coffee },
  { key: 'cloture', label: 'Clôture', color: '#14b8a6', icon: Sunset },
  { key: 'transition', label: 'Transition', color: '#a3a3a3', icon: ArrowRight },
  { key: 'energizer', label: 'Energizer', color: '#f97316', icon: Zap },
];

const FORMATS = [
  { key: 'pleniere', label: 'Plénière' },
  { key: 'binomes', label: 'Binômes' },
  { key: 'trinomes', label: 'Trinômes' },
  { key: 'sous-groupes', label: 'Sous-groupes de N' },
  { key: 'individuel', label: 'Individuel' },
];

// US-D017 : Questions d'inspiration
const INTENTION_HINTS = [
  "Qu'est-ce que les participants doivent ressentir après ce moment ?",
  "Quel mouvement intérieur ce bloc doit-il provoquer ?",
  "Si ce bloc réussit parfaitement, que se passe-t-il ensuite ?",
];

function getBlockType(key) {
  return BLOCK_TYPES.find(t => t.key === key) || BLOCK_TYPES[2];
}

function formatDuration(minutes) {
  if (!minutes) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function cumulativeDuration(blocks, upToIndex) {
  let total = 0;
  for (let i = 0; i <= upToIndex; i++) {
    total += blocks[i]?.duration_minutes || 0;
  }
  return total;
}

// ===== Block Creation/Edit Form (US-D004, US-D007, US-D008, US-D009, US-D016, US-D017) =====
function BlockForm({ block, onSave, onCancel }) {
  const [title, setTitle] = useState(block?.title || '');
  const [intention, setIntention] = useState(block?.intention || '');
  const [description, setDescription] = useState(block?.description || '');
  const [blockType, setBlockType] = useState(block?.block_type || 'production');
  const [duration, setDuration] = useState(block?.duration_minutes || 30);
  const [format, setFormat] = useState(block?.format || 'pleniere');
  const [formatDetail, setFormatDetail] = useState(block?.format_detail || '');
  const [material, setMaterial] = useState(block?.material || '');
  const [deliverable, setDeliverable] = useState(block?.deliverable || '');
  const [attentionFlag, setAttentionFlag] = useState(block?.attention_flag || false);
  const [attentionNote, setAttentionNote] = useState(block?.attention_note || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const titleRef = useRef();
  const [hintIdx] = useState(Math.floor(Math.random() * INTENTION_HINTS.length));

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!title.trim()) errs.title = true;
    if (!intention.trim()) errs.intention = "L'intention est le cœur du bloc";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      title: title.trim(), intention: intention.trim(), description, block_type: blockType,
      duration_minutes: parseInt(duration) || 30, format, format_detail: formatDetail,
      material, deliverable, attention_flag: attentionFlag, attention_note: attentionNote
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card p-6 animate-fade-in"
      style={{ backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-accent)' }}>
      <div className="grid gap-4">
        {/* Title */}
        <div>
          <label className="text-label font-semibold block mb-1">Titre *</label>
          <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Tour de table d'ouverture"
            className={`input-field w-full ${errors.title ? 'ring-2 ring-red-400' : ''}`} />
        </div>

        {/* Intention */}
        <div>
          <label className="text-label font-semibold block mb-1">Intention *</label>
          <textarea value={intention} onChange={e => setIntention(e.target.value)}
            placeholder={INTENTION_HINTS[hintIdx]}
            rows={2}
            className={`input-field w-full resize-none ${errors.intention ? 'ring-2 ring-red-400' : ''}`} />
          {errors.intention && <p className="text-caption mt-1" style={{ color: 'var(--color-error)' }}>{errors.intention}</p>}
        </div>

        {/* Type + Duration row */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="text-label font-semibold block mb-1">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_TYPES.map(t => (
                <button key={t.key} type="button"
                  onClick={() => setBlockType(t.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium transition-all
                    ${blockType === t.key ? 'ring-2 ring-offset-1 text-white' : 'opacity-60 hover:opacity-100'}`}
                  style={{
                    backgroundColor: blockType === t.key ? t.color : 'var(--color-surface-alt)',
                    ringColor: t.color,
                    color: blockType === t.key ? 'white' : 'var(--color-text)',
                  }}>
                  <t.icon size={12} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-28">
            <label className="text-label font-semibold block mb-1">Durée (min)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              min={5} max={480} step={5} className="input-field w-full" />
          </div>
        </div>

        {/* Advanced fields */}
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-body-sm font-medium flex items-center gap-1 self-start" style={{ color: 'var(--color-text-muted)' }}>
          {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Options avancées
        </button>

        {showAdvanced && (
          <div className="grid gap-4 animate-fade-in">
            {/* Description */}
            <div>
              <label className="text-label font-semibold block mb-1">Description / Consignes</label>
              <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 2000))}
                placeholder="Consignes, matériel, instructions détaillées..."
                rows={3} className="input-field w-full resize-y" />
              <p className="text-caption mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description.length}/2000</p>
            </div>

            {/* Format */}
            <div>
              <label className="text-label font-semibold block mb-1">Format participants</label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(f => (
                  <button key={f.key} type="button"
                    onClick={() => setFormat(f.key)}
                    className={`px-3 py-1.5 rounded-btn text-caption font-medium transition-all ${format === f.key ? 'ring-2' : ''}`}
                    style={{
                      backgroundColor: format === f.key ? 'rgba(255,222,89,0.2)' : 'var(--color-surface-alt)',
                      ringColor: 'var(--color-accent)',
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
              {format === 'sous-groupes' && (
                <input value={formatDetail} onChange={e => setFormatDetail(e.target.value)}
                  placeholder="Ex: Sous-groupes de 4" className="input-field mt-2 w-48" />
              )}
            </div>

            {/* Material */}
            <div>
              <label className="text-label font-semibold block mb-1">Matériel nécessaire</label>
              <input value={material} onChange={e => setMaterial(e.target.value)}
                placeholder="Post-its, feutres, paperboard..." className="input-field w-full" />
            </div>

            {/* Deliverable */}
            <div>
              <label className="text-label font-semibold block mb-1">Livrable attendu</label>
              <input value={deliverable} onChange={e => setDeliverable(e.target.value)}
                placeholder="Ex: Liste priorisée d'idées" className="input-field w-full" />
            </div>

            {/* Attention flag */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={attentionFlag} onChange={e => setAttentionFlag(e.target.checked)}
                  className="rounded" />
                <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
                <span className="text-body-sm font-medium">Point d'attention</span>
              </label>
              {attentionFlag && (
                <input value={attentionNote} onChange={e => setAttentionNote(e.target.value)}
                  placeholder="Ex: Sujet sensible — possible tension..."
                  className="input-field w-full mt-2" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel}
          className="btn-ghost text-body-sm">Annuler</button>
        <button type="submit" className="btn-primary text-body-sm">
          {block ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

// ===== Block Card (US-D012, US-D006, US-D010, US-D011, US-D030, US-D031) =====
function BlockCard({ block, index, blocks, onEdit, onDragStart, onDragOver, onDrop, isDragging }) {
  const { state } = useStore();
  const [collapsed, setCollapsed] = useState(block.collapsed);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const blockType = getBlockType(block.block_type);
  const cumDuration = cumulativeDuration(blocks, index);
  const comments = state.blockComments.filter(c => c.block_id === block.id);

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    socket.emit('delete-block', { blockId: block.id });
    setConfirmDelete(false);
  }

  function handleDuplicate() {
    socket.emit('duplicate-block', { blockId: block.id });
    setShowMenu(false);
  }

  function handleToggleCollapse() {
    const newVal = !collapsed;
    setCollapsed(newVal);
    socket.emit('update-block', { blockId: block.id, collapsed: newVal });
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    socket.emit('add-block-comment', { blockId: block.id, content: commentText });
    setCommentText('');
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={`group rounded-card transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : 'elevation-1 hover:elevation-2'}`}
      style={{ backgroundColor: 'var(--color-surface)', borderLeft: `4px solid ${blockType.color}` }}>

      {/* Header — always visible */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={handleToggleCollapse}>
        {/* Drag handle */}
        <div className="cursor-grab opacity-30 group-hover:opacity-60 transition-opacity"
          onMouseDown={e => e.stopPropagation()}>
          <GripVertical size={16} />
        </div>

        {/* Number */}
        <span className="text-caption font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: blockType.color, color: 'white' }}>
          {index + 1}
        </span>

        {/* Collapse indicator */}
        {collapsed ? <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />}

        {/* Title + intention preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-body-sm truncate">{block.title}</span>
            <span className="text-caption px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${blockType.color}20`, color: blockType.color }}>
              {blockType.label}
            </span>
            {block.attention_flag && <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />}
            {block.deliverable && <Package size={14} style={{ color: 'var(--color-text-muted)' }} />}
            {comments.length > 0 && (
              <span className="text-caption flex items-center gap-0.5" style={{ color: 'var(--color-text-muted)' }}>
                <MessageSquare size={12} /> {comments.length}
              </span>
            )}
          </div>
          {collapsed && (
            <p className="text-caption truncate" style={{ color: 'var(--color-text-muted)' }}>{block.intention}</p>
          )}
        </div>

        {/* Duration + cumulative */}
        <div className="text-right shrink-0">
          <div className="font-semibold text-body-sm">{formatDuration(block.duration_minutes)}</div>
          <div className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{formatDuration(cumDuration)}</div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(block)} className="p-1 rounded hover:bg-black/5" title="Éditer">
            <Edit3 size={14} />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-black/5" title="Plus">
            <Layers size={14} />
          </button>
        </div>
      </div>

      {/* Menu contextuel */}
      {showMenu && (
        <div className="px-4 pb-2 flex gap-2 animate-fade-in" onClick={e => e.stopPropagation()}>
          <button onClick={handleDuplicate} className="btn-ghost text-caption flex items-center gap-1">
            <Copy size={12} /> Dupliquer
          </button>
          <button onClick={() => { setShowComments(!showComments); setShowMenu(false); }}
            className="btn-ghost text-caption flex items-center gap-1">
            <MessageSquare size={12} /> Commentaires ({comments.length})
          </button>
          <button onClick={handleDelete}
            className={`btn-ghost text-caption flex items-center gap-1 ${confirmDelete ? 'text-red-500 font-semibold' : ''}`}>
            <Trash2 size={12} /> {confirmDelete ? 'Confirmer ?' : 'Supprimer'}
          </button>
          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-caption">Annuler</button>
          )}
        </div>
      )}

      {/* Expanded content */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in" onClick={e => e.stopPropagation()}>
          {/* Intention */}
          <div>
            <p className="text-label font-semibold mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Intention</p>
            <p className="text-body-sm">{block.intention}</p>
          </div>

          {/* Description */}
          {block.description && (
            <div>
              <p className="text-label font-semibold mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Description</p>
              <p className="text-body-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>{block.description}</p>
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-caption" style={{ color: 'var(--color-text-muted)' }}>
            {block.format !== 'pleniere' && (
              <span className="flex items-center gap-1"><Users size={12} /> {FORMATS.find(f => f.key === block.format)?.label}{block.format_detail ? ` (${block.format_detail})` : ''}</span>
            )}
            {block.material && <span className="flex items-center gap-1"><Package size={12} /> {block.material}</span>}
            {block.deliverable && <span className="flex items-center gap-1"><FileText size={12} /> {block.deliverable}</span>}
          </div>

          {/* Attention note */}
          {block.attention_flag && block.attention_note && (
            <div className="flex items-start gap-2 p-2 rounded-btn text-caption"
              style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}>
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              <span>{block.attention_note}</span>
            </div>
          )}

          {/* Linked axes */}
          {block.linked_axes?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {block.linked_axes.map(ax => (
                <span key={ax} className="text-caption px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'rgba(255,222,89,0.15)', color: 'var(--color-accent-dark)' }}>
                  Axe: {ax}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="border-t px-4 py-3 space-y-2 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}
          onClick={e => e.stopPropagation()}>
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white"
                style={{ backgroundColor: c.author_color }}>{c.author[0]}</div>
              <div>
                <span className="text-caption font-semibold">{c.author}</span>
                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire..." className="input-field flex-1 text-caption" />
            <button type="submit" className="btn-primary text-caption px-3">Envoyer</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ===== Summary Bar (US-D019, US-D038) =====
function DerouleSummary({ blocks }) {
  const totalMinutes = blocks.reduce((a, b) => a + (b.duration_minutes || 0), 0);
  const byType = {};
  blocks.forEach(b => {
    const t = getBlockType(b.block_type);
    if (!byType[t.key]) byType[t.key] = { ...t, count: 0, minutes: 0 };
    byType[t.key].count++;
    byType[t.key].minutes += b.duration_minutes || 0;
  });
  const types = Object.values(byType).sort((a, b) => b.minutes - a.minutes);

  // US-D038: Equilibrium check
  const hasNoPause = totalMinutes > 120 && !types.find(t => t.key === 'pause');

  return (
    <div className="rounded-card p-4 mb-6 elevation-1" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="text-body font-semibold">{blocks.length} bloc{blocks.length > 1 ? 's' : ''}</div>
        <div className="text-body font-semibold" style={{ color: 'var(--color-accent-dark)' }}>
          <Clock size={16} className="inline mr-1" />{formatDuration(totalMinutes)}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <span key={t.key} className="text-caption flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${t.color}15`, color: t.color }}>
              {t.count} {t.label} ({formatDuration(t.minutes)})
            </span>
          ))}
        </div>
      </div>

      {/* Type distribution bar */}
      {totalMinutes > 0 && (
        <div className="flex rounded-full overflow-hidden h-2">
          {types.map(t => (
            <div key={t.key} style={{ width: `${(t.minutes / totalMinutes) * 100}%`, backgroundColor: t.color }}
              title={`${t.label}: ${formatDuration(t.minutes)} (${Math.round((t.minutes / totalMinutes) * 100)}%)`} />
          ))}
        </div>
      )}

      {/* Equilibrium warnings */}
      {hasNoPause && (
        <p className="text-caption mt-2 flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
          <AlertTriangle size={12} />
          Méthode Insuffle : un groupe fatigue au bout de 90 min. Pensez à une respiration.
        </p>
      )}
    </div>
  );
}

// ===== Main DeroulePage =====
export default function DeroulePage() {
  const { state } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState({ system: [], personal: [] });
  const [dragIndex, setDragIndex] = useState(null);

  const blocks = [...state.blocks].sort((a, b) => a.position - b.position);

  function handleCreate(data) {
    socket.emit('create-block', data);
    setShowForm(false);
  }

  function handleEdit(block) {
    setEditingBlock(block);
    setShowForm(false);
  }

  function handleSaveEdit(data) {
    socket.emit('update-block', { blockId: editingBlock.id, ...data });
    setEditingBlock(null);
  }

  // Drag & drop (US-D013)
  function handleDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, toIndex) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === toIndex) { setDragIndex(null); return; }
    const reordered = [...blocks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(toIndex, 0, moved);
    socket.emit('reorder-blocks', { orderedIds: reordered.map(b => b.id) });
    setDragIndex(null);
  }

  // Templates (US-D023)
  function loadTemplates() {
    setShowTemplates(true);
    socket.emit('list-templates');
    socket.once('templates-list', (data) => setTemplates(data));
  }

  function useTemplate(id) {
    socket.emit('load-deroulement-template', { templateId: id });
    setShowTemplates(false);
  }

  function saveAsTemplate() {
    const name = prompt('Nom du template :');
    if (name) socket.emit('save-deroulement-template', { name, description: '' });
  }

  // Sections (US-D033)
  function addSection() {
    const title = prompt('Nom de la section (ex: Matin - Jour 1) :');
    if (title) socket.emit('create-section', { title });
  }

  // US-D002: Empty state
  if (blocks.length === 0 && !showForm && !editingBlock) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-card mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,222,89,0.15)' }}>
          <LayoutList size={32} style={{ color: 'var(--color-accent-dark)' }} />
        </div>
        <h2 className="font-display text-h2-mobile mb-3">Construisez le déroulé de votre intervention</h2>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Ajoutez des blocs d'activité, définissez les intentions et organisez la séquence de votre atelier.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setShowForm(true)} className="btn-primary text-body-sm flex items-center gap-2">
            <Plus size={18} /> Ajouter un bloc
          </button>
          <button onClick={loadTemplates} className="btn-ghost text-body-sm flex items-center gap-2">
            <FileText size={18} /> Importer un template
          </button>
        </div>

        {/* Templates modal */}
        {showTemplates && <TemplatesModal templates={templates} onUse={useTemplate} onClose={() => setShowTemplates(false)} />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Summary (US-D019) */}
      {blocks.length > 0 && <DerouleSummary blocks={blocks} />}

      {/* Sections display */}
      {state.sections.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {state.sections.sort((a, b) => a.position - b.position).map(sec => (
            <div key={sec.id} className="flex items-center gap-2 px-3 py-1.5 rounded-btn text-caption font-semibold"
              style={{ backgroundColor: 'rgba(255,222,89,0.1)', color: 'var(--color-accent-dark)' }}>
              <Layers size={12} /> {sec.title}
              <button onClick={() => {
                const t = prompt('Nouveau nom :', sec.title);
                if (t) socket.emit('update-section', { sectionId: sec.id, title: t });
              }} className="hover:opacity-70"><Edit3 size={10} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => { setShowForm(true); setEditingBlock(null); }}
          className="btn-primary text-body-sm flex items-center gap-1">
          <Plus size={16} /> Ajouter un bloc
        </button>
        <button onClick={addSection} className="btn-ghost text-body-sm flex items-center gap-1">
          <FolderPlus size={16} /> Section
        </button>
        <button onClick={loadTemplates} className="btn-ghost text-body-sm flex items-center gap-1">
          <FileText size={16} /> Templates
        </button>
        <button onClick={saveAsTemplate} className="btn-ghost text-body-sm flex items-center gap-1">
          <Package size={16} /> Sauvegarder
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <div className="mb-4">
          <BlockForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Edit form */}
      {editingBlock && (
        <div className="mb-4">
          <BlockForm block={editingBlock} onSave={handleSaveEdit} onCancel={() => setEditingBlock(null)} />
        </div>
      )}

      {/* Blocks list (US-D026) */}
      <div className="space-y-2">
        {blocks.map((block, i) => (
          <BlockCard
            key={block.id}
            block={block}
            index={i}
            blocks={blocks}
            onEdit={handleEdit}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={dragIndex === i}
          />
        ))}
      </div>

      {/* Templates modal */}
      {showTemplates && <TemplatesModal templates={templates} onUse={useTemplate} onClose={() => setShowTemplates(false)} />}
    </div>
  );
}

// ===== Templates Modal (US-D023) =====
function TemplatesModal({ templates, onUse, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-h3">Templates de déroulé</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={18} /></button>
        </div>

        {templates.system.length > 0 && (
          <>
            <h4 className="text-label font-semibold uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Templates Insuffle</h4>
            <div className="space-y-2 mb-4">
              {templates.system.map(t => (
                <button key={t.id} onClick={() => onUse(t.id)}
                  className="w-full text-left p-3 rounded-card hover:elevation-1 transition-shadow"
                  style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <div className="font-semibold text-body-sm">{t.name}</div>
                  {t.description && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>}
                </button>
              ))}
            </div>
          </>
        )}

        {templates.personal.length > 0 && (
          <>
            <h4 className="text-label font-semibold uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Mes templates</h4>
            <div className="space-y-2">
              {templates.personal.map(t => (
                <button key={t.id} onClick={() => onUse(t.id)}
                  className="w-full text-left p-3 rounded-card hover:elevation-1 transition-shadow"
                  style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <div className="font-semibold text-body-sm">{t.name}</div>
                  {t.description && <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{t.description}</p>}
                </button>
              ))}
            </div>
          </>
        )}

        {templates.system.length === 0 && templates.personal.length === 0 && (
          <p className="text-body-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            Aucun template disponible pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
