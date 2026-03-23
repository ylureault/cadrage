import { useState, useMemo } from 'react';
import { useStore } from '../store.jsx';
import socket from '../socket.js';
import {
  MessageSquare, Trash2, Edit3, Flag, Star, Tag, ThumbsUp,
  ThumbsDown, HelpCircle, Lightbulb, Flame, X
} from 'lucide-react';

const TAG_COLORS = {
  'Urgent': 'bg-red-100 text-red-700',
  'À valider': 'bg-orange-100 text-orange-700',
  'Fait': 'bg-green-100 text-green-700',
  'Question': 'bg-blue-100 text-blue-700',
  'Hors scope': 'bg-gray-100 text-gray-700',
};

const EMOJIS = ['👍', '👎', '❓', '💡', '🔥'];

export default function Card({ card }) {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const isAuthor = card.author === state.pseudo;
  const isSpotlight = state.spotlight === card.id;
  const comments = state.comments.filter(c => c.card_id === card.id);
  const cardVotes = state.votes.filter(v => v.card_id === card.id);
  const myVote = cardVotes.find(v => v.pseudo === state.pseudo);
  const isHighlighted = state.searchQuery && (card.content.toLowerCase().includes(state.searchQuery.toLowerCase()) || card.author.toLowerCase().includes(state.searchQuery.toLowerCase()));

  function saveEdit() {
    if (editContent.trim() && editContent !== card.content) {
      socket.emit('update-card', { cardId: card.id, content: editContent.trim() });
    }
    setEditing(false);
  }

  function deleteCard() {
    if (confirm('Supprimer cette carte ?')) {
      socket.emit('delete-card', { cardId: card.id, asFacilitator: state.isFacilitator && !isAuthor });
    }
  }

  function toggleDiscuss() { socket.emit('mark-discuss', { cardId: card.id }); }

  function addComment() {
    if (!commentText.trim()) return;
    socket.emit('add-comment', { cardId: card.id, content: commentText.trim() });
    setCommentText('');
  }

  function handleReact(emoji) {
    socket.emit('react', { cardId: card.id, emoji });
    setShowEmojis(false);
  }

  function addTag(tag) {
    socket.emit('add-tag', { cardId: card.id, tag });
    setShowTags(false);
  }

  function removeTag(tag) { socket.emit('remove-tag', { cardId: card.id, tag }); }

  function vote() { socket.emit('vote', { cardId: card.id }); }
  function unvote() { socket.emit('unvote', { cardId: card.id }); }

  function spotlight() { socket.emit('spotlight', { cardId: isSpotlight ? null : card.id }); }

  /* US-379: Card micro-animations, US-365: radius, US-366: elevations */
  return (
    <div className={`rounded-card border-l-[3px] elevation-1 hover:elevation-2 transition-all duration-200 animate-scale-in
      ${isSpotlight ? 'ring-2 scale-[1.02] z-10' : ''}
      ${isHighlighted ? 'ring-2' : ''}
      ${card.marked_discuss ? 'ring-1' : ''}`}
      style={{
        borderLeftColor: card.author_color,
        backgroundColor: 'var(--color-surface)',
        ...(isSpotlight ? { ringColor: 'var(--color-accent)' } : {}),
        ...(isHighlighted ? { ringColor: 'var(--color-accent)', backgroundColor: 'rgba(255,222,89,0.05)' } : {}),
        ...(card.marked_discuss ? { ringColor: 'var(--color-warning)' } : {}),
      }}
      role="listitem"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>

      {/* Author + Tags */}
      <div className="px-3 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
            style={{ backgroundColor: card.author_color }}>
            {card.author[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-500">{card.author}</span>
          {card.marked_discuss ? <Flag size={12} className="text-orange-400" /> : null}
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {(card.tags || []).map(tag => (
            <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}>
              {tag}
              {(isAuthor || state.isFacilitator) && (
                <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500">×</button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {editing ? (
          <div>
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
              className="input-field w-full text-sm resize-none" rows={3} maxLength={500} autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            />
            <div className="flex justify-end gap-1 mt-1">
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Annuler</button>
              <button onClick={saveEdit} className="btn-primary text-xs px-2 py-1">Valider</button>
            </div>
          </div>
        ) : card.content.startsWith('[Q] ') ? (
          <>
            <div className="text-[11px] italic px-2 py-1 rounded-btn mb-1.5"
              style={{ backgroundColor: 'rgba(255,222,89,0.1)', color: 'var(--color-text-muted)' }}>
              <HelpCircle size={10} className="inline mr-1" style={{ color: 'var(--color-accent)' }} />
              {card.content.slice(4).split('\n\n')[0]}
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">
              {card.content.slice(4).split('\n\n').slice(1).join('\n\n') || ''}
            </p>
          </>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{card.content}</p>
        )}
      </div>

      {/* Reactions */}
      {card.reactions && Object.keys(card.reactions).length > 0 && (
        <div className="px-3 pb-1 flex gap-1 flex-wrap">
          {Object.entries(card.reactions).map(([emoji, users]) => (
            <button key={emoji} onClick={() => handleReact(emoji)}
              className={`text-xs px-1.5 py-0.5 rounded-full border ${users.includes(state.pseudo) ? 'bg-insuffle-gold/20 border-insuffle-gold' : 'bg-gray-50 border-gray-200'}`}
              title={users.join(', ')}>
              {emoji} {users.length}
            </button>
          ))}
        </div>
      )}

      {/* Votes */}
      {cardVotes.length > 0 && (
        <div className="px-3 pb-1">
          <span className="text-xs text-insuffle-blue font-medium">⬆ {cardVotes.length} vote{cardVotes.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Action bar */}
      {(showActions || showComments) && !editing && !state.archived && (
        <div className="px-3 pb-2 flex items-center gap-1 flex-wrap">
          {/* Comment */}
          <button onClick={() => setShowComments(!showComments)}
            className="btn-ghost text-xs flex items-center gap-0.5 p-1">
            <MessageSquare size={13} /> {comments.length || ''}
          </button>

          {/* React */}
          <div className="relative">
            <button onClick={() => setShowEmojis(!showEmojis)} className="btn-ghost text-xs p-1">😊</button>
            {showEmojis && (
              <div className="absolute bottom-full left-0 bg-white card-shadow rounded-lg p-1 flex gap-1 z-30">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => handleReact(e)} className="hover:bg-gray-100 rounded p-1 text-lg">{e}</button>
                ))}
              </div>
            )}
          </div>

          {/* Vote */}
          <button onClick={myVote ? unvote : vote} className={`btn-ghost text-xs p-1 ${myVote ? 'text-insuffle-blue' : ''}`}>
            ⬆
          </button>

          {/* Discuss */}
          <button onClick={toggleDiscuss} className={`btn-ghost text-xs p-1 ${card.marked_discuss ? 'text-orange-500' : ''}`}>
            <Flag size={13} />
          </button>

          {/* Tags */}
          {(isAuthor || state.isFacilitator) && (
            <div className="relative">
              <button onClick={() => setShowTags(!showTags)} className="btn-ghost text-xs p-1"><Tag size={13} /></button>
              {showTags && (
                <div className="absolute bottom-full left-0 bg-white card-shadow rounded-lg p-2 z-30 min-w-[120px]">
                  {Object.keys(TAG_COLORS).map(t => (
                    <button key={t} onClick={() => addTag(t)} className="block w-full text-left text-xs py-1 px-2 hover:bg-gray-50 rounded">{t}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit (author only) */}
          {isAuthor && <button onClick={() => { setEditing(true); setEditContent(card.content); }} className="btn-ghost text-xs p-1"><Edit3 size={13} /></button>}

          {/* Delete (author or facilitator) */}
          {(isAuthor || state.isFacilitator) && (
            <button onClick={deleteCard} className="btn-ghost text-xs p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
          )}

          {/* Spotlight (facilitator) */}
          {state.isFacilitator && (
            <button onClick={spotlight} className={`btn-ghost text-xs p-1 ${isSpotlight ? 'text-insuffle-gold' : ''}`}><Star size={13} /></button>
          )}
        </div>
      )}

      {/* Comments panel */}
      {showComments && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-white text-[8px]"
                style={{ backgroundColor: c.author_color }}>{c.author[0]}</div>
              <div>
                <span className="text-xs font-medium">{c.author}</span>
                <p className="text-xs text-gray-600">{c.content}</p>
              </div>
            </div>
          ))}
          {!state.archived && (
            <div className="flex gap-1">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Commenter..." className="input-field flex-1 text-xs py-1"
                onKeyDown={e => e.key === 'Enter' && addComment()} />
              <button onClick={addComment} className="btn-primary text-xs px-2 py-1">↑</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
