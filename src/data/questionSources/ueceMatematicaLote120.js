import { UECE_MATEMATICA_BASE_20 } from "./ueceMatematicaBase20.js";
import { UECE_MATEMATICA_COMPLEMENTO_21_40 } from "./ueceMatematicaComplemento21a40.js";
import { UECE_MATEMATICA_COMPLEMENTO_41_60 } from "./ueceMatematicaComplemento41a60.js";
import { UECE_MATEMATICA_COMPLEMENTO_61_80 } from "./ueceMatematicaComplemento61a80.js";
import { UECE_MATEMATICA_COMPLEMENTO_81_100 } from "./ueceMatematicaComplemento81a100.js";

// UECE por Assunto - Matemática auditada: 100 itens.
export const UECE_MATEMATICA_LOTE_100 = [
  ...UECE_MATEMATICA_BASE_20,
  ...UECE_MATEMATICA_COMPLEMENTO_21_40,
  ...UECE_MATEMATICA_COMPLEMENTO_41_60,
  ...UECE_MATEMATICA_COMPLEMENTO_61_80,
  ...UECE_MATEMATICA_COMPLEMENTO_81_100,
];

// Alias preservado porque o agregador legado ainda importa este nome.
export const UECE_MATEMATICA_LOTE_20 = UECE_MATEMATICA_LOTE_100;
