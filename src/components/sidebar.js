import { state } from '../state.js';
import { navigate } from '../router.js';
import { ROLES } from '../utils/constants.js';
import { icons, icon } from '../utils/icons.js';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
  { id: 'graph', label: 'Knowledge Graph', icon: icons.graph },
  { type: 'divider' },
  { id: 'incidents', label: 'Incidents', icon: icons.incident },
  { id: 'lessons', label: 'Lessons Learned', icon: icons.lesson },
  { id: 'edl', label: 'Eng. Documents', icon: icons.edl },
  { id: 'opl', label: 'OPL', icon: icons.opl },
  { type: 'divider' },
  { id: 'equipment', label: 'Equipment', icon: icons.equipment },
  { id: 'skills', label: 'Skills & Learning', icon: icons.skills },
];

export function renderSidebar() {
  const el = document.getElementById('sidebar');

  el.innerHTML = `
    <div style="padding: 16px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-light);">
      <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--brand-600); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">${icon('brain', 18)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em;">DOT</div>
        <div style="font-size: 10px; color: var(--text-muted); font-weight: 400;">Digital Organizational Topology</div>
      </div>
    </div>

    <nav style="flex: 1; padding: 8px; overflow-y: auto;">
      ${menuItems.map(item => {
        if (item.type === 'divider') return '<div style="height: 1px; background: var(--border-light); margin: 6px 12px;"></div>';
        const active = state.currentRoute === item.id;
        return `
          <button class="sidebar-item ${active ? 'active' : ''}" data-route="${item.id}"
            style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: none; border-radius: 6px; background: ${active ? 'var(--bg-active)' : 'transparent'}; color: ${active ? 'var(--brand-600)' : 'var(--text-secondary)'}; cursor: pointer; font-family: var(--font-sans); font-size: 13px; font-weight: ${active ? '600' : '450'}; transition: all 120ms; text-align: left;"
            onmouseover="if(!this.classList.contains('active'))this.style.background='var(--bg-hover)'"
            onmouseout="if(!this.classList.contains('active'))this.style.background='transparent'">
            <span style="flex-shrink: 0; display: flex; opacity: ${active ? '1' : '0.7'};">${item.icon}</span>
            <span class="truncate">${item.label}</span>
          </button>`;
      }).join('')}
    </nav>

    <div style="padding: 12px; border-top: 1px solid var(--border-light);">
      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label" style="font-size: 10px;">Active Role</label>
        <select class="select" id="role-select" style="font-size: 12px; padding: 5px 8px;">
          ${ROLES.map(r => `<option value="${r}" ${state.currentRole === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
    </div>
  `;

  el.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentRoute = btn.dataset.route;
      navigate(btn.dataset.route);
      renderSidebar();
    });
  });

  const roleSelect = el.querySelector('#role-select');
  if (roleSelect) roleSelect.addEventListener('change', (e) => { state.currentRole = e.target.value; });
}
