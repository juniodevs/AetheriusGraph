import { useState, useMemo, useCallback } from 'react';
import loreDataRaw from './data/tes_lore_graph.json';
import type { TESUniverseData, LoreNode } from './types/lore';
import { ConstellationCanvas } from './components/canvas/ConstellationCanvas';
import { Header } from './components/ui/Header';
import { Sidebar } from './components/ui/Sidebar';
import { FilterBar } from './components/ui/FilterBar';

const loreData = loreDataRaw as unknown as TESUniverseData;

export function App() {
  const [selectedNode, setSelectedNode] = useState<LoreNode | null>(null);
  const [activeRealm, setActiveRealm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const nodesMap = useMemo(() => {
    const map = new Map<string, LoreNode>();
    loreData.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, []);

  const handleSelectRealm = useCallback((realmKey: string | null) => {
    setActiveRealm(realmKey);
    setSelectedNode(null);
  }, []);

  const handleSelectNode = useCallback((node: LoreNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleResetCamera = useCallback(() => {
    setSelectedNode(null);
    setActiveRealm(null);
    setFilterType(null);
    setSearchQuery('');
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-cosmos)',
      }}
    >
      <Header
        nodes={loreData.nodes}
        realms={loreData.metadata.realms}
        activeRealm={activeRealm}
        onSelectRealm={handleSelectRealm}
        onSelectNode={handleSelectNode}
        onResetCamera={handleResetCamera}
      />

      <ConstellationCanvas
        data={loreData}
        selectedNode={selectedNode}
        onSelectNode={handleSelectNode}
        activeRealm={activeRealm}
        filterType={filterType}
        searchQuery={searchQuery}
      />

      <Sidebar
        node={selectedNode}
        edges={loreData.edges}
        nodesMap={nodesMap}
        onClose={() => setSelectedNode(null)}
        onSelectNode={handleSelectNode}
      />

      <FilterBar
        selectedType={filterType}
        onSelectType={setFilterType}
        totalNodes={loreData.nodes.length}
        totalEdges={loreData.edges.length}
      />
    </div>
  );
}

export default App;
