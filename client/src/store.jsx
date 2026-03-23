import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const StoreContext = createContext();

// Dark mode: read from localStorage or system preference
function getInitialDarkMode() {
  const stored = localStorage.getItem('insuffle-dark-mode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
}

const initialState = {
  // Connection
  pseudo: null,
  color: null,
  spaceId: null,
  connected: false,
  offline: false,

  // Space data
  space: null,
  cards: [],
  comments: [],
  axes: [],
  axesFinal: [],
  phaseStates: [],
  votes: [],
  participants: [],
  facilitators: [],

  // Déroulé & Agenda
  blocks: [],
  blockComments: [],
  sections: [],
  agendaDays: [],
  agendaSlots: [],

  // Canvas structure
  phases: [],
  axesDef: [],

  // UI state
  activePhase: 'avant',
  spotlight: null,
  timer: null,
  silentColumns: {},
  revealedColumns: {},
  searchQuery: '',
  showAxes: false,
  showActivity: false,
  showStats: false,
  showExport: false,
  darkMode: getInitialDarkMode(),
  isFacilitator: false,
  archived: false,
  welcomeMessage: '',
  notifications: [],
  focusZones: {},
  pendingCards: [],
  hiddenColumns: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PSEUDO': return { ...state, pseudo: action.pseudo, color: action.color };
    case 'SET_SPACE_ID': return { ...state, spaceId: action.spaceId };
    case 'SET_CONNECTED': return { ...state, connected: action.connected };
    case 'SET_OFFLINE': return { ...state, offline: action.offline };
    case 'SET_ARCHIVED': return { ...state, archived: action.archived };

    case 'LOAD_STRUCTURE': return { ...state, phases: action.phases, axesDef: action.axes };
    case 'LOAD_SPACE': {
      const d = action.data;
      return {
        ...state,
        space: d.space,
        cards: d.cards,
        comments: d.comments,
        axes: d.axes,
        axesFinal: d.axesFinal,
        phaseStates: d.phaseStates,
        votes: d.votes,
        blocks: d.blocks || [],
        blockComments: d.blockComments || [],
        sections: d.sections || [],
        agendaDays: d.agendaDays || [],
        agendaSlots: d.agendaSlots || [],
        facilitators: d.space.facilitator_ids || [],
        archived: !!d.space.archived,
        welcomeMessage: d.space.welcome_message || '',
        isFacilitator: (d.space.facilitator_ids || []).includes(state.pseudo),
        hiddenColumns: d.space.hidden_columns || [],
      };
    }

    case 'SET_PARTICIPANTS': return { ...state, participants: action.participants };
    case 'SET_FACILITATORS': {
      return { ...state, facilitators: action.facilitators, isFacilitator: action.facilitators.includes(state.pseudo) };
    }

    // Header
    case 'UPDATE_HEADER': return {
      ...state,
      space: state.space ? { ...state.space, [action.field]: action.value } : state.space
    };

    // Cards
    case 'ADD_CARD': return { ...state, cards: [...state.cards, action.card] };
    case 'UPDATE_CARD': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, content: action.content } : c)
    };
    case 'DELETE_CARD': return { ...state, cards: state.cards.filter(c => c.id !== action.cardId) };
    case 'MOVE_CARD': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId
        ? { ...c, phase: action.toPhase, column_key: action.toColumnKey, position: action.toPosition }
        : c)
    };
    case 'MARK_DISCUSS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, marked_discuss: action.marked } : c)
    };
    case 'UPDATE_TAGS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, tags: action.tags } : c)
    };
    case 'UPDATE_REACTIONS': return {
      ...state,
      cards: state.cards.map(c => c.id === action.cardId ? { ...c, reactions: action.reactions } : c)
    };
    case 'UPDATE_VOTES': return { ...state, votes: action.votes };

    // Comments
    case 'ADD_COMMENT': return { ...state, comments: [...state.comments, action.comment] };

    // Axes
    case 'UPDATE_AXIS': {
      const filtered = state.axes.filter(a => a.axis_key !== action.axisKey);
      return { ...state, axes: [...filtered, ...action.positions] };
    }
    case 'UPDATE_AXIS_FINAL': {
      const filtered = state.axesFinal.filter(a => a.axis_key !== action.axisKey);
      return { ...state, axesFinal: [...filtered, { axis_key: action.axisKey, position: action.position, space_id: state.spaceId }] };
    }
    case 'UPDATE_AXIS_LOCK': {
      return {
        ...state,
        axesFinal: state.axesFinal.map(a => a.axis_key === action.axisKey ? { ...a, locked: action.locked ? 1 : 0 } : a)
      };
    }

    // Blocks (Déroulé)
    case 'ADD_BLOCK': return { ...state, blocks: [...state.blocks, action.block] };
    case 'UPDATE_BLOCK': return {
      ...state,
      blocks: state.blocks.map(b => b.id === action.block.id ? action.block : b)
    };
    case 'DELETE_BLOCK': return {
      ...state,
      blocks: state.blocks.filter(b => b.id !== action.blockId),
      agendaSlots: state.agendaSlots.filter(s => s.block_id !== action.blockId)
    };
    case 'REORDER_BLOCKS': {
      const orderMap = {};
      action.orderedIds.forEach((id, i) => { orderMap[id] = i; });
      return { ...state, blocks: [...state.blocks].sort((a, b) => (orderMap[a.id] ?? a.position) - (orderMap[b.id] ?? b.position)) };
    }
    case 'SET_BLOCKS': return { ...state, blocks: action.blocks };

    // Block comments
    case 'ADD_BLOCK_COMMENT': return { ...state, blockComments: [...state.blockComments, action.comment] };

    // Sections
    case 'ADD_SECTION': return { ...state, sections: [...state.sections, action.section] };
    case 'UPDATE_SECTION': return {
      ...state,
      sections: state.sections.map(s => s.id === action.section.id ? action.section : s)
    };
    case 'DELETE_SECTION': return {
      ...state,
      sections: state.sections.filter(s => s.id !== action.sectionId),
      blocks: state.blocks.map(b => b.section_id === action.sectionId ? { ...b, section_id: null } : b)
    };
    case 'REORDER_SECTIONS': {
      const orderMap = {};
      action.orderedIds.forEach((id, i) => { orderMap[id] = i; });
      return { ...state, sections: [...state.sections].sort((a, b) => (orderMap[a.id] ?? a.position) - (orderMap[b.id] ?? b.position)) };
    }

    // Agenda
    case 'ADD_AGENDA_DAY': return { ...state, agendaDays: [...state.agendaDays, action.day] };
    case 'UPDATE_AGENDA_DAY': return {
      ...state,
      agendaDays: state.agendaDays.map(d => d.id === action.day.id ? action.day : d)
    };
    case 'DELETE_AGENDA_DAY': return {
      ...state,
      agendaDays: state.agendaDays.filter(d => d.id !== action.dayId),
      agendaSlots: state.agendaSlots.filter(s => s.day_id !== action.dayId)
    };
    case 'ADD_AGENDA_SLOT': return { ...state, agendaSlots: [...state.agendaSlots, action.slot] };
    case 'UPDATE_AGENDA_SLOT': return {
      ...state,
      agendaSlots: state.agendaSlots.map(s => s.id === action.slot.id ? action.slot : s)
    };
    case 'DELETE_AGENDA_SLOT': return { ...state, agendaSlots: state.agendaSlots.filter(s => s.id !== action.slotId) };
    case 'SET_AGENDA_SLOTS': return { ...state, agendaSlots: action.slots.concat(state.agendaSlots.filter(s => s.day_id !== action.dayId)) };
    case 'REORDER_AGENDA_SLOTS': {
      const orderMap = {};
      action.orderedIds.forEach((id, i) => { orderMap[id] = i; });
      return { ...state, agendaSlots: [...state.agendaSlots].sort((a, b) => (orderMap[a.id] ?? a.position) - (orderMap[b.id] ?? b.position)) };
    }

    // Phase states
    case 'UPDATE_PHASE_STATE': return {
      ...state,
      phaseStates: state.phaseStates.map(p => {
        if (p.phase !== action.phase) return p;
        return {
          ...p,
          ...(action.locked !== null ? { locked: !!action.locked } : {}),
          ...(action.hidden !== null ? { hidden: !!action.hidden } : {}),
        };
      })
    };

    // Timer
    case 'SET_TIMER': return { ...state, timer: action.timer };
    case 'CLEAR_TIMER': return { ...state, timer: null };

    // Spotlight
    case 'SET_SPOTLIGHT': return { ...state, spotlight: action.cardId };

    // Silent mode
    case 'SET_SILENT_MODE': return {
      ...state,
      silentColumns: { ...state.silentColumns, [action.columnKey]: action.active }
    };
    case 'REVEAL_COLUMN': return {
      ...state,
      revealedColumns: { ...state.revealedColumns, [action.columnKey]: true },
      silentColumns: { ...state.silentColumns, [action.columnKey]: false }
    };

    // UI
    case 'SET_ACTIVE_PHASE': return { ...state, activePhase: action.phase };
    case 'SET_SEARCH': return { ...state, searchQuery: action.query };
    case 'TOGGLE_AXES': return { ...state, showAxes: !state.showAxes };
    case 'TOGGLE_ACTIVITY': return { ...state, showActivity: !state.showActivity };
    case 'TOGGLE_STATS': return { ...state, showStats: !state.showStats };
    case 'TOGGLE_EXPORT': return { ...state, showExport: !state.showExport };
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode };
    case 'SET_SPACE_ARCHIVED': return { ...state, archived: action.archived };
    case 'SET_WELCOME_MESSAGE': return { ...state, welcomeMessage: action.message };
    case 'UPDATE_SETTING': {
      const newSpace = state.space ? { ...state.space, [action.key]: action.value } : state.space;
      const extra = {};
      if (action.key === 'hidden_columns') extra.hiddenColumns = action.value;
      return { ...state, space: newSpace, ...extra };
    }
    case 'ADD_NOTIFICATION': return { ...state, notifications: [...state.notifications, { id: Date.now(), ...action.notification }] };
    case 'REMOVE_NOTIFICATION': return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };
    case 'SET_FOCUS': return { ...state, focusZones: { ...state.focusZones, [action.pseudo]: action.columnKey } };

    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply dark mode class on <html> and persist to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
    localStorage.setItem('insuffle-dark-mode', String(state.darkMode));
  }, [state.darkMode]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
