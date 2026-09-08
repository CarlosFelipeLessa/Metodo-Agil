# AgilFlow — Task Plan

## Visão Geral
Execução das fases de refatoração e polimento do AgilFlow para atender a padrões sênior de portfólio.

---

## Fase 1: Deal-Breakers (Concluída ✅)
- [x] **1.1 README.md Profissional**
  - [x] Badges, contextualização, regras Scrum, arquitetura, setup local e deploy.
- [x] **1.2 Responsividade Total (Mobile & Tablet)**
  - [x] Breakpoints em `@media (max-width: 992px)` e `@media (max-width: 680px)`.
  - [x] Sidebar móvel / navegação adaptada horizontal e sticky.
  - [x] Reorganização do Kanban (stacking vertical no mobile) e Backlog (card format adaptável).
  - [x] Ajustes na Topbar e nos modais.
- [x] **1.3 Instruções de Deploy (GitHub Pages)**
  - [x] Documentação de ativação passo a passo no README.
- [x] **1.4 Git Hygiene & Commit Semântico**
  - [x] Commit estruturado no padrão Conventional Commits.

---

## Fase 2: Quick Wins (Concluída ✅)
- [x] Acessibilidade (a11y: aria-labels e for/id associados em todos os inputs e labels).
- [x] Substituição de confirm() nativo por modal estilizado com suporte a ações destrutivas customizadas.
- [x] Otimização de Google Fonts (font-display: swap e preconnect crossorigin).
- [x] Tratamento de estouro de texto (word-break / overflow-wrap) e maxlength em todos os inputs.

---

## Fase 3: Arquitetura & Clean Code (Concluída ✅)
- [x] Desacoplamento de arquivos em `css/` (`variables.css`, `layout.css`, `components.css`).
- [x] Desacoplamento de arquivos em `js/` (`state.js`, `ui.js`, `events.js`, `app.js`).
- [x] Migração de variáveis globais e `var` para ES Modules (`const`/`let`).
- [x] Eliminação completa de scripts inline e atributos de evento no HTML.

---

## Fase 4: UI/UX & Interatividade (Concluída ✅)
- [x] Ações de movimentação rápida para mobile/touch sem depender exclusivamente de drag & drop nativo.
- [x] Sistema completo de backup (Exportação/Importação de JSON e restauração de dados demo).
- [x] Sistema de busca em tempo real e filtros combinados (texto, prioridade e responsável).
- [x] Indicador dinâmico de contagem de tarefas filtradas.
- [x] Alternador de perfil ágil (Profile Switcher na Topbar) e filtro rápido "🎯 Minhas Tarefas".

---

## Fase 5: Portfólio & Demonstração
- [ ] Pitch e materiais de apresentação.
