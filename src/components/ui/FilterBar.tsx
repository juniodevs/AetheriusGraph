import React from 'react';

interface FilterBarProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  totalNodes: number;
  totalEdges: number;
}

const TYPE_OPTIONS: Array<{ key: string | null; label: string; color: string }> = [
  { key: null, label: 'All Stars', color: '#e8e0d0' },
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
        background: 'linear-gradient(0deg, rgba(11, 11, 11, 0.98) 0%, rgba(13, 27, 42, 0.6) 70%, rgba(11, 11, 11, 0) 100%)',
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
            fontFamily: 'var(--font-title)',
            color: 'var(--color-tarnished-gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginRight: '6px',
            fontWeight: 700,
          }}
        >
          Spectral Reliquary:
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
                padding: '5px 12px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'var(--font-title)',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-purple)' : 'rgba(13, 27, 42, 0.8)',
                border: `1px solid ${isActive ? opt.color : 'var(--border-subtle)'}`,
                color: isActive ? 'var(--color-bone-white)' : 'var(--text-secondary)',
                boxShadow: isActive ? `0 0 12px ${opt.color}55` : 'none',
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
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          pointerEvents: 'auto',
        }}
      >
        <span>
          Left drag: rotate • Right drag: pan • Wheel: zoom • Star click: inspect
        </span>
        <span style={{ color: 'var(--color-stone-grey)' }}>|</span>
        <span style={{ color: 'var(--color-tarnished-gold-bright)', fontWeight: 600 }}>
          {totalNodes} Stars • {totalEdges} Lore Beams
        </span>
      </div>
    </footer>
  );
};
