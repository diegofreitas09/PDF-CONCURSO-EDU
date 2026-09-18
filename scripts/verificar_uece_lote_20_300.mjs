import { UECE_FIL_SOC_LOTE_300_20 as Q } from "../src/data/questionSources/ueceFilosofiaSociologiaLote300_20.js";
import { auditQuestionBank } from "../src/data/questionAuditEngine.js";

if (Q.length !== 300) throw new Error(`count ${Q.length}`);
if (new Set(Q.map(q=>q.id)).size !== 300) throw new Error("ids duplicados");

const c=Q.reduce((a,q)=>(a[q.discipline]=(a[q.discipline]||0)+1,a),{});
if(c.Filosofia!==161||c.Sociologia!==139) throw new Error(JSON.stringify(c));

const audit=auditQuestionBank(Q);
if(audit.stats.raw!==300||audit.stats.published!==300||audit.stats.quarantined!==0||audit.stats.duplicates!==0){
  console.error(audit.quarantined.map(q=>({id:q.id,issues:q.auditIssues})));
  console.error(audit.duplicates.map(q=>({id:q.id,duplicateOf:q.duplicateOf})));
  throw new Error(`catraca falhou: ${JSON.stringify(audit.stats)}`);
}

console.log("Lote 20 OK — 300/300 | Filosofia 161 | Sociologia 139 | quarentena 0 | duplicadas 0");
