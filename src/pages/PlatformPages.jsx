import React from "react";

import {
  ArrowRight,
  BookOpenText,
  ListChecks,
  ChartNoAxesCombined,
  CalendarRange,
  LibraryBig,
  BrainCircuit,
  Network,
  Settings2,
  PlayCircle,
  Database,
  FileText,
  Target,
  Clock3,
  CheckCircle2
} from "lucide-react";

import { useNavigate } from "react-router";

function PageHeader({ eyebrow, title, description, icon: Icon }) {

  return (
    <div className="page-header">

      <div>

        <div className="page-eyebrow">
          {eyebrow}
        </div>

        <h1>{title}</h1>

        <p>{description}</p>

      </div>

      {Icon && (
        <div className="page-icon">
          <Icon size={28} strokeWidth={1.7} />
        </div>
      )}

    </div>
  );
}

function ModulePage({
  eyebrow,
  title,
  description,
  icon,
  children
}) {

  return (
    <section className="page">

      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        icon={icon}
      />

      {children}

    </section>
  );
}

export function Dashboard() {

  const navigate = useNavigate();

  return (
    <section className="page dashboard-page">

      <div className="dashboard-heading">

        <div>

          <div className="page-eyebrow">
            PAINEL DE ESTUDOS
          </div>

          <h1>
            Olá, Diego!
          </h1>

          <p>
            Continue sua preparação para o seu concurso.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/estudos")}
        >
          <PlayCircle size={19} />
          Iniciar estudo
          <ArrowRight size={18} />
        </button>

      </div>

      <div className="stats-grid">

        <Stat
          icon={ListChecks}
          label="QUESTÕES"
          value="—"
          description="Questões disponíveis"
        />

        <Stat
          icon={Target}
          label="ACERTOS"
          value="—"
          description="Seu desempenho"
        />

        <Stat
          icon={FileText}
          label="SIMULADOS"
          value="—"
          description="Simulados realizados"
        />

        <Stat
          icon={Clock3}
          label="TEMPO DE ESTUDO"
          value="—"
          description="Tempo acumulado"
        />

      </div>

      <div className="dashboard-grid">

        <div className="card study-card">

          <div className="card-heading">

            <div>
              <div className="card-eyebrow">
                CONTINUE ESTUDANDO
              </div>

              <h2>Legislação Educacional</h2>

              <p>
                LDB, ECA, Diretrizes Curriculares e legislação
                educacional relacionada à preparação para o concurso.
              </p>
            </div>

            <BookOpenText size={27} strokeWidth={1.6} />

          </div>

          <div className="progress-meta">
            <span>Trilha de estudo</span>
            <strong>Legislação</strong>
          </div>

          <div className="progress-meta">
            <span>Progresso</span>
            <strong>0%</strong>
          </div>

          <div className="progress-bar">
            <span style={{ width: "0%" }} />
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/estudos")}
          >
            Abrir estudos
            <ArrowRight size={17} />
          </button>

        </div>

        <div className="card">

          <div className="card-heading">

            <div>
              <div className="card-eyebrow">
                BASE PDF CONCURSO EDU
              </div>

              <h2>Base de conhecimento</h2>
            </div>

            <Database size={26} strokeWidth={1.6} />

          </div>

          <div className="source-list">

            <button onClick={() => navigate("/questoes")}>
              <div>
                <strong>01&nbsp;&nbsp; Base de Questões</strong>
                <span>Questões e provas analisadas</span>
              </div>
              <ArrowRight size={17} />
            </button>

            <button onClick={() => navigate("/biblioteca")}>
              <div>
                <strong>02&nbsp;&nbsp; Biblioteca de Pesquisa</strong>
                <span>Materiais utilizados como fonte</span>
              </div>
              <ArrowRight size={17} />
            </button>

            <button onClick={() => navigate("/desempenho")}>
              <div>
                <strong>03&nbsp;&nbsp; Motor de Análise</strong>
                <span>Correlação entre questão e material</span>
              </div>
              <ArrowRight size={17} />
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

function Stat({ icon: Icon, label, value, description }) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        <Icon size={21} strokeWidth={1.7} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>

    </div>
  );
}

export function Estudos() {

  const navigate = useNavigate();

  return (
    <ModulePage
      eyebrow="PREPARAÇÃO"
      title="Estudos"
      description="Organize sua preparação por disciplinas, conteúdos e trilhas de aprendizagem."
      icon={BookOpenText}
    >

      <div className="module-grid">

        <ModuleCard
          title="Legislação Educacional"
          description="LDB, ECA, Diretrizes Curriculares e legislação relacionada."
          icon={BookOpenText}
          action={() => navigate("/questoes")}
          actionText="Praticar questões"
        />

        <ModuleCard
          title="Filosofia"
          description="Conteúdos específicos para a preparação do cargo de Filosofia."
          icon={Network}
          action={() => navigate("/questoes")}
          actionText="Ver questões"
        />

        <ModuleCard
          title="Língua Portuguesa"
          description="Gramática, interpretação, sintaxe e conteúdos cobrados em concursos."
          icon={FileText}
          action={() => navigate("/questoes")}
          actionText="Praticar questões"
        />

      </div>

    </ModulePage>
  );
}

export function Questoes() {

  return (
    <ModulePage
      eyebrow="BANCO DE QUESTÕES"
      title="Questões"
      description="Pratique questões e acompanhe sua evolução."
      icon={ListChecks}
    >

      <div className="feature-panel">

        <ListChecks size={42} strokeWidth={1.4} />

        <h2>Banco de questões</h2>

        <p>
          Esta área será conectada ao banco oficial de questões
          do PDF CONCURSO EDU.
        </p>

        <div className="feature-status">
          <CheckCircle2 size={17} />
          Estrutura do frontend pronta para integração com a API.
        </div>

      </div>

    </ModulePage>
  );
}

export function Desempenho() {

  return (
    <ModulePage
      eyebrow="ANÃLISE"
      title="Desempenho"
      description="Acompanhe acertos, erros, evolução e pontos que precisam de reforço."
      icon={ChartNoAxesCombined}
    >

      <div className="empty-dashboard">

        <ChartNoAxesCombined size={44} strokeWidth={1.4} />

        <h2>Seu desempenho</h2>

        <p>
          Os indicadores serão alimentados pelo histórico real
          de questões respondidas.
        </p>

      </div>

    </ModulePage>
  );
}

export function Cronograma() {

  return (
    <ModulePage
      eyebrow="PLANEJAMENTO"
      title="Cronograma"
      description="Organize seus horários e mantenha uma rotina de estudos."
      icon={CalendarRange}
    >

      <div className="module-grid">

        <ModuleCard
          title="Semana de estudos"
          description="Planejamento semanal da sua preparação."
          icon={CalendarRange}
          action={() => {}}
          actionText="Abrir cronograma"
        />

        <ModuleCard
          title="Metas"
          description="Defina objetivos de estudo e acompanhe o progresso."
          icon={Target}
          action={() => {}}
          actionText="Definir metas"
        />

      </div>

    </ModulePage>
  );
}

export function Biblioteca() {

  return (
    <ModulePage
      eyebrow="BASE DE PESQUISA"
      title="Biblioteca"
      description="Consulte os materiais utilizados como fonte de conhecimento."
      icon={LibraryBig}
    >

      <div className="library-panel">

        <LibraryBig size={44} strokeWidth={1.4} />

        <h2>Biblioteca de Pesquisa</h2>

        <p>
          A biblioteca possui materiais utilizados pelo motor
          de análise do PDF CONCURSO EDU.
        </p>

        <div className="feature-status">
          <CheckCircle2 size={17} />
          Integração preparada para consulta somente leitura.
        </div>

      </div>

    </ModulePage>
  );
}

export function Flashcards() {

  return (
    <ModulePage
      eyebrow="REVISÃO"
      title="Flashcards"
      description="Revise conceitos importantes usando repetição e recuperação ativa."
      icon={BrainCircuit}
    >

      <div className="feature-panel">

        <BrainCircuit size={44} strokeWidth={1.4} />

        <h2>Flashcards</h2>

        <p>
          O módulo será conectado posteriormente ao sistema
          de cartões e ao histórico de revisão.
        </p>

      </div>

    </ModulePage>
  );
}

export function MapasMentais() {

  return (
    <ModulePage
      eyebrow="VISUALIZAÇÃO"
      title="Mapas Mentais"
      description="Organize conceitos, relações e estruturas de conteúdo."
      icon={Network}
    >

      <div className="feature-panel">

        <Network size={44} strokeWidth={1.4} />

        <h2>Mapas Mentais</h2>

        <p>
          Ãrea preparada para os mapas mentais da plataforma.
        </p>

      </div>

    </ModulePage>
  );
}

export function Configuracoes() {

  return (
    <ModulePage
      eyebrow="SISTEMA"
      title="Configurações"
      description="Preferências e configurações da plataforma."
      icon={Settings2}
    >

      <div className="settings-panel">

        <div className="setting-row">
          <div>
            <strong>Perfil</strong>
            <span>Diego — Administrador</span>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Servidor da API</strong>
            <span>127.0.0.1:8000</span>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Versão</strong>
            <span>PDF CONCURSO EDU V3.1</span>
          </div>
        </div>

      </div>

    </ModulePage>
  );
}

function ModuleCard({
  title,
  description,
  icon: Icon,
  action,
  actionText
}) {

  return (
    <div className="module-card">

      <div className="module-card-icon">
        <Icon size={23} strokeWidth={1.7} />
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

      <button
        className="secondary-button"
        onClick={action}
      >
        {actionText}
        <ArrowRight size={17} />
      </button>

    </div>
  );
}









