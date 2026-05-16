# Task Manager Corporativo — Wesley

Acesse: (https://wesley-c-f-lourenco.github.io/task-manage/dashboard)

## Descrição
Sistema de gerenciamento de tarefas corporativo desenvolvido em Angular 21.
Permite criar, visualizar, editar e excluir tarefas com controle de status,
categorias, filtros, exportação de dados e calendário integrado.

## Tecnologias Utilizadas
- Angular 21 (Standalone Components, Signals, Lazy Loading)
- TypeScript
- ReactiveFormsModule
- HttpClient + json-server (mock)
- SheetJS (xlsx) — exportação Excel
- jsPDF + jspdf-autotable — exportação PDF

## Pré-requisitos
- Node.js >= 20.x
- npm >= 10.x
- Angular CLI: `npm install -g @angular/cli`
- json-server: `npm install -g json-server`

## Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar o mock (json-server) — terminal 1
```bash
npm run db
```

### 3. Rodar o frontend — terminal 2
```bash
ng serve
```


## Funcionalidades
- [x] Cadastro de perfil com persistência em localStorage
- [x] Guard de rota: redireciona para /perfil se não houver cadastro
- [x] Alternância Meu Perfil / Equipe
- [x] Lista de tarefas em cards horizontais com scroll
- [x] Formulário reativo com validação
- [x] CRUD completo com confirmação de exclusão
- [x] Filtros por status, categoria e busca textual
- [x] Calendário com visualização e edição de tarefas por dia
- [x] Lista vertical em tabela
- [x] Exportação CSV, Excel e PDF
- [x] Feedback visual: toast de sucesso/erro
- [x] Dark/Light mode
- [x] Responsivo
- [x] Signals + computed() + effect()
- [x] Lazy Loading de rotas
- [x] Serviços com responsabilidade única (SRP)

## Estrutura do Projeto
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── models/
├── pages/
│   ├── perfil/
│   └── dashboard/
└── db/
└── db.json
