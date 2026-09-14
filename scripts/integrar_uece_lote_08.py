from pathlib import Path
import base64,lzma,sys,hashlib
OUT=Path('src/data/questionSources/uecePortuguesLote100_08.js'); REG=Path('src/data/questionRegistry.js'); VERIFY=Path('scripts/verificar_uece_lote_08.mjs'); DEPLOY=Path('.github/workflows/deploy-pages.yml')
expected_parts={1:'2aced375201fe01dfe1f200386db520629596575209d37d980532c51b95cfc63',2:'3f656f2a17a2e2e0bc9e12f23aa25a0ad926b34fb51690cee9c1f2f6fe17ce62',3:'ec41716447613505c305a713074d7bbfc3ad92a6d65a8cd3b3aa1ada6c1d3b36',4:'cde46f56a4372473745b034bb059f9db5e0746a46faa178c0ab3e9af180db5a5',5:'db311c9e00be68eb7f0ce0e371bbaf6dde0adcc1cea44e4261e4472d867cd19f',6:'ce837dd6eea41ee237cae6b03b4f6ebab99a34123c31e079e7a7efa6c65bb8bb',7:'28742bd8809be66ad8872ecea1e73b14ecb9a509aaf15bf6c0250e651b11f301',8:'b4e916a75aa2784c9531351e120e9964f23d48b23a2002ae09acbd230e255093'}
chunks5=['cdb3970d31f70548d98126983f233decf56bc6c56fdd8d778cb319b0bb6a4933','db22421b7c65c71494ff754dc499201b553e551c1120c484ea1f0b44515e2942','4c4420eaa49e98f95720ae08ed183161752bfca48c79a12e22f1705eff962540','0d70f6304b2ce634900007eeaeabcc057dc3452699a901846ec4e4c8c07331a1','000298b8b90181cc1b6dba39f4a26cb1bb8c0c218adfb1ec8962d056b15f316e','a62f0df91a9cdac87a398117d2c6823ccd6aef32453ba31312dfad21f48714cb','427572722d30b5feb472e6c66f60e4bfbd132437f78af39f3c9a47e066d01dd7','543f092c61e41a02865cac9a4c490248de702a6b9aa619e6c506746b72001208','f159f22ec5997d84aaa08147fd4322e6af49e2bce9cfdcf537af95a8dc27997d','94fd621b2e6c8d7327c121bf643f33be48e730d43168cfacbeae335bd8ca99e7','cfab09def33eaa59454c8e8dd03df0f03238e7aefd1e4b475df223b7a9e9cd16','634ebf02825f1874b53aa329767d49e85ff656e8b91425af656339eb57ed3208','723cc8e7c63d7d7ef1b3d79daf54f5bf2d01dc54b3d7ff4320c4ac87093b8c8c','568f8f94b1e4dc8a006b527753142bbbfbb17d7f60d6acc628a751f68973c87f','5f000f85f9527a90ab8896d3e6b43bf8a8f44bf5fc025d067a520119a6082b2c','9ab39e79412de89017df8a1e6e5c30544868a5e6e900cb46f8cffbd45bc68143','a0d1f8ff508113943f51051aa07253d79bcb9a4d5a2812026900214fe99f89cf','e17b334ccc8b035fe923c1c27aa0f5048f323c0d2b0f49f46643cc77074db12f','4a3e0cc2d4eda5c5a09bbfe1c52be78129d8b9536ee6c6003ae18f766c1fe9f3','b70c51d0764a5e626f222138852149231d7cbaa6f517d557bee92a6861ab8441','e3004c6744d25b1f2c731506444ab857d99be31e464f79b66ecaff0a2c8850ca','83033aa5c8ab70bd0e1c5e83ac09357eae175a7ab54d947bd49cdd6d0be38623','b58455160e242f17100fbf451e1e217c97172e7b3390d0bdc4ccd1bb3eb438bb','edd365728cd4a6cc13c969a32dc352f70224447df63945cbc676b1a5f49bcc93','7d5dfc1306516742bb013d821cfd3f767d631b5face3cb9a1927c344cf42faae','41e01ba5211717538f5d5c6595790938cb92a30b3b046746d5dc345184362931','1d92cd457e76a903f5ac61411b4ce8b683f56f067ef68b08284a9e486953a4e5','020a2230d1154e3b95c495a38f62e4e2210302089dd9bb39892ad9d20297b524','1f6c3f5698833116585ef8a6cdd5a4d6acc55996ea1569325f545ed7b2e95eea','e9b6670f8dc41cdced5dca84b7d4b2ee72b25ee7edd25b2fd8d170302a2b730b','2bef6de433792e8e21c2a642abd9e903ac953ad946df133ec8274f07359f5425','9d7719707f9e584122bfa21b0e4a6ad4402cb6e48f87656e95440245348eb055','2a4bdc6bba60cb153615355cc934e4bc3a7b45a508d14602742bd48a3131cd23','f2f6552e2ba3fdf2b1c253bbd8a4a6843c6d7ed9b0ef40a2ec86cd0db31e9fb6','bdd6b2c1fcbaf4b2c310307c44f569a16481a9fc042324a337fd43f4eb689097','d9fba3f39e21e563f7a8a7df4eb03072a65d1edfafd21b00244faaec3d11c85c','aa733c2652326819a4314fd528c91356ccfc983f4818f08d49b353ab4a2eac08','a92aac67f79275b765a6b9193d2607c193124323a68e506b85848d14d041f72c','a5e13a0fff9e3e40f6bc57dbf07b64c2bccc9f93a8c0b2a67ab7df8b3754f922','b3fe3d4643b009263d2b743a72d517683fca9d3633148302aebf90260228f325','fb1acd78234750440ee810166cfc705b10b69d2f49b18811454a928c52feccc2','7e7ead82657919bcba1c87e406812988ef396517978f2d7d5e336497421da00a']
alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
parts=[]
for i in range(1,9):
    p=Path(f'scripts/uece_lote08_rebuild_{i}.b64'); s=p.read_text().strip()
    if i==3 and 'WFOpGM7ntiBG' in s:
        s=s.replace('WFOpGM7ntiBG','WFOpGM7ktiBG',1); p.write_text(s); print('parte 3: reparo n→k aplicado')
    if i==5 and len(s)==10602:
        first_bad=next((k for k in range(len(chunks5)) if hashlib.sha256(s[k*256:k*256+256].encode()).hexdigest()!=chunks5[k]),None)
        if first_bad is None: sys.exit('parte 5 curta sem bloco divergente')
        lo=max(0,first_bad*256-1); hi=min(len(s),first_bad*256+257); target=expected_parts[5]; repaired=None
        for pos in range(lo,hi+1):
            for c in alphabet:
                cand=s[:pos]+c+s[pos:]
                if hashlib.sha256(cand.encode()).hexdigest()==target:
                    repaired=cand; print(f'parte 5: caractere recuperado em {pos}: {c}'); break
            if repaired: break
        if not repaired: sys.exit(f'parte 5: reparo não encontrado na janela {lo}:{hi}')
        s=repaired; p.write_text(s)
    h=hashlib.sha256(s.encode()).hexdigest()
    if len(s)!=10603 or h!=expected_parts[i]: sys.exit(f'fragmento divergente parte {i}: len={len(s)} sha={h}')
    parts.append(s)
try: raw=lzma.decompress(base64.b64decode(''.join(parts),validate=True)); text=raw.decode('utf-8')
except Exception as e: sys.exit(f'falha reconstrução: {e}')
if hashlib.sha256(raw).hexdigest()!='99d96744d3688e18e4e6164ffe407d4bd6118119ef35afaec1a6f0fbd6ac4b9d': sys.exit('sha final divergente')
if text.count('"id":"UECE-PORT-')!=100 or 'UECE-PORT-INT-170' not in text or 'UECE-PORT-DISC-001' not in text: sys.exit('limites/quantidade divergentes')
OUT.write_text(text,encoding='utf-8')
VERIFY.write_text(r'''import { UECE_PORTUGUES_LOTE_100_08 } from "../src/data/questionSources/uecePortuguesLote100_08.js";
const lote=UECE_PORTUGUES_LOTE_100_08, fail=m=>{console.error(`ERRO UECE lote 08: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const expect={"Interpretação de texto":11,"Literatura":25,"Linguística e aspectos da linguagem":8,"Estrutura e tipologia textual":3,"Coesão textual":52,"Discurso e vozes do texto":1};
const ids=new Set(),src=new Set(),topics={};let media=0;
for(const q of lote){for(const f of ["id","discipline","topic","context","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(q.discipline!=="Português")fail(`${q.id}: disciplina`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf")fail(`${q.id}: origem`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.context}::${q.statement}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);topics[q.topic]=(topics[q.topic]||0)+1;if(q.media)media++;}
for(const [k,v] of Object.entries(expect))if(topics[k]!==v)fail(`${k}: esperado ${v}, veio ${topics[k]||0}`);
if(Object.keys(topics).length!==Object.keys(expect).length)fail('tópicos inesperados');
if(lote[0].id!=="UECE-PORT-INT-170"||lote.at(-1).id!=="UECE-PORT-DISC-001")fail('limites divergentes');
console.log(`UECE lote 08 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);
''',encoding='utf-8')
reg=REG.read_text(); imp='import{UECE_PORTUGUES_LOTE_100_08}from"./questionSources/uecePortuguesLote100_08";\n'; anchor='import{UECE_PORTUGUES_LOTE_100_07}from"./questionSources/uecePortuguesLote100_07";\n'
if imp not in reg:
    if anchor not in reg: sys.exit('âncora import ausente')
    reg=reg.replace(anchor,anchor+imp,1)
old='...UECE_PORTUGUES_LOTE_100_07].map(sanitizeQuestion)'; new='...UECE_PORTUGUES_LOTE_100_07,...UECE_PORTUGUES_LOTE_100_08].map(sanitizeQuestion)'
if new not in reg:
    if old not in reg: sys.exit('âncora RAW ausente')
    reg=reg.replace(old,new,1)
REG.write_text(reg)
if DEPLOY.exists():
    d=DEPLOY.read_text()
    if 'verificar_uece_lote_08.mjs' not in d:
        needle='        run: node scripts/verificar_uece_lote_07.mjs\n'
        if needle not in d: sys.exit('âncora deploy ausente')
        d=d.replace(needle,needle+'      - name: Auditar lote UECE Português 170-269\n        run: node scripts/verificar_uece_lote_08.mjs\n',1); DEPLOY.write_text(d)
print('LOTE08 GERADO — Português +100 — 100/100 | visuais 0')
