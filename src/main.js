// DOT Main Entry — Digital Organizational Topology
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { registerRoute, initRouter, navigate } from './router.js';
import { state, subscribe } from './state.js';

// Module imports
import { renderDashboard } from './modules/dashboard/dashboard.js';
import { renderGraphExplorer } from './modules/graph-explorer/graph-explorer.js';
import { renderNodeDetail } from './modules/node-detail/node-detail.js';
import { renderIncidents } from './modules/incidents/incidents-list.js';
import { renderLessons } from './modules/lessons/lessons-list.js';
import { renderEDL } from './modules/edl/edl-list.js';
import { renderOPL } from './modules/opl/opl-list.js';
import { renderEquipment } from './modules/equipment/equipment-list.js';
import { renderSkills } from './modules/skills/skill-dashboard.js';

// Register routes
registerRoute('dashboard', () => { state.currentRoute = 'dashboard'; renderSidebar(); renderHeader(); renderDashboard(); });
registerRoute('graph', (params) => { state.currentRoute = 'graph'; renderSidebar(); renderHeader(); return renderGraphExplorer(params); });
registerRoute('node-detail', (params) => { state.currentRoute = 'node-detail'; renderSidebar(); renderHeader(); renderNodeDetail(params); });
registerRoute('incidents', () => { state.currentRoute = 'incidents'; renderSidebar(); renderHeader(); renderIncidents(); });
registerRoute('lessons', () => { state.currentRoute = 'lessons'; renderSidebar(); renderHeader(); renderLessons(); });
registerRoute('edl', () => { state.currentRoute = 'edl'; renderSidebar(); renderHeader(); renderEDL(); });
registerRoute('opl', () => { state.currentRoute = 'opl'; renderSidebar(); renderHeader(); renderOPL(); });
registerRoute('equipment', () => { state.currentRoute = 'equipment'; renderSidebar(); renderHeader(); renderEquipment(); });
registerRoute('skills', () => { state.currentRoute = 'skills'; renderSidebar(); renderHeader(); renderSkills(); });

// Initialize
initRouter();
