/* Calculateur de croisements — canards coureurs indiens
 * page-identifier.js : page « Identifier un canard » (identifier.html, en/identifier.html).
 */
'use strict';
const M = window.MOTEUR_CANARD;
const { VARIETES } = window.DONNEES_CANARD;
const I = window.IDENTIFICATION_CANARD;
const rep = {};

const nomQ = Object.fromEntries(I.QUESTIONS.map(q => [q.id, q]));

/* ---------- questions ---------- */
const form = document.getElementById('questions');
form.innerHTML = I.QUESTIONS.map(q => `
  <fieldset data-q="${q.id}">
    <legend>${esc(q.texte)}${q.sexe ? ` <span class="q-auto">(${q.sexe === 'M' ? tr('mâle', 'drake') : tr('cane', 'duck')})</span>` : ''}</legend>
    ${q.aide ? `<p class="q-aide">${esc(q.aide)}</p>` : ''}
    <div class="choix-q">
      <label><input type="radio" name="${q.id}" value="" checked><span class="passe">${tr('Je ne sais pas', 'Don’t know')}</span></label>
      ${q.options.map(([v, t]) => `<label><input type="radio" name="${q.id}" value="${v}"><span>${esc(t)}</span></label>`).join('')}
    </div>
  </fieldset>`).join('') +
  `<div class="actions"><button type="reset" class="btn">${tr('Tout effacer', 'Clear all')}</button></div>`;

form.addEventListener('change', ev => {
  if (ev.target.name) { rep[ev.target.name] = ev.target.value; maj(); }
});
form.addEventListener('reset', () => setTimeout(() => {
  for (const k of Object.keys(rep)) delete rep[k];
  maj();
}));

/* ---------- résultats ---------- */
function carte(v, ecarts) {
  const s = rep.sexe;
  const sexes = s ? [s] : ['M', 'F'];
  const imgs = sexes.map(x => v.img[x] || v.img[x === 'M' ? 'F' : 'M']).filter(Boolean);
  const uniques = [...new Set(imgs)];
  const htmlImgs = uniques.map((src, i) =>
    `<img src="${esc(cheminImg(src))}" alt="${esc(v.nom)}${uniques.length > 1 ? (i ? tr(', cane', ', duck') : tr(', mâle', ', drake')) : ''}" loading="lazy">`).join('');
  const lien = x => `<a href="index.html?${x}=${encodeURIComponent(v.id)}">${x === 'M' ? tr('Comme mâle au calculateur', 'As drake in the calculator') : tr('Comme cane au calculateur', 'As duck in the calculator')}</a>`;
  // Sous le nom : le nom anglais (page française) ou le nom français (page anglaise).
  const autreNom = LANGUE === 'en' ? (v.nomFr ? 'French: ' + v.nomFr : '') : v.en;
  const sansQuestion = q => nomQ[q].texte.replace(/ ?\?$/, '');
  return `<li class="carte">
    <div class="imgs${uniques.length > 1 ? ' deux' : ''}">${htmlImgs}</div>
    <h3>${esc(v.nom)}</h3>
    ${autreNom ? `<span class="en">${esc(autreNom)}</span>` : ''}
    ${v.homologuee ? `<span class="hom">${tr('Homologuée en France', 'French standard colour')}</span>` : ''}
    ${ecarts.length ? `<span class="ecart">${tr('Diffère sur : ', 'Differs on: ')}${ecarts.map(q => esc(LANGUE === 'en' ? sansQuestion(q) : sansQuestion(q).toLowerCase())).join(' ; ')}</span>` : ''}
    <div class="liens">${sexes.map(lien).join('')}<a href="origines.html?v=${encodeURIComponent(v.id)}">${tr('Quels parents ?', 'Which parents?')}</a></div>
  </li>`;
}

function maj() {
  // Questions réservées à l'autre sexe : grisées.
  document.querySelectorAll('fieldset[data-q]').forEach(f => {
    const q = nomQ[f.dataset.q];
    f.classList.toggle('inutile', !!(q.sexe && rep.sexe && q.sexe !== rep.sexe));
  });
  const classees = VARIETES.map(v => ({ v, ecarts: I.contradictions(v, rep, M) }));
  const ok = classees.filter(x => !x.ecarts.length);
  const presque = classees.filter(x => x.ecarts.length === 1);
  const nbRep = Object.values(rep).filter(Boolean).length;
  const el = document.getElementById('resultats');
  let titre;
  if (!nbRep) titre = `${VARIETES.length} ${tr('variétés', 'varieties')}`;
  else if (ok.length === 1) titre = tr('Une seule variété correspond', 'Only one variety matches');
  else if (ok.length) titre = `${ok.length} ${tr('variétés correspondent', 'varieties match')}`;
  else titre = tr('Aucune variété ne correspond à toutes les réponses', 'No variety matches all the answers');
  const aideTxt = !nbRep ? tr('Commencez par les questions faciles : sexe, blanc, uni, panaché.', 'Start with the easy questions: sex, white, self-coloured, pied.')
    : ok.length ? tr('Les réponses incertaines peuvent être laissées sur « Je ne sais pas ».', 'Uncertain answers can be left on “Don’t know”.')
    : tr('Vérifiez une réponse douteuse, ou regardez les variétés proches ci-dessous. Un croisement peut aussi donner une couleur hors liste.',
         'Check a doubtful answer, or look at the close varieties below. A cross can also give a colour that is not in the list.');
  const n = presque.length;
  el.innerHTML = `<p class="compte">${titre}</p><p class="compte-aide">${aideTxt}</p>
    <ul class="cartes">${ok.map(x => carte(x.v, [])).join('')}</ul>
    ${nbRep && n ? `<details class="presque"${ok.length ? '' : ' open'}>
      <summary>${n} ${n > 1 ? tr('variétés', 'varieties') : tr('variété', 'variety')} ${tr('à une réponse près', 'off by one answer')}</summary>
      <ul class="cartes">${presque.map(x => carte(x.v, x.ecarts)).join('')}</ul></details>` : ''}`;
}
maj();
