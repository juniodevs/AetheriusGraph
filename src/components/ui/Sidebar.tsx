import React, { useEffect } from 'react';
import type { LoreNode, LoreEdge } from '../../types/lore';

interface SidebarProps {
  node: LoreNode | null;
  edges: LoreEdge[];
  nodesMap: Map<string, LoreNode>;
  onClose: () => void;
  onSelectNode: (node: LoreNode) => void;
}

const cleanSummary = (text: string) => {
  return text
    .replace(/^\{\|[\s\S]*?;\s*\"?\s*/g, '')
    .replace(/^\{\|[\s\S]*?\|\}\s*/g, '')
    .replace(/\{\|[\s\S]*?\|\}/g, '')
    .trim();
};

export const Sidebar: React.FC<SidebarProps> = ({
  node,
  edges,
  nodesMap,
  onClose,
  onSelectNode,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const connectedRelations = edges
    .filter(e => e.source === node.id || e.target === node.id)
    .map(e => {
      const isSource = e.source === node.id;
      const targetId = isSource ? e.target : e.source;
      const targetNode = nodesMap.get(targetId);
      return {
        edge: e,
        targetNode,
        isOutgoing: isSource,
      };
    })
    .filter((rel): rel is { edge: LoreEdge; targetNode: LoreNode; isOutgoing: boolean } => Boolean(rel.targetNode));

  const wikiUrl = `https://en.uesp.net/wiki/${encodeURIComponent(node.title)}`;
  const sanitizedSummary = cleanSummary(node.summary);

  return (
    <aside
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '400px',
        maxWidth: '92vw',
        height: '100%',
        backgroundColor: 'var(--bg-obsidian)',
        backgroundImage: 'linear-gradient(180deg, rgba(13, 27, 42, 0.4) 0%, rgba(11, 11, 11, 0.98) 35%, rgba(11, 11, 11, 1) 100%)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.85), inset 1px 0 0 rgba(139, 115, 85, 0.15)',
        animation: 'slideIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          padding: '22px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'linear-gradient(180deg, rgba(45, 10, 62, 0.25) 0%, rgba(11, 11, 11, 0) 100%)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '3px',
                backgroundColor: `${node.color}18`,
                border: `1px solid ${node.color}60`,
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: node.color,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: node.color,
                  boxShadow: `0 0 6px ${node.color}`,
                  display: 'inline-block',
                }}
              />
              {node.type}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-title)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {node.realm_name}
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '22px',
              color: 'var(--color-bone-white)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              margin: 0,
              textShadow: '0 0 14px rgba(200, 155, 60, 0.35)',
            }}
          >
            {node.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            color: 'var(--text-muted)',
            fontSize: '18px',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            transition: 'color 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-bone-white)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {node.image && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: 'var(--bg-obsidian)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.85), 0 4px 14px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '120px',
              }}
            >
              <img
                src={node.image}
                alt={node.name}
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  maxHeight: '320px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.8))',
                  borderRadius: '2px',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '10px',
                paddingTop: '6px',
                borderTop: '1px solid rgba(139, 115, 85, 0.2)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Archive Portrait
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  color: 'var(--color-tarnished-gold)',
                  letterSpacing: '0.04em',
                }}
              >
                Canonical
              </span>
            </div>
          </div>
        )}

        <div>
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              color: 'var(--color-tarnished-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
              margin: 0,
            }}
          >
            Chronicler Lore Record
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13.5px',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              marginTop: '8px',
              marginBottom: 0,
            }}
          >
            {sanitizedSummary}
          </p>
        </div>

        <div>
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              color: 'var(--color-tarnished-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '10px',
              margin: 0,
            }}
          >
            Connected Lore Links ({connectedRelations.length})
          </h3>

          {connectedRelations.length === 0 ? (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '8px',
              }}
            >
              No direct lore links mapped in this constellation.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              {connectedRelations.map(({ edge, targetNode }) => (
                <div
                  key={`${edge.source}-${edge.target}`}
                  onClick={() => onSelectNode(targetNode)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-tarnished-gold-bright)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(200, 155, 60, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: targetNode.color,
                        boxShadow: `0 0 6px ${targetNode.color}`,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--color-bone-white)', fontWeight: 500, fontFamily: 'var(--font-title)' }}>
                      {targetNode.name}
                    </span>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      ({targetNode.type})
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-tarnished-gold)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {edge.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-obsidian)',
        }}
      >
        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px 16px',
            borderRadius: '4px',
            border: '1px solid var(--color-tarnished-gold)',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--color-bone-white)',
            fontFamily: 'var(--font-title)',
            fontSize: '11.5px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'border-color 0.2s, color 0.2s, box-shadow 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-tarnished-gold-bright)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
            e.currentTarget.style.boxShadow = 'var(--glow-gold)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-tarnished-gold)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.color = 'var(--color-bone-white)';
          }}
        >
          Read Full Article on UESP Wiki
        </a>
      </div>
    </aside>
  );
};
