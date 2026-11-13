/* Calculateur de croisements — canards coureurs indiens
 * page-calculateur.js : page « Croiser » (index.html, en/index.html).
 */
'use strict';
const M = window.MOTEUR_CANARD;
const { LOCI, VARIETES } = window.DONNEES_CANARD;
const SEXES = { M: { titre: tr('Mâle', 'Drake'), enfants: tr('Fils', 'Sons') },
                F: { titre: tr('Cane', 'Duck'), enfants: tr('Filles', 'Daughters') } };
const STATUTS = { verifier: tr('Génotype à confirmer', 'Genotype to be confirmed') };
const MAX_LIGNES = 40;

const etat = {
  M: { variete: 'marron', geno: null, pourquoi: true },
  F: { variete: 'noir', geno: null, pourquoi: true }
};

function imageDe(v, sexe) {
  if (!v) return null;
  return v.img[sexe] || v.img[sexe === 'M' ? 'F' : 'M'] || null;
}
function photoHTML(v, sexe, classe) {
  const src = imageDe(v, sexe);
  if (src) return `<img class="${classe}" src="${esc(cheminImg(src))}" alt="${esc(v.nom)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${classe} photo-vide',textContent:'?'}))">`;
  return `<div class="${classe} photo-vide" aria-hidden="true">?</div>`;
}

/* ---------- options de génotype par locus ---------- */
function optionsLocus(l, sexe) {
  if (l.z && sexe === 'F') return l.alleles.map(a => [a]);
  const res = [];
  for (let i = 0; i < l.alleles.length; i++)
    for (let j = i; j < l.alleles.length; j++) res.push([l.alleles[i], l.alleles[j]]);
  return res;
}

/* ---------- parents ---------- */
function rendreParent(sexe) {
  const e = etat[sexe];
  const el = document.getElementById('parent-' + sexe);
  const ph = M.phenotype(e.geno, sexe);
  const vReconnue = M.varieteDe(e.geno, sexe);
  const vChoisie = VARIETES.find(v => v.id === e.variete) || null;
  const v = vChoisie || vReconnue;
  const opt = x => `<option value="${x.id}"${x.id === e.variete ? ' selected' : ''}>${esc(x.nom)}</option>`;
  const options = `<optgroup label="${tr('Homologuées en France', 'French standard colours')}">${VARIETES.filter(x => x.homologuee).map(opt).join('')}</optgroup>`
    + `<optgroup label="${tr('Autres couleurs', 'Other colours')}">${VARIETES.filter(x => !x.homologuee).map(opt).join('')}</optgroup>`;
  const lignesLoci = LOCI.map(l => {
    const cur = e.geno[l.id].join('/');
    const opts = optionsLocus(l, sexe).map(p => {
      const k = p.join('/');
      const txt = p.length === 1 ? p[0] + '/–' : k;
      return `<option value="${k}"${k === cur ? ' selected' : ''}>${esc(txt)}</option>`;
    }).join('');
    return `<span title="${esc(l.aide)}">${esc(l.nom)} (${l.id})</span>
            <select data-locus="${l.id}" aria-label="${esc(l.nom)}" title="${esc(l.aide)}">${opts}</select>`;
  }).join('');
  const statut = vChoisie && STATUTS[vChoisie.statut] ? `<div class="statut">${STATUTS[vChoisie.statut]}</div>` : '';
  const homol = (v && v.homologuee ? `<div class="geno">${tr('Couleur homologuée en France', 'Colour of the French standard')}</div>` : '')
    + (v ? `<div class="geno"><a href="origines.html?v=${encodeURIComponent(v.id)}">${tr('Quels parents donnent cette couleur ?', 'Which parents give this colour?')}</a></div>` : '');
  // Page française : nom anglais. Page anglaise : nom français et autres noms anglais.
  const autresNoms = !v ? '' : LANGUE === 'en'
    ? (v.nomFr ? `<div class="geno">French name: ${esc(v.nomFr)}</div>` : '')
      + (v.en && v.en !== v.nom ? `<div class="geno">Also called: ${esc(v.en)}</div>` : '')
    : (v.en ? `<div class="geno">En anglais : ${esc(v.en)}</div>` : '');
  const note = vChoisie && vChoisie.note ? `<div class="note-var">${esc(vChoisie.note)}</div>` : '';
  const explications = M.expliquer(e.geno, sexe).map(x =>
    `<li>${x.geno ? `<code>${fmtPaire(e.geno[x.locus])}</code> ` : ''}${esc(x.texte)}</li>`).join('');
  const porteurs = M.porteurs(e.geno);
  el.innerHTML = `
    <div class="parent-tete">
      ${photoHTML(v, sexe, 'photo')}
      <div>
        <h3>${SEXES[sexe].titre}</h3>
        <label class="choix" for="var-${sexe}">${tr('Variété', 'Variety')}</label>
        <select id="var-${sexe}">
          ${e.variete ? '' : `<option value="" selected>${tr('Génotype personnalisé', 'Custom genotype')}</option>`}
          ${options}
        </select>
      </div>
    </div>
    <div class="pheno">${esc(ph.nom)}</div>
    <div class="geno">${fmtGeno(e.geno)}${porteurs.length ? tr(' — porte ', ' — carries ') + porteurs.map(fmtAllele).join(', ') : ''}</div>
    ${!vChoisie && vReconnue ? `<div class="geno">${tr('Ressemble à : ', 'Looks like: ')}${esc(vReconnue.nom)}</div>` : ''}
    ${homol}
    ${autresNoms}
    ${statut}
    ${note}
    <details class="pourquoi"${e.pourquoi ? ' open' : ''}>
      <summary>${tr('Pourquoi cette couleur ?', 'Why this colour?')}</summary>
      <ul>${explications}</ul>
    </details>
    <details class="avance"${e.ouvert ? ' open' : ''}>
      <summary>${tr('Préciser le génotype', 'Set the genotype')}</summary>
      <div class="loci">${lignesLoci}</div>
    </details>`;

  el.querySelector('#var-' + sexe).addEventListener('change', ev => {
    if (!ev.target.value) return;
    choisirVariete(sexe, ev.target.value);
  });
  el.querySelector('details.avance').addEventListener('toggle', ev => { e.ouvert = ev.target.open; });
  el.querySelector('details.pourquoi').addEventListener('toggle', ev => { e.pourquoi = ev.target.open; });
  el.querySelectorAll('select[data-locus]').forEach(s => s.addEventListener('change', ev => {
    const loc = ev.target.dataset.locus;
    e.geno = Object.assign({}, e.geno, { [loc]: ev.target.value.split('/') });
    e.variete = '';
    rendreParent(sexe);
    rendreResultats();
    document.querySelector(`#parent-${sexe} select[data-locus="${loc}"]`).focus();
  }));
}

function choisirVariete(sexe, id) {
  const v = VARIETES.find(x => x.id === id);
  etat[sexe].variete = id;
  etat[sexe].geno = M.lireGeno(v.geno, sexe);
  rendreParent(sexe);
  rendreResultats();
}

function prendreCommeParent(sexe, geno) {
  etat[sexe].geno = geno;
  etat[sexe].variete = '';
  rendreParent(sexe);
  rendreResultats();
  document.getElementById('parent-' + sexe).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

/* ---------- résultats ---------- */
const genosAffiches = { M: [], F: [] };

function rendreResultats() {
  for (const sexe of ['M', 'F']) {
    const res = M.resultat(etat.M.geno, etat.F.geno, sexe);
    const el = document.getElementById('res-' + sexe);
    genosAffiches[sexe] = [];
    const items = res.map(gr => {
      const v = gr.variete;
      const lignes = gr.genotypes.slice(0, MAX_LIGNES).map(x => {
        const idx = genosAffiches[sexe].push(x.geno) - 1;
        return `<tr>
          <td class="n">${fmtPct(x.p)}</td>
          <td>${fmtGeno(x.geno)}</td>
          <td>${x.porteurs.length ? x.porteurs.map(fmtAllele).join(', ') : '—'}</td>
          <td><button class="prendre" data-sexe="${sexe}" data-idx="${idx}">${sexe === 'M' ? tr('Prendre comme mâle', 'Use as drake') : tr('Prendre comme cane', 'Use as duck')}</button></td>
        </tr>`;
      }).join('');
      const reste = gr.genotypes.length - MAX_LIGNES;
      const n = gr.genotypes.length;
      return `<li class="groupe">
        <div class="ligne">
          <div class="pct">${fmtPct(gr.p)}<span class="frac">${M.fraction(gr.p)}</span></div>
          <div>
            <span class="nom">${esc(gr.phenotype.nom)}</span>
            ${v ? `<span class="var">${tr('Variété', 'Variety:')} ${esc(v.nom)}</span>` : ''}
            <div class="barre"><i style="width:${(gr.p * 100).toFixed(2)}%"></i></div>
          </div>
          ${v && imageDe(v, sexe) ? photoHTML(v, sexe, 'vignette') : '<span></span>'}
        </div>
        <details>
          <summary>${n} ${tr('génotype', 'genotype')}${n > 1 ? 's' : ''}</summary>
          <table>
            <thead><tr><th>${tr('Part', 'Share')}</th><th>${tr('Génotype (gènes non sauvages)', 'Genotype (non-wild genes)')}</th><th>${tr('Porte', 'Carries')}</th><th></th></tr></thead>
            <tbody>${lignes}</tbody>
          </table>
          ${reste > 0 ? `<p class="note">${reste} ${tr('autres génotypes non affichés.', 'more genotypes not shown.')}</p>` : ''}
        </details>
      </li>`;
    }).join('');
    const nb = res.length;
    el.innerHTML = `<h2>${SEXES[sexe].enfants} <small>${nb} ${tr('couleur', 'colour')}${nb > 1 ? 's' : ''}</small></h2>
      <ol class="groupes">${items}</ol>`;
  }
}

document.querySelector('.resultats').addEventListener('click', ev => {
  const b = ev.target.closest('button.prendre');
  if (!b) return;
  prendreCommeParent(b.dataset.sexe, genosAffiches[b.dataset.sexe][+b.dataset.idx]);
});

/* ---------- table d'aide ---------- */
document.getElementById('table-loci').innerHTML =
  `<thead><tr><th>Locus</th><th>${tr('Allèles (du plus dominant au plus récessif)', 'Alleles (from most dominant to most recessive)')}</th><th>${tr('Effet', 'Effect')}</th></tr></thead><tbody>` +
  LOCI.map(l => `<tr><td>${esc(l.nom)} (${l.id})${l.z ? `<br><span class="note">${tr('lié au sexe', 'sex-linked')}</span>` : ''}</td>
    <td>${l.alleles.map(fmtAllele).join(' &gt; ')}</td><td>${esc(l.aide)}</td></tr>`).join('') + '</tbody>';

/* ---------- démarrage ---------- */
// index.html?M=noir&F=bleu : variétés choisies depuis la page d'identification.
try {
  const p = new URLSearchParams(location.search);
  for (const s of ['M', 'F']) if (VARIETES.some(v => v.id === p.get(s))) etat[s].variete = p.get(s);
} catch (e) { /* ignoré */ }
for (const s of ['M', 'F']) etat[s].geno = M.lireGeno(VARIETES.find(v => v.id === etat[s].variete).geno, s);
rendreParent('M');
rendreParent('F');
rendreResultats();
