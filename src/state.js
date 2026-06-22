// Reactive state store using Proxy
const listeners = new Set();

const handler = {
  set(target, property, value) {
    target[property] = value;
    listeners.forEach(fn => fn(property, value));
    return true;
  }
};

export const state = new Proxy({
  currentRoute: 'dashboard',
  currentRole: 'Engineer',
  selectedNodeId: null,
  searchQuery: '',
  sidebarCollapsed: false,
  graphFilters: {
    nodeTypes: ['incident', 'lesson', 'edl', 'opl', 'equipment', 'system', 'failure_mode', 'person', 'skill', 'training'],
    search: '',
    clusterFocus: ''
  }
}, handler);

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
