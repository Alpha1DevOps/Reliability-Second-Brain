import { icon } from '../utils/icons.js';

let toastId = 0;

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-root');
  const id = ++toastId;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.id = `toast-${id}`;
  const ico = type === 'success' ? icon('check', 14) : type === 'error' ? icon('close', 14) : icon('info', 14);
  toast.innerHTML = `<span style="display:flex;color:${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'};">${ico}</span><span style="flex:1;font-size:13px;">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all 300ms'; setTimeout(() => toast.remove(), 300); }, duration);
}

export function showModal(title, contentHtml, actions = []) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" data-action="close">${icon('close', 16)}</button>
        </div>
        <div class="modal-body">${contentHtml}</div>
        ${actions.length > 0 ? `<div class="modal-actions">${actions.map(a => `<button class="btn ${a.class || 'btn-secondary'}" data-action="${a.action}">${a.label}</button>`).join('')}</div>` : ''}
      </div>`;
    const close = (result) => { 
      resolve(result); 
      // Remove overlay on next tick so callers can read form data
      setTimeout(() => overlay.remove(), 0); 
    };
    overlay.querySelector('.modal-close').addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    overlay.querySelectorAll('[data-action]').forEach(btn => { if (btn.dataset.action !== 'close') btn.addEventListener('click', () => close(btn.dataset.action)); });
    root.appendChild(overlay);
  });
}
