/* Calculateur de croisements — canards coureurs indiens
 * traduction-en.js : textes anglais des données (loci, variétés) et des
 * questions d'identification. Chargé par les pages de en/, après
 * donnees.js, moteur.js et identification.js.
 *
 * Une variété, un locus ou une question ajouté en français doit recevoir
 * ici son texte anglais (vérifié par node tests.js). Les génotypes, les
 * images et les critères ne se règlent qu'en français, dans donnees.js et
 * identification.js.
 */
(function (g) {
  'use strict';

  const LOCI = {
    M:  { nom: 'Mallard pattern',
          aide: 'MR restricted mallard (Appleyard), mainly lightens the wing coverts; incomplete dominance: MR/M+ and MR/md are intermediate. M+ mallard > md dusky (recessive): no eye stripes, speculum without sheen, reduced collar.' },
    Li: { nom: 'Phase',
          aide: 'Li+ dark phase > li light phase (trout) > lih silver (harlequin). li/lih gives an intermediate between trout and silver.' },
    E:  { nom: 'Extended black',
          aide: 'E dominant: self-coloured plumage, masks the mallard pattern and the phase. Some pencilling (outlined feathers on the wing or throat) and “calico” patches may remain.' },
    Bl: { nom: 'Blue dilution',
          aide: 'Dose effect. On extended black: Bl/bl+ blue, Bl/Bl splash. On mallard pattern: Bl/bl+ blue, Bl/Bl very pale fawn-blue (apricot).' },
    C:  { nom: 'Recessive white',
          aide: 'c/c gives a white duck (orange bill and legs) that masks all other genes. A coloured feather may appear (pigment “leak”). Ducklings are yellow from hatching.' },
    B:  { nom: 'Recessive bib',
          aide: 'b/b gives a white bib on the breast.' },
    R:  { nom: 'Runner pied',
          aide: 'Incomplete dominance: R/R classic runner pied, R/r+ partial pied (collar and a little white on the wings).' },
    D:  { nom: 'Brown dilution',
          aide: 'Sex-linked. d turns black pigment (eumelanin) brown. A d/– duck is diluted; a drake must be d/d. With Bl: lilac, lavender, apricot, jaune pois.' },
    Bu: { nom: 'Buff dilution',
          aide: 'Sex-linked. bu dilutes to buff. A bu/– duck is buff; a drake must be bu/bu.' },
    Cr: { nom: 'Crest',
          aide: 'Cr dominant: crest (pompom). Cr/Cr causes skull deformities or death of the duckling: never mate two crested birds together.' }
  };

  // nom : nom affiché sur les pages anglaises (nom d'usage britannique ou
  // américain quand il existe, sinon le nom français).
  const VARIETES = {
    'sauvage': { nom: 'Mallard' },
    'truite': { nom: 'Trout',
      note: 'An M+/md li/li bird looks exactly like a pure trout: it can hide dusky.' },
    'argente': { nom: 'Silver (harlequin on dusky)' },
    'bleu-fauve-truite': { nom: 'Apricot trout' },
    'jaune-pois': { nom: 'Jaune pois (double-blue brown trout)',
      note: 'Apricot trout + brown dilution. Sex-linked through d: a jaune pois drake and an apricot trout duck give jaune pois daughters and apricot trout sons carrying brown.' },
    'noir': { nom: 'Black' },
    'bleu': { nom: 'Cumberland blue' },
    'marron': { nom: 'Chocolate' },
    'blanc': { nom: 'White' },
    'panache': { nom: 'Fawn & white (pied khaki)',
      note: 'Dusky Feathers calls this genotype “pied khaki” and gives the British fawn & white one extra dose of blue (Bl/bl+), the American one two (see American fawn & white).' },
    'truite-brun': { nom: 'Brown trout',
      note: 'Trout + brown dilution. The speculum keeps its sheen, bronze.' },
    'truite-bleu': { nom: 'Blue trout',
      note: 'One dose of blue: does not breed true (blue × blue gives ¼ trout, ½ blue trout, ¼ apricot trout).' },
    'truite-lilas': { nom: 'Lilac trout',
      note: 'Blue trout + brown dilution. A second dose of blue gives jaune pois.' },
    'intermediaire-bleu-brun': { nom: 'Blue & brown spotted mallard',
      note: 'li/lih and Bl/bl+ are heterozygous: does not breed true.' },
    'arlequin': { nom: 'Harlequin (on mallard)',
      note: 'According to Dusky Feathers, lih/lih looks the same whatever the M pattern: the harlequin (M+) looks like the French standard silver (md/md). The difference only shows in the offspring.' },
    'appleyard': { nom: 'Restricted mallard (Appleyard)',
      note: 'MR mainly lightens the wing coverts; its role in the Silver Appleyard may be smaller than once thought (Dusky Feathers). Interactions with Li are not modelled.' },
    'sauvage-blanc': { nom: 'Mallard & white' },
    'fonce': { nom: 'Dusky (dark dusky)',
      note: 'Base pattern of the “dusky” colours: duck without eye stripes, speculum without sheen, drake’s collar reduced or absent. Under extended black it gives a deeper black.' },
    'brun-fonce': { nom: 'Khaki (brown dark dusky)',
      note: 'Also called “brun sauvage foncé” in French. With runner pied R/R it gives the French standard fawn & white (pied khaki).' },
    'truite-dusky': { nom: 'Light dusky (trout dusky)',
      note: 'Like trout, but the duck has no eye stripes, the speculum has no sheen and the drake’s collar is reduced to a thin line. Add brown dilution to get Fawn.' },
    'fonce-truite-bleu': { nom: 'Blue light dusky' },
    'fauve': { nom: 'Fawn (brown light dusky)' },
    'bleu-dusky': { nom: 'Blue dusky',
      note: 'Fawn + one dose of blue (IRDC, Domaine des Bardons). Plumes de Pyrène calls this combination “abricot”, and Dusky Feathers uses “blue light dusky” for the version without brown.' },
    'abricot': { nom: 'Apricot dusky',
      note: 'Fawn + two doses of blue (IRDC, Domaine des Bardons). For Plumes de Pyrène, apricot has only one dose of blue.' },
    'fonce-intermediaire': { nom: 'Spotted dusky',
      note: 'Spotted feathers, lighter than light dusky; the single lih partly brings back the blue sheen of the speculum. Heterozygous: does not breed true.' },
    'fonce-intermediaire-bleu': { nom: 'Blue spotted dusky' },
    'fonce-intermediaire-brun': { nom: 'Brown spotted dusky' },
    'fonce-intermediaire-bleu-brun': { nom: 'Blue & brown spotted dusky' },
    'panache-americain': { nom: 'American fawn & white',
      note: 'Genotype confirmed by Domaine des Bardons and Dusky Feathers: md/md Li+ Bl/Bl d R/R. Two doses of blue: breeds true.' },
    'splash': { nom: 'Splash',
      note: 'Almost white with a black bill (Dusky Feathers). Splash × black gives 100 % blues.' },
    'lilas': { nom: 'Lilac' },
    'lavande': { nom: 'Lavender' }
  };

  const QUESTIONS = {
    sexe: { texte: 'Drake or duck?',
            aide: 'An adult drake has a small curled feather on top of the tail. The duck quacks loudly; the drake has a quiet, hoarse voice.',
            options: { M: 'Drake (male)', F: 'Duck (female)' } },
    blanc: { texte: 'All-white plumage, orange bill?', options: { oui: 'Yes', non: 'No' } },
    uni: { texte: 'Plumage of a single colour, without pattern?',
           aide: 'No edged or spotted feathers, no head of a different colour from the body.',
           options: { oui: 'Yes, self-coloured', non: 'No, patterned' } },
    panache: { texte: 'Large, clean white areas (neck, around the eyes, belly, wings)?',
               aide: 'The runner pied pattern: white band around the eye, white neck, belly and wings partly white.',
               options: { oui: 'Yes', non: 'No' } },
    teinte: { texte: 'Main body colour?',
              options: { noir: 'Black with green sheen', bleu: 'Grey-blue, slate', brun: 'Dark brown, chocolate',
                         tachete: 'Mottled brown (camouflage)', fauve: 'Fawn, beige, yellow',
                         gris: 'Pearl grey (body of the mallard drake)', clair: 'Cream or almost white' } },
    tete: { texte: 'Colour of the drake’s head?',
            options: { verte: 'Bright green', noire: 'Black', grisbleu: 'Grey-blue', brune: 'Brown, bronze', blanche: 'White' } },
    collier: { texte: 'White collar at the base of the neck?', options: { oui: 'Yes', non: 'No or barely' } },
    oeil: { texte: 'Dark stripe through the eye?',
            aide: 'A darker band runs from the bill to the back of the head, through the eye. Dusky birds do not have it.',
            options: { oui: 'Yes', non: 'No' } },
    miroir: { texte: 'Wing speculum (coloured feathers in the middle of the wing)?',
              aide: 'Easiest to see when the wing is slightly open.',
              options: { bleu: 'Bright blue-violet', grisbleu: 'Dull grey-blue', brun: 'Brown or brown-grey', absent: 'No distinct speculum' } }
  };

  // Remplace les textes français par les textes anglais. Le nom français
  // reste disponible dans v.nomFr (affiché sur les pages anglaises).
  function appliquer(donnees, ident, moteur) {
    if (moteur) moteur.choisirLangue('en');
    if (donnees) {
      for (const l of donnees.LOCI) if (LOCI[l.id]) Object.assign(l, LOCI[l.id]);
      for (const v of donnees.VARIETES) {
        const t = VARIETES[v.id];
        if (!t) continue;
        v.nomFr = v.nom;
        v.nom = t.nom;
        v.note = t.note || '';
      }
    }
    if (ident) {
      for (const q of ident.QUESTIONS) {
        const t = QUESTIONS[q.id];
        if (!t) continue;
        q.texte = t.texte;
        if (q.aide) q.aide = t.aide || '';
        q.options = q.options.map(([val, txt]) => [val, (t.options && t.options[val]) || txt]);
      }
    }
  }

  const trad = { LOCI, VARIETES, QUESTIONS, appliquer };
  g.TRADUCTION_EN = trad;
  if (g.DONNEES_CANARD && g.MOTEUR_CANARD && typeof document !== 'undefined')
    appliquer(g.DONNEES_CANARD, g.IDENTIFICATION_CANARD, g.MOTEUR_CANARD);
  if (typeof module !== 'undefined' && module.exports) module.exports = trad;
})(typeof globalThis !== 'undefined' ? globalThis : this);
