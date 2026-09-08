/**
 * AgilFlow — State Management & Persistence Module
 */

const STORAGE_KEY = 'agilflow_v3';

export const state = {
  projectName: 'Meu Projeto Ágil',
  sprintDuration: 14,
  sprint: null,
  nextSprintName: 'Sprint 1 — MVP',
  tasks: [],
  backlog: [],
  team: [],
  archived: []
};

/**
 * Gera um ID pseudo-único determinístico para entidades
 */
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Salva o estado atual no localStorage do navegador
 */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

/**
 * Carrega o estado persistido do localStorage
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
    }
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
  }
}

/**
 * Retorna apenas as tarefas ativas no sprint atual
 */
export function sprintTasks() {
  return state.tasks.filter(t => !t.archived);
}

/**
 * Busca um membro do time pelo nome
 */
export function getMember(name) {
  return state.team.find(m => m.name === name);
}

/**
 * Inicializa dados de demonstração caso a base esteja vazia
 */
export function seedData() {
  if (state.team.length === 0) {
    state.team = [
      { id: uid(), name: 'Ana Lima', role: 'PO', color: 'cyan' },
      { id: uid(), name: 'Bruno Silva', role: 'Dev', color: 'purple' },
      { id: uid(), name: 'Carla Nunes', role: 'Dev', color: 'green' },
      { id: uid(), name: 'Diego Mota', role: 'QA', color: 'amber' },
      { id: uid(), name: 'Elisa Cruz', role: 'Scrum Master', color: 'rose' }
    ];
  }

  if (state.tasks.length === 0 && state.backlog.length === 0) {
    const ms = state.team.map(m => m.name);

    state.tasks = [
      { id: uid(), title: 'Configurar pipeline de CI/CD', desc: 'Implementar GitHub Actions para testes automatizados e deploy contínuo.', points: 5, priority: 'alta', assignee: ms[1], column: 'todo', sprintId: null, archived: false },
      { id: uid(), title: 'Sistema de autenticação JWT', desc: 'Fluxo de login, cadastro e recuperação de senha com JWT e refresh tokens.', points: 8, priority: 'alta', assignee: ms[2], column: 'progress', sprintId: null, archived: false },
      { id: uid(), title: 'API de usuários — CRUD completo', desc: 'Endpoints REST para criar, listar, atualizar e deletar usuários com validações.', points: 5, priority: 'media', assignee: ms[1], column: 'progress', sprintId: null, archived: false },
      { id: uid(), title: 'Tela de dashboard principal', desc: 'Componente com gráficos de overview e métricas do projeto em tempo real.', points: 3, priority: 'media', assignee: ms[2], column: 'done', sprintId: null, archived: false },
      { id: uid(), title: 'Testes E2E com Playwright', desc: 'Cobertura dos fluxos críticos de negócio com testes end-to-end automatizados.', points: 8, priority: 'media', assignee: ms[3], column: 'todo', sprintId: null, archived: false },
      { id: uid(), title: 'Documentação da API Swagger', desc: 'Gerar documentação OpenAPI para todos os endpoints públicos.', points: 3, priority: 'baixa', assignee: ms[1], column: 'todo', sprintId: null, archived: false },
      { id: uid(), title: 'Otimização de performance do banco', desc: 'Analisar queries lentas e adicionar índices e cache onde necessário.', points: 5, priority: 'media', assignee: ms[2], column: 'done', sprintId: null, archived: false }
    ];

    state.backlog = [
      { id: uid(), title: 'Integração com Stripe', desc: 'Implementar pagamentos recorrentes e assinaturas via Stripe.', points: 13, priority: 'alta', assignee: ms[1], column: 'backlog', sprintId: null, archived: false },
      { id: uid(), title: 'Modo offline Service Worker', desc: 'PWA com cache estratégico para uso offline completo.', points: 8, priority: 'media', assignee: ms[2], column: 'backlog', sprintId: null, archived: false },
      { id: uid(), title: 'Multi-idioma i18n', desc: 'Suporte a PT-BR, EN e ES com detecção automática.', points: 5, priority: 'baixa', assignee: ms[4], column: 'backlog', sprintId: null, archived: false },
      { id: uid(), title: 'Analytics avançado', desc: 'Gráficos de retenção, funil de conversão e análise de coorte.', points: 13, priority: 'media', assignee: ms[0], column: 'backlog', sprintId: null, archived: false }
    ];

    state.sprint = {
      id: uid(),
      name: 'Sprint 1 — MVP',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      active: true
    };
    state.nextSprintName = 'Sprint 2 — Polimento';
    state.tasks.forEach(t => {
      if (state.sprint) t.sprintId = state.sprint.id;
    });
  }
}

/**
 * Exporta o estado completo em formato JSON para download
 */
export function exportBackupJSON() {
  const backup = {
    appName: 'AgilFlow',
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: state
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Importa e valida um backup JSON, restaurando o estado
 */
export function importBackupJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    const data = parsed.data || parsed;

    if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.team)) {
      throw new Error('Arquivo de backup inválido ou incompatível.');
    }

    state.projectName = data.projectName || 'Meu Projeto Ágil';
    state.sprintDuration = Number(data.sprintDuration) || 14;
    state.sprint = data.sprint || null;
    state.nextSprintName = data.nextSprintName || 'Sprint';
    state.tasks = data.tasks || [];
    state.backlog = data.backlog || [];
    state.team = data.team || [];
    state.archived = data.archived || [];

    saveState();
    return true;
  } catch (error) {
    console.error('Falha ao importar backup:', error);
    throw error;
  }
}

/**
 * Reseta o estado para os dados de demonstração iniciais
 */
export function resetToSeedData() {
  state.team = [];
  state.tasks = [];
  state.backlog = [];
  state.archived = [];
  state.sprint = null;
  state.projectName = 'Meu Projeto Ágil';
  state.sprintDuration = 14;
  state.nextSprintName = 'Sprint 1 — MVP';
  seedData();
  saveState();
}

