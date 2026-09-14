// UECE por Assunto — Biologia — lote 064–163 (100 questões íntegras).
// Ordem da apostila: Microbiologia 6–37 (32) + Seres vivos e reprodução (25)
// + Bioquímica (35) + Botânica 1–8 (8).
// Todos os itens vêm de fontes já conferidas com o gabarito oficial da apostila.
import { UECE_BIOLOGIA_MICROBIOLOGIA_37 } from "./ueceBiologiaMicrobiologia37.js";
import { UECE_BIOLOGIA_SERES_VIVOS_REPRODUCAO_25 } from "./ueceBiologiaSeresVivosReproducao25.js";
import { UECE_BIOLOGIA_BIOQUIMICA_35 } from "./ueceBiologiaBioquimica35.js";
import { UECE_BIOLOGIA_BOTANICA_15 } from "./ueceBiologiaBotanica15.js";

const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);
const MICROBIOLOGIA_006_A_037 = UECE_BIOLOGIA_MICROBIOLOGIA_37.filter((q) => numero(q) >= 6 && numero(q) <= 37);
const BOTANICA_001_A_008 = UECE_BIOLOGIA_BOTANICA_15.filter((q) => numero(q) >= 1 && numero(q) <= 8);

export const UECE_BIOLOGIA_LOTE_100_02 = [
  ...MICROBIOLOGIA_006_A_037,
  ...UECE_BIOLOGIA_SERES_VIVOS_REPRODUCAO_25,
  ...UECE_BIOLOGIA_BIOQUIMICA_35,
  ...BOTANICA_001_A_008,
];
