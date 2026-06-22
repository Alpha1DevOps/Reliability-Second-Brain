// DOT - In-Browser Graph Store (no backend needed)
// Full graph database running in the browser with localStorage persistence

import { v4 } from './uuid-mini.js';

class GraphStore {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacency = new Map();
    this.typeIndex = new Map();
    this.edgeTypeIndex = new Map();
    this.load();
  }

  createNode(type, properties = {}) {
    const id = properties.id || v4();
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
    this.save();
    return node;
  }

  deleteNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;
    const edgeIds = this.adjacency.get(id);
    if (edgeIds) { for (const eid of edgeIds) this._removeEdge(eid); }
    const typeSet = this.typeIndex.get(node.type);
    if (typeSet) typeSet.delete(id);
    this.adjacency.delete(id);
    this.nodes.delete(id);
    this.save();
    return true;
  }

  createEdge(type, sourceId, targetId, properties = {}) {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;
    const id = properties.id || v4();
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

  deleteEdge(id) { this._removeEdge(id); this.save(); }

  _removeEdge(id) {
    const edge = this.edges.get(id);
    if (!edge) return;
    const s = this.adjacency.get(edge.source); if (s) s.delete(id);
    const t = this.adjacency.get(edge.target); if (t) t.delete(id);
    const ts = this.edgeTypeIndex.get(edge.type); if (ts) ts.delete(id);
    this.edges.delete(id);
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

  search(query) {
    const q = query.toLowerCase();
    return Array.from(this.nodes.values()).map(node => {
      const title = (node.properties.title || node.properties.name || '').toLowerCase();
      const desc = (node.properties.description || '').toLowerCase();
      const tag = (node.properties.tag_number || '').toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 10;
      if (tag.includes(q)) score += 8;
      if (desc.includes(q)) score += 3;
      return { node, score };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).map(r => r.node);
  }

  getKPIs() {
    const incidents = this.getNodesByType('incident');
    const lessons = this.getNodesByType('lesson');
    const opls = this.getNodesByType('opl');
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
    const nodesByType = {};
    for (const [type, ids] of this.typeIndex) nodesByType[type] = ids.size;
    return {
      incidentCount: incidents.length, lessonCount: lessons.length, oplCount: opls.length,
      equipmentCount: this.getNodesByType('equipment').length, personCount: this.getNodesByType('person').length,
      skillCount: this.getNodesByType('skill').length,
      totalEdges: this.edges.size, nodesByType,
      incidentWithLesson: { count: incWithLesson.length, total: incidents.length, pct: incidents.length > 0 ? Math.round(incWithLesson.length / incidents.length * 100) : 0 },
      lessonWithOPL: { count: lessonWithOPL.length, total: lessons.length, pct: lessons.length > 0 ? Math.round(lessonWithOPL.length / lessons.length * 100) : 0 },
      oplPreventingFM: { count: oplPreventFM.length, total: opls.length, pct: opls.length > 0 ? Math.round(oplPreventFM.length / opls.length * 100) : 0 },
      topNodes, linkDensity: this.nodes.size > 0 ? (this.edges.size * 2 / this.nodes.size).toFixed(2) : 0
    };
  }

  save() {
    try {
      localStorage.setItem('ecbp_nodes', JSON.stringify(Array.from(this.nodes.values())));
      localStorage.setItem('ecbp_edges', JSON.stringify(Array.from(this.edges.values())));
    } catch (e) { console.warn('Save failed:', e); }
  }

  load() {
    try {
      const nodesJson = localStorage.getItem('ecbp_nodes');
      const edgesJson = localStorage.getItem('ecbp_edges');
      if (nodesJson) {
        for (const node of JSON.parse(nodesJson)) {
          this.nodes.set(node.id, node);
          this.adjacency.set(node.id, new Set());
          if (!this.typeIndex.has(node.type)) this.typeIndex.set(node.type, new Set());
          this.typeIndex.get(node.type).add(node.id);
        }
      }
      if (edgesJson) {
        for (const edge of JSON.parse(edgesJson)) {
          this.edges.set(edge.id, edge);
          if (this.adjacency.has(edge.source)) this.adjacency.get(edge.source).add(edge.id);
          if (this.adjacency.has(edge.target)) this.adjacency.get(edge.target).add(edge.id);
          if (!this.edgeTypeIndex.has(edge.type)) this.edgeTypeIndex.set(edge.type, new Set());
          this.edgeTypeIndex.get(edge.type).add(edge.id);
        }
      }
    } catch (e) { console.warn('Load failed:', e); }
  }

  reset() {
    this.nodes.clear(); this.edges.clear(); this.adjacency.clear();
    this.typeIndex.clear(); this.edgeTypeIndex.clear();
    localStorage.removeItem('ecbp_nodes'); localStorage.removeItem('ecbp_edges');
  }
}

export const graphStore = new GraphStore();
