/**
 * AgilFlow — Events & Interactions Module
 */

import { state, saveState, uid, sprintTasks } from './state.js';
import {
  currentPage,
  navigate,
  toast,
  escHtml,
  openModal,
  closeModal,
  showConfirmDialog,
  openNewTask,
  openEditTask,
  renderDashboard,
  renderBacklog,
  renderSidebar,
  renderTeam,
  editingTaskId,
  editingSource,
  selectedPoints,
  selectedPrio,
  defaultColumn,
  setSelectedPoints,
  setSelectedPrio
} from './ui.js';

let dragId = null;
let contextTaskId = null;

/**
 * Registra todos os ouvintes de eventos da aplicação
 */
export function setupEventListeners() {
  setupNavigation();
  setupModalActions();
  setupSprintControls();
  setupSettingsControls();
  setupContextMenu();
  setupDragAndDrop();
  setupDelegatedClicks();
}

/**
 * Navegação entre abas
 */
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) navigate(page);
    });
  });
}

/**
 * Controles de Modais e Submissão de Tarefa
 */
function setupModalActions() {
  const btnNew = document.getElementById('btnNewTask');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      openNewTask(currentPage === 'backlog' ? 'backlog' : 'todo');
    });
  }

  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  if (modalClose) modalClose.addEventListener('click', () => closeModal('taskModal'));
  if (modalCancel) modalCancel.addEventListener('click', () => closeModal('taskModal'));

  const sprintClose = document.getElementById('sprintModalClose');
  const sprintCancel = document.getElementById('sprintModalCancel');
  if (sprintClose) sprintClose.addEventListener('click', () => closeModal('sprintModal'));
  if (sprintCancel) sprintCancel.addEventListener('click', () => closeModal('sprintModal'));

  // Fechar modal ao clicar fora
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Seleção de Story Points
  const pointsGrid = document.getElementById('pointsGrid');
  if (pointsGrid) {
    pointsGrid.querySelectorAll('.point-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setSelectedPoints(Number(btn.dataset.val));
      });
    });
  }

  // Seleção de Prioridade
  document.querySelectorAll('.prio-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setSelectedPrio(btn.dataset.val);
    });
  });

  // Salvar Tarefa
  const modalSave = document.getElementById('modalSave');
  if (modalSave) {
    modalSave.addEventListener('click', handleSaveTask);
  }
}

/**
 * Validação e salvamento de tarefas (criação e edição)
 */
function handleSaveTask() {
  const titleInput = document.getElementById('taskTitle');
  const descInput = document.getElementById('taskDesc');
  const colInput = document.getElementById('taskColumn');
  const assigneeInput = document.getElementById('taskAssignee');

  const title = titleInput ? titleInput.value.trim() : '';
  const desc = descInput ? descInput.value.trim() : '';
  const col = (colInput ? colInput.value : '') || defaultColumn;
  const assignee = assigneeInput ? assigneeInput.value : '';

  if (!title) {
    toast('O título é obrigatório!', 'error');
    return;
  }
  if (!selectedPoints) {
    toast('Selecione os Story Points!', 'error');
    return;
  }
  if (!selectedPrio) {
    toast('Selecione a prioridade!', 'error');
    return;
  }

  if (editingTaskId) {
    const list = (editingSource === 'tasks') ? state.tasks : state.backlog;
    const task = list.find(t => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.desc = desc;
      task.points = selectedPoints;
      task.priority = selectedPrio;
      task.assignee = assignee;
      if (editingSource === 'tasks') task.column = col;
    }
    toast('Tarefa atualizada!', 'success');
  } else {
    const newTask = {
      id: uid(),
      title,
      desc,
      points: selectedPoints,
      priority: selectedPrio,
      assignee,
      archived: false,
      column: (editingSource === 'backlog') ? 'backlog' : col,
      sprintId: (state.sprint && state.sprint.active) ? state.sprint.id : null
    };

    if (editingSource === 'backlog') {
      state.backlog.push(newTask);
    } else {
      state.tasks.push(newTask);
    }
    toast('Tarefa criada!', 'success');
  }

  saveState();
  closeModal('taskModal');

  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'backlog') renderBacklog();
  renderSidebar();
}

/**
 * Ciclo de vida do Sprint (Iniciar e Encerrar)
 */
function setupSprintControls() {
  const btnStart = document.getElementById('btnStartSprint');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (state.sprint && state.sprint.active) {
        toast('Já existe um sprint ativo!', 'warning');
        return;
      }
      const name = state.nextSprintName || 'Sprint';
      const dur = state.sprintDuration || 14;
      showConfirmDialog(
        'Iniciar Sprint',
        '🚀',
        `Deseja iniciar o <strong>${escHtml(name)}</strong>?<br>Duração: <strong>${dur} dias</strong>.`,
        '▶ Iniciar Sprint',
        'btn-primary',
        confirmStartSprint
      );
    });
  }

  const btnEnd = document.getElementById('btnEndSprint');
  if (btnEnd) {
    btnEnd.addEventListener('click', () => {
      if (!state.sprint || !state.sprint.active) {
        toast('Nenhum sprint ativo!', 'warning');
        return;
      }
      const tasks = sprintTasks();
      const done = tasks.filter(t => t.column === 'done');
      const pending = tasks.filter(t => t.column !== 'done');
      showConfirmDialog(
        'Encerrar Sprint',
        '🏁',
        `Encerrar o sprint <strong>${escHtml(state.sprint.name)}</strong>?<br><br>
         ✅ <strong>${done.length}</strong> tarefa(s) concluída(s) serão arquivadas<br>
         🔄 <strong>${pending.length}</strong> tarefa(s) pendente(s) voltam ao Backlog`,
        '🏁 Encerrar Sprint',
        'btn-danger',
        confirmEndSprint
      );
    });
  }
}

function confirmStartSprint() {
  const name = state.nextSprintName || 'Sprint';
  const dur = Number(state.sprintDuration) || 14;
  state.sprint = {
    id: uid(),
    name,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + dur * 86400000).toISOString(),
    active: true
  };
  saveState();
  navigate('dashboard');
  toast(`Sprint "${name}" iniciado!`, 'success');
}

function confirmEndSprint() {
  const tasks = sprintTasks();
  const done = tasks.filter(t => t.column === 'done');
  const pending = tasks.filter(t => t.column !== 'done');

  done.forEach(t => {
    t.archived = true;
    state.archived.push(t);
  });
  pending.forEach(t => {
    t.column = 'backlog';
    t.sprintId = null;
    state.backlog.push(t);
  });

  state.tasks = [];
  state.sprint = Object.assign({}, state.sprint, { active: false });

  const match = state.sprint.name.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]) + 1;
    state.nextSprintName = state.sprint.name.replace(/\d+/, num);
  }

  saveState();
  navigate('dashboard');
  toast(`Sprint encerrado! ${done.length} tarefa(s) arquivadas.`, 'success');
}

/**
 * Controles de Configurações e Gestão de Membros
 */
function setupSettingsControls() {
  const btnSave = document.getElementById('btnSaveSettings');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const cfgName = document.getElementById('cfgProjectName');
      const cfgDur = document.getElementById('cfgSprintDuration');
      const cfgSprint = document.getElementById('cfgSprintName');

      state.projectName = (cfgName && cfgName.value.trim()) || 'Meu Projeto Ágil';
      state.sprintDuration = (cfgDur && Number(cfgDur.value)) || 14;
      state.nextSprintName = (cfgSprint && cfgSprint.value.trim()) || 'Sprint';

      saveState();
      toast('Configurações salvas!', 'success');
    });
  }

  const btnAdd = document.getElementById('btnAddMember');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const nameInput = document.getElementById('newMemberName');
      const roleSelect = document.getElementById('newMemberRole');
      const colorSelect = document.getElementById('newMemberColor');

      const name = nameInput ? nameInput.value.trim() : '';
      const role = roleSelect ? roleSelect.value : 'Dev';
      const color = colorSelect ? colorSelect.value : 'cyan';

      if (!name) {
        toast('Digite o nome do membro!', 'error');
        return;
      }
      if (state.team.find(m => m.name.toLowerCase() === name.toLowerCase())) {
        toast('Membro já existe!', 'warning');
        return;
      }

      state.team.push({ id: uid(), name, role, color });
      if (nameInput) nameInput.value = '';

      saveState();
      renderTeam();
      toast(`${name} adicionado ao time!`, 'success');
    });
  }
}

/**
 * Menu Contextual das tarefas
 */
function setupContextMenu() {
  document.addEventListener('click', () => {
    const menu = document.getElementById('contextMenu');
    if (menu) menu.classList.remove('open');
    contextTaskId = null;
  });

  const ctxEdit = document.getElementById('ctxEdit');
  if (ctxEdit) {
    ctxEdit.addEventListener('click', e => {
      e.stopPropagation();
      if (contextTaskId) openEditTask(contextTaskId);
      const menu = document.getElementById('contextMenu');
      if (menu) menu.classList.remove('open');
    });
  }

  const ctxLeft = document.getElementById('ctxMoveLeft');
  if (ctxLeft) {
    ctxLeft.addEventListener('click', e => {
      e.stopPropagation();
      moveTask(contextTaskId, -1);
      const menu = document.getElementById('contextMenu');
      if (menu) menu.classList.remove('open');
    });
  }

  const ctxRight = document.getElementById('ctxMoveRight');
  if (ctxRight) {
    ctxRight.addEventListener('click', e => {
      e.stopPropagation();
      moveTask(contextTaskId, 1);
      const menu = document.getElementById('contextMenu');
      if (menu) menu.classList.remove('open');
    });
  }

  const ctxToBacklog = document.getElementById('ctxToBacklog');
  if (ctxToBacklog) {
    ctxToBacklog.addEventListener('click', e => {
      e.stopPropagation();
      const t = state.tasks.find(x => x.id === contextTaskId);
      if (t) {
        state.tasks = state.tasks.filter(x => x.id !== t.id);
        t.column = 'backlog';
        t.sprintId = null;
        state.backlog.push(t);
        saveState();
        renderDashboard();
        toast('Tarefa enviada ao Backlog', 'info');
      }
      const menu = document.getElementById('contextMenu');
      if (menu) menu.classList.remove('open');
    });
  }

  const ctxDelete = document.getElementById('ctxDelete');
  if (ctxDelete) {
    ctxDelete.addEventListener('click', e => {
      e.stopPropagation();
      const id = contextTaskId;
      const menu = document.getElementById('contextMenu');
      if (menu) menu.classList.remove('open');
      if (!id) return;

      const task = state.tasks.find(t => t.id === id);
      const title = task ? escHtml(task.title) : 'esta tarefa';

      showConfirmDialog(
        'Excluir Tarefa',
        '🗑️',
        `Deseja excluir permanentemente a tarefa <strong>${title}</strong>?<br>Esta ação não pode ser desfeita.`,
        '🗑️ Excluir',
        'btn-danger',
        () => {
          state.tasks = state.tasks.filter(t => t.id !== id);
          saveState();
          renderDashboard();
          toast('Tarefa excluída com sucesso!', 'error');
        }
      );
    });
  }
}

function openContextMenu(e, id) {
  e.stopPropagation();
  contextTaskId = id;
  const menu = document.getElementById('contextMenu');
  const task = state.tasks.find(t => t.id === id);
  if (!menu || !task) return;

  const cols = ['todo', 'progress', 'done'];
  const ci = cols.indexOf(task.column);

  const moveLeft = document.getElementById('ctxMoveLeft');
  const moveRight = document.getElementById('ctxMoveRight');
  if (moveLeft) moveLeft.style.display = ci > 0 ? '' : 'none';
  if (moveRight) moveRight.style.display = ci < 2 ? '' : 'none';

  menu.style.left = `${e.pageX}px`;
  menu.style.top = `${e.pageY}px`;
  menu.classList.add('open');
}

function moveTask(id, dir) {
  const cols = ['todo', 'progress', 'done'];
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const ci = cols.indexOf(task.column);
  const nc = cols[ci + dir];
  if (nc) {
    task.column = nc;
    saveState();
    renderDashboard();
    const colNames = { todo: 'A Fazer', progress: 'Em Progresso', done: 'Concluído' };
    toast(`Movido para "${colNames[nc]}"`, 'success');
  }
}

/**
 * Configuração de Drag and Drop nas colunas do Kanban
 */
function setupDragAndDrop() {
  ['todo', 'progress', 'done'].forEach(col => {
    const colEl = document.getElementById(`col-${col}`);
    if (!colEl) return;

    colEl.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
      colEl.classList.add('drag-over');
    });

    colEl.addEventListener('dragleave', e => {
      if (!colEl.contains(e.relatedTarget)) {
        colEl.classList.remove('drag-over');
      }
    });

    colEl.addEventListener('drop', e => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (!dragId) return;

      const task = state.tasks.find(t => t.id === dragId);
      if (task && task.column !== col) {
        task.column = col;
        saveState();
        renderDashboard();
        const colNames = { todo: 'A Fazer', progress: 'Em Progresso', done: 'Concluído' };
        toast(`Tarefa movida para "${colNames[col]}"`, 'success');
      }
      cleanupDrag();
    });
  });

  // Delegação de dragstart e dragend no container do quadro
  const board = document.getElementById('kanbanBoard');
  if (board) {
    board.addEventListener('dragstart', e => {
      const card = e.target.closest('.task-card');
      if (card) {
        dragId = card.dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => card.classList.add('dragging'), 0);
      }
    });

    board.addEventListener('dragend', () => cleanupDrag());
  }
}

function cleanupDrag() {
  document.querySelectorAll('.task-card').forEach(c => c.classList.remove('dragging'));
  document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
  dragId = null;
}

/**
 * Delegação de cliques para componentes dinamicamente renderizados
 */
function setupDelegatedClicks() {
  document.addEventListener('click', e => {
    // Menu contextual no card
    const menuBtn = e.target.closest('[data-action="context"]');
    if (menuBtn) {
      openContextMenu(e, menuBtn.dataset.id);
      return;
    }

    // Botão "+ Adicionar tarefa" nas colunas do Kanban
    const addColBtn = e.target.closest('[data-action="add-column-task"]');
    if (addColBtn) {
      openNewTask(addColBtn.dataset.col);
      return;
    }

    // Botão "+ Adicionar ao Backlog"
    const addBacklogBtn = e.target.closest('[data-action="add-backlog-task"]');
    if (addBacklogBtn) {
      openNewTask('backlog');
      return;
    }

    // Botão "▶ Sprint" no Backlog
    const promoteBtn = e.target.closest('[data-action="promote-sprint"]');
    if (promoteBtn) {
      backlogToSprint(promoteBtn.dataset.id);
      return;
    }

    // Botão "🗑️ Excluir" no Backlog
    const deleteBacklogBtn = e.target.closest('[data-action="delete-backlog"]');
    if (deleteBacklogBtn) {
      deleteBacklogItem(deleteBacklogBtn.dataset.id);
      return;
    }

    // Botão "✕ Remover" no Time
    const removeMemberBtn = e.target.closest('[data-action="remove-member"]');
    if (removeMemberBtn) {
      removeMember(removeMemberBtn.dataset.id);
      return;
    }
  });
}

function backlogToSprint(id) {
  if (!state.sprint || !state.sprint.active) {
    toast('Inicie um sprint primeiro!', 'warning');
    return;
  }
  const idx = state.backlog.findIndex(t => t.id === id);
  if (idx === -1) return;

  const task = state.backlog.splice(idx, 1)[0];
  task.column = 'todo';
  task.sprintId = state.sprint.id;
  state.tasks.push(task);

  saveState();
  renderBacklog();
  renderSidebar();
  toast('Tarefa movida para o Sprint!', 'success');
}

function deleteBacklogItem(id) {
  const task = state.backlog.find(t => t.id === id);
  const title = task ? escHtml(task.title) : 'esta tarefa';

  showConfirmDialog(
    'Excluir do Backlog',
    '🗑️',
    `Deseja remover <strong>${title}</strong> do Backlog?<br>Esta ação não pode ser desfeita.`,
    '🗑️ Remover',
    'btn-danger',
    () => {
      state.backlog = state.backlog.filter(t => t.id !== id);
      saveState();
      renderBacklog();
      renderSidebar();
      toast('Tarefa removida do backlog', 'error');
    }
  );
}

function removeMember(id) {
  const m = state.team.find(x => x.id === id);
  if (!m) return;

  showConfirmDialog(
    'Remover Membro',
    '👤',
    `Deseja remover <strong>${escHtml(m.name)}</strong> da equipe?<br>As tarefas associadas não serão apagadas.`,
    'Remover',
    'btn-danger',
    () => {
      state.team = state.team.filter(x => x.id !== id);
      saveState();
      renderTeam();
      toast(`${m.name} removido da equipe`, 'info');
    }
  );
}
