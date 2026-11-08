/* Calculateur de croisements — canards coureurs indiens
 * donnees.js : loci, allèles et variétés de référence.
 *
 * Pour ajouter une variété : ajouter une entrée à VARIETES.
 * Le génotype ne liste que les loci qui diffèrent du sauvage (colvert),
 * au format "Locus:allèle/allèle", séparés par des virgules.
 * Pour les loci liés au sexe (D, Bu), écrire le génotype du mâle :
 * la cane reçoit automatiquement le premier allèle (ex. "D:d/d" -> cane d/–).
 *
 * Sources des génotypes : Ashton, « Colour Breeding in Domestic Ducks » ;
 * standards de l'Indian Runner Duck Club (runnerduck.net) ; synthèse
 * francophones de Plumes de Pyrène et du Domaine des Bardons (couleurs
 * homologuées en France) ; Dusky Feathers Waterfowl (duskyfeatherswaterfowl.com)
 * pour les combinaisons dusky et intermédiaires.
 * Photos des couleurs homologuées : Laufenten SV (laufenten-sv.de), usage privé.
 */
(function (g) {
  'use strict';

  // Allèles rangés du plus dominant au plus récessif.
  // incomplet: true -> l'hétérozygote est visible (effet de dose).
  // z: true -> porté par le chromosome Z (une seule copie chez la cane).
  const LOCI = [
    { id: 'M',  nom: 'Motif sauvage',     alleles: ['MR', 'M+', 'md'],
      aide: 'MR sauvage restreint (Appleyard), éclaircit surtout les couvertures des ailes ; dominance incomplète : MR/M+ et MR/md sont intermédiaires. M+ sauvage > md sauvage foncé (dusky, récessif) : sans traits sur la tête, miroir sans reflets, collier réduit.' },
    { id: 'Li', nom: 'Phase',             alleles: ['Li+', 'li', 'lih'],
      aide: 'Li+ phase sombre > li phase claire (truité) > lih argenté (arlequin). li/lih donne un intermédiaire entre truité et argenté.' },
    { id: 'E',  nom: 'Uni (noir étendu)', alleles: ['E', 'e+'],
      aide: 'E dominant : plumage uni, masque le motif sauvage et la phase. Restent parfois un crayonné (plumes dessinées sur l’aile ou la gorge) et des taches « calico ».' },
    { id: 'Bl', nom: 'Dilution bleue',    alleles: ['Bl', 'bl+'], incomplet: true,
      aide: 'Effet de dose. Sur uni : Bl/bl+ bleu, Bl/Bl splash. Sur sauvage : Bl/bl+ bleu, Bl/Bl bleu-fauve.' },
    { id: 'C',  nom: 'Blanc récessif',    alleles: ['C+', 'c'],
      aide: 'c/c donne un canard blanc (bec et pattes orange) qui masque tous les autres gènes. Une plume colorée peut apparaître (« fuite » de pigment). Canetons jaunes dès l’éclosion.' },
    { id: 'B',  nom: 'Bavette récessive', alleles: ['B+', 'b'],
      aide: 'b/b donne une bavette blanche sur la poitrine.' },
    { id: 'R',  nom: 'Panaché',           alleles: ['R', 'r+'], incomplet: true,
      aide: 'Dominance incomplète : R/R panaché classique, R/r+ panaché partiel (collier et un peu de blanc aux ailes).' },
    { id: 'D',  nom: 'Dilution brune',    alleles: ['D+', 'd'], z: true,
      aide: 'Liée au sexe. d rend l’eumélanine marron. Une cane d/– est diluée ; un mâle doit être d/d. Avec Bl : lilas, lavande, abricot, jaune pois.' },
    { id: 'Bu', nom: 'Dilution chamois',  alleles: ['Bu+', 'bu'], z: true,
      aide: 'Liée au sexe. bu dilue en chamois (buff). Une cane bu/– est chamois ; un mâle doit être bu/bu.' },
    { id: 'Cr', nom: 'Huppe',             alleles: ['Cr', 'cr+'],
      aide: 'Cr dominant : huppe (pompon). Cr/Cr provoque malformations du crâne ou mort du caneton : ne pas accoupler deux huppés.' }
  ];

  // homologuee : couleur homologuée en France pour le coureur indien.
  // en : nom anglais (IRDC) quand il existe ; note : explication courte affichée.
  // statut : 'ok' (génotype documenté), 'verifier' (à confirmer, sources divergentes).
  // img : photo par sexe dans img/ ; si une seule est fournie, elle sert aux deux.
  // Les images « Photo à faire » se remplacent en gardant le même nom de fichier
  // (liste : python3 outils/photos_a_faire.py).
  const VARIETES = [
    // --- Homologuées en France ---
    { id: 'sauvage', nom: 'Sauvage (colvert)', en: 'Mallard', geno: '', homologuee: true,
      img: { M: 'colvert-canard.jpg', F: 'colvert-cane.jpg' }, statut: 'ok' },
    { id: 'truite', nom: 'Truité', en: 'Trout', geno: 'Li:li/li', homologuee: true,
      note: 'Un canard M+/md li/li ressemble exactement au truité pur : il peut cacher le dusky.',
      img: { M: 'truite-canard.jpg', F: 'truite-cane.jpg' }, statut: 'ok' },
    { id: 'argente', nom: 'Sauvage argenté', en: 'Silver (UK), harlequin, snowy', geno: 'M:md/md,Li:lih/lih', homologuee: true,
      img: { M: 'argente-canard.jpg', F: 'argente-cane.jpg' }, statut: 'ok' },
    { id: 'bleu-fauve-truite', nom: 'Bleu-fauve truité (apricot trout)', en: 'Apricot trout', geno: 'Li:li/li,Bl:Bl/Bl', homologuee: true,
      img: { M: 'bleu-fauve-truite-canard.jpg', F: 'bleu-fauve-truite-cane.jpg' }, statut: 'ok' },
    { id: 'jaune-pois', nom: 'Jaune pois', en: '', geno: 'Li:li/li,Bl:Bl/Bl,D:d/d', homologuee: true,
      note: 'Bleu-fauve truité + dilution brune. Couleur liée au sexe par d : un mâle jaune pois et une cane bleu-fauve truité donnent des filles jaune pois et des fils bleu-fauve truité porteurs.',
      img: { M: 'jaune-pois-canard.jpg', F: 'jaune-pois-cane.jpg' }, statut: 'ok' },
    { id: 'noir', nom: 'Noir uni', en: 'Black', geno: 'M:md/md,E:E/E', homologuee: true,
      img: { M: 'noir-canard.jpg', F: 'noir-cane.jpg' }, statut: 'ok' },
    { id: 'bleu', nom: 'Bleu uni (Cumberland blue)', en: 'Blue (Cumberland blue)', geno: 'M:md/md,E:E/E,Bl:Bl/bl+', homologuee: true,
      img: { M: 'bleu-canard.jpg', F: 'bleu-cane.jpg' }, statut: 'ok' },
    { id: 'marron', nom: 'Marron uni (chocolat)', en: 'Chocolate', geno: 'M:md/md,E:E/E,D:d/d', homologuee: true,
      img: { M: 'chocolat-canard.jpg', F: 'chocolat-cane.jpg' }, statut: 'ok' },
    { id: 'blanc', nom: 'Blanc', en: 'White', geno: 'C:c/c', homologuee: true,
      img: { M: 'blanc-canard.jpg', F: 'blanc-cane.jpg' }, statut: 'ok' },
    { id: 'panache', nom: 'Panaché brun sauvage foncé (fawn & white)', en: 'Fawn & white, pied khaki', geno: 'M:md/md,D:d/d,R:R/R', homologuee: true,
      note: 'Dusky Feathers appelle ce génotype « pied khaki » et donne au fawn & white britannique une dose de bleu en plus (Bl/bl+), à l’américain deux (voir panaché américain).',
      img: { M: 'fauve-blanc-canard.jpg', F: 'fauve-blanc-cane.jpg' }, statut: 'ok' },

    // --- Autres couleurs ---
    // Nom = couleur calculée par le moteur, nom d'usage entre parenthèses.
    // en : noms anglais (Dusky Feathers Waterfowl, IRDC).

    // Motif sauvage (M+)
    { id: 'truite-brun', nom: 'Sauvage truité brun', en: 'Brown trout, golden trout', geno: 'Li:li/li,D:d/d',
      img: { M: 'truite-brun-canard.jpg', F: 'truite-brun-cane.jpg' }, statut: 'ok',
      note: 'Truité + dilution brune. Le miroir garde des reflets, bronze.' },
    { id: 'truite-bleu', nom: 'Sauvage truité bleu', en: 'Blue trout', geno: 'Li:li/li,Bl:Bl/bl+',
      img: { M: 'truite-bleu-canard.jpg', F: 'truite-bleu-cane.jpg' }, statut: 'ok',
      note: 'Une dose de bleu : ne se reproduit pas fidèlement (bleu × bleu donne ¼ truité, ½ truité bleu, ¼ bleu-fauve truité).' },
    { id: 'truite-lilas', nom: 'Sauvage truité bleu brun (truité lilas)', en: 'Lilac trout', geno: 'Li:li/li,Bl:Bl/bl+,D:d/d',
      img: { M: 'truite-lilas-canard.jpg', F: 'truite-lilas-cane.jpg' }, statut: 'ok',
      note: 'Truité bleu + dilution brune. Une deuxième dose de bleu donne le jaune pois.' },
    { id: 'intermediaire-bleu-brun', nom: 'Sauvage intermédiaire truité-argenté bleu brun', en: 'Blue & brown spotted (non officiel)', geno: 'Li:li/lih,Bl:Bl/bl+,D:d/d',
      img: { M: 'intermediaire-bleu-brun-canard.jpg', F: 'intermediaire-bleu-brun-cane.jpg' }, statut: 'ok',
      note: 'li/lih et Bl/bl+ sont hétérozygotes : ne se reproduit pas fidèlement.' },
    { id: 'arlequin', nom: 'Arlequin (argenté sur base sauvage)', en: 'Harlequin, snowy, abacot', geno: 'Li:lih/lih',
      img: { M: 'arlequin-canard.jpg', F: 'arlequin-cane.jpg' }, statut: 'ok',
      note: 'Selon Dusky Feathers, lih/lih s’exprime de la même façon quel que soit le motif M : l’arlequin (M+) ressemble au sauvage argenté homologué (md/md). La différence ne se révèle qu’à la descendance.' },
    { id: 'appleyard', nom: 'Sauvage restreint (Appleyard)', en: 'Restricted mallard', geno: 'M:MR/MR',
      img: { M: 'appleyard-canard.jpg', F: 'appleyard-cane.jpg' }, statut: 'verifier',
      note: 'MR éclaircit surtout les couvertures des ailes ; son rôle dans le Silver Appleyard serait moindre qu’on ne le pensait (Dusky Feathers). Interactions avec Li non modélisées.' },
    { id: 'sauvage-blanc', nom: 'Sauvage panaché', en: 'Mallard & white', geno: 'R:R/R',
      img: { M: 'sauvage-blanc-canard.jpg', F: 'sauvage-blanc-cane.jpg' }, statut: 'ok' },

    // Motif sauvage foncé (dusky, md/md)
    { id: 'brun-fonce', nom: 'Sauvage foncé brun (khaki)', en: 'Khaki, brown dark dusky', geno: 'M:md/md,D:d/d',
      img: { M: 'brun-fonce-canard.jpg', F: 'brun-fonce-cane.jpg' }, statut: 'ok',
      note: 'Appelé aussi « brun sauvage foncé ». Avec le panaché R/R, il donne le panaché brun sauvage foncé homologué.' },
    { id: 'truite-dusky', nom: 'Sauvage foncé truité (truité dusky)', en: 'Light dusky', geno: 'M:md/md,Li:li/li',
      img: { M: 'truite-dusky-canard.jpg', F: 'truite-dusky-cane.jpg' }, statut: 'ok',
      note: 'Comme le truité, mais sans les traits sur la tête de la cane, miroir sans reflets, collier du mâle réduit à un liseré. Ajoutez la dilution brune et on obtient le Fawn.' },
    { id: 'fonce-truite-bleu', nom: 'Sauvage foncé truité bleu', en: 'Blue light dusky', geno: 'M:md/md,Li:li/li,Bl:Bl/bl+',
      img: { M: 'fonce-truite-bleu-canard.jpg', F: 'fonce-truite-bleu-cane.jpg' }, statut: 'ok' },
    { id: 'fauve', nom: 'Sauvage foncé truité brun (Fawn)', en: 'Fawn, brown light dusky', geno: 'M:md/md,Li:li/li,D:d/d',
      img: { M: 'fauve-canard.jpg', F: 'fauve-cane.jpg' }, statut: 'ok' },
    { id: 'bleu-dusky', nom: 'Sauvage foncé truité bleu brun (bleu dusky)', en: 'Blue dusky', geno: 'M:md/md,Li:li/li,Bl:Bl/bl+,D:d/d',
      img: { M: 'bleu-dusky-canard.jpg', F: 'bleu-dusky-cane.jpg' }, statut: 'verifier',
      note: 'Fawn + une dose de bleu (IRDC, Domaine des Bardons). Plumes de Pyrène appelle cette combinaison « abricot », et Dusky Feathers appelle « blue light dusky » la version sans brun (sauvage foncé truité bleu).' },
    { id: 'abricot', nom: 'Sauvage foncé truité bleu-fauve brun (abricot dusky)', en: 'Apricot dusky', geno: 'M:md/md,Li:li/li,Bl:Bl/Bl,D:d/d',
      img: { M: 'abricot-canard.jpg', F: 'abricot-dusky.jpg' }, statut: 'verifier',
      note: 'Fawn + deux doses de bleu (IRDC, Domaine des Bardons). Pour Plumes de Pyrène, l’abricot n’a qu’une dose de bleu.' },
    { id: 'fonce-intermediaire', nom: 'Sauvage foncé intermédiaire truité-argenté', en: 'Spotted dusky', geno: 'M:md/md,Li:li/lih',
      img: { M: 'fonce-intermediaire-canard.jpg', F: 'fonce-intermediaire-cane.jpg' }, statut: 'ok',
      note: 'Plumes tachetées, plus claires que le truité dusky ; le lih unique fait revenir en partie les reflets bleus du miroir. Hétérozygote : ne se reproduit pas fidèlement.' },
    { id: 'fonce-intermediaire-bleu', nom: 'Sauvage foncé intermédiaire truité-argenté bleu', en: 'Blue spotted dusky', geno: 'M:md/md,Li:li/lih,Bl:Bl/bl+',
      img: { M: 'fonce-intermediaire-bleu-canard.jpg', F: 'fonce-intermediaire-bleu-cane.jpg' }, statut: 'ok' },
    { id: 'fonce-intermediaire-brun', nom: 'Sauvage foncé intermédiaire truité-argenté brun', en: 'Brown spotted dusky', geno: 'M:md/md,Li:li/lih,D:d/d',
      img: { M: 'fonce-intermediaire-brun-canard.jpg', F: 'fonce-intermediaire-brun-cane.jpg' }, statut: 'ok' },
    { id: 'fonce-intermediaire-bleu-brun', nom: 'Sauvage foncé intermédiaire truité-argenté bleu brun', en: 'Blue & brown spotted dusky', geno: 'M:md/md,Li:li/lih,Bl:Bl/bl+,D:d/d',
      img: { M: 'fonce-intermediaire-bleu-brun-canard.jpg', F: 'fonce-intermediaire-bleu-brun-cane.jpg' }, statut: 'ok' },
    { id: 'panache-americain', nom: 'Panaché américain (american fawn & white)', en: 'Fawn & white (USA)', geno: 'M:md/md,Bl:Bl/Bl,D:d/d,R:R/R',
      note: 'Génotype confirmé par Domaine des Bardons et Dusky Feathers : md/md Li+ Bl/Bl d R/R. Deux doses de bleu : se reproduit fidèlement.',
      img: { M: 'panache-americain-canard.jpg', F: 'panache-americain-cane.jpg' }, statut: 'ok' },

    // Unis (E)
    { id: 'splash', nom: 'Splash', en: 'Splash', geno: 'M:md/md,E:E/E,Bl:Bl/Bl',
      img: { M: 'splash-canard.jpg', F: 'splash-cane.jpg' }, statut: 'ok',
      note: 'Presque blanc avec le bec noir (Dusky Feathers). Splash × noir donne 100 % de bleus.' },
    { id: 'lilas', nom: 'Lilas uni', en: 'Lilac', geno: 'M:md/md,E:E/E,Bl:Bl/bl+,D:d/d',
      img: { M: 'lilas-canard.jpg', F: 'lilas-cane.jpg' }, statut: 'ok' },
    { id: 'lavande', nom: 'Lavande uni', en: 'Lavender', geno: 'M:md/md,E:E/E,Bl:Bl/Bl,D:d/d',
      img: { M: 'lavande-canard.jpg', F: 'lavande-cane.jpg' }, statut: 'ok' }
  ];

  const donnees = { LOCI, VARIETES };
  g.DONNEES_CANARD = donnees;
  if (typeof module !== 'undefined' && module.exports) module.exports = donnees;
})(typeof globalThis !== 'undefined' ? globalThis : this);
