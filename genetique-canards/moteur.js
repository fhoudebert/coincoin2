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
      return { nom: 'Blanc' + (huppe ? ', ' + huppe : ''), couleur: 'Blanc', marques: '', huppe,
               masques: 'tous les autres gènes de couleur' };
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
      masques = 'motif sauvage et phase (masqués par l’uni)';
      if (!brun) couleur = ['Noir', 'Bleu', 'Splash'][bl];
      else couleur = ['Marron (chocolat)', 'Lilas', 'Lavande'][bl];
      if (chamois) couleur += ' dilué chamois';
    } else {
      // Motif sauvage (M) : MR à dominance incomplète.
      const mr = nb(geno, 'M', 'MR');
      let motif;
      if (mr === 2) motif = 'Sauvage restreint';
      else if (mr === 1 && nb(geno, 'M', 'md') === 1) motif = 'Sauvage restreint foncé intermédiaire';
      else if (mr === 1) motif = 'Sauvage restreint intermédiaire';
      else if (nb(geno, 'M', 'M+') >= 1) motif = 'Sauvage';
      else motif = 'Sauvage foncé';
      // Phase (Li) : li à dominance incomplète sur lih.
      const li = nb(geno, 'Li', 'li');
      const lih = nb(geno, 'Li', 'lih');
      let phase = '';
      if (nb(geno, 'Li', 'Li+') >= 1) phase = '';
      else if (li === 2) phase = 'truité';
      else if (lih === 2) phase = 'argenté';
      else phase = 'intermédiaire truité-argenté';
      // lih/lih s'exprime de la même façon quel que soit M (Dusky Feathers) :
      // md/md porte le nom homologué « sauvage argenté », M+ celui d'arlequin.
      if (lih === 2 && mr === 0) {
        if (motif === 'Sauvage foncé') { motif = 'Sauvage'; }
        else { motif = 'Arlequin'; phase = ''; }
      }
      // Dilutions sur motif sauvage. Les combinaisons bleu + brun portent des
      // noms qui varient selon les auteurs (abricot, jaune pois, lilas…) :
      // le nom calculé reste descriptif, la variété donne le nom d'usage.
      let dil = ['', 'bleu', 'bleu-fauve'][bl];
      if (brun) dil = (dil ? dil + ' ' : '') + 'brun';
      if (chamois) dil = (dil ? dil + ' ' : '') + 'chamois';
      couleur = [motif, phase, dil].filter(Boolean).join(' ');
    }

    // Marques blanches. R à dominance incomplète.
    const r = nb(geno, 'R', 'R');
    const bavette = nb(geno, 'B', 'b') === 2 || (noir && !fonce);
    const marques = [];
    if (r === 2) marques.push(bavette ? 'panaché à bavette' : 'panaché');
    else {
      if (bavette) marques.push('bavette blanche');
      if (r === 1) marques.push('panaché partiel (collier blanc)');
    }
    const suffixe = marques.concat(huppe ? [huppe] : []);
    return { nom: couleur + (suffixe.length ? ', ' + suffixe.join(', ') : ''),
             couleur, marques: marques.join(', '), huppe, masques };
  }

  function huppeDe(geno) {
    const n = nb(geno, 'Cr', 'Cr');
    if (n === 2) return 'huppé Cr/Cr (malformations ou mort du caneton)';
    return n === 1 ? 'huppé' : '';
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
    const cache = blanc ? ' (caché par le blanc, mais transmis)' : '';
    const ajoute = (l, txt) => res.push({ locus: l, geno: k(l), texte: txt });

    if (blanc) ajoute('C', 'Blanc récessif en double : aucun pigment, le canard est blanc à bec orange. Tous les autres gènes sont cachés mais restent transmis aux canetons.');
    else if (n('C', 'c') === 1) ajoute('C', 'Porte le blanc caché : accouplé à un autre porteur, un quart des canetons seront blancs.');

    if (n('E', 'E') === 2) ajoute('E', 'Uni en double : tous ses canetons seront unis' + cache + '.');
    else if (uni) ajoute('E', 'Uni (une copie suffit) : la moitié de ses canetons recevront l’uni' + cache + '.');

    const masqueMLi = uni && !blanc ? ' — masqué par l’uni, mais transmis' : cache;
    const m = p('M').join('/');
    const textesM = {
      'MR/MR': 'Sauvage restreint (Appleyard) : zones blanches diffuses sur poitrine, tête et cou',
      'MR/M+': 'Restreint intermédiaire entre sauvage et Appleyard',
      'MR/md': 'Restreint intermédiaire entre dusky et Appleyard',
      'M+/md': 'Sauvage classique, porte le dusky (md)',
      'md/md': 'Sauvage foncé (dusky) : cane sans traits sur la tête, miroir sans reflets, collier du mâle réduit ou absent'
    };
    if (textesM[m]) ajoute('M', textesM[m] + masqueMLi + '.');

    const li = p('Li').join('/');
    const textesLi = {
      'Li+/li': 'Phase sombre, porte le truité (li)',
      'Li+/lih': 'Phase sombre, porte l’argenté (lih)',
      'li/li': 'Truité (phase claire) : le fond marron s’éclaircit en beige',
      'li/lih': 'Intermédiaire entre truité et argenté (« spotted »), ne se reproduit pas fidèlement',
      'lih/lih': 'Argenté (arlequin) : fond presque blanc sur la poitrine, crème sur le dos ; même aspect quel que soit le motif M, la différence ne se voit qu’à la descendance'
    };
    if (textesLi[li]) ajoute('Li', textesLi[li] + masqueMLi + '.');

    const bl = n('Bl', 'Bl');
    if (bl === 1) ajoute('Bl', 'Une dose de dilution bleue : ' + (uni ? 'le noir devient bleu ardoise' : 'parties sombres grisées, tête du mâle bleue, miroir gris-bleu sans reflets') + cache + '. La moitié de ses canetons recevront Bl.');
    if (bl === 2) ajoute('Bl', 'Deux doses de dilution bleue : ' + (uni ? 'splash (presque blanc, bec et pattes colorés)' : 'bleu-fauve, très éclairci') + cache + '. Tous ses canetons recevront au moins une dose.');

    const lieSexe = (l, a, nom) => {
      const x = n(l, a);
      if (sexe === 'F' && x === 1) ajoute(l, 'Dilution ' + nom + '. Une seule copie suffit chez la cane, le gène étant sur le chromosome Z' + cache + '. Tous ses fils la porteront ; ses filles ne la reçoivent pas d’elle.');
      if (sexe === 'M' && x === 2) ajoute(l, 'Dilution ' + nom + ' en double' + cache + '. Toutes ses filles seront diluées, tous ses fils au moins porteurs.');
      if (sexe === 'M' && x === 1) ajoute(l, 'Porte la dilution ' + nom + ' : la moitié de ses filles seront diluées, quelle que soit la cane.');
    };
    lieSexe('D', 'd', 'brune (chocolat ; miroir à reflets bronze)');
    lieSexe('Bu', 'bu', 'chamois (buff)');

    if (n('B', 'b') === 2) ajoute('B', 'Bavette blanche (récessive, en double)' + cache + '.');
    else if (n('B', 'b') === 1) ajoute('B', 'Porte la bavette blanche cachée.');
    if (uni && !blanc && n('M', 'md') < 2) ajoute('M', 'Uni sans md/md : bavette blanche probable selon le modèle kippenjungle.');

    if (n('R', 'R') === 2) ajoute('R', 'Panaché classique : blanc au cou, autour des yeux, au ventre et aux ailes' + cache + '.');
    else if (n('R', 'R') === 1) ajoute('R', 'Panaché partiel (une copie) : collier blanc et un peu de blanc aux ailes' + cache + '.');

    if (n('Cr', 'Cr') === 2) ajoute('Cr', 'Huppe en double : malformations du crâne ou mort du caneton.');
    else if (n('Cr', 'Cr') === 1) ajoute('Cr', 'Huppé. Ne pas l’accoupler à un autre huppé : un quart des canetons seraient Cr/Cr.');

    if (!res.length) res.push({ locus: '', geno: '', texte: 'Tous les gènes sont sauvages : c’est la couleur du canard colvert.' });
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

  const moteur = { LOCI, sauvage, lireGeno, ecrireGeno, normaliser, cle, croiser,
                   phenotype, porteurs, expliquer, varieteDe, resultat, fraction,
                   distribLocusId, chercherCroisements };
  g.MOTEUR_CANARD = moteur;
  if (typeof module !== 'undefined' && module.exports) module.exports = moteur;
})(typeof globalThis !== 'undefined' ? globalThis : this);
