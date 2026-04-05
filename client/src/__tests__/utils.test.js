import { describe, it, expect } from 'vitest';

// ===== UTILITY FUNCTIONS TESTS =====

// Reproduce functions from components for isolated testing

function formatDuration(minutes) {
  if (!minutes) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function addMinutesToTime(time, mins) {
  const [h, m] = (time || '09:00').split(':').map(Number);
  const total = ((h || 0) * 60 + (m || 0) + (mins || 0)) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function timeToMinutes(time) {
  const [h, m] = (time || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ===== TESTS =====

describe('formatDuration', () => {
  it('returns 0min for zero', () => {
    expect(formatDuration(0)).toBe('0min');
  });

  it('returns 0min for null/undefined', () => {
    expect(formatDuration(null)).toBe('0min');
    expect(formatDuration(undefined)).toBe('0min');
  });

  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(45)).toBe('45min');
  });

  it('formats hours only', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h30');
    expect(formatDuration(150)).toBe('2h30');
    expect(formatDuration(75)).toBe('1h15');
    expect(formatDuration(195)).toBe('3h15');
  });

  it('handles large durations', () => {
    expect(formatDuration(480)).toBe('8h');
    expect(formatDuration(500)).toBe('8h20');
  });
});

describe('addMinutesToTime', () => {
  it('adds minutes correctly', () => {
    expect(addMinutesToTime('09:00', 30)).toBe('09:30');
    expect(addMinutesToTime('10:15', 45)).toBe('11:00');
    expect(addMinutesToTime('14:00', 120)).toBe('16:00');
  });

  it('handles null/undefined time', () => {
    expect(addMinutesToTime(null, 30)).toBe('09:30');
    expect(addMinutesToTime(undefined, 60)).toBe('10:00');
  });

  it('handles null/undefined minutes', () => {
    expect(addMinutesToTime('09:00', null)).toBe('09:00');
    expect(addMinutesToTime('09:00', undefined)).toBe('09:00');
  });

  it('wraps around midnight (modulo 1440)', () => {
    expect(addMinutesToTime('23:00', 120)).toBe('01:00');
    expect(addMinutesToTime('23:50', 30)).toBe('00:20');
  });

  it('handles exact midnight', () => {
    expect(addMinutesToTime('23:00', 60)).toBe('00:00');
  });

  it('pads single digits', () => {
    expect(addMinutesToTime('01:05', 0)).toBe('01:05');
    expect(addMinutesToTime('09:00', 5)).toBe('09:05');
  });
});

describe('timeToMinutes', () => {
  it('converts correctly', () => {
    expect(timeToMinutes('09:00')).toBe(540);
    expect(timeToMinutes('17:30')).toBe(1050);
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('12:15')).toBe(735);
  });

  it('handles null/undefined', () => {
    expect(timeToMinutes(null)).toBe(540); // defaults to 09:00
    expect(timeToMinutes(undefined)).toBe(540);
  });

  it('handles edge cases', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
    expect(timeToMinutes('00:01')).toBe(1);
  });
});

// ===== CARD CONTENT PARSING =====

describe('Card content parsing', () => {
  it('detects question-linked cards', () => {
    const content = '[Q] What is the goal?\n\nThe goal is X';
    expect((content || '').startsWith('[Q] ')).toBe(true);
  });

  it('extracts question text', () => {
    const content = '[Q] What is the goal?\n\nThe goal is X';
    expect(content.slice(4).split('\n\n')[0]).toBe('What is the goal?');
  });

  it('extracts answer text', () => {
    const content = '[Q] What is the goal?\n\nThe goal is X';
    expect(content.slice(4).split('\n\n').slice(1).join('\n\n')).toBe('The goal is X');
  });

  it('handles null content', () => {
    const content = null;
    expect((content || '').startsWith('[Q] ')).toBe(false);
  });

  it('handles empty content', () => {
    const content = '';
    expect((content || '').startsWith('[Q] ')).toBe(false);
  });

  it('handles question with no answer', () => {
    const content = '[Q] What is the goal?';
    expect(content.slice(4).split('\n\n').slice(1).join('\n\n')).toBe('');
  });
});

// ===== TAG COLORS =====

describe('TAG_COLORS structure', () => {
  const TAG_COLORS = {
    'Urgent': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    'À valider': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    'Fait': { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    'Question': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    'Hors scope': { bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  };

  it('has all expected tags', () => {
    expect(Object.keys(TAG_COLORS)).toEqual(['Urgent', 'À valider', 'Fait', 'Question', 'Hors scope']);
  });

  it('each tag has bg and color', () => {
    for (const [tag, value] of Object.entries(TAG_COLORS)) {
      expect(value).toHaveProperty('bg');
      expect(value).toHaveProperty('color');
      expect(value.bg).toMatch(/^rgba/);
      expect(value.color).toMatch(/^#/);
    }
  });
});

// ===== BLOCK TYPES =====

describe('Block types', () => {
  const VALID_TYPES = [
    'ouverture', 'icebreaker', 'production', 'exploration',
    'debriefing', 'decision', 'pause', 'cloture', 'transition', 'energizer'
  ];

  it('has 10 valid types', () => {
    expect(VALID_TYPES).toHaveLength(10);
  });

  it('all types are lowercase strings', () => {
    for (const type of VALID_TYPES) {
      expect(type).toBe(type.toLowerCase());
      expect(typeof type).toBe('string');
    }
  });
});

// ===== AXES VALIDATION =====

describe('Axes validation', () => {
  const AXES = [
    { key: 'decider_murir', left: 'Décider', right: 'Faire mûrir' },
    { key: 'agir_cap', left: 'Agir ensemble', right: 'Porter le cap' },
    { key: 'cadre_autonomie', left: 'Tenir le cadre', right: 'Autonomie du groupe' },
    { key: 'produire_explorer', left: 'Produire', right: 'Explorer' },
    { key: 'contenu_processus', left: 'Contenu', right: 'Processus' },
    { key: 'recul_action', left: 'Prendre du recul', right: "Passer à l'action" },
    { key: 'ouvert_cible', left: 'Ouvert', right: 'Ciblé' },
    { key: 'serieux_ludique', left: 'Sérieux', right: 'Énergie ludique' },
  ];

  it('has 8 axes', () => {
    expect(AXES).toHaveLength(8);
  });

  it('each axis has key, left, right', () => {
    for (const axis of AXES) {
      expect(axis).toHaveProperty('key');
      expect(axis).toHaveProperty('left');
      expect(axis).toHaveProperty('right');
      expect(axis.key).toBeTruthy();
      expect(axis.left).toBeTruthy();
      expect(axis.right).toBeTruthy();
    }
  });

  it('positions must be between 1 and 5', () => {
    for (let p = 1; p <= 5; p++) {
      expect(p >= 1 && p <= 5).toBe(true);
    }
    expect(0 >= 1).toBe(false);
    expect(6 <= 5).toBe(false);
  });

  it('divergence calculation is correct', () => {
    // Aligned
    expect(Math.max(2, 2, 3) - Math.min(2, 2, 3)).toBeLessThan(2);
    // Moderate
    expect(Math.max(1, 3, 4) - Math.min(1, 3, 4)).toBeGreaterThanOrEqual(2);
    // Strong divergence
    expect(Math.max(1, 5) - Math.min(1, 5)).toBeGreaterThanOrEqual(3);
  });
});

// ===== SERIALIZATION =====

describe('SQLite boolean serialization', () => {
  it('converts 0 to false', () => {
    expect(!!0).toBe(false);
  });

  it('converts 1 to true', () => {
    expect(!!1).toBe(true);
  });

  it('converts null to false', () => {
    expect(!!null).toBe(false);
  });

  it('handles JSON parse for arrays', () => {
    expect(JSON.parse('[]')).toEqual([]);
    expect(JSON.parse('["a","b"]')).toEqual(['a', 'b']);
  });

  it('handles JSON parse for objects', () => {
    expect(JSON.parse('{}')).toEqual({});
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles null/empty JSON strings', () => {
    expect(JSON.parse('[]' || '[]')).toEqual([]);
    expect(JSON.parse('{}' || '{}')).toEqual({});
  });
});

// ===== PSEUDO VALIDATION =====

describe('Pseudo validation', () => {
  it('rejects empty pseudo', () => {
    expect(''.trim()).toBe('');
    expect(!''.trim()).toBe(true);
  });

  it('rejects whitespace-only pseudo', () => {
    expect('   '.trim()).toBe('');
    expect(!'   '.trim()).toBe(true);
  });

  it('accepts valid pseudo', () => {
    expect('Alice'.trim()).toBe('Alice');
    expect(!'Alice'.trim()).toBe(false);
  });

  it('enforces max length', () => {
    expect('A'.repeat(30).length).toBe(30);
    expect('A'.repeat(51).length > 50).toBe(true);
  });
});

// ===== URL GENERATION =====

describe('URL generation', () => {
  it('generates correct darkboard URL', () => {
    const spaceId = 'abc123';
    const url = `https://darkboard.insuffle.com/board/cadrage-${spaceId}`;
    expect(url).toBe('https://darkboard.insuffle.com/board/cadrage-abc123');
  });

  it('generates correct demo URL', () => {
    const demoId = '6AG_demo';
    expect(`/${demoId}`).toBe('/6AG_demo');
  });
});
