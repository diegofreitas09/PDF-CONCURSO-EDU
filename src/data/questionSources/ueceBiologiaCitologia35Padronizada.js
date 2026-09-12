// Compatibilidade editorial — normaliza os IDs do lote Citologia Q1–Q35 no padrão UECE-BIO-CIT-001...
import { UECE_BIOLOGIA_CITOLOGIA_35 as RAW_CITOLOGIA_35 } from "./ueceBiologiaCitologia35.js";

export const UECE_BIOLOGIA_CITOLOGIA_35_PADRONIZADA = RAW_CITOLOGIA_35.map((item, index) => ({
  ...item,
  id: `UECE-BIO-CIT-${String(index + 1).padStart(3, "0")}`,
}));
