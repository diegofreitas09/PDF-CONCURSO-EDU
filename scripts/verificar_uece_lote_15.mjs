// Lote 15 foi removido por duplicar conteúdo já integrado no lote 14.
// Este verificador permanece apenas para compatibilidade da esteira histórica.
import fs from "node:fs";
const reg=fs.readFileSync(new URL('../src/data/questionRegistry.js',import.meta.url),'utf8');
if(reg.includes('UECE_HISTORIA_LOTE_100_15')){
  console.error('ERRO UECE lote 15: lote duplicado voltou ao registry');
  process.exit(1);
}
console.log('UECE lote 15 REMOVIDO — duplicidade histórica bloqueada | registry limpo');
