// UECE por Assunto — Química / Polímeros — item visual Q5.
// Ponte de compatibilidade: agrega também os lotes de Biologia que ainda não possuem import direto no agregador global.
import { UECE_BIOLOGIA_ORIGEM_VIDA_30 } from "./ueceBiologiaOrigemVida30.js";
import { UECE_BIOLOGIA_SERES_VIVOS_REPRODUCAO_25 } from "./ueceBiologiaSeresVivosReproducao25.js";
import { UECE_BIOLOGIA_BIOQUIMICA_35 } from "./ueceBiologiaBioquimica35.js";
import { UECE_BIOLOGIA_BOTANICA_15 } from "./ueceBiologiaBotanica15.js";
import { UECE_BIOLOGIA_BOTANICA_50_COMPLEMENTO } from "./ueceBiologiaBotanica50Complemento.js";
import { UECE_BIOLOGIA_CITOLOGIA_35_PADRONIZADA } from "./ueceBiologiaCitologia35Padronizada.js";
import { UECE_BIOLOGIA_CITOLOGIA_06_COMPLEMENTO } from "./ueceBiologiaCitologia06Complemento.js";
import { UECE_BIOLOGIA_ECOLOGIA_20 } from "./ueceBiologiaEcologia20.js";
// Fonte: Apostila UECE por Assunto 11ª edição, p. 227. Estruturas reconstruídas em KaTeX.
const origin="Apostila UECE por Assunto 11ª edição — p. 227";
const POLIMERO_VISUAL=[{
  id:"UECE-QUI-POL-005",
  discipline:"Química",
  topic:"Polímeros",
  statement:"(UECE 2024.1 2ª Fase) Macromoléculas de cadeias longas caracterizam os polímeros, em que cada cadeia apresenta uma unidade chamada de monômero. Um exemplo de polímero é a poliacrilonitrila. Com relação a esse fato, analise as proposições: I. A fórmula do monômero formador da poliacrilonitrila é $C_3H_3N$. II. A fórmula estrutural deste monômero é a estrutura saturada mostrada abaixo. Considerando as proposições apresentadas, é correto afirmar que",
  media:{type:"formula",title:"Estruturas da questão",latex:"\\text{Poliacrilonitrila: }[-\\mathrm{CH_2}-\\mathrm{CH}(\\mathrm{CN})-]_n\\qquad\\text{II: }-\\mathrm{CH_2}-\\mathrm{CH}(\\mathrm{CN})-\\mathrm{CH_2}-",caption:"Reconstrução em KaTeX das estruturas mostradas na questão original da apostila."},
  options:["I é falsa e II é verdadeira.","ambas são falsas.","ambas são verdadeiras.","I é verdadeira e II é falsa."],
  answer:3,
  explanation:"Gabarito oficial da apostila: D. O monômero da poliacrilonitrila é a acrilonitrila, $CH_2=CH-CN$, cuja fórmula molecular é $C_3H_3N$. A estrutura da proposição II representa um trecho saturado da cadeia polimérica, não o monômero com ligação dupla.",
  source:"UECE 2024.1 2ª Fase",
  origin,
  reviewed:true
}];
export const UECE_QUIMICA_POLIMEROS_VISUAL_01=[...POLIMERO_VISUAL,...UECE_BIOLOGIA_ORIGEM_VIDA_30,...UECE_BIOLOGIA_SERES_VIVOS_REPRODUCAO_25,...UECE_BIOLOGIA_BIOQUIMICA_35,...UECE_BIOLOGIA_BOTANICA_15,...UECE_BIOLOGIA_BOTANICA_50_COMPLEMENTO,...UECE_BIOLOGIA_CITOLOGIA_35_PADRONIZADA,...UECE_BIOLOGIA_CITOLOGIA_06_COMPLEMENTO,...UECE_BIOLOGIA_ECOLOGIA_20];
