/* Calculateur de croisements — canards coureurs indiens
 * moteur.js : croisements mendéliens (autosomes + chromosome Z) et
 * traduction génotype -> phénotype. Aucune dépendance.
 *
 * Un génotype est un objet { Locus: [allèle, allèle] }.
 * Chez la cane, les loci liés au Z n'ont qu'un allèle : { D: ['d'] }.
 * sexe : 'M' (mâle, ZZ) ou 'F' (cane, ZW).
 */
(function (g) {
  'use strict';
  const D = g.DONNEES_CANARD || (typeof require !== 'undefined' ? require('./donnees.js') : null);
  const LOCI = D.LOCI;
  const PAR_ID = Object.fromEntries(LOCI.map(l => [l.id, l]));

  /* ---------- langue ---------- */

  // Les noms de couleur calculés et les explications existent en français
  // (par défaut) et en anglais. Les groupes de résultats et la reconnaissance
  // des variétés se font sur le nom calculé : il doit rester unique dans
  // chaque langue (vérifié par tests.js).
  let langue = 'fr';
  const tr = (fr, en) => (langue === 'en' ? en : fr);
  const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1);
  function choisirLangue(l) {
    langue = l === 'en' ? 'en' : 'fr';
    for (const k of Object.keys(cacheVar)) delete cacheVar[k];
  }

  /* ---------- génotypes ---------- */

  function rang(locus, a) { return PAR_ID[locus].alleles.indexOf(a); }

  // Range les deux allèles du plus dominant au plus récessif.
  function normaliser(locus, paire) {
    return paire.slice().sort((a, b) => rang(locus, a) - rang(locus, b));
  }

  function sauvage(sexe) {
    const g = {};
    for (const l of LOCI) {
      const s = l.alleles.find(a => a.endsWith('+')) || l.alleles[0];
      g[l.id] = (l.z && sexe === 'F') ? [s] : [s, s];
    }
    return g;
  }

  // "M:md/md,D:d/d" -> génotype complet pour le sexe demandé.
  function lireGeno(texte, sexe) {
    const geno = sauvage(sexe);
    for (const part of (texte || '').split(',').map(s => s.trim()).filter(Boolean)) {
      const [loc, val] = part.split(':');
      const l = PAR_ID[loc];
      if (!l) throw new Error('Locus inconnu : ' + loc);
      const al = val.split('/');
      for (const a of al) if (a !== '-' && a !== '–' && rang(loc, a) < 0) throw new Error('Allèle inconnu : ' + a + ' (locus ' + loc + ')');
      geno[loc] = (l.z && sexe === 'F') ? [al[0]] : normaliser(loc, [al[0], al[1] ?? al[0]]);
    }
    return geno;
  }

  function ecrireGeno(geno, { seulementMutes = false } = {}) {
    const parts = [];
    for (const l of LOCI) {
      const p = geno[l.id];
      if (seulementMutes && p.every(a => a.endsWith('+'))) continue;
      parts.push(l.id + ':' + (p.length === 1 ? p[0] + '/–' : p.join('/')));
    }
    return parts.join(', ');
  }

  function cle(geno) { return LOCI.map(l => geno[l.id].join('/')).join(';'); }

  /* ---------- croisement ---------- */

  // Distribution des génotypes d'un locus chez les fils ou les filles.
  function distribLocus(l, pere, mere, sexe) {
    const res = new Map();
    const ajoute = (paire, p) => {
      const n = paire.length === 2 ? normaliser(l.id, paire) : paire;
      const k = n.join('/');
      const e = res.get(k);
      if (e) e.p += p; else res.set(k, { paire: n, p });
    };
    const gp = pere[l.id];
    const gm = mere[l.id];
    if (l.z) {
      // Le père transmet un de ses deux Z. La mère transmet son Z aux fils
      // et son W aux filles.
      for (const a of gp) {
        if (sexe === 'M') ajoute([a, gm[0]], 0.5);
        else ajoute([a], 0.5);
      }
    } else {
      for (const a of gp) for (const b of gm) ajoute([a, b], 0.25);
    }
    return [...res.values()];
  }

  // Renvoie [{ geno, p }] trié par probabilité décroissante.
  function croiser(pere, mere, sexe) {
    let acc = [{ geno: {}, p: 1 }];
    for (const l of LOCI) {
      const dl = distribLocus(l, pere, mere, sexe);
      const suiv = [];
      for (const x of acc) for (const y of dl) {
        suiv.push({ geno: Object.assign({}, x.geno, { [l.id]: y.paire }), p: x.p * y.p });
      }
      acc = suiv;
    }
    return acc.sort((a, b) => b.p - a.p);
  }

  /* ---------- phénotype ---------- */

  function nb(geno, locus, a) { return geno[locus].filter(x => x === a).length; }

  // Une copie suffit chez la cane pour les loci du Z.
  function exprimeRecessifZ(geno, locus, a, sexe) {
    return sexe === 'F' ? nb(geno, locus, a) === 1 : nb(geno, locus, a) === 2;
  }

  function phenotype(geno, sexe) {
    const huppe = huppeDe(geno);
    if (nb(geno, 'C', 'c') === 2) {
      const blanc = tr('Blanc', 'White');
      return { nom: blanc + (huppe ? ', ' + huppe : ''), couleur: blanc, marques: '', huppe,
               masques: tr('tous les autres gènes de couleur', 'all other colour genes') };
    }
    const brun = exprimeRecessifZ(geno, 'D', 'd', sexe);
    const chamois = exprimeRecessifZ(geno, 'Bu', 'bu', sexe);
    const bl = nb(geno, 'Bl', 'Bl');
    const noir = nb(geno, 'E', 'E') >= 1;
    const fonce = nb(geno, 'M', 'md') === 2;
    let couleur;
    let masques = '';

    if (noir) {
      // Uni : l'eumélanine couvre tout, M et Li ne s'expriment plus.
      masques = tr('motif sauvage et phase (masqués par l’uni)', 'pattern and phase (masked by extended black)');
      if (!brun) couleur = tr(['Noir', 'Bleu', 'Splash'], ['Black', 'Blue', 'Splash'])[bl];
      else couleur = tr(['Marron (chocolat)', 'Lilas', 'Lavande'], ['Chocolate', 'Lilac', 'Lavender'])[bl];
      if (chamois) couleur = tr(couleur + ' dilué chamois', 'Buff-diluted ' + couleur.toLowerCase());
    } else {
      // Motif sauvage (M) : MR à dominance incomplète.
      const mr = nb(geno, 'M', 'MR');
      let motif;
      if (mr === 2) motif = 'restreint';
      else if (mr === 1 && nb(geno, 'M', 'md') === 1) motif = 'restreint-fonce';
      else if (mr === 1) motif = 'restreint-inter';
      else if (nb(geno, 'M', 'M+') >= 1) motif = 'sauvage';
      else motif = 'fonce';
      // Phase (Li) : li à dominance incomplète sur lih.
      const li = nb(geno, 'Li', 'li');
      const lih = nb(geno, 'Li', 'lih');
      let phase = '';
      if (nb(geno, 'Li', 'Li+') >= 1) phase = '';
      else if (li === 2) phase = 'truite';
      else if (lih === 2) phase = 'argente';
      else phase = 'intermediaire';
      // lih/lih s'exprime de la même façon quel que soit M (Dusky Feathers) :
      // md/md porte le nom homologué « sauvage argenté », M+ celui d'arlequin.
      if (lih === 2 && mr === 0) {
        if (motif === 'fonce') motif = 'sauvage';
        else { motif = 'arlequin'; phase = ''; }
      }
      // Dilutions sur motif sauvage. Les combinaisons bleu + brun portent des
      // noms qui varient selon les auteurs (abricot, jaune pois, lilas…) :
      // le nom calculé reste descriptif, la variété donne le nom d'usage.
      if (langue === 'en') {
        // Anglais : dilutions, phase puis motif (« blue brown trout dusky »).
        // md/md lih/lih : « silver » (nom britannique du sauvage argenté).
        const motifs = { 'restreint': 'restricted mallard', 'restreint-fonce': 'intermediate restricted dusky',
                         'restreint-inter': 'intermediate restricted mallard', 'sauvage': 'mallard',
                         'fonce': 'dusky', 'arlequin': 'harlequin' };
        const phases = { truite: 'trout', argente: 'silver', intermediaire: 'spotted' };
        const mots = [['', 'blue', 'double-blue'][bl], brun ? 'brown' : '', chamois ? 'buff' : ''];
        const base = phase === 'argente' && motif === 'sauvage' ? 'silver'
          : [phases[phase] || '', motifs[motif]].filter(Boolean).join(' ');
        couleur = majuscule(mots.concat(base).filter(Boolean).join(' '));
      } else {
        const motifs = { 'restreint': 'Sauvage restreint', 'restreint-fonce': 'Sauvage restreint foncé intermédiaire',
                         'restreint-inter': 'Sauvage restreint intermédiaire', 'sauvage': 'Sauvage',
                         'fonce': 'Sauvage foncé', 'arlequin': 'Arlequin' };
        const phases = { truite: 'truité', argente: 'argenté', intermediaire: 'intermédiaire truité-argenté' };
        let dil = ['', 'bleu', 'bleu-fauve'][bl];
        if (brun) dil = (dil ? dil + ' ' : '') + 'brun';
        if (chamois) dil = (dil ? dil + ' ' : '') + 'chamois';
        couleur = [motifs[motif], phases[phase] || '', dil].filter(Boolean).join(' ');
      }
    }

    // Marques blanches. R à dominance incomplète.
    const r = nb(geno, 'R', 'R');
    const bavette = nb(geno, 'B', 'b') === 2 || (noir && !fonce);
    const marques = [];
    if (r === 2) marques.push(bavette ? tr('panaché à bavette', 'pied with bib') : tr('panaché', 'pied'));
    else {
      if (bavette) marques.push(tr('bavette blanche', 'white bib'));
      if (r === 1) marques.push(tr('panaché partiel (collier blanc)', 'partial pied (white collar)'));
    }
    const suffixe = marques.concat(huppe ? [huppe] : []);
    return { nom: couleur + (suffixe.length ? ', ' + suffixe.join(', ') : ''),
             couleur, marques: marques.join(', '), huppe, masques };
  }

  function huppeDe(geno) {
    const n = nb(geno, 'Cr', 'Cr');
    if (n === 2) return tr('huppé Cr/Cr (malformations ou mort du caneton)', 'crested Cr/Cr (skull deformities or duckling death)');
    return n === 1 ? tr('huppé', 'crested') : '';
  }

  // Allèles récessifs portés sans être exprimés (hétérozygotes).
  function porteurs(geno) {
    const res = [];
    for (const l of LOCI) {
      if (l.incomplet) continue;
      const p = geno[l.id];
      if (p.length < 2 || p[0] === p[1]) continue;
      // p est normalisé : p[1] est le plus récessif des deux.
      if (p[1].endsWith('+')) continue;          // allèle sauvage : sans intérêt
      if (l.id === 'Li' && p[0] === 'li') continue; // li/lih : intermédiaire visible
      res.push(p[1]);
    }
    return res;
  }


  /* ---------- explications pour débutant ---------- */

  // Une phrase par gène qui diffère du sauvage, ou qui est masqué.
  function expliquer(geno, sexe) {
    const res = [];
    const p = l => geno[l];
    const k = l => p(l).join('/') + (p(l).length === 1 ? '/–' : '');
    const n = (l, a) => nb(geno, l, a);
    const blanc = n('C', 'c') === 2;
    const uni = n('E', 'E') >= 1;
    const cache = blanc ? tr(' (caché par le blanc, mais transmis)', ' (hidden by the white, but passed on)') : '';
    const ajoute = (l, txt) => res.push({ locus: l, geno: k(l), texte: txt });

    if (blanc) ajoute('C', tr('Blanc récessif en double : aucun pigment, le canard est blanc à bec orange. Tous les autres gènes sont cachés mais restent transmis aux canetons.',
                              'Two copies of recessive white: no pigment, the duck is white with an orange bill. All other genes are hidden but still passed on to the ducklings.'));
    else if (n('C', 'c') === 1) ajoute('C', tr('Porte le blanc caché : accouplé à un autre porteur, un quart des canetons seront blancs.',
                                               'Carries hidden white: mated to another carrier, a quarter of the ducklings will be white.'));

    if (n('E', 'E') === 2) ajoute('E', tr('Uni en double : tous ses canetons seront unis', 'Two copies of extended black: all its ducklings will be self-coloured') + cache + '.');
    else if (uni) ajoute('E', tr('Uni (une copie suffit) : la moitié de ses canetons recevront l’uni', 'Extended black (one copy is enough): half of its ducklings will inherit it') + cache + '.');

    const masqueMLi = uni && !blanc ? tr(' — masqué par l’uni, mais transmis', ' — masked by extended black, but passed on') : cache;
    const m = p('M').join('/');
    const textesM = tr({
      'MR/MR': 'Sauvage restreint (Appleyard) : zones blanches diffuses sur poitrine, tête et cou',
      'MR/M+': 'Restreint intermédiaire entre sauvage et Appleyard',
      'MR/md': 'Restreint intermédiaire entre dusky et Appleyard',
      'M+/md': 'Sauvage classique, porte le dusky (md)',
      'md/md': 'Sauvage foncé (dusky) : cane sans traits sur la tête, miroir sans reflets, collier du mâle réduit ou absent'
    }, {
      'MR/MR': 'Restricted mallard (Appleyard): diffuse light areas on breast, head and neck',
      'MR/M+': 'Restricted, intermediate between mallard and Appleyard',
      'MR/md': 'Restricted, intermediate between dusky and Appleyard',
      'M+/md': 'Ordinary mallard pattern, carries dusky (md)',
      'md/md': 'Dusky: duck without eye stripes, speculum without sheen, drake’s collar reduced or absent'
    });
    if (textesM[m]) ajoute('M', textesM[m] + masqueMLi + '.');

    const li = p('Li').join('/');
    const textesLi = tr({
      'Li+/li': 'Phase sombre, porte le truité (li)',
      'Li+/lih': 'Phase sombre, porte l’argenté (lih)',
      'li/li': 'Truité (phase claire) : le fond marron s’éclaircit en beige',
      'li/lih': 'Intermédiaire entre truité et argenté (« spotted »), ne se reproduit pas fidèlement',
      'lih/lih': 'Argenté (arlequin) : fond presque blanc sur la poitrine, crème sur le dos ; même aspect quel que soit le motif M, la différence ne se voit qu’à la descendance'
    }, {
      'Li+/li': 'Dark phase, carries trout (li)',
      'Li+/lih': 'Dark phase, carries silver (lih)',
      'li/li': 'Trout (light phase): the brown ground colour lightens to beige',
      'li/lih': 'Intermediate between trout and silver (“spotted”), does not breed true',
      'lih/lih': 'Silver (harlequin): almost white ground on the breast, cream on the back; looks the same whatever the M pattern, the difference only shows in the offspring'
    });
    if (textesLi[li]) ajoute('Li', textesLi[li] + masqueMLi + '.');

    const bl = n('Bl', 'Bl');
    if (bl === 1) ajoute('Bl', tr('Une dose de dilution bleue : ', 'One dose of blue dilution: ')
      + (uni ? tr('le noir devient bleu ardoise', 'black becomes slate blue')
             : tr('parties sombres grisées, tête du mâle bleue, miroir gris-bleu sans reflets', 'dark areas greyed, drake’s head blue, speculum grey-blue without sheen'))
      + cache + tr('. La moitié de ses canetons recevront Bl.', '. Half of its ducklings will inherit Bl.'));
    if (bl === 2) ajoute('Bl', tr('Deux doses de dilution bleue : ', 'Two doses of blue dilution: ')
      + (uni ? tr('splash (presque blanc, bec et pattes colorés)', 'splash (almost white, coloured bill and legs)')
             : tr('bleu-fauve, très éclairci', 'very pale, fawn-blue (apricot)'))
      + cache + tr('. Tous ses canetons recevront au moins une dose.', '. All its ducklings will inherit at least one dose.'));

    const lieSexe = (l, a, nom) => {
      const x = n(l, a);
      if (sexe === 'F' && x === 1) ajoute(l, tr('Dilution ' + nom + '. Une seule copie suffit chez la cane, le gène étant sur le chromosome Z' + cache + '. Tous ses fils la porteront ; ses filles ne la reçoivent pas d’elle.',
                                               majuscule(nom) + '. One copy is enough in a duck, as the gene is on the Z chromosome' + cache + '. All her sons will carry it; her daughters do not get it from her.'));
      if (sexe === 'M' && x === 2) ajoute(l, tr('Dilution ' + nom + ' en double' + cache + '. Toutes ses filles seront diluées, tous ses fils au moins porteurs.',
                                               'Two copies of ' + nom + cache + '. All his daughters will be diluted, all his sons at least carriers.'));
      if (sexe === 'M' && x === 1) ajoute(l, tr('Porte la dilution ' + nom + ' : la moitié de ses filles seront diluées, quelle que soit la cane.',
                                               'Carries ' + nom + ': half of his daughters will be diluted, whatever the duck.'));
    };
    lieSexe('D', 'd', tr('brune (chocolat ; miroir à reflets bronze)', 'brown dilution (chocolate; bronze-sheened speculum)'));
    lieSexe('Bu', 'bu', tr('chamois (buff)', 'buff dilution'));

    if (n('B', 'b') === 2) ajoute('B', tr('Bavette blanche (récessive, en double)', 'White bib (recessive, two copies)') + cache + '.');
    else if (n('B', 'b') === 1) ajoute('B', tr('Porte la bavette blanche cachée.', 'Carries a hidden white bib.'));
    if (uni && !blanc && n('M', 'md') < 2) ajoute('M', tr('Uni sans md/md : bavette blanche probable selon le modèle kippenjungle.',
                                                         'Extended black without md/md: white bib likely according to the kippenjungle model.'));

    if (n('R', 'R') === 2) ajoute('R', tr('Panaché classique : blanc au cou, autour des yeux, au ventre et aux ailes', 'Runner pied: white on the neck, around the eyes, on the belly and wings') + cache + '.');
    else if (n('R', 'R') === 1) ajoute('R', tr('Panaché partiel (une copie) : collier blanc et un peu de blanc aux ailes', 'Partial pied (one copy): white collar and a little white on the wings') + cache + '.');

    if (n('Cr', 'Cr') === 2) ajoute('Cr', tr('Huppe en double : malformations du crâne ou mort du caneton.', 'Two copies of crest: skull deformities or death of the duckling.'));
    else if (n('Cr', 'Cr') === 1) ajoute('Cr', tr('Huppé. Ne pas l’accoupler à un autre huppé : un quart des canetons seraient Cr/Cr.', 'Crested. Do not mate it to another crested bird: a quarter of the ducklings would be Cr/Cr.'));

    if (!res.length) res.push({ locus: '', geno: '', texte: tr('Tous les gènes sont sauvages : c’est la couleur du canard colvert.', 'All genes are wild type: this is the colour of the wild mallard.') });
    return res;
  }


  /* ---------- variétés ---------- */

  const cacheVar = {};
  function varieteDe(geno, sexe) {
    const nom = phenotype(geno, sexe).nom;
    if (!cacheVar[sexe]) {
      cacheVar[sexe] = new Map();
      for (const v of D.VARIETES) {
        const n = phenotype(lireGeno(v.geno, sexe), sexe).nom;
        if (!cacheVar[sexe].has(n)) cacheVar[sexe].set(n, v);
      }
    }
    return cacheVar[sexe].get(nom) || null;
  }

  // Résultat complet pour un sexe : groupes de même phénotype.
  function resultat(pere, mere, sexe) {
    const groupes = new Map();
    for (const { geno, p } of croiser(pere, mere, sexe)) {
      const ph = phenotype(geno, sexe);
      let gr = groupes.get(ph.nom);
      if (!gr) {
        gr = { phenotype: ph, variete: varieteDe(geno, sexe), p: 0, genotypes: [] };
        groupes.set(ph.nom, gr);
      }
      gr.p += p;
      gr.genotypes.push({ geno, p, porteurs: porteurs(geno) });
    }
    return [...groupes.values()].sort((a, b) => b.p - a.p || a.phenotype.nom.localeCompare(b.phenotype.nom));
  }

  // 0.1875 -> "3/16"
  function fraction(p) {
    for (let den = 1; den <= 1 << 20; den *= 2) {
      const num = p * den;
      if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num) + '/' + den;
    }
    return '';
  }


  /* ---------- recherche des croisements qui donnent une variété ---------- */

  // Distribution d'un locus chez les fils ou les filles, par identifiant.
  function distribLocusId(id, pere, mere, sexe) {
    return distribLocus(PAR_ID[id], pere, mere, sexe);
  }

  // Parmi les couples de variétés (mâle × cane), ceux qui donnent la couleur
  // de la variété cible. Les parents sont pris avec le génotype type de leur
  // variété. Renvoie [{ pere, mere, p: { M, F }, score }] trié par score.
  function chercherCroisements(cible, parents, sexes) {
    sexes = sexes && sexes.length ? sexes : ['M', 'F'];
    const nomCible = {};
    for (const s of sexes) nomCible[s] = phenotype(lireGeno(cible.geno, s), s).nom;
    const genos = parents.map(v => ({ v, M: lireGeno(v.geno, 'M'), F: lireGeno(v.geno, 'F') }));
    const res = [];
    for (const pe of genos) for (const me of genos) {
      const p = {};
      let total = 0;
      for (const s of sexes) {
        p[s] = 0;
        for (const x of croiser(pe.M, me.F, s)) if (phenotype(x.geno, s).nom === nomCible[s]) p[s] += x.p;
        total += p[s];
      }
      if (total > 1e-12) res.push({ pere: pe.v, mere: me.v, p, score: total / sexes.length });
    }
    // À probabilité égale : parents homologués d'abord, puis couple de même variété.
    const bonus = r => (r.pere.homologuee ? 2 : 0) + (r.mere.homologuee ? 2 : 0) + (r.pere === r.mere ? 1 : 0);
    return res.sort((a, b) => b.score - a.score || bonus(b) - bonus(a) ||
                    a.pere.nom.localeCompare(b.pere.nom) || a.mere.nom.localeCompare(b.mere.nom));
  }

  const moteur = { LOCI, choisirLangue, langue: () => langue, sauvage, lireGeno, ecrireGeno, normaliser, cle, croiser,
                   phenotype, porteurs, expliquer, varieteDe, resultat, fraction,
                   distribLocusId, chercherCroisements };
  g.MOTEUR_CANARD = moteur;
  if (typeof module !== 'undefined' && module.exports) module.exports = moteur;
})(typeof globalThis !== 'undefined' ? globalThis : this);
