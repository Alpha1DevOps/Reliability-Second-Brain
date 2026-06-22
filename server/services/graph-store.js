import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

export class GraphStore {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacency = new Map();
    this.typeIndex = new Map();
    this.edgeTypeIndex = new Map();
    this._ensureDataDir();
    this.load();
  }

  _ensureDataDir() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  }

  createNode(type, properties = {}) {
    const id = properties.id || uuidv4();
    const node = { id, type, properties: { ...properties }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    delete node.properties.id;
    this.nodes.set(id, node);
    this.adjacency.set(id, new Set());
    if (!this.typeIndex.has(type)) this.typeIndex.set(type, new Set());
    this.typeIndex.get(type).add(id);
    return node;
  }

  getNode(id) { return this.nodes.get(id) || null; }

  getNodesByType(type, filters = {}) {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];
    let results = Array.from(ids).map(id => this.nodes.get(id)).filter(Boolean);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(n => {
        const t = (n.properties.title || n.properties.name || '').toLowerCase();
        const d = (n.properties.description || '').toLowerCase();
        return t.includes(q) || d.includes(q);
      });
    }
    if (filters.severity) results = results.filter(n => n.properties.severity === filters.severity);
    if (filters.status) results = results.filter(n => n.properties.status === filters.status);
    if (filters.category) results = results.filter(n => n.properties.category === filters.category);
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results;
  }

  getAllNodes(filters = {}) {
    let results = Array.from(this.nodes.values());
    if (filters.types && filters.types.length > 0) results = results.filter(n => filters.types.includes(n.type));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(n => {
        const t = (n.properties.title || n.properties.name || '').toLowerCase();
        const d = (n.properties.description || '').toLowerCase();
        return t.includes(q) || d.includes(q);
      });
    }
    return results;
  }

  updateNode(id, properties) {
    const node = this.nodes.get(id);
    if (!node) return null;
    node.properties = { ...node.properties, ...properties };
    node.updatedAt = new Date().toISOString();
    return node;
  }

  deleteNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;
    const edgeIds = this.adjacency.get(id);
    if (edgeIds) { for (const eid of edgeIds) this._removeEdgeInternal(eid); }
    const typeSet = this.typeIndex.get(node.type);
    if (typeSet) typeSet.delete(id);
    this.adjacency.delete(id);
    this.nodes.delete(id);
    return true;
  }

  createEdge(type, sourceId, targetId, properties = {}) {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;
    const id = properties.id || uuidv4();
    const edge = { id, type, source: sourceId, target: targetId, properties: { ...properties }, createdAt: new Date().toISOString() };
    delete edge.properties.id;
    this.edges.set(id, edge);
    if (!this.adjacency.has(sourceId)) this.adjacency.set(sourceId, new Set());
    if (!this.adjacency.has(targetId)) this.adjacency.set(targetId, new Set());
    this.adjacency.get(sourceId).add(id);
    this.adjacency.get(targetId).add(id);
    if (!this.edgeTypeIndex.has(type)) this.edgeTypeIndex.set(type, new Set());
    this.edgeTypeIndex.get(type).add(id);
    return edge;
  }

  getEdge(id) { return this.edges.get(id) || null; }

  getEdgesForNode(nodeId, direction = 'both') {
    const edgeIds = this.adjacency.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(eid => this.edges.get(eid)).filter(e => {
      if (!e) return false;
      if (direction === 'out') return e.source === nodeId;
      if (direction === 'in') return e.target === nodeId;
      return true;
    });
  }

  getEdgesByType(type) {
    const ids = this.edgeTypeIndex.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.edges.get(id)).filter(Boolean);
  }

  deleteEdge(id) { return this._removeEdgeInternal(id); }

  _removeEdgeInternal(id) {
    const edge = this.edges.get(id);
    if (!edge) return false;
    const srcAdj = this.adjacency.get(edge.source);
    if (srcAdj) srcAdj.delete(id);
    const tgtAdj = this.adjacency.get(edge.target);
    if (tgtAdj) tgtAdj.delete(id);
    const typeSet = this.edgeTypeIndex.get(edge.type);
    if (typeSet) typeSet.delete(id);
    this.edges.delete(id);
    return true;
  }

  getNeighbors(nodeId, depth = 1) {
    const visited = new Set();
    const nodeSet = new Set();
    const edgeSet = new Set();
    const queue = [{ id: nodeId, d: 0 }];
    visited.add(nodeId);
    nodeSet.add(nodeId);
    while (queue.length > 0) {
      const { id, d } = queue.shift();
      if (d >= depth) continue;
      const edgeIds = this.adjacency.get(id);
      if (!edgeIds) continue;
      for (const eid of edgeIds) {
        const edge = this.edges.get(eid);
        if (!edge) continue;
        edgeSet.add(eid);
        const neighbor = edge.source === id ? edge.target : edge.source;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          nodeSet.add(neighbor);
          queue.push({ id: neighbor, d: d + 1 });
        }
      }
    }
    return {
      nodes: Array.from(nodeSet).map(nid => this.nodes.get(nid)).filter(Boolean),
      edges: Array.from(edgeSet).map(eid => this.edges.get(eid)).filter(Boolean)
    };
  }

  getFullGraph(nodeTypes = null) {
    let nodes = Array.from(this.nodes.values());
    if (nodeTypes && nodeTypes.length > 0) nodes = nodes.filter(n => nodeTypes.includes(n.type));
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = Array.from(this.edges.values()).filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes, edges };
  }

  search(query, types = null) {
    const q = query.toLowerCase();
    let results = Array.from(this.nodes.values());
    if (types && types.length > 0) results = results.filter(n => types.includes(n.type));
    return results.map(node => {
      const title = (node.properties.title || node.properties.name || '').toLowerCase();
      const desc = (node.properties.description || '').toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 10;
      if (desc.includes(q)) score += 3;
      return { node, score };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).map(r => r.node);
  }

  getKPIs() {
    const incidents = this.getNodesByType('incident');
    const lessons = this.getNodesByType('lesson');
    const opls = this.getNodesByType('opl');
    const equipment = this.getNodesByType('equipment');
    const persons = this.getNodesByType('person');

    const incWithLesson = incidents.filter(inc => this.getEdgesForNode(inc.id, 'out').some(e => e.type === 'results_in'));
    const lessonWithOPL = lessons.filter(les => {
      const edges = this.getEdgesForNode(les.id);
      return edges.some(e => { const oid = e.source === les.id ? e.target : e.source; const on = this.nodes.get(oid); return on && on.type === 'opl'; });
    });
    const oplPreventFM = opls.filter(opl => this.getEdgesForNode(opl.id, 'out').some(e => e.type === 'prevents'));

    const topNodes = Array.from(this.nodes.values()).map(n => ({
      id: n.id, type: n.type, name: n.properties.title || n.properties.name || n.id,
      connections: (this.adjacency.get(n.id) || new Set()).size
    })).sort((a, b) => b.connections - a.connections).slice(0, 10);

    return {
      incidentCount: incidents.length, lessonCount: lessons.length, oplCount: opls.length,
      equipmentCount: equipment.length, personCount: persons.length, skillCount: this.getNodesByType('skill').length,
      incidentWithLesson: { count: incWithLesson.length, total: incidents.length, pct: incidents.length > 0 ? Math.round(incWithLesson.length / incidents.length * 100) : 0 },
      lessonWithOPL: { count: lessonWithOPL.length, total: lessons.length, pct: lessons.length > 0 ? Math.round(lessonWithOPL.length / lessons.length * 100) : 0 },
      oplPreventingFM: { count: oplPreventFM.length, total: opls.length, pct: opls.length > 0 ? Math.round(oplPreventFM.length / opls.length * 100) : 0 },
      topNodes, linkDensity: this.nodes.size > 0 ? (this.edges.size * 2 / this.nodes.size).toFixed(2) : 0
    };
  }

  save() {
    const nodesData = Array.from(this.nodes.values());
    const edgesData = Array.from(this.edges.values());
    writeFileSync(join(DATA_DIR, 'nodes.json'), JSON.stringify(nodesData, null, 2));
    writeFileSync(join(DATA_DIR, 'edges.json'), JSON.stringify(edgesData, null, 2));
    return { nodes: nodesData.length, edges: edgesData.length };
  }

  load() {
    try {
      const nodesPath = join(DATA_DIR, 'nodes.json');
      const edgesPath = join(DATA_DIR, 'edges.json');
      if (existsSync(nodesPath)) {
        const nodesData = JSON.parse(readFileSync(nodesPath, 'utf-8'));
        for (const node of nodesData) {
          this.nodes.set(node.id, node);
          this.adjacency.set(node.id, new Set());
          if (!this.typeIndex.has(node.type)) this.typeIndex.set(node.type, new Set());
          this.typeIndex.get(node.type).add(node.id);
        }
      }
      if (existsSync(edgesPath)) {
        const edgesData = JSON.parse(readFileSync(edgesPath, 'utf-8'));
        for (const edge of edgesData) {
          this.edges.set(edge.id, edge);
          if (this.adjacency.has(edge.source)) this.adjacency.get(edge.source).add(edge.id);
          if (this.adjacency.has(edge.target)) this.adjacency.get(edge.target).add(edge.id);
          if (!this.edgeTypeIndex.has(edge.type)) this.edgeTypeIndex.set(edge.type, new Set());
          this.edgeTypeIndex.get(edge.type).add(edge.id);
        }
      }
      console.log(`[GraphStore] Loaded ${this.nodes.size} nodes, ${this.edges.size} edges`);
    } catch (err) {
      console.log('[GraphStore] No existing data, starting fresh');
    }
  }
}

export default new GraphStore();
