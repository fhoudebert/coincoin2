/* Calculateur de croisements — canards coureurs indiens
 * page-aide.js : tableaux de la page « Comprendre la génétique » (aide.html, en/aide.html).
 */
'use strict';
const M = window.MOTEUR_CANARD;
const { LOCI, VARIETES } = window.DONNEES_CANARD;

document.getElementById('table-loci').innerHTML =
  `<thead><tr><th>${tr('Gène', 'Gene')}</th><th>${tr('Allèles (du plus fort au plus faible)', 'Alleles (from strongest to weakest)')}</th><th>${tr('Effet', 'Effect')}</th></tr></thead><tbody>` +
  LOCI.map(l => `<tr><td>${esc(l.nom)} (${l.id})${l.z ? `<br><span class="note">${tr('lié au sexe', 'sex-linked')}</span>` : ''}${l.incomplet ? `<br><span class="note">${tr('dominance incomplète', 'incomplete dominance')}</span>` : ''}</td>
    <td>${l.alleles.map(fmtAllele).join(' &gt; ')}</td><td>${esc(l.aide)}</td></tr>`).join('') + '</tbody>';

// Page française : colonne « Anglais ». Page anglaise : colonne « French name ».
document.getElementById('table-varietes').innerHTML =
  `<thead><tr><th>${tr('Variété', 'Variety')}</th><th>${tr('Anglais', 'French name')}</th><th>${tr('Génotype (mâle / cane)', 'Genotype (drake / duck)')}</th><th>${tr('Remarque', 'Note')}</th></tr></thead><tbody>` +
  VARIETES.map(v => {
    const gm = M.lireGeno(v.geno, 'M'), gf = M.lireGeno(v.geno, 'F');
    const gtxt = fmtGeno(gm) === fmtGeno(gf) ? fmtGeno(gm) : fmtGeno(gm) + '<br>' + fmtGeno(gf);
    const rem = [v.homologuee ? tr('Homologuée en France.', 'French standard colour.') : '',
                 v.statut === 'verifier' ? tr('À confirmer.', 'To be confirmed.') : '', v.note || ''].filter(Boolean).join(' ');
    const autre = LANGUE === 'en' ? (v.nomFr || '') : (v.en || '');
    return `<tr><td>${esc(v.nom)}</td><td>${esc(autre)}</td><td>${gtxt}</td><td>${esc(rem)}</td></tr>`;
  }).join('') + '</tbody>';
