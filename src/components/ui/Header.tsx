import React, { useState, useRef, useEffect } from 'react';
import type { LoreNode, RealmDetail } from '../../types/lore';

interface HeaderProps {
  nodes: LoreNode[];
  realms: Record<string, RealmDetail>;
  activeRealm: string | null;
  onSelectRealm: (realmKey: string | null) => void;
  onSelectNode: (node: LoreNode) => void;
  onResetCamera: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nodes,
  realms,
  activeRealm,
  onSelectRealm,
  onSelectNode,
  onResetCamera,
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = search.trim()
    ? nodes
        .filter(n =>
          n.name.toLowerCase().includes(search.toLowerCase()) ||
          n.realm_name.toLowerCase().includes(search.toLowerCase()) ||
          n.summary.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 24px',
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(2,4,9,0.94) 0%, rgba(2,4,9,0.4) 75%, rgba(2,4,9,0) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          pointerEvents: 'auto',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#f8fafc',
              textTransform: 'uppercase',
              margin: 0,
              textShadow: '0 0 14px rgba(200, 155, 60, 0.35)',
            }}
          >
            AetheriusGraph
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Celestial Lore Sphere of The Elder Scrolls
          </span>
        </div>

        <div ref={searchRef} style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search deities, heroes, daedra, factions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(200, 155, 60, 0.2)';
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {isOpen && filteredResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '100%',
                maxHeight: '320px',
                overflowY: 'auto',
                backgroundColor: '#0a0f1d',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                zIndex: 40,
              }}
            >
              {filteredResults.map(node => (
                <div
                  key={node.id}
                  onClick={() => {
                    onSelectNode(node);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    padding: '9px 14px',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(200, 155, 60, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: node.color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ color: '#f8fafc', fontWeight: 500 }}>
                      {node.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {node.realm_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onResetCamera}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '7px 16px',
            borderRadius: '4px',
            fontSize: '12px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
            e.currentTarget.style.color = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Celestial Panorama
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          pointerEvents: 'auto',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
        }}
      >
        <button
          onClick={() => onSelectRealm(null)}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '11.5px',
            backgroundColor: activeRealm === null ? 'var(--bg-surface-elevated)' : 'rgba(10,15,29,0.7)',
            border: `1px solid ${activeRealm === null ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
            color: activeRealm === null ? 'var(--accent-gold)' : 'var(--text-secondary)',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: activeRealm === null ? '0 0 12px rgba(200, 155, 60, 0.25)' : 'none',
          }}
        >
          All Cosmos
        </button>

        {Object.entries(realms).map(([key, info]) => {
          const isActive = activeRealm === key;
          return (
            <button
              key={key}
              onClick={() => onSelectRealm(key)}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '11.5px',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'rgba(10,15,29,0.7)',
                border: `1px solid ${isActive ? info.color : 'var(--border-subtle)'}`,
                color: isActive ? '#f8fafc' : 'var(--text-secondary)',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? `0 0 14px ${info.color}44` : 'none',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: info.color,
                  display: 'inline-block',
                }}
              />
              <span>{info.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
