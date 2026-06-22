import { state } from '../state.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { NODE_TYPES } from '../utils/constants.js';
import { icons, icon } from '../utils/icons.js';

let searchTimeout = null;
let searchResults = [];

export function renderHeader() {
  const el = document.getElementById('header');
  const routeLabels = {
    dashboard: 'Dashboard', graph: 'Knowledge Graph', incidents: 'Incidents',
    lessons: 'Lessons Learned', edl: 'Engineering Documents', opl: 'OPL',
    equipment: 'Equipment', skills: 'Skills & Learning', 'node-detail': 'Node Detail',
    'data-sync': 'Data Management', 'ai-extractor': 'AI Knowledge Extractor'
  };

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex:1;">
      <h2 style="font-size: 15px; font-weight: 600; white-space: nowrap; color: var(--text-primary);">${routeLabels[state.currentRoute] || 'DOT'}</h2>
      <div class="search-box" id="global-search-box">
        ${icons.search}
        <input class="input" type="text" placeholder="Search nodes… (⌘K)" id="global-search" autocomplete="off" value="${state.searchQuery}"/>
        <div class="search-results" id="search-results" style="display:none;"></div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:12px;color:var(--text-muted);font-weight:500;">${state.currentRole}</span>
      <div style="width:30px;height:30px;border-radius:50%;background:var(--bg-subtle);display:flex;align-items:center;justify-content:center;color:var(--text-muted);">${icon('user', 16)}</div>
    </div>
  `;

  const searchInput = el.querySelector('#global-search');
  const resultsDiv = el.querySelector('#search-results');

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    state.searchQuery = q;
    clearTimeout(searchTimeout);
    if (q.length < 2) { resultsDiv.style.display = 'none'; return; }
    searchTimeout = setTimeout(async () => {
      try { searchResults = await api.search(q); renderSearchResults(resultsDiv, searchResults); }
      catch (err) { console.error(err); }
    }, 300);
  });

  searchInput.addEventListener('focus', () => { if (searchResults.length > 0) resultsDiv.style.display = 'block'; });
  document.addEventListener('click', (e) => { if (!el.querySelector('#global-search-box').contains(e.target)) resultsDiv.style.display = 'none'; });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); } });
}

function renderSearchResults(container, results) {
  if (results.length === 0) {
    container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">No results found</div>';
  } else {
    container.innerHTML = results.slice(0, 10).map(node => {
      const t = NODE_TYPES[node.type] || { icon: icons.info, label: node.type };
      const name = node.properties.title || node.properties.name || node.id;
      return `<div class="search-result-item" data-id="${node.id}">
        <span style="color:var(--text-muted);display:flex;">${t.icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;color:var(--text-primary);" class="truncate">${name}</div>
          <div style="font-size:11px;color:var(--text-muted);">${t.label}</div>
        </div>
      </div>`;
    }).join('');
  }
  container.style.display = 'block';
  container.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => { navigate('graph', { id: item.dataset.id }); container.style.display = 'none'; });
  });
}
