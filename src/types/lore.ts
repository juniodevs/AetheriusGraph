export type EntityType = 
  | 'deity' 
  | 'daedra' 
  | 'hero' 
  | 'dragon' 
  | 'character' 
  | 'faction' 
  | 'location' 
  | 'artifact';

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  deity: '#facc15',
  daedra: '#c084fc',
  dragon: '#f97316',
  artifact: '#f43f5e',
  hero: '#38bdf8',
  character: '#34d399',
  faction: '#818cf8',
  location: '#2dd4bf',
};

export interface LoreNode {
  id: string;
  name: string;
  title: string;
  type: EntityType;
  realm: string;
  realm_name: string;
  color: string;
  position: [number, number, number];
  summary: string;
  image: string;
  importance: number;
}

export interface LoreEdge {
  source: string;
  target: string;
  relation: string;
  label: string;
  is_cross_realm?: boolean;
}

export interface RealmDetail {
  name: string;
  color: string;
  center: [number, number, number];
  heading?: string;
}

export interface TESUniverseData {
  metadata: {
    title: string;
    version: string;
    source: string;
    language: string;
    realms: Record<string, RealmDetail>;
    total_nodes: number;
    total_edges: number;
  };
  nodes: LoreNode[];
  edges: LoreEdge[];
}

export type LoreGraphData = TESUniverseData;

