/* Calculateur de croisements — canards coureurs indiens
 * page-origines.js : page « Obtenir une variété » (origines.html, en/origines.html).
 */
'use strict';
const M = window.MOTEUR_CANARD;
const { LOCI, VARIETES } = window.DONNEES_CANARD;
const PAS = 12;
let limite = PAS;
let resultats = [];

const q = s => tr('« ' + s + ' »', '“' + s + '”');
function img(v, sexe) {
  const src = v.img[sexe] || v.img[sexe === 'M' ? 'F' : 'M'];
  return src ? `<img src="${esc(cheminImg(src))}" alt="${esc(v.nom)}, ${sexe === 'M' ? tr('mâle', 'drake') : tr('cane', 'duck')}" loading="lazy">`
             : '<span class="vide" aria-hidden="true">?</span>';
}

/* ---------- réglages ---------- */
const sel = document.getElementById('cible');
const opt = v => `<option value="${v.id}">${esc(v.nom)}</option>`;
sel.innerHTML = `<optgroup label="${tr('Homologuées en France', 'French standard colours')}">${VARIETES.filter(v => v.homologuee).map(opt).join('')}</optgroup>`
  + `<optgroup label="${tr('Autres couleurs', 'Other colours')}">${VARIETES.filter(v => !v.homologuee).map(opt).join('')}</optgroup>`;
try {
  const v = new URLSearchParams(location.search).get('v');
  if (VARIETES.some(x => x.id === v)) sel.value = v;
} catch (e) { /* ignoré */ }

document.getElementById('reglages').addEventListener('change', () => { limite = PAS; calculer(); });
document.getElementById('plus').addEventListener('click', () => { limite += PAS; afficher(); });

function sexesChoisis() {
  const v = document.querySelector('input[name="sexe"]:checked').value;
  return v === 'MF' ? ['M', 'F'] : [v];
}
const prefixeSexe = (s, sexes) => sexes.length > 1 ? (s === 'M' ? tr('fils : ', 'sons: ') : tr('filles : ', 'daughters: ')) : '';

/* ---------- détail d'un couple ---------- */
// Pour chaque gène utile : génotypes des parents et répartition chez les jeunes.
function detail(r, sexes, cibleGeno) {
  const gp = M.lireGeno(r.pere.geno, 'M'), gm = M.lireGeno(r.mere.geno, 'F');
  const lignes = [];
  for (const l of LOCI) {
    const utile = [gp, gm, cibleGeno.M, cibleGeno.F].some(g => !g[l.id].every(a => a.endsWith('+')));
    if (!utile) continue;
    const jeunes = sexes.map(s => {
      const d = M.distribLocusId(l.id, gp, gm, s).sort((a, b) => b.p - a.p);
      const t = d.map(x => `${fmtPaire(x.paire)} ${fmtPct(x.p)}`).join(', ');
      return prefixeSexe(s, sexes) + t;
    }).join('<br>');
    lignes.push(`<tr><td>${esc(l.nom)} (${l.id})</td><td>${fmtPaire(gp[l.id])}</td><td>${fmtPaire(gm[l.id])}</td><td>${jeunes}</td></tr>`);
  }
  return `<table><thead><tr><th>${tr('Gène', 'Gene')}</th><th>${tr('Mâle', 'Drake')}</th><th>${tr('Cane', 'Duck')}</th><th>${tr('Jeunes', 'Young')}</th></tr></thead><tbody>${lignes.join('')}</tbody></table>`;
}

// Autres couleurs obtenues avec ce couple.
function autres(r, sexes, nomCible) {
  const gp = M.lireGeno(r.pere.geno, 'M'), gm = M.lireGeno(r.mere.geno, 'F');
  return sexes.map(s => {
    const res = M.resultat(gp, gm, s).filter(g => g.phenotype.nom !== nomCible[s]);
    if (!res.length) return '';
    const t = res.slice(0, 4).map(g => `${esc(g.variete ? g.variete.nom : g.phenotype.nom)} ${fmtPct(g.p)}`).join(' ; ');
    const pre = prefixeSexe(s, sexes);
    return `<p>${pre.charAt(0).toUpperCase() + pre.slice(1)}${t}${res.length > 4 ? ' ; …' : ''}</p>`;
  }).join('');
}

/* ---------- calcul et affichage ---------- */
let contexte = null;
function calculer() {
  const cible = VARIETES.find(v => v.id === sel.value);
  const sexes = sexesChoisis();
  const homol = document.getElementById('homologues').checked;
  const parents = homol ? VARIETES.filter(v => v.homologuee) : VARIETES;
  const cibleGeno = { M: M.lireGeno(cible.geno, 'M'), F: M.lireGeno(cible.geno, 'F') };
  const nomCible = { M: M.phenotype(cibleGeno.M, 'M').nom, F: M.phenotype(cibleGeno.F, 'F').nom };
  resultats = M.chercherCroisements(cible, parents, sexes);
  contexte = { cible, sexes, cibleGeno, nomCible, homol };
  document.getElementById('photo-cible').innerHTML = (() => {
    const src = cible.img[sexes[sexes.length - 1]] || cible.img.M || cible.img.F;
    return src ? `<img class="photo" src="${esc(cheminImg(src))}" alt="${esc(cible.nom)}">` : '<div class="photo photo-vide" aria-hidden="true">?</div>';
  })();
  document.getElementById('geno-cible').innerHTML = fmtGeno(cibleGeno.M) +
    (fmtGeno(cibleGeno.M) !== fmtGeno(cibleGeno.F) ? tr(' (mâle) ; ', ' (drake); ') + fmtGeno(cibleGeno.F) + tr(' (cane)', ' (duck)') : '');
  try { history.replaceState(null, '', '?v=' + encodeURIComponent(cible.id)); } catch (e) { /* ignoré */ }
  afficher();
}

function afficher() {
  const { cible, sexes, homol } = contexte;
  const surs = resultats.filter(r => r.score > 1 - 1e-9).length;
  const sur = sexes.length > 1 ? tr('chez tous les jeunes', 'in all the young')
    : sexes[0] === 'M' ? tr('chez tous les fils', 'in all the sons') : tr('chez toutes les filles', 'in all the daughters');
  const n = resultats.length;
  const pluriel = (x, fr1, frN, en1, enN) => x > 1 ? tr(frN, enN) : tr(fr1, en1);
  document.getElementById('resume').innerHTML = n
    ? `<p class="compte">${n} ${pluriel(n, 'couple donne', 'couples donnent', 'pair gives', 'pairs give')} ${q(esc(cible.nom))}</p>
       <p>${surs ? `${surs} ${pluriel(surs, 'donne', 'donnent', 'gives', 'give')} ${tr('cette couleur', 'this colour')} ${sur}.`
                 : tr(`Aucun couple ne la donne ${sur} : elle s’obtient seulement en partie.`, `No pair gives it ${sur}: it is only obtained in part.`)}</p>`
    : `<p class="compte">${tr(`Aucun couple de la liste ne donne ${q(esc(cible.nom))} en une génération`, `No pair from the list gives ${q(esc(cible.nom))} in one generation`)}</p>
       <p>${homol ? tr('Essayez sans la restriction aux couleurs homologuées, ou passez', 'Try without the French-standard restriction, or go')
                  : tr('Il faut passer', 'You need to go')} ${tr('par une génération intermédiaire : croisez d’abord pour obtenir des jeunes porteurs, puis croisez ces jeunes entre eux (le <a href="index.html">calculateur</a> permet de le faire avec « Prendre comme mâle / cane »).',
                       'through an intermediate generation: first cross to get carrier young, then cross these young together (the <a href="index.html">calculator</a> lets you do this with “Use as drake / duck”).')}</p>`;
  const html = resultats.slice(0, limite).map(r => {
    const probas = ['M', 'F'].filter(s => sexes.includes(s)).map(s => {
      const p = r.p[s];
      return `<div class="proba"><div class="lib">${s === 'M' ? tr('Fils', 'Sons') : tr('Filles', 'Daughters')} ${q(esc(cible.nom))}</div>
        ${p > 0 ? `<div class="val">${fmtPct(p)}<small>${M.fraction(p)}</small></div><div class="barre"><i style="width:${(p * 100).toFixed(1)}%"></i></div>`
                : `<div class="nul">${tr('aucun', 'none')}</div>`}</div>`;
    }).join('');
    const memes = r.pere === r.mere && r.score > 1 - 1e-9 ? `<span class="etiquette">${tr('se reproduit fidèlement', 'breeds true')}</span>` : '';
    const homolTxt = tr(' · homologuée', ' · French standard');
    return `<li class="couple">
      <div class="couple-tete">
        ${img(r.pere, 'M')}<div class="parent-nom">${esc(r.pere.nom)}<small>${tr('mâle', 'drake')}${r.pere.homologuee ? homolTxt : ''}</small></div>
        ${img(r.mere, 'F')}<div class="parent-nom">${esc(r.mere.nom)}<small>${tr('cane', 'duck')}${r.mere.homologuee ? homolTxt : ''}</small>${memes}</div>
      </div>
      <div class="probas">${probas}</div>
      <details><summary>${tr('Ce que donne ce couple, gène par gène', 'What this pair gives, gene by gene')}</summary>
        ${detail(r, sexes, contexte.cibleGeno)}
        <p><strong>${tr('Autres couleurs obtenues :', 'Other colours obtained:')}</strong></p>${autres(r, sexes, contexte.nomCible) || `<p>${tr('aucune', 'none')}</p>`}
      </details>
      <div class="liens"><a href="index.html?M=${encodeURIComponent(r.pere.id)}&amp;F=${encodeURIComponent(r.mere.id)}">${tr('Ouvrir ce couple au calculateur', 'Open this pair in the calculator')}</a></div>
    </li>`;
  }).join('');
  document.getElementById('couples').innerHTML = html;
  document.getElementById('plus').hidden = resultats.length <= limite;
}

calculer();
