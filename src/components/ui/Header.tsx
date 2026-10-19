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
        background: 'linear-gradient(180deg, rgba(11, 11, 11, 0.98) 0%, rgba(13, 27, 42, 0.55) 70%, rgba(11, 11, 11, 0) 100%)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/favicon.svg"
            alt="AetheriusGraph emblem"
            style={{
              width: '32px',
              height: '32px',
              filter: 'drop-shadow(0 0 12px rgba(200, 155, 60, 0.45))',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--color-bone-white)',
                margin: 0,
                textShadow: '0 0 16px rgba(200, 155, 60, 0.4), 0 0 30px rgba(45, 10, 62, 0.55)',
              }}
            >
              AetheriusGraph
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '11px',
                color: 'var(--color-tarnished-gold)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Celestial Lore Sphere of The Elder Scrolls
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                backgroundColor: 'var(--bg-midnight)',
                border: '1px solid var(--border-stone)',
                padding: '8px 14px',
                borderRadius: '4px',
                color: 'var(--color-bone-white)',
                fontSize: '12.5px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-tarnished-gold-bright)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(200, 155, 60, 0.25)';
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-stone)';
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
                  backgroundColor: 'var(--bg-obsidian)',
                  border: '1px solid var(--color-tarnished-gold)',
                  borderRadius: '4px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.9), 0 0 16px rgba(45, 10, 62, 0.5)',
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
                      padding: '10px 14px',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(139, 115, 85, 0.15)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(200, 155, 60, 0.15)';
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
                          boxShadow: `0 0 6px ${node.color}`,
                        }}
                      />
                      <span style={{ color: 'var(--color-bone-white)', fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                        {node.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-tarnished-gold)' }}>
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
              backgroundColor: 'var(--bg-midnight)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-bone-white)',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-tarnished-gold-bright)';
              e.currentTarget.style.boxShadow = 'var(--glow-gold)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = 'var(--color-bone-white)';
            }}
          >
            Celestial Panorama
          </button>
        </div>
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
            fontFamily: 'var(--font-title)',
            backgroundColor: activeRealm === null ? 'var(--bg-purple)' : 'rgba(13, 27, 42, 0.75)',
            border: `1px solid ${activeRealm === null ? 'var(--color-tarnished-gold-bright)' : 'var(--border-subtle)'}`,
            color: activeRealm === null ? 'var(--color-bone-white)' : 'var(--text-secondary)',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: activeRealm === null ? '0 0 14px rgba(200, 155, 60, 0.35)' : 'none',
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
                fontFamily: 'var(--font-title)',
                backgroundColor: isActive ? 'var(--bg-purple)' : 'rgba(13, 27, 42, 0.75)',
                border: `1px solid ${isActive ? info.color : 'var(--border-subtle)'}`,
                color: isActive ? 'var(--color-bone-white)' : 'var(--text-secondary)',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? `0 0 14px ${info.color}55` : 'none',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: info.color,
                  display: 'inline-block',
                  boxShadow: `0 0 6px ${info.color}`,
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
