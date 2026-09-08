# AgilFlow — Findings & Technical Constraints

## Descobertas Técnicas
1. **Layout Desktop Atual**: O layout desktop atual em `index.html` utiliza `height: 100vh` com `overflow: hidden`, o que bloqueia a rolagem natural e esconde conteúdos em telas verticais estreitas ou no mobile.
2. **Quadro Kanban & Drag-and-Drop**: O Kanban utiliza a API nativa HTML5 Drag and Drop (`dragstart`, `drop`, etc.), que não dispara eventos de touch em dispositivos móveis. É necessário garantir que as tarefas possam ser movidas via menu contextual ou controles visuais diretos no card além do drag.
3. **Persistência**: O estado reside na chave `agilflow_v3` no `localStorage`. Não há dependências externas de pacotes nem bundlers, o que permite execução direta via GitHub Pages sem necessidade de etapa de compilação.
