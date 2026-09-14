from pathlib import Path
import hashlib,sys
p=Path('scripts/uece_lote08_rebuild_8.b64'); s=p.read_text().strip()
target='b4e916a75aa2784c9531351e120e9964f23d48b23a2002ae09acbd230e255093'
if len(s)!=10603: sys.exit(f'parte 8: tamanho inesperado {len(s)}')
if hashlib.sha256(s.encode()).hexdigest()==target:
    print('parte 8: SHA já correto'); sys.exit(0)
chunks=['fdd5880ba9f4dc65fdc5ed436a0d348e08f34e7ee13a9f57b234380774f7bbe9','8ab4c3ff121cb01ce2e052f7e29556aa578982d35f5f73f72f50d63b67da0da2','d12c2f197facada529a03270bdc9831c5a87752eff8afbdba00a402b65c91af4','2d9105d660b5c1a0973172bc1ba39d1e61318e74bb691119776b31de877ff4c0','be3ea809eca112b398880ffeec501c511902fa13c2416eb13768cb76dc8e21e7','7063577914e9631d8d6034937f6b0cc2366893ae4469a4378d6072e362483e42','b31f40e5e8fcded398dccadea8c1a322333ad5a0ac507928279b5112ecc5fb43','28e748dee24c4503f260ef9ae3fb6c131df99943f9a0ebd197d17e072abb4edc','4a7fcd52bc736c28ce5b50ec976639b7d4d41d3c104d2c818cc7df68cef10b5a','a4f63ce0c731f9902da84c4105abaf76c31baea5ea0c519f749e4a3c45f6524c','281e699e81e44ee6eb38e5d8884d0c7fc8110a1a52a40cdd26fc5f190366c738','3408817b38f4ffa89d30f4540e04c0a47487509af9f30beb36000da4b8b51a10','8af88d69037a6800a8138e4d2013989fd4ec4fe7bbd3833c120d807cea0d1f65','09ad239038cc8464a4a1373b816bdee3fb63b7ecefd68d6a0b7d7f02fbbbe536','101529b7bb73d1050d8ebe8e16dfc7ba6f88b1a52f24277a7c0a9151ea46f8d6','fbffd1fd35d2623e02dd957fa706bd99958402df0a9ed781aed4dd855107ee7b','bd3ef2495e057d8dc03f75aee24973e2eb0b7f7be73153fb9261075ca6a276ac','24cbc3b7a3ef996c1f3b1e5387119d1dcd9cdca551246212c3a9cadd7b035fa1','7bd72ae56b55b4cb0064f8d7e59030459e0784f1b779639273eec08eb70b4e4a','a21926ebe379f6719f7a88542f6eda7d47400629662f7123f9dd24473246d25c','7436c31955634bcf83e8d89eb4a90bbf122d4d0667f76bbdcee31f5e7c6b9ab3','6118ad207e7af93ccb6f9b47d9118450e6e87d0082b2c94543445e4d8dd846cf','e0b05d95b4d7744761b9e0cd954bac098180469f2988239bdf18397cfbf297ff','fca5d529ade75bda739d863e011b07a28d4e3449171afd97ca89b6f0d647dbda','968e1ac9e1b9ba77aa850e3ad5da377c0abccbc406c5c48a841378ade842b900','3bab7f41e99a2b3dc13ed7852a2ba854346fc49f8629b37e6af5202ce0bfd800','c72e1d1fd8a7b8df571bd76a740ca18ad575f5a37626b08331781699515e7a2c','cd90fb934dcd130aa806dddddda457e1a673e6d70c84c0d114b2db279e92399b','55e29fdb99a752809b49433a7f4c4f682ac96db3ec1dec80e383eb6777bab923','7d6e67bb04d7bc7c12a0a92c598568c7ba16b47b3c49daa1afd274421023726b','1e43a9386c9488e9c248c373cae37c084bf9a3bef01252c367bbd462869ca3bc','792ea6fd5f86ab5c2c7067aff1426a6693db005d3f91de1c109dc4de44946214','92493952340b15653aec80bb0ea35fef6dfad00b21d8400d4f522e1d2db3b30a','2671fbd22a21c376fc50be2446e1bbfa50b397d9d07f6a3cdcad617951eee1bc','906fef56d3a9a01cbf8d3eb59bfe958d6f34fc75f50e61280f61a3c85fba7701','c70a4713bec9fdbbaf59cb4e4dd0e453f0d0b6bdc14898a9ff176583a14422a2','fcc40fd5760113ec18d3f9693f586b0e8b5469b12dc058e7d3edce179e9e9246','d36d2f539bdab0350b730eab65daa82ecb132905163215a90f8e269b8227df92','0de0c861fd852067ba321b06cadd0294e0ee42691899f6481a721766428e7e1e','414f694b6d196f0c8f30bdd30f9fad5187d02c7ff554293a6ac9d1093ed1d122','7ba34bb77b4148694c38ac0d1c4483409268c7a4eaca050eab97a81d2bfeb2e7','52d9699f89dbca5ea794b059abb346c1af90735d950ff2eaf6134e311842ba6f']
bad=next((k for k,h in enumerate(chunks) if hashlib.sha256(s[k*256:k*256+256].encode()).hexdigest()!=h),None)
if bad is None: sys.exit('parte 8: SHA divergente sem bloco divergente')
lo=bad*256; hi=min(len(s),lo+256); alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
chars=list(s)
for pos in range(lo,hi):
    old=chars[pos]
    for c in alphabet:
        if c==old: continue
        chars[pos]=c; cand=''.join(chars)
        if hashlib.sha256(cand.encode()).hexdigest()==target:
            p.write_text(cand); print(f'parte 8: reparo SHA em {pos}: {old}→{c}'); sys.exit(0)
    chars[pos]=old
sys.exit(f'parte 8: substituição não encontrada no bloco {bad}')
