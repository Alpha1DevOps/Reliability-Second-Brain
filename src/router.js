// Client-side hash router
const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path, params = {}) {
  window.location.hash = `#/${path}${params.id ? '/' + params.id : ''}`;
}

export function getCurrentRoute() {
  const hash = window.location.hash.slice(2) || 'dashboard';
  const parts = hash.split('/');
  return { path: parts[0], params: { id: parts[1] || null } };
}

export function initRouter() {
  const handleRoute = () => {
    const { path, params } = getCurrentRoute();
    if (currentCleanup) { currentCleanup(); currentCleanup = null; }
    const handler = routes[path] || routes['dashboard'];
    if (handler) {
      const cleanup = handler(params);
      if (typeof cleanup === 'function') currentCleanup = cleanup;
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
