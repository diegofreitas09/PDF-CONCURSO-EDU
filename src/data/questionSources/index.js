import { QUESTION_BANK as LEGACY_QUESTION_BANK } from "../questionBank";
import { SIMULADO_05_TEORIAS_PEDAGOGICAS } from "./simulado05TeoriasPedagogicas";
import { SEDUC_CONHECIMENTOS_GERAIS_MODULO_1 } from "./seducConhecimentosGeraisModulo1";
import { APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01 } from "./apostilaPresencialSeducPedagogicos01";
import { PORTUGUES_APOSTILA_PRESENCIAL } from "./portuguesApostilaPresencial";
import { INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL } from "./indicadoresEducacionaisApostilaPresencial";
import { ADMINISTRACAO_PUBLICA_SEDUC_01 } from "./administracaoPublicaSeduc01";

/**
 * Banco unificado da plataforma.
 * Cada novo material entra como um lote separado em questionSources/.
 * Isso permite auditoria por fonte, deduplicação e atualização sem editar o banco legado.
 */
export const ALL_QUESTIONS = [
  ...LEGACY_QUESTION_BANK,
  ...SIMULADO_05_TEORIAS_PEDAGOGICAS,
  ...SEDUC_CONHECIMENTOS_GERAIS_MODULO_1,
  ...APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01,
  ...PORTUGUES_APOSTILA_PRESENCIAL,
  ...INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL,
  ...ADMINISTRACAO_PUBLICA_SEDUC_01,
];

export const QUESTION_SOURCE_STATS = {
  legado: LEGACY_QUESTION_BANK.length,
  simulado05TeoriasPedagogicas: SIMULADO_05_TEORIAS_PEDAGOGICAS.length,
  seducConhecimentosGeraisModulo1: SEDUC_CONHECIMENTOS_GERAIS_MODULO_1.length,
  apostilaPresencialSeducPedagogicos01: APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01.length,
  portuguesApostilaPresencial: PORTUGUES_APOSTILA_PRESENCIAL.length,
  indicadoresEducacionaisApostilaPresencial: INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL.length,
  administracaoPublicaSeduc01: ADMINISTRACAO_PUBLICA_SEDUC_01.length,
  total: LEGACY_QUESTION_BANK.length + SIMULADO_05_TEORIAS_PEDAGOGICAS.length + SEDUC_CONHECIMENTOS_GERAIS_MODULO_1.length + APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01.length + PORTUGUES_APOSTILA_PRESENCIAL.length + INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL.length + ADMINISTRACAO_PUBLICA_SEDUC_01.length,
};
