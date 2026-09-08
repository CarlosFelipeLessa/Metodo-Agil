/**
 * AgilFlow — UI Rendering & Component Helpers Module
 */

import { state, sprintTasks, getMember, getActiveMember, setActiveMember } from './state.js';

export let currentPage = 'dashboard';
export let editingTaskId = null;
export let editingSource = 'tasks';
export let selectedPoints = null;
export let selectedPrio = 'media';
export let defaultColumn = 'todo';

export let filterQuery = '';
export let filterPriority = 'all';
export let filterAssignee = 'all';

export function setFilterQuery(q) { filterQuery = q; }
export function setFilterPriority(p) { filterPriority = p; }
export function setFilterAssignee(a) { filterAssignee = a; }
export function resetFilters() {
  filterQuery = '';
  filterPriority = 'all';
  filterAssignee = 'all';
  const qEl = document.getElementById('filterQuery');
  const pEl = document.getElementById('filterPriority');
  const aEl = document.getElementById('filterAssignee');
  const btnMyTasks = document.getElementById('btnMyTasks');
  if (qEl) qEl.value = '';
  if (pEl) pEl.value = 'all';
  if (aEl) aEl.value = 'all';
  if (btnMyTasks) {
    btnMyTasks.classList.remove('active');
    btnMyTasks.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Escapa strings para evitar injeção XSS
 */
export function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Formata data ISO para padrão brasileiro abreviado
 */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/**
 * Calcula dias restantes até a data final do sprint
 */
export function daysLeft(iso) {
  if (!iso) return 0;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

/**
 * Retorna o rótulo formatado da prioridade
 */
export function priorityLabel(p) {
  const map = { alta: '🔴 Alta', media: '🟡 Média', baixa: '🟢 Baixa' };
  return map[p] || p;
}

/**
 * Gera o avatar estilizado de um membro
 */
export function avatarHtml(name) {
  const m = getMember(name);
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const cls = m ? m.color : 'cyan';
  return `<div class="avatar ${cls}" title="${escHtml(name || 'Sem responsável')}">${initials}</div>`;
}

/**
 * Dispara uma notificação toast temporária
 */
export function toast(msg, type = 'info', dur = 3000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${escHtml(msg)}</span>`;
  
  const container = document.getElementById('toastContainer');
  if (container) container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, dur);
}

/**
 * Abre um modal por ID
 */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

/**
 * Fecha um modal por ID
 */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

/**
 * Diálogo de confirmação customizado
 */
export function showConfirmDialog(title, icon, message, confirmText, confirmClass, onConfirm) {
  const modalTitle = document.getElementById('sprintModalTitle');
  const modalIcon = document.getElementById('sprintModalIcon');
  const modalText = document.getElementById('sprintModalText');
  const btn = document.getElementById('sprintModalConfirm');

  if (modalTitle) modalTitle.textContent = title;
  if (modalIcon) modalIcon.textContent = icon;
  if (modalText) modalText.innerHTML = message;
  
  if (btn) {
    btn.textContent = confirmText;
    btn.className = `btn ${confirmClass || 'btn-primary'}`;
    btn.onclick = () => {
      closeModal('sprintModal');
      if (typeof onConfirm === 'function') onConfirm();
    };
  }
  openModal('sprintModal');
}

/**
 * Navegação centralizada entre as abas da aplicação
 */
export function navigate(page) {
  currentPage = page;

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const navEl = document.getElementById(`nav-${page}`);
  const pageEl = document.getElementById(`page-${page}`);
  if (navEl) navEl.classList.add('active');
  if (pageEl) pageEl.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Visão geral do seu projeto ágil'],
    backlog: ['Product Backlog', 'Tarefas aguardando priorização'],
    settings: ['Configurações', 'Personalize seu fluxo de trabalho']
  };

  const topTitle = document.getElementById('topbarTitle');
  const topSub = document.getElementById('topbarSub');
  if (topTitle && titles[page]) topTitle.textContent = titles[page][0];
  if (topSub && titles[page]) topSub.textContent = titles[page][1];

  const btnStart = document.getElementById('btnStartSprint');
  const btnEnd = document.getElementById('btnEndSprint');
  const btnNew = document.getElementById('btnNewTask');

  if (btnStart) btnStart.style.display = (page === 'dashboard' && (!state.sprint || !state.sprint.active)) ? '' : 'none';
  if (btnEnd) btnEnd.style.display = (page === 'dashboard' && state.sprint && state.sprint.active) ? '' : 'none';
  if (btnNew) btnNew.style.display = (page !== 'settings') ? '' : 'none';

  renderProfileSwitcher();

  if (page === 'dashboard') renderDashboard();
  if (page === 'backlog') renderBacklog();
  if (page === 'settings') renderSettings();
}

/**
 * Renderiza o Dashboard e todas as suas seções
 */
export function renderDashboard() {
  renderProfileSwitcher();
  renderSprintBanner();
  renderStats();
  populateAssigneeFilter();
  renderKanban();
  renderSidebar();
}

/**
 * Renderiza o banner superior com status do sprint ativo
 */
export function renderSprintBanner() {
  const c = document.getElementById('sprintBannerContainer');
  if (!c) return;

  if (state.sprint && state.sprint.active) {
    const dl = daysLeft(state.sprint.endDate);
    c.innerHTML = `
      <div class="sprint-banner">
        <div class="sprint-banner-dot"></div>
        <div class="sprint-banner-info">
          <div class="sprint-banner-name">🚀 ${escHtml(state.sprint.name)}</div>
          <div class="sprint-banner-dates">
            ${formatDate(state.sprint.startDate)} → ${formatDate(state.sprint.endDate)}&nbsp;·&nbsp;
            <span style="color: ${dl < 3 ? 'var(--rose)' : 'var(--text-secondary)'};">
              ${dl > 0 ? `${dl} dia(s) restante(s)` : 'Encerrado hoje!'}
            </span>
          </div>
        </div>
        <span class="archived-badge">🟢 ATIVO</span>
      </div>`;
  } else {
    c.innerHTML = '<div class="no-sprint-banner">💤 &nbsp; Nenhum sprint ativo. Inicie um sprint para começar a trabalhar!</div>';
  }
}

/**
 * Calcula e renderiza os cards de Story Points e a barra de Burndown
 */
export function renderStats() {
  const tasks = sprintTasks();
  const total = tasks.reduce((s, t) => s + (t.points || 0), 0);
  const donePts = tasks.filter(t => t.column === 'done').reduce((s, t) => s + (t.points || 0), 0);
  const progPts = tasks.filter(t => t.column === 'progress').reduce((s, t) => s + (t.points || 0), 0);
  const todoPts = tasks.filter(t => t.column === 'todo').reduce((s, t) => s + (t.points || 0), 0);
  const pct = total > 0 ? Math.round((donePts / total) * 100) : 0;

  const statTot = document.getElementById('statTotal');
  const statDon = document.getElementById('statDone');
  const statPrg = document.getElementById('statProgress');
  const statTod = document.getElementById('statTodo');
  const bPercent = document.getElementById('burndownPercent');
  const bBar = document.getElementById('burndownBar');
  const bDays = document.getElementById('burndownDaysLeft');

  if (statTot) statTot.textContent = total;
  if (statDon) statDon.textContent = donePts;
  if (statPrg) statPrg.textContent = progPts;
  if (statTod) statTod.textContent = todoPts;
  if (bPercent) bPercent.textContent = `${pct}%`;
  if (bBar) bBar.style.width = `${pct}%`;

  const dl = state.sprint ? daysLeft(state.sprint.endDate) : 0;
  if (bDays) bDays.textContent = (state.sprint && state.sprint.active) ? `${dl} dias restantes` : '';

  renderSidebar();
}

/**
 * Renderiza os indicadores na barra lateral
 */
export function renderSidebar() {
  const tasks = sprintTasks();
  const total = tasks.reduce((s, t) => s + (t.points || 0), 0);
  const done = tasks.filter(t => t.column === 'done').reduce((s, t) => s + (t.points || 0), 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const sName = document.getElementById('sidebarSprintName');
  const sBar = document.getElementById('sidebarProgressBar');
  const sLabel = document.getElementById('sidebarProgressLabel');
  const bBadge = document.getElementById('backlogBadge');

  if (sName) sName.textContent = (state.sprint && state.sprint.active) ? state.sprint.name : 'Nenhum sprint ativo';
  if (sBar) sBar.style.width = `${pct}%`;
  if (sLabel) sLabel.textContent = `${pct}% concluído`;
  if (bBadge) bBadge.textContent = state.backlog.length;
}

/**
 * Renderiza o componente de troca de perfil na barra superior
 */
export function renderProfileSwitcher() {
  const sel = document.getElementById('selectActiveMember');
  const avatar = document.getElementById('topbarUserAvatar');
  if (!sel) return;

  const active = getActiveMember();
  sel.innerHTML = '';

  state.team.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.name} (${m.role})`;
    if (active && m.id === active.id) opt.selected = true;
    sel.appendChild(opt);
  });

  if (avatar && active) {
    const initials = active.name
      ? active.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '??';
    avatar.textContent = initials;
    avatar.className = `avatar ${active.color || 'cyan'}`;
    avatar.title = `Perfil Ativo: ${active.name} (${active.role})`;
  }
}

/**
 * Constrói o HTML individual de um cartão de tarefa
 */
export function taskCardHtml(task) {
  let quickNavHtml = '';
  if (task.column === 'todo') {
    quickNavHtml = `<button class="quick-nav-btn next" data-action="quick-move" data-id="${task.id}" data-dir="1" title="Avançar para Em Progresso">Avançar ➡️</button>`;
  } else if (task.column === 'progress') {
    quickNavHtml = `
      <button class="quick-nav-btn prev" data-action="quick-move" data-id="${task.id}" data-dir="-1" title="Voltar para A Fazer">⬅️</button>
      <button class="quick-nav-btn next success" data-action="quick-move" data-id="${task.id}" data-dir="1" title="Concluir tarefa">Concluir ✅</button>
    `;
  } else if (task.column === 'done') {
    quickNavHtml = `<button class="quick-nav-btn prev" data-action="quick-move" data-id="${task.id}" data-dir="-1" title="Reabrir para Em Progresso">⬅️ Reabrir</button>`;
  }

  return `
    <div class="task-card priority-${task.priority}" draggable="true" data-id="${task.id}" id="card-${task.id}">
      <div class="task-top">
        <div class="task-title">${escHtml(task.title)}</div>
        <button class="task-menu-btn" data-action="context" data-id="${task.id}" title="Opções da tarefa" aria-label="Opções da tarefa">⋮</button>
      </div>
      ${task.desc ? `<div class="task-desc">${escHtml(task.desc)}</div>` : ''}
      <div class="task-meta">
        <span class="tag tag-priority-${task.priority}">${priorityLabel(task.priority)}</span>
        <span class="tag tag-points">⚡ ${task.points || '?'} pts</span>
        <div class="task-assignee">${avatarHtml(task.assignee)}</div>
      </div>
      <div class="task-card-footer">
        <div class="task-quick-nav">${quickNavHtml}</div>
      </div>
    </div>`;
}

/**
 * Preenche o seletor de responsáveis na barra de filtros
 */
export function populateAssigneeFilter() {
  const sel = document.getElementById('filterAssignee');
  if (!sel) return;
  const curr = sel.value || 'all';
  sel.innerHTML = '<option value="all">Todos os responsáveis</option>';
  state.team.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = m.name;
    if (m.name === curr) opt.selected = true;
    sel.appendChild(opt);
  });
}

/**
 * Renderiza as colunas do quadro Kanban com suporte a filtros dinâmicos
 */
export function renderKanban() {
  const isFiltering = filterQuery.trim() !== '' || filterPriority !== 'all' || filterAssignee !== 'all';
  const filterBadge = document.getElementById('filterCountBadge');
  const allTasks = sprintTasks();
  let totalVisible = 0;

  ['todo', 'progress', 'done'].forEach(col => {
    let tasks = allTasks.filter(t => t.column === col);

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.desc && t.desc.toLowerCase().includes(q))
      );
    }
    if (filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }
    if (filterAssignee !== 'all') {
      tasks = tasks.filter(t => t.assignee === filterAssignee);
    }

    totalVisible += tasks.length;

    const countEl = document.getElementById(`count-${col}`);
    const bodyEl = document.getElementById(`cards-${col}`);

    if (countEl) countEl.textContent = tasks.length;
    if (!bodyEl) return;

    if (tasks.length === 0) {
      if (isFiltering) {
        bodyEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-text">Nenhuma tarefa correspondente aos filtros</div>
          </div>`;
      } else {
        const icons = { todo: '📝', progress: '⚡', done: '🎉' };
        bodyEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">${icons[col]}</div>
            <div class="empty-text">Sem tarefas aqui</div>
          </div>`;
      }
    } else {
      bodyEl.innerHTML = tasks.map(t => taskCardHtml(t)).join('');
    }
  });

  if (filterBadge) {
    if (isFiltering) {
      filterBadge.style.display = 'inline-flex';
      filterBadge.textContent = `${totalVisible} de ${allTasks.length} tarefas`;
    } else {
      filterBadge.style.display = 'none';
    }
  }

  const btnMyTasks = document.getElementById('btnMyTasks');
  const active = getActiveMember();
  if (btnMyTasks) {
    const isFilteringMine = Boolean(active && filterAssignee === active.name);
    btnMyTasks.classList.toggle('active', isFilteringMine);
    btnMyTasks.setAttribute('aria-pressed', isFilteringMine ? 'true' : 'false');
  }
}

/**
 * Renderiza a lista de itens no Product Backlog
 */
export function renderBacklog() {
  const list = document.getElementById('backlogList');
  if (!list) return;

  if (state.backlog.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding: 60px 20px;">
        <div class="empty-icon">📭</div>
        <div class="empty-text">O backlog está vazio.<br>Adicione histórias e ideias para o próximo sprint!</div>
      </div>`;
    return;
  }

  list.innerHTML = state.backlog.map(task => `
    <div class="backlog-item">
      <div>
        <div class="backlog-item-title">${escHtml(task.title)}</div>
        ${task.desc ? `<div class="backlog-item-desc">${escHtml(task.desc)}</div>` : ''}
      </div>
      <span class="tag tag-priority-${task.priority}">${priorityLabel(task.priority)}</span>
      <span class="tag tag-points">⚡ ${task.points || '?'}</span>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${avatarHtml(task.assignee)}
        <span style="font-size: 12px; color: var(--text-secondary);">${escHtml(task.assignee || '—')}</span>
      </div>
      <button class="btn btn-secondary btn-sm" data-action="promote-sprint" data-id="${task.id}" title="Mover para o Sprint ativo" aria-label="Mover para o Sprint ativo">▶ Sprint</button>
      <button class="btn btn-danger btn-sm" data-action="delete-backlog" data-id="${task.id}" title="Excluir tarefa" aria-label="Excluir tarefa">🗑️</button>
    </div>
  `).join('');
}

/**
 * Renderiza os campos da página de Configurações
 */
export function renderSettings() {
  const cfgProj = document.getElementById('cfgProjectName');
  const cfgDur = document.getElementById('cfgSprintDuration');
  const cfgSprint = document.getElementById('cfgSprintName');

  if (cfgProj) cfgProj.value = state.projectName || '';
  if (cfgDur) cfgDur.value = state.sprintDuration || 14;
  if (cfgSprint) cfgSprint.value = state.nextSprintName || '';

  renderTeam();
}

/**
 * Renderiza a lista de membros do time
 */
export function renderTeam() {
  const list = document.getElementById('teamList');
  if (!list) return;

  if (state.team.length === 0) {
    list.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">Nenhum membro adicionado</div>';
    return;
  }

  const active = getActiveMember();

  list.innerHTML = state.team.map(m => `
    <div class="team-member">
      ${avatarHtml(m.name)}
      <div class="member-info">
        <div class="member-name">
          ${escHtml(m.name)}
          ${active && active.id === m.id ? '<span class="active-member-pill">Perfil Ativo</span>' : ''}
        </div>
        <div class="member-role">${escHtml(m.role)}</div>
      </div>
      <button class="remove-member-btn" data-action="remove-member" data-id="${m.id}" title="Remover" aria-label="Remover membro">✕</button>
    </div>
  `).join('');
}

/**
 * Preenche o dropdown de responsáveis no modal de tarefas
 */
export function populateAssignee(selected) {
  const sel = document.getElementById('taskAssignee');
  if (!sel) return;

  const active = getActiveMember();
  const defaultSelected = (selected === null && active) ? active.name : selected;

  sel.innerHTML = '<option value="">Sem responsável</option>';
  state.team.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = `${m.name} — ${m.role}`;
    if (m.name === defaultSelected) opt.selected = true;
    sel.appendChild(opt);
  });
}

/**
 * Atualiza os botões visuais de Story Points selecionados
 */
export function updatePointsUI() {
  document.querySelectorAll('.point-btn').forEach(b => {
    b.classList.toggle('selected', Number(b.dataset.val) === selectedPoints);
  });
}

/**
 * Atualiza os botões visuais de prioridade selecionados
 */
export function updatePrioUI() {
  document.querySelectorAll('.prio-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.val === selectedPrio);
  });
}

export function setSelectedPoints(val) {
  selectedPoints = val;
  updatePointsUI();
}

export function setSelectedPrio(val) {
  selectedPrio = val;
  updatePrioUI();
}

/**
 * Prepara e abre o modal para criação de nova tarefa
 */
export function openNewTask(col = 'todo') {
  editingTaskId = null;
  editingSource = (col === 'backlog') ? 'backlog' : 'tasks';
  defaultColumn = col;
  selectedPoints = null;
  selectedPrio = 'media';

  const modalTitle = document.getElementById('modalTitle');
  const taskTitle = document.getElementById('taskTitle');
  const taskDesc = document.getElementById('taskDesc');
  const taskCol = document.getElementById('taskColumn');
  const colGroup = document.getElementById('colSelectGroup');

  if (modalTitle) modalTitle.textContent = 'Nova Tarefa';
  if (taskTitle) taskTitle.value = '';
  if (taskDesc) taskDesc.value = '';
  if (taskCol) taskCol.value = (col === 'backlog') ? 'todo' : col;
  if (colGroup) colGroup.style.display = (col === 'backlog') ? 'none' : '';

  updatePointsUI();
  updatePrioUI();
  populateAssignee(null);
  openModal('taskModal');
}

/**
 * Prepara e abre o modal para edição de uma tarefa existente
 */
export function openEditTask(id) {
  const src1 = state.tasks.find(t => t.id === id);
  const src2 = state.backlog.find(t => t.id === id);
  if (!src1 && !src2) return;

  editingSource = src1 ? 'tasks' : 'backlog';
  editingTaskId = id;
  const task = src1 || src2;

  selectedPoints = task.points;
  selectedPrio = task.priority;

  const modalTitle = document.getElementById('modalTitle');
  const taskTitle = document.getElementById('taskTitle');
  const taskDesc = document.getElementById('taskDesc');
  const taskCol = document.getElementById('taskColumn');
  const colGroup = document.getElementById('colSelectGroup');

  if (modalTitle) modalTitle.textContent = 'Editar Tarefa';
  if (taskTitle) taskTitle.value = task.title;
  if (taskDesc) taskDesc.value = task.desc || '';
  if (taskCol) taskCol.value = (task.column !== 'backlog') ? task.column : 'todo';
  if (colGroup) colGroup.style.display = (editingSource === 'backlog') ? 'none' : '';

  updatePointsUI();
  updatePrioUI();
  populateAssignee(task.assignee);
  openModal('taskModal');
}
