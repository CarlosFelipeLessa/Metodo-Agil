# ⚡ AgilFlow — Gestão Ágil de Projetos (Scrum & Kanban)

<div align="center">

![GitHub language count](https://img.shields.io/github/languages/count/CarlosFelipeLessa/Metodo-Agil?style=for-the-badge&color=00d4e8)
![GitHub repo size](https://img.shields.io/github/repo-size/CarlosFelipeLessa/Metodo-Agil?style=for-the-badge&color=9d6fff)
![GitHub license](https://img.shields.io/github/license/CarlosFelipeLessa/Metodo-Agil?style=for-the-badge&color=34d399)
![Status](https://img.shields.io/badge/Status-Em%20Produ%C3%A7%C3%A3o-success?style=for-the-badge&color=00d4e8)

<p align="center">
  <strong>Plataforma client-side determinística para gestão ágil de produtos e equipes com Scrum e Kanban.</strong><br>
  Cálculo dinâmico de Story Points, ciclo de vida de Sprints, burndown em tempo real e governança de backlog.
</p>

[🌐 Acessar Demonstração ao Vivo](#-deploy--acesso-ao-vivo) · [✨ Funcionalidades](#-funcionalidades-chave) · [📐 Regras de Negócio](#-regras-de-negócio-ágeis) · [🚀 Instalação](#-instalação-e-execução-local)

</div>

---

## 📌 Visão Geral

O **AgilFlow** foi projetado para solucionar a sobrecarga e burocracia de softwares legados de gestão de projetos (como Jira e Trello) para pequenos times e desenvolvedores individuais.

Diferente de simples listas de afazeres (*To-Do Lists*), o sistema aplica a disciplina do framework **Scrum**:
- Gestão de capacidade e esforço com a **Sequência de Fibonacci** (Story Points).
- Ciclo de vida estrito de **Sprints** (planejamento, execução e encerramento automatizado).
- Visão visual de fluxo contínuo via **Quadro Kanban** interativo.
- Governança de **Product Backlog** com priorização e transição assistida.

---

## ✨ Funcionalidades Chave

- 🚀 **Ciclo de Vida de Sprints**: Início e encerramento automatizado de iterações. Ao encerrar um sprint, tarefas concluídas são arquivadas para histórico e tarefas inacabadas retornam automaticamente ao Product Backlog.
- 📊 **Métricas e Burndown em Tempo Real**: Total de Story Points do sprint, pontos concluídos, em andamento e taxa de conclusão percentual com barra dinâmica.
- 📋 **Quadro Kanban Interativo**:
  - 3 colunas canônicas (*A Fazer*, *Em Progresso*, *Concluído*).
  - Drag & Drop com feedback visual de área ativa (*drop-zone*).
  - Menu contextual para edição rápida, priorização, exclusão e transição entre colunas.
- 🎯 **Estimativa por Story Points (Fibonacci)**: Dimensionamento padronizado de esforço (1, 2, 3, 5, 8, 13 pts).
- 🏷️ **Priorização Visual e Níveis de Criticidade**: Indicadores de prioridade Alta, Média e Baixa com badges coloridos e barras laterais no card.
- 👥 **Alocação de Time & Membros**: Cadastro de equipe com cargos (Dev, PO, Scrum Master, QA, Designer) e avatares visuais gerados automaticamente por iniciais.
- 💾 **Persistência Local (Offline-Ready)**: Armazenamento instantâneo via `localStorage` com recuperação e carga de dados de exemplo (*mock seed*) na primeira utilização.
- 📱 **Interface 100% Responsiva**: Experiência fluida tanto em monitores de alta resolução quanto em tablets e smartphones.

---

## 📐 Regras de Negócio Ágeis

| Mecanismo | Implementação no AgilFlow |
|---|---|
| **Estimativa de Esforço** | Sequência de Fibonacci estrita ($1, 2, 3, 5, 8, 13$), incentivando times a dividirem histórias muito grandes (> 13 pts). |
| **Grooming do Backlog** | O Backlog centraliza histórias e demandas não planejadas. Usuários podem promover itens do Backlog para o Sprint ativo com 1 clique. |
| **Encerramento de Sprint** | Não permite "esconder dívidas técnicas": tarefas inacabadas deixam de pontuar no sprint e retornam ao Backlog para reavaliação no próximo ciclo. |
| **Velocidade do Time** | Cálculo contínuo dos Story Points entregues versus planejados, fornecendo feedback instantâneo de capacidade. |

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estruturação acessível com uso de tags semânticas (`<main>`, `<aside>`, `<header>`, `<section>`).
- **CSS3 Moderno**:
  - Variáveis CSS (Design Tokens de cores, espaçamentos, tipografia e raios).
  - Flexbox e CSS Grid para layouts altamente responsivos e adaptáveis.
  - Efeitos visuais modernos: Glassmorphism, gradientes HSL e microinterações táteis.
- **JavaScript (ES6+)**:
  - Manipulação determinística de DOM.
  - HTML5 Drag and Drop API integrada com suporte alternativo para menu de ações em touch.
  - Persistência desacoplada em `localStorage`.
- **Google Fonts**: Tipografia *Inter* com `display=swap` para excelente legibilidade e carregamento rápido.

---

## 🌐 Deploy & Acesso ao Vivo

A aplicação foi desenvolvida no padrão *Zero-Build / Zero-Config*, permitindo hospedagem imediata em qualquer servidor estático ou plataforma de deploy contínuo:

### Habilitar no GitHub Pages
1. Acesse o repositório no GitHub.
2. Navegue até **Settings** > **Pages** (no menu lateral esquerdo).
3. Em **Build and deployment** > **Source**, selecione **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save**. O link de acesso ficará disponível em poucos instantes no topo da página.

---

## 🚀 Instalação e Execução Local

Como a aplicação não depende de empacotadores ou etapas de compilação pesadas, você pode executá-la instantaneamente em qualquer máquina:

### 1. Clonar o repositório
```bash
git clone https://github.com/CarlosFelipeLessa/Metodo-Agil.git
cd Metodo-Agil
```

### 2. Executar no navegador

**Opção A (Direta):**
Dê dois cliques no arquivo `index.html` ou abra-o diretamente no seu navegador de preferência.

**Opção B (Via Live Server ou servidor local HTTP):**
```bash
# Com Python 3
python -m http.server 3000

# Com Node.js / npx
npx serve .
```
Acesse `http://localhost:3000` no seu navegador.

---

## 📁 Estrutura de Arquivos

```text
├── .gitattributes      # Configurações de atributos do Git
├── .gitignore          # Arquivos de sistema, logs e dependências ignorados
├── index.html          # Aplicação completa (Marcação, Estilos e Lógica)
├── README.md           # Documentação técnica e guia do projeto
└── task_plan.md        # Planejamento das fases de evolução contínua
```

---

## 🗺️ Roadmap de Evolução

- [x] Criação da interface com suporte a Sprints e Kanban.
- [x] Persistência em `localStorage` e dados de exemplo.
- [x] Documentação técnica completa e guia de governança.
- [x] Layout responsivo para smartphones e tablets.
- [ ] Modularização de código em arquivos independentes (`css/` e `js/`).
- [ ] Exportação e importação de backups em formato JSON.
- [ ] Filtros em tempo real por responsável, tag e prioridade.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo de licença para mais detalhes.

---

<div align="center">
  Desenvolvido por <strong>Carlos Felipe Lessa</strong> para demonstração de boas práticas em engenharia de software e metodologias ágeis.
</div>
