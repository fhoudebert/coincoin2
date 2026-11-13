/* Calculateur de croisements — canards coureurs indiens
 * commun.js : langue de la page et fonctions d'affichage communes.
 *
 * La langue vient de <html lang="..."> : les pages françaises sont à la
 * racine, les pages anglaises dans en/ (mêmes noms de fichiers), qui
 * chargent les scripts et les images depuis le dossier parent.
 * tr('texte français', 'English text') choisit le texte de la page.
 */
'use strict';
const LANGUE = document.documentElement.lang === 'en' ? 'en' : 'fr';
const RACINE = LANGUE === 'en' ? '../' : '';
const tr = (fr, en) => (LANGUE === 'en' ? en : fr);

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function fmtAllele(a) {
  if (a === '–' || a === '-') return '–';
  if (a.endsWith('+')) return a.slice(0, -1) + '<sup>+</sup>';
  if (a === 'MR') return 'M<sup>R</sup>';
  if (a === 'md') return 'm<sup>d</sup>';
  if (a === 'lih') return 'li<sup>h</sup>';
  return a;
}
function fmtPaire(p) { return p.length === 1 ? fmtAllele(p[0]) + '/–' : p.map(fmtAllele).join('/'); }
function fmtGeno(geno) {
  const parts = window.DONNEES_CANARD.LOCI.filter(l => !geno[l.id].every(a => a.endsWith('+')))
    .map(l => fmtPaire(geno[l.id]));
  return parts.length ? parts.join(', ') : tr('tout sauvage', 'all wild type');
}
// 0.125 -> « 12,5 % » en français, « 12.5% » en anglais.
function fmtPct(p) {
  const v = p * 100;
  const t = Number.isInteger(v) ? String(v) : v.toFixed(v < 1 ? 2 : 1);
  return tr(t.replace('.', ',') + ' %', t + '%');
}
// Chemin d'une photo de img/, depuis la page courante.
function cheminImg(src) { return RACINE + 'img/' + src; }

// Le lien vers l'autre langue garde la variété ou le couple affiché.
document.addEventListener('click', ev => {
  const a = ev.target.closest && ev.target.closest('a[data-langue]');
  if (a && location.search) a.href = a.getAttribute('href').split('?')[0] + location.search;
});
