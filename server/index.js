import express from 'express';
import cors from 'cors';
import graphStore from './services/graph-store.js';
import { seedData } from './data/seed-data.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── Seed data on startup ───
seedData();

// ─── Auto-save every 30 seconds ───
setInterval(() => { graphStore.save(); }, 30000);

// ═══ NODE ROUTES ═══
app.get('/api/nodes', (req, res) => {
  const { type, search, severity, status, category } = req.query;
  if (type) {
    res.json(graphStore.getNodesByType(type, { search, severity, status, category }));
  } else {
    const types = req.query.types ? req.query.types.split(',') : null;
    res.json(graphStore.getAllNodes({ types, search }));
  }
});

app.get('/api/nodes/:id', (req, res) => {
  const node = graphStore.getNode(req.params.id);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  const edges = graphStore.getEdgesForNode(node.id);
  const relationships = edges.map(e => {
    const otherId = e.source === node.id ? e.target : e.source;
    const otherNode = graphStore.getNode(otherId);
    return { edge: e, node: otherNode, direction: e.source === node.id ? 'out' : 'in' };
  });
  res.json({ ...node, relationships });
});

app.post('/api/nodes', (req, res) => {
  const { type, ...properties } = req.body;
  if (!type) return res.status(400).json({ error: 'Type is required' });
  const node = graphStore.createNode(type, properties);
  graphStore.save();
  res.status(201).json(node);
});

app.put('/api/nodes/:id', (req, res) => {
  const node = graphStore.updateNode(req.params.id, req.body);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  graphStore.save();
  res.json(node);
});

app.delete('/api/nodes/:id', (req, res) => {
  const ok = graphStore.deleteNode(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Node not found' });
  graphStore.save();
  res.json({ success: true });
});

// ═══ EDGE ROUTES ═══
app.get('/api/edges', (req, res) => {
  const { type } = req.query;
  if (type) {
    res.json(graphStore.getEdgesByType(type));
  } else {
    res.json(Array.from(graphStore.edges.values()));
  }
});

app.post('/api/edges', (req, res) => {
  const { type, source, target, ...properties } = req.body;
  if (!type || !source || !target) return res.status(400).json({ error: 'type, source, target required' });
  const edge = graphStore.createEdge(type, source, target, properties);
  if (!edge) return res.status(400).json({ error: 'Source or target node not found' });
  graphStore.save();
  res.status(201).json(edge);
});

app.delete('/api/edges/:id', (req, res) => {
  const ok = graphStore.deleteEdge(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Edge not found' });
  graphStore.save();
  res.json({ success: true });
});

// ═══ GRAPH ROUTES ═══
app.get('/api/graph', (req, res) => {
  const types = req.query.types ? req.query.types.split(',') : null;
  res.json(graphStore.getFullGraph(types));
});

app.get('/api/graph/neighbors/:id', (req, res) => {
  const depth = parseInt(req.query.depth) || 1;
  res.json(graphStore.getNeighbors(req.params.id, depth));
});

// ═══ SEARCH ROUTES ═══
app.get('/api/search', (req, res) => {
  const { q, types } = req.query;
  if (!q) return res.json([]);
  const typeArr = types ? types.split(',') : null;
  res.json(graphStore.search(q, typeArr));
});

// ═══ DASHBOARD / KPI ═══
app.get('/api/dashboard/kpis', (req, res) => {
  res.json(graphStore.getKPIs());
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json(graphStore.getStats());
});

app.listen(PORT, () => {
  console.log(`[DOT Server] Running on http://localhost:${PORT}`);
  console.log(`[DOT Server] Graph: ${graphStore.nodes.size} nodes, ${graphStore.edges.size} edges`);
});
