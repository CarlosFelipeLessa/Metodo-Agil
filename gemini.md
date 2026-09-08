# AgilFlow — Project Constitution (gemini.md)

## 1. Identidade do Sistema & Missão
O **AgilFlow** é uma aplicação web client-side determinística para gerenciamento ágil de projetos aplicando os métodos Scrum e Kanban. O objetivo é fornecer uma ferramenta ágil visual, rápida e de alta fidelidade técnica, ideal para portfólio de engenharia de software.

## 2. Padrões Arquiteturais e Regras Inegociáveis
- **Client-First & Offline-Ready**: Persistência via `localStorage` com tratamento de falhas e fallback automático.
- **Design Moderno & Responsivo**: Tema dark mode com paleta HSL/Hex refinada, suporte pleno para desktop, tablets e celulares (breakpoints 900px e 600px).
- **Semântica e Acessibilidade**: Elementos HTML5 semânticos, rótulos acessíveis com `aria-label` e contraste visual WCAG AA.
- **Conventional Commits**: Todos os commits no repositório devem seguir o padrão: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
