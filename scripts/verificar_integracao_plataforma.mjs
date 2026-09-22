import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const files={
  header:read("src/components/Header.jsx"),
  dashboard:read("src/pages/Dashboard.jsx"),
  questoes:read("src/pages/Questoes.jsx"),
  simulados:read("src/pages/Simulados.jsx"),
  desempenho:read("src/pages/Desempenho.jsx"),
  platform:read("src/pages/PlatformPages.jsx"),
  router:read("src/routes/router.jsx"),
  catalog:read("src/utils/platformCatalog.js"),
  scanner:read("src/components/simulations/AnswerSheetScanner.jsx"),
  redacao:read("src/pages/CorretorRedacao.jsx"),
};
const checks=[];
const ok=(name,condition,detail="")=>checks.push({name,condition:Boolean(condition),detail});
ok("catálogo único usa REGISTERED_QUESTIONS",files.catalog.includes("REGISTERED_QUESTIONS"));
ok("questões usa catálogo único",files.questoes.includes("questionPool")&&files.questoes.includes("topicsFor")&&files.questoes.includes("savePlatformSelection"));
ok("questões integra simulado",files.questoes.includes("/simulados?"));
ok("questões integra desempenho",files.questoes.includes("/desempenho?"));
ok("simulados filtra por assunto",files.simulados.includes("topicFilters")&&files.simulados.includes("topicsFor")&&files.simulados.includes("questionCount"));
ok("desempenho filtra disciplina/assunto",files.desempenho.includes("useSearchParams")&&files.desempenho.includes("answeredCoverage"));
ok("desempenho abre treino",files.desempenho.includes("buildQuestionsRoute"));
ok("estudos usa disciplinas reais",files.platform.includes("DISCIPLINE_STATS.map")&&files.platform.includes("buildQuestionsRoute"));
ok("biblioteca lê busca da URL",files.platform.includes('params.get("busca")')&&files.platform.includes("updateSearch"));
ok("busca global usa catálogo",files.header.includes("resolveQuestionSearch")&&files.header.includes("savePlatformSelection"));
ok("dashboard mede cobertura",files.dashboard.includes("answeredCoverage")&&files.dashboard.includes("COBERTURA"));
ok("dashboard mostra qualidade",files.dashboard.includes("qualityPct")&&files.dashboard.includes("em quarentena"));
ok("tipo de prova executa changePaperType",files.simulados.includes("changePaperType")&&files.simulados.includes("paperSelectionToDigital"));
ok("cartão-resposta mapeia A-D",files.scanner.includes('option value="0">A')&&files.scanner.includes('option value="3">D')&&files.scanner.includes("onApply?.(scan.answers)"));
ok("redação atualiza competência pelo seletor",files.redacao.includes("SCORE_VALUES")&&files.redacao.includes("updateScore(index, e.target.value)"));
for(const route of ["estudos","questoes","simulados","desempenho","biblioteca","cronograma","flashcards","mapas-mentais","corretor-redacao","assistente-ia","configuracoes"])ok("rota "+route,files.router.includes(`path: "${route}"`));
const staleActive=[
  ["Questões","src/pages/Questoes.jsx",files.questoes],
  ["Simulados","src/pages/Simulados.jsx",files.simulados],
  ["Desempenho","src/pages/Desempenho.jsx",files.desempenho],
  ["Dashboard","src/pages/Dashboard.jsx",files.dashboard],
];
for(const [name,path,content] of staleActive)ok(`${name} não usa questionBank legado`,!content.includes('from"../data/questionBank"')&&!content.includes('from "../data/questionBank"'),path);
const failed=checks.filter(x=>!x.condition);
console.table(checks.map(x=>({status:x.condition?"OK":"FALHA",check:x.name,detail:x.detail})));
if(failed.length){console.error("\nFalhas de integração:",failed);process.exit(1)}
console.log(`\nAuditoria de seletores e indicadores: ${checks.length}/${checks.length} verificações aprovadas.`);
