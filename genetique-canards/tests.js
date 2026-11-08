// Tests du moteur : node tests.js
'use strict';
const D = require('./donnees.js');
global.DONNEES_CANARD = D;
const M = require('./moteur.js');

let ok = 0, ko = 0;
function verifie(nom, cond, info) {
  if (cond) ok++; else { ko++; console.log('ÉCHEC :', nom, info !== undefined ? JSON.stringify(info) : ''); }
}
function parNom(res) { return Object.fromEntries(res.map(g => [g.phenotype.nom, g.p])); }
function geno(v, sexe) { return M.lireGeno(D.VARIETES.find(x => x.id === v).geno, sexe); }
function proche(a, b) { return Math.abs(a - b) < 1e-9; }

// 1. Chaque variété a un phénotype distinct et se reconnaît elle-même.
for (const sexe of ['M', 'F']) {
  const vus = new Map();
  for (const v of D.VARIETES) {
    const g = M.lireGeno(v.geno, sexe);
    const n = M.phenotype(g, sexe).nom;
    verifie('phénotype unique ' + v.id + ' / ' + vus.get(n), !vus.has(n), n);
    vus.set(n, v.id);
    verifie('auto-reconnaissance ' + v.id + ' ' + sexe, M.varieteDe(g, sexe) === v);
  }
}

// 2. Les probabilités somment à 1.
for (const a of D.VARIETES) for (const b of D.VARIETES) for (const s of ['M', 'F']) {
  const t = M.croiser(geno(a.id, 'M'), geno(b.id, 'F'), s).reduce((x, y) => x + y.p, 0);
  if (!proche(t, 1)) verifie('somme ' + a.id + ' x ' + b.id, false, t);
}
ok++;

// 3. Colvert x Blanc : tout colvert, porteur de c.
{
  const r = M.resultat(geno('sauvage', 'M'), geno('blanc', 'F'), 'M');
  verifie('colvert x blanc : un seul phénotype', r.length === 1 && r[0].phenotype.nom === 'Sauvage', r.map(x => x.phenotype.nom));
  verifie('colvert x blanc : porteurs c', r[0].genotypes.every(g => g.porteurs.includes('c')));
}

// 4. Lié au sexe : mâle chocolat x cane noire -> fils noirs porteurs d, filles chocolat.
{
  const fils = parNom(M.resultat(geno('marron', 'M'), geno('noir', 'F'), 'M'));
  const filles = parNom(M.resultat(geno('marron', 'M'), geno('noir', 'F'), 'F'));
  verifie('chocolat x noir : fils noirs', proche(fils['Noir'], 1), fils);
  verifie('chocolat x noir : filles chocolat', proche(filles['Marron (chocolat)'], 1), filles);
  // Croisement réciproque : tout noir.
  const fils2 = parNom(M.resultat(geno('noir', 'M'), geno('marron', 'F'), 'M'));
  const filles2 = parNom(M.resultat(geno('noir', 'M'), geno('marron', 'F'), 'F'));
  verifie('noir x chocolat : fils noirs', proche(fils2['Noir'], 1), fils2);
  verifie('noir x chocolat : filles noires', proche(filles2['Noir'], 1), filles2);
}

// 5. Bleu x Bleu : 1/4 noir, 1/2 bleu, 1/4 bleu pâle.
{
  const r = parNom(M.resultat(geno('bleu', 'M'), geno('bleu', 'F'), 'F'));
  verifie('bleu x bleu', proche(r['Noir'], .25) && proche(r['Bleu'], .5) && proche(r['Splash'], .25), r);
}

// 6. Dominance M : MR > M+ > md.
{
  const g = M.lireGeno('M:M+/MR', 'M');
  verifie('MR dominant', M.phenotype(g, 'M').couleur === 'Sauvage restreint intermédiaire');
  verifie('normalisation MR en premier', g.M[0] === 'MR');
  verifie('M+/md = colvert', M.phenotype(M.lireGeno('M:M+/md', 'M'), 'M').couleur === 'Sauvage');
}

// 7. Noir sans md/md -> bavette blanche.
verifie('noir M+ : bavette', M.phenotype(M.lireGeno('E:E/E', 'M'), 'M').marques === 'bavette blanche');

// 8. Fractions.
verifie('fraction 3/16', M.fraction(0.1875) === '3/16');


// 9. Jaune pois lié au sexe : mâle jaune pois x cane bleu-fauve truité.
{
  const fils = parNom(M.resultat(geno('jaune-pois', 'M'), geno('bleu-fauve-truite', 'F'), 'M'));
  const filles = parNom(M.resultat(geno('jaune-pois', 'M'), geno('bleu-fauve-truite', 'F'), 'F'));
  verifie('jaune pois : fils bleu-fauve truité', proche(fils['Sauvage truité bleu-fauve'], 1), fils);
  verifie('jaune pois : filles jaune pois', proche(filles['Sauvage truité bleu-fauve brun'], 1), filles);
}

// 10. Huppé x huppé : 1/4 Cr/Cr, 1/2 huppé, 1/4 sans huppe.
{
  const g = M.lireGeno('Cr:Cr/cr+', 'M'), h = M.lireGeno('Cr:Cr/cr+', 'F');
  const r = parNom(M.resultat(g, h, 'F'));
  verifie('huppe Cr/Cr', proche(r['Sauvage, huppé Cr/Cr (malformations ou mort du caneton)'], .25) &&
          proche(r['Sauvage, huppé'], .5) && proche(r['Sauvage'], .25), r);
}

// 11. Panaché R/R x sauvage : tout panaché partiel.
{
  const r = M.resultat(geno('panache', 'M'), geno('sauvage', 'F'), 'M');
  verifie('R/r+ partiel', r.every(x => x.phenotype.marques.includes('panaché partiel')), r.map(x => x.phenotype.nom));
}

// 12. Explications : une ligne par gène non sauvage.
{
  const e = M.expliquer(geno('jaune-pois', 'F'), 'F').map(x => x.locus);
  verifie('explications jaune pois', ['Li', 'Bl', 'D'].every(l => e.includes(l)), e);
  verifie('explication sauvage', M.expliquer(geno('sauvage', 'M'), 'M').length === 1);
  const b = M.expliquer(M.lireGeno('C:c/c,E:E/e+', 'M'), 'M').map(x => x.texte).join(' ');
  verifie('blanc cache uni', b.includes('caché par le blanc'), b);
}

// 13. Identification : chaque variété correspond à sa propre description.
{
  const I = require('./identification.js');
  for (const v of D.VARIETES) {
    verifie('critères définis ' + v.id, !!I.CRITERES[v.id]);
    for (const s of ['M', 'F']) {
      const c = I.criteres(v, M, s);
      for (const q of I.QUESTIONS) {
        if (q.id === 'sexe' || (q.sexe && q.sexe !== s)) continue;
        const vals = I.valeurs(c[q.id], s);
        for (const r of vals || []) {
          verifie('option connue ' + v.id + ' ' + q.id + '=' + r, q.options.some(o => o[0] === r));
          verifie('auto-compatible ' + v.id + ' ' + s + ' ' + q.id,
                  I.contradictions(v, { sexe: s, [q.id]: r }, M).length === 0);
        }
      }
    }
  }
  const ids = r => D.VARIETES.filter(v => !I.contradictions(v, r, M).length).map(v => v.id);
  verifie('uni noir -> noir', ids({ uni: 'oui', teinte: 'noir' }).join() === 'noir', ids({ uni: 'oui', teinte: 'noir' }));
  verifie('blanc -> blanc', ids({ blanc: 'oui' }).join() === 'blanc');
  verifie('cane oeil barré exclut dusky', !ids({ sexe: 'F', oeil: 'oui' }).includes('fauve'));
  verifie('question cane ignorée pour un mâle', ids({ sexe: 'M', oeil: 'oui' }).includes('fauve'));
}

// 14. Recherche des croisements qui donnent une variété.
{
  const V = id => D.VARIETES.find(v => v.id === id);
  const trouve = (cible, pere, mere, sexes) => M.chercherCroisements(V(cible), D.VARIETES, sexes)
    .find(r => r.pere.id === pere && r.mere.id === mere);
  const jp = trouve('jaune-pois', 'jaune-pois', 'bleu-fauve-truite', ['F']);
  verifie('jaune pois : mâle jaune pois × cane bleu-fauve truité', jp && proche(jp.p.F, 1), jp && jp.p);
  const bl = trouve('bleu', 'noir', 'splash');
  verifie('bleu : noir × splash 100 %', bl && proche(bl.score, 1), bl && bl.p);
  const prem = M.chercherCroisements(V('noir'), D.VARIETES)[0];
  verifie('noir : premier résultat 100 %', proche(prem.score, 1) && prem.pere.homologuee && prem.mere.homologuee, prem);
  const r = M.chercherCroisements(V('truite'), D.VARIETES);
  verifie('tri décroissant', r.every((x, i) => !i || r[i - 1].score >= x.score - 1e-12));
  verifie('aucun couple à 0 %', r.every(x => x.score > 0));
  const dl = M.distribLocusId('D', M.lireGeno('D:d/d', 'M'), M.lireGeno('', 'F'), 'F');
  verifie('locus lié au sexe : filles d/–', dl.length === 1 && dl[0].paire.join() === 'd', dl);
}

console.log(ok + ' tests réussis, ' + ko + ' échec(s).');
process.exit(ko ? 1 : 0);
