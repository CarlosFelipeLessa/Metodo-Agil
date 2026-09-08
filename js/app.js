/**
 * AgilFlow — Main Application Entrypoint
 */

import { state, loadState, seedData, saveState } from './state.js';
import { renderDashboard } from './ui.js';
import { setupEventListeners } from './events.js';

/**
 * Inicialização do ciclo de vida da aplicação
 */
export function init() {
  loadState();
  seedData();
  saveState();

  const btnStart = document.getElementById('btnStartSprint');
  const btnEnd = document.getElementById('btnEndSprint');

  if (btnStart) {
    btnStart.style.display = (!state.sprint || !state.sprint.active) ? '' : 'none';
  }
  if (btnEnd) {
    btnEnd.style.display = (state.sprint && state.sprint.active) ? '' : 'none';
  }

  setupEventListeners();
  renderDashboard();
}

// Inicializa a aplicação assim que o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
