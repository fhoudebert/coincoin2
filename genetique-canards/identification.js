/* Calculateur de croisements — canards coureurs indiens
 * identification.js : questions de la page « Identifier un canard » et
 * critères visibles de chaque variété.
 *
 * Trois questions se déduisent du génotype (donnees.js) : tout blanc, uni,
 * panaché. Les autres critères sont décrits ici, variété par variété.
 *
 * Valeur d'un critère :
 *   'oui'                    une seule réponse correspond ;
 *   ['oui', 'non']           plusieurs réponses acceptées (cas douteux) ;
 *   { M: ..., F: ... }       valeur différente pour le mâle et la cane ;
 *   absent                   critère inconnu : la variété n'est jamais écartée.
 * En cas de doute, mieux vaut accepter plusieurs réponses qu'écarter à tort.
 */
(function (g) {
  'use strict';

  const QUESTIONS = [
    { id: 'sexe', texte: 'Mâle ou cane ?',
      aide: 'Le mâle adulte a une petite plume recourbée sur le dessus de la queue. La cane cancane fort ; le mâle a une voix faible et voilée.',
      options: [['M', 'Mâle (canard)'], ['F', 'Cane']] },
    { id: 'blanc', texte: 'Plumage entièrement blanc, bec orange ?', auto: true,
      options: [['oui', 'Oui'], ['non', 'Non']] },
    { id: 'uni', texte: 'Plumage d’une seule couleur, sans dessin ?', auto: true,
      aide: 'Pas de plumes bordées ou tachetées, pas de tête de couleur différente du corps.',
      options: [['oui', 'Oui, uni'], ['non', 'Non, avec un dessin']] },
    { id: 'panache', texte: 'Grandes plages blanches nettes (cou, tour des yeux, ventre, ailes) ?', auto: true,
      aide: 'Le panaché des coureurs : bandeau blanc autour de l’œil, cou blanc, ventre et ailes en partie blancs.',
      options: [['oui', 'Oui'], ['non', 'Non']] },
    { id: 'teinte', texte: 'Couleur dominante du corps ?',
      options: [['noir', 'Noir à reflets verts'], ['bleu', 'Gris-bleu, ardoise'], ['brun', 'Brun foncé, marron'],
                ['tachete', 'Brun tacheté (camouflage)'], ['fauve', 'Fauve, beige, jaune'],
                ['gris', 'Gris perle (corps du mâle sauvage)'], ['clair', 'Crème ou presque blanc']] },
    { id: 'tete', texte: 'Couleur de la tête du mâle ?', sexe: 'M',
      options: [['verte', 'Vert brillant'], ['noire', 'Noire'], ['grisbleu', 'Gris-bleu'], ['brune', 'Brune, bronze'], ['blanche', 'Blanche']] },
    { id: 'collier', texte: 'Collier blanc à la base du cou ?', sexe: 'M',
      options: [['oui', 'Oui'], ['non', 'Non ou à peine']] },
    { id: 'oeil', texte: 'Trait sombre qui traverse l’œil (œil barré) ?', sexe: 'F',
      aide: 'Une bande plus foncée passe du bec à l’arrière de la tête, à travers l’œil. Les « dusky » (sauvage foncé) ne l’ont pas.',
      options: [['oui', 'Oui'], ['non', 'Non']] },
    { id: 'miroir', texte: 'Miroir de l’aile (plumes colorées au milieu de l’aile) ?',
      aide: 'Visible surtout quand l’aile est un peu ouverte.',
      options: [['bleu', 'Bleu-violet brillant'], ['grisbleu', 'Gris-bleu terne'], ['brun', 'Brun ou brun-gris'], ['absent', 'Pas de miroir distinct']] }
  ];

  const T = (M, F) => ({ M, F });

  const CRITERES = {
    'sauvage':           { teinte: T('gris', 'tachete'), tete: 'verte', collier: 'oui', oeil: 'oui', miroir: 'bleu' },
    'truite':            { teinte: T('gris', ['tachete', 'fauve']), tete: 'verte', collier: 'oui', oeil: 'oui', miroir: 'bleu' },
    'argente':           { teinte: 'clair', tete: 'verte', collier: 'oui', oeil: ['non', 'oui'], miroir: 'bleu' },
    'bleu-fauve-truite': { teinte: T(['clair', 'fauve'], 'fauve'), tete: 'grisbleu', collier: 'oui', oeil: ['oui', 'non'], miroir: 'grisbleu' },
    'jaune-pois':        { teinte: 'fauve', tete: 'brune', collier: 'oui', oeil: ['oui', 'non'], miroir: 'brun' },
    'noir':              { teinte: 'noir', tete: ['noire', 'verte'], collier: 'non', oeil: 'non', miroir: 'absent' },
    'bleu':              { teinte: 'bleu', tete: 'grisbleu', collier: 'non', oeil: 'non', miroir: 'absent' },
    'marron':            { teinte: 'brun', tete: 'brune', collier: 'non', oeil: 'non', miroir: 'absent' },
    'blanc':             { teinte: 'clair', tete: 'blanche', collier: 'non', oeil: 'non', miroir: 'absent' },
    'panache':           { teinte: ['brun', 'fauve'], tete: 'brune', oeil: 'non', miroir: 'brun' },
    'fauve':             { teinte: ['fauve', 'brun'], tete: 'brune', collier: ['oui', 'non'], oeil: 'non', miroir: 'brun' },
    'brun-fonce':        { teinte: 'brun', tete: 'brune', collier: 'non', oeil: 'non', miroir: 'brun' },
    'bleu-dusky':        { teinte: ['bleu', 'fauve'], tete: ['grisbleu', 'brune'], collier: ['oui', 'non'], oeil: 'non', miroir: ['grisbleu', 'brun'] },
    'abricot':           { teinte: ['fauve', 'clair'], tete: ['grisbleu', 'brune'], collier: ['oui', 'non'], oeil: 'non', miroir: ['grisbleu', 'brun'] },
    'truite-bleu':       { teinte: T(['gris', 'bleu'], ['fauve', 'tachete', 'bleu']), tete: 'grisbleu', collier: 'oui', oeil: 'oui', miroir: 'grisbleu' },
    'splash':            { teinte: 'clair', tete: 'grisbleu', collier: 'non', oeil: 'non', miroir: 'absent' },
    'lilas':             { teinte: ['bleu', 'brun'], tete: ['grisbleu', 'brune'], collier: 'non', oeil: 'non', miroir: 'absent' },
    'lavande':           { teinte: 'clair', tete: 'grisbleu', collier: 'non', oeil: 'non', miroir: 'absent' },
    'panache-americain': { teinte: ['fauve', 'clair'], tete: ['grisbleu', 'brune'], oeil: 'non', miroir: ['grisbleu', 'brun'] },
    'truite-dusky':      { teinte: T('gris', ['fauve', 'tachete']), tete: 'verte', collier: ['oui', 'non'], oeil: 'non', miroir: ['grisbleu', 'absent', 'bleu'] },
    'truite-lilas':      { teinte: 'fauve', tete: ['grisbleu', 'brune'], collier: 'oui', oeil: ['oui', 'non'], miroir: ['grisbleu', 'brun'] },
    'arlequin':          { teinte: 'clair', tete: 'verte', collier: 'oui', oeil: ['oui', 'non'], miroir: 'bleu' },
    'appleyard':         { teinte: T(['gris', 'clair'], ['fauve', 'clair']), tete: 'verte', collier: 'oui', oeil: 'oui', miroir: 'bleu' },
    'sauvage-blanc':     { teinte: T('gris', 'tachete'), tete: 'verte', miroir: 'bleu' },
    // Combinaisons dusky et intermédiaires (Dusky Feathers Waterfowl)
    'truite-brun':                   { teinte: T(['gris', 'fauve'], ['fauve', 'tachete']), tete: ['brune', 'verte'], collier: 'oui', oeil: 'oui', miroir: 'brun' },
    'intermediaire-bleu-brun':       { teinte: T(['clair', 'fauve'], ['fauve', 'tachete', 'clair']), tete: ['grisbleu', 'brune'], collier: 'oui', oeil: ['oui', 'non'], miroir: ['grisbleu', 'brun'] },
    'fonce-truite-bleu':             { teinte: T(['gris', 'bleu'], ['fauve', 'tachete', 'bleu']), tete: 'grisbleu', collier: ['oui', 'non'], oeil: 'non', miroir: ['grisbleu', 'absent'] },
    'fonce-intermediaire':           { teinte: T(['gris', 'clair'], ['tachete', 'fauve', 'clair']), tete: 'verte', collier: 'oui', oeil: 'non', miroir: ['bleu', 'grisbleu'] },
    'fonce-intermediaire-bleu':      { teinte: T(['gris', 'clair', 'bleu'], ['fauve', 'tachete', 'clair']), tete: ['grisbleu', 'verte'], collier: 'oui', oeil: 'non', miroir: ['grisbleu', 'bleu'] },
    'fonce-intermediaire-brun':      { teinte: T(['gris', 'clair', 'fauve'], ['fauve', 'tachete', 'clair']), tete: ['brune', 'verte'], collier: 'oui', oeil: 'non', miroir: ['brun', 'bleu'] },
    'fonce-intermediaire-bleu-brun': { teinte: T(['clair', 'fauve'], ['fauve', 'clair']), tete: ['grisbleu', 'brune'], collier: 'oui', oeil: 'non', miroir: ['grisbleu', 'brun'] }
  };

  // Valeurs acceptées pour un critère, selon le sexe ('' = inconnu).
  function valeurs(crit, sexe) {
    if (crit === undefined) return null;
    if (crit && !Array.isArray(crit) && typeof crit === 'object') {
      if (sexe) return valeurs(crit[sexe], sexe);
      return [].concat(valeurs(crit.M, 'M') || [], valeurs(crit.F, 'F') || []);
    }
    return [].concat(crit);
  }

  // Critères d'une variété : ceux déduits du génotype + ceux du tableau.
  function criteres(v, moteur, sexe) {
    const geno = moteur.lireGeno(v.geno, sexe || 'M');
    const nb = (l, a) => geno[l].filter(x => x === a).length;
    const blanc = nb('C', 'c') === 2;
    return Object.assign({
      blanc: blanc ? 'oui' : 'non',
      uni: blanc || nb('E', 'E') >= 1 ? 'oui' : 'non',
      panache: blanc ? 'non' : nb('R', 'R') === 2 ? 'oui' : 'non'
    }, CRITERES[v.id] || {});
  }

  // Liste des critères qui contredisent les réponses (vide = compatible).
  // Une question réservée à un sexe est ignorée si l'autre sexe est choisi.
  function contradictions(v, reponses, moteur) {
    const sexe = reponses.sexe || '';
    const crit = criteres(v, moteur, sexe);
    const res = [];
    for (const q of QUESTIONS) {
      const r = reponses[q.id];
      if (!r || q.id === 'sexe') continue;
      if (q.sexe && sexe && q.sexe !== sexe) continue;
      const ok = valeurs(crit[q.id], q.sexe || sexe);
      if (ok && !ok.includes(r)) res.push(q.id);
    }
    return res;
  }

  const ident = { QUESTIONS, CRITERES, valeurs, criteres, contradictions };
  g.IDENTIFICATION_CANARD = ident;
  if (typeof module !== 'undefined' && module.exports) module.exports = ident;
})(typeof globalThis !== 'undefined' ? globalThis : this);
