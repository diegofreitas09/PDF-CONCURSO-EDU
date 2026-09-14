// UECE por Assunto — Química / Química e Reações Orgânicas — fechamento 106–109.
// Reutiliza exclusivamente os itens íntegros já auditados nas fontes textuais existentes, sem duplicar objetos.
import { UECE_QUIMICA_ORGANICA_TEXTUAIS_16C } from "./ueceQuimicaOrganicaTextuais16c.js";
import { UECE_QUIMICA_ORGANICA_TEXTUAIS_29B } from "./ueceQuimicaOrganicaTextuais29b.js";

const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);
const todos=[...UECE_QUIMICA_ORGANICA_TEXTUAIS_16C,...UECE_QUIMICA_ORGANICA_TEXTUAIS_29B];
export const UECE_QUIMICA_ORGANICA_FINAL_04=[...new Map(todos.filter(q=>numero(q)>=106&&numero(q)<=109).map(q=>[q.id,q])).values()].sort((a,b)=>numero(a)-numero(b));
