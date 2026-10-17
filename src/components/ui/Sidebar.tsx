import React, { useEffect } from 'react';
import type { LoreNode, LoreEdge } from '../../types/lore';

interface SidebarProps {
  node: LoreNode | null;
  edges: LoreEdge[];
  nodesMap: Map<string, LoreNode>;
  onClose: () => void;
  onSelectNode: (node: LoreNode) => void;
}

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

  return (
    <aside
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '390px',
        maxWidth: '90vw',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 36px rgba(0,0,0,0.7)',
        animation: 'slideIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '3px',
                backgroundColor: `${node.color}20`,
                border: `1px solid ${node.color}60`,
                fontSize: '10.5px',
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
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {node.realm_name}
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '20px',
              color: '#f8fafc',
              fontWeight: 600,
              letterSpacing: '0.04em',
              margin: 0,
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
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
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
          gap: '20px',
        }}
      >
        {node.image && (
          <div
            style={{
              width: '100%',
              maxHeight: '260px',
              minHeight: '140px',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#050811',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            <img
              src={node.image}
              alt={node.name}
              loading="lazy"
              style={{
                maxWidth: '100%',
                maxHeight: '250px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}

        <div>
          <h3
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              margin: 0,
            }}
          >
            Chronicler Lore Record
          </h3>
          <p
            style={{
              fontSize: '13.5px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginTop: '8px',
              marginBottom: 0,
            }}
          >
            {node.summary}
          </p>
        </div>

        <div>
          <h3
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
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
                    transition: 'border-color 0.2s, background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
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
                    <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>
                      {targetNode.name}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      ({targetNode.type})
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--accent-gold)',
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
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '10px 16px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
            e.currentTarget.style.color = 'var(--accent-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          Read Full Article on UESP Wiki
        </a>
      </div>
    </aside>
  );
};
