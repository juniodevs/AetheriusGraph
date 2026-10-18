import React from 'react';

interface FilterBarProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  totalNodes: number;
  totalEdges: number;
}

const TYPE_OPTIONS: Array<{ key: string | null; label: string; color: string }> = [
  { key: null, label: 'All Stars', color: '#f8fafc' },
  { key: 'deity', label: 'Deities', color: '#facc15' },
  { key: 'daedra', label: 'Daedra', color: '#c084fc' },
  { key: 'dragon', label: 'Dragons', color: '#f97316' },
  { key: 'artifact', label: 'Artifacts', color: '#f43f5e' },
  { key: 'hero', label: 'Heroes', color: '#38bdf8' },
  { key: 'character', label: 'Characters', color: '#34d399' },
  { key: 'faction', label: 'Factions', color: '#818cf8' },
  { key: 'location', label: 'Locations', color: '#2dd4bf' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedType,
  onSelectType,
  totalNodes,
  totalEdges,
}) => {
  return (
    <footer
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        pointerEvents: 'none',
        background: 'linear-gradient(0deg, rgba(2,4,9,0.96) 0%, rgba(2,4,9,0.5) 75%, rgba(2,4,9,0) 100%)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '6px',
          pointerEvents: 'auto',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginRight: '4px',
            fontWeight: 600,
          }}
        >
          Spectral Filter:
        </span>
        {TYPE_OPTIONS.map(opt => {
          const isActive = selectedType === opt.key;
          return (
            <button
              key={opt.label}
              onClick={() => onSelectType(opt.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '3px',
                fontSize: '11px',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(15, 23, 42, 0.9)' : 'rgba(8, 12, 22, 0.75)',
                border: `1px solid ${isActive ? opt.color : 'rgba(255, 255, 255, 0.1)'}`,
                color: isActive ? '#f8fafc' : 'var(--text-secondary)',
                boxShadow: isActive ? `0 0 10px ${opt.color}40` : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: opt.color,
                  boxShadow: `0 0 6px ${opt.color}`,
                  display: 'inline-block',
                }}
              />
              {opt.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          pointerEvents: 'auto',
        }}
      >
        <span>
          Left drag: rotate • Right drag: pan • Wheel: zoom • Star click: inspect
        </span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span style={{ color: '#f8fafc', fontWeight: 500 }}>
          {totalNodes} Stars • {totalEdges} Lore Beams
        </span>
      </div>
    </footer>
  );
};
