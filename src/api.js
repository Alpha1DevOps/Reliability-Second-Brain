// API layer — uses in-browser graph store (no backend needed)
import { graphStore } from './store/graph-store.js';
import { seedData } from './store/seed-data.js';

// Initialize seed data
seedData();

export const api = {
  getNodes: (params = {}) => {
    return Promise.resolve(
      params.type
        ? graphStore.getNodesByType(params.type, params)
        : graphStore.getAllNodes(params)
    );
  },
  getNode: (id) => {
    const node = graphStore.getNode(id);
    if (!node) return Promise.reject(new Error('Node not found'));
    const edges = graphStore.getEdgesForNode(node.id);
    const relationships = edges.map(e => {
      const otherId = e.source === node.id ? e.target : e.source;
      const otherNode = graphStore.getNode(otherId);
      return { edge: e, node: otherNode, direction: e.source === node.id ? 'out' : 'in' };
    });
    return Promise.resolve({ ...node, relationships });
  },
  createNode: (data) => {
    const { type, ...props } = data;
    const node = graphStore.createNode(type, props);
    graphStore.save();
    return Promise.resolve(node);
  },
  updateNode: (id, data) => {
    const node = graphStore.updateNode(id, data);
    if (!node) return Promise.reject(new Error('Node not found'));
    return Promise.resolve(node);
  },
  deleteNode: (id) => {
    graphStore.deleteNode(id);
    return Promise.resolve({ success: true });
  },
  createEdge: (data) => {
    const { type, source, target, ...props } = data;
    const edge = graphStore.createEdge(type, source, target, props);
    if (!edge) return Promise.reject(new Error('Source or target not found'));
    graphStore.save();
    return Promise.resolve(edge);
  },
  deleteEdge: (id) => {
    graphStore.deleteEdge(id);
    return Promise.resolve({ success: true });
  },
  getGraph: (types = null) => {
    return Promise.resolve(graphStore.getFullGraph(types));
  },
  getNeighbors: (id, depth = 1) => {
    return Promise.resolve(graphStore.getNeighbors(id, depth));
  },
  search: (q) => {
    return Promise.resolve(graphStore.search(q));
  },
  getKPIs: () => {
    return Promise.resolve(graphStore.getKPIs());
  },
  getStats: () => {
    const kpis = graphStore.getKPIs();
    return Promise.resolve({
      totalNodes: graphStore.nodes.size,
      totalEdges: graphStore.edges.size,
      nodesByType: kpis.nodesByType
    });
  }
};
