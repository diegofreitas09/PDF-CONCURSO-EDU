# PDF CONCURSO EDU

Plataforma web de preparação para concursos, com banco de questões, trilhas de estudo, desempenho, cronograma, biblioteca, flashcards, mapas mentais, autenticação e publicação automática no GitHub Pages.

## Acesso público

https://diegofreitas09.github.io/PDF-CONCURSO-EDU/

## Tecnologias

- React 19
- Vite 6
- React Router
- Firebase Authentication
- Lucide React
- GitHub Actions
- GitHub Pages

## Estrutura do projeto

```text
PDF-CONCURSO-EDU/
├── .github/workflows/        # Deploy automático no GitHub Pages
├── public/                   # Imagens e arquivos públicos
├── src/
│   ├── components/           # Cabeçalho, menu e componentes globais
│   ├── context/              # Contexto de autenticação
│   ├── data/                 # Banco de questões e materiais
│   ├── lib/                  # Configurações externas
│   ├── pages/                # Páginas da plataforma
│   ├── routes/               # Rotas
│   ├── services/             # Serviços da aplicação
│   └── styles/               # Estilos globais e funcionais
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Funcionalidades atuais

- Dashboard de estudos
- Banco de questões com filtros por disciplina e tópico
- Correção de alternativas e histórico local de respostas
- Indicadores de desempenho
- Trilha de estudos por conteúdo
- Cronograma de tarefas
- Biblioteca de materiais
- Flashcards
- Mapas mentais
- Configurações do usuário
- Autenticação com Firebase
- Notificações e busca no cabeçalho
- Deploy automático no GitHub Pages

## Executar localmente

Pré-requisitos: Node.js 22 ou superior e npm.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

## Publicação

Todo push na branch `main` dispara o workflow `.github/workflows/deploy-pages.yml`. O projeto é compilado com Vite e publicado automaticamente no GitHub Pages.

A configuração `base: "/PDF-CONCURSO-EDU/"` em `vite.config.js` garante que os arquivos estáticos funcionem corretamente dentro do endereço do projeto no GitHub Pages.

## Banco de questões

O banco principal está em:

```text
src/data/questionBank.js
```

Cada questão pode conter os campos:

```js
{
  id,
  source,
  sourceQuestion,
  discipline,
  topic,
  statement,
  options,
  answer,
  explanation
}
```

## Próximas etapas

- Auditoria e limpeza completa do banco de questões
- Padronização de disciplinas e assuntos
- Comentários detalhados das respostas
- Questões favoritas, puladas e revisões
- Simulados personalizados
- Filtros por banca, concurso, ano e dificuldade
- Estatísticas mais detalhadas por conteúdo
- Persistência dos dados do usuário em nuvem

## Projeto

**PDF CONCURSO EDU**

Plataforma em desenvolvimento contínuo para organização de estudos e preparação para concursos.
