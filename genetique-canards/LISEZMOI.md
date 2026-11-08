# Calculateur de croisements — coureurs indiens

Ouvrir `index.html` dans un navigateur : tout fonctionne en local, sans serveur ni connexion.

- `identifier.html` : page « Identifier un canard » — questions facultatives (sexe, blanc,
  uni, panaché, couleur, tête, collier, œil barré, miroir) qui filtrent les variétés en
  photos ; les variétés à une réponse près restent visibles. Chaque fiche ouvre le
  calculateur avec la variété choisie (`index.html?M=noir&F=bleu`).
- `identification.js` : questions et critères visibles de chaque variété. Blanc, uni et
  panaché se déduisent du génotype ; le reste se règle ici. En cas de doute, une
  variété accepte plusieurs réponses (`['oui', 'non']`) plutôt que d'être écartée à tort.
  Une nouvelle variété ajoutée à `donnees.js` doit y recevoir ses critères (vérifié par
  `node tests.js`).
- `aide.html` : page « Comprendre la génétique » pour débutants (notions, ordre de lecture, exemples, vocabulaire anglais).
- `style.css` : styles communs aux deux pages.
- `donnees.js` : loci, allèles (du plus dominant au plus récessif) et variétés de référence.
  C'est le seul fichier à modifier pour corriger un génotype ou ajouter une variété.
- `moteur.js` : croisements (autosomes et chromosome Z) et traduction génotype → couleur.
- `tests.js` : vérifications du moteur, à lancer avec `node tests.js` après chaque modification.
- `img/` : photos, une par sexe et par variété.
- `outils/normaliser_images.py` : met une photo au format du calculateur (voir plus bas).
- `outils/supprimer_anciennes_images.sh` : retire les images remplacées ou écartées.
- `outils/photos_a_faire.py` : crée et liste les images « Photo à faire ».
- `outils/detourer_fond_vert.py` : détoure une photo prise sur fond vert.

Les variétés sont classées en deux groupes : les 10 couleurs homologuées en France
(sauvage, truité, sauvage argenté, bleu-fauve truité, jaune pois, noir, bleu, marron,
blanc, panaché brun sauvage foncé) et les autres couleurs. Les noms de couleur calculés
suivent le vocabulaire français ; les équivalents anglais (IRDC) sont donnés entre
parenthèses dans les noms de variété.

## Images

Les photos sont affichées entières dans un cadre de 240 px de haut (180 px sur mobile,
88 px en vignette). Format cible : portrait 1:2, 300 × 600 px, oiseau entier, debout,
pattes en bas, fond blanc, JPEG.

Pour préparer une nouvelle photo :

    python3 outils/normaliser_images.py photo.png img/variete-canard.jpg
    python3 outils/normaliser_images.py photo.jpg img/variete-cane.jpg --crop x1,y1,x2,y2 --sans-rognage

`--crop` isole un oiseau dans une photo de groupe ; `--sans-rognage` est à utiliser
quand le fond n'est pas blanc. Le script nettoie les petits restes de détourage,
complète en blanc jusqu'au format 1:2 sans jamais couper l'oiseau, et limite la
hauteur à 600 px. Il faut ensuite renseigner le champ `img` de la variété dans
`donnees.js`.

### Photos à faire

Chaque photo manquante a une image d'attente (✎ dans le tableau ci-dessous) : un cadre
avec une silhouette en pointillés, « Photo à faire », le sexe, la variété et le nom du
fichier. Elle est déjà déclarée dans `donnees.js`, il suffit de la remplacer :

    python3 outils/normaliser_images.py ma-photo.jpg img/jaune-pois-cane.jpg

Pour voir ce qui reste à faire :

    python3 outils/photos_a_faire.py

Le script reconnaît les images d'attente à leur commentaire JPEG (PHOTO_A_FAIRE) ;
une vraie photo enregistrée sous le même nom sort donc de la liste d'elle-même.
Pour une nouvelle variété ou une photo à refaire :

    python3 outils/photos_a_faire.py --creer img/appleyard-cane.jpg "Appleyard" cane

### Photos du Laufenten SV (◆)

Les 16 photos marquées ◆ viennent de la page des couleurs du club allemand
(laufenten-sv.de/laufenten.html, © Laufenten SV) : couleurs reconnues en
Allemagne, prises en studio sur fond vert, mâle (1,0) et cane (0,1). Elles ont été
détourées avec `outils/detourer_fond_vert.py` (vert → blanc, sol gardé). Usage
privé uniquement : demander l'accord du club avant toute diffusion.

Correspondance des noms allemands : wildfarbig = sauvage, forellenfarbig = truité,
silber-wildfarbig = sauvage argenté, blau-gelb = bleu-fauve truité, erbsgelb =
jaune pois, schwarz = noir, blau = bleu, braun = marron, weiß = blanc,
rehfarbig-weißgescheckt = panaché brun sauvage foncé.

### Photos de Dusky Feathers Waterfowl (●)

Les 16 photos marquées ● ont été ajoutées le 8 novembre 2026 à partir des pages de
duskyfeatherswaterfowl.com (motifs dusky, mallard, panaché, blanc). Prises en
extérieur, sur leur fond d'origine. Usage privé uniquement.

### État des images (✎ = photo à faire, ◆ = Laufenten SV, ● = Dusky Feathers, ▲ = filigrane Plumes de Pyrène, non libre)

| Variété | Canard | Cane | Remarque |
|---|---|---|---|
| Sauvage (colvert) | colvert-canard.jpg ● | colvert-cane.jpg ◆ |  |
| Truité | truite-canard.jpg ◆ | truite-cane.jpg ◆ |  |
| Sauvage argenté | argente-canard.jpg ◆ | argente-cane.jpg ◆ |  |
| Bleu-fauve truité (apricot trout) | bleu-fauve-truite-canard.jpg ◆ | bleu-fauve-truite-cane.jpg ◆ |  |
| Jaune pois | jaune-pois-canard.jpg ▲ | jaune-pois-cane.jpg | couchée au nid |
| Noir uni | noir-canard.jpg ◆ | noir-cane.jpg ◆ |  |
| Bleu uni (Cumberland blue) | bleu-canard.jpg ◆ | bleu-cane.jpg ◆ |  |
| Marron uni (chocolat) | chocolat-canard.jpg ◆ | chocolat-cane.jpg | cane penchée, à refaire |
| Blanc | blanc-canard.jpg ◆ | blanc-cane.jpg ◆ |  |
| Panaché brun sauvage foncé (fawn & white) | fauve-blanc-canard.jpg ◆ | fauve-blanc-cane.jpg ◆ |  |
| Sauvage truité brun | truite-brun-canard.jpg ✎ | truite-brun-cane.jpg ● | tenue en main, ailes ouvertes |
| Sauvage truité bleu | truite-bleu-canard.jpg ✎ | truite-bleu-cane.jpg | filigrane Dusky Feathers, petite ; couleur beige à confirmer |
| Sauvage truité bleu brun (truité lilas) | truite-lilas-canard.jpg ✎ | truite-lilas-cane.jpg ● | tenue en main, ailes ouvertes |
| Sauvage intermédiaire truité-argenté bleu brun | intermediaire-bleu-brun-canard.jpg ✎ | intermediaire-bleu-brun-cane.jpg ● |  |
| Arlequin (argenté sur base sauvage) | arlequin-canard.jpg ● | arlequin-cane.jpg ● | groupe de mâles; groupe de canes |
| Sauvage restreint (Appleyard) | appleyard-canard.jpg ✎ | appleyard-cane.jpg ▲ |  |
| Sauvage panaché | sauvage-blanc-canard.jpg ▲ | sauvage-blanc-cane.jpg ✎ |  |
| Sauvage foncé (dusky) | fonce-canard.jpg ● | fonce-cane.jpg ✎ |  |
| Sauvage foncé brun (khaki) | brun-fonce-canard.jpg ▲ | brun-fonce-cane.jpg ● | deux canes |
| Sauvage foncé truité (truité dusky) | truite-dusky-canard.jpg ▲ | truite-dusky-cane.jpg ▲ |  |
| Sauvage foncé truité bleu | fonce-truite-bleu-canard.jpg ✎ | fonce-truite-bleu-cane.jpg ● | tenue en main |
| Sauvage foncé truité brun (Fawn) | fauve-canard.jpg ● | fauve-cane.jpg | oie à l’arrière-plan |
| Sauvage foncé truité bleu brun (bleu dusky) | bleu-dusky-canard.jpg | bleu-dusky-cane.jpg ✎ | photo de groupe |
| Sauvage foncé truité bleu-fauve brun (abricot dusky) | abricot-canard.jpg | abricot-cane.jpg | groupe, très petite (143 px); filigrane FeatherSite |
| Sauvage foncé intermédiaire truité-argenté | fonce-intermediaire-canard.jpg ● | fonce-intermediaire-cane.jpg ● | tenue en main |
| Sauvage foncé intermédiaire truité-argenté bleu | fonce-intermediaire-bleu-canard.jpg ● | fonce-intermediaire-bleu-cane.jpg ● |  |
| Sauvage foncé intermédiaire truité-argenté brun | fonce-intermediaire-brun-canard.jpg ✎ | fonce-intermediaire-brun-cane.jpg ● |  |
| Sauvage foncé intermédiaire truité-argenté bleu brun | fonce-intermediaire-bleu-brun-canard.jpg ● | fonce-intermediaire-bleu-brun-cane.jpg ● |  |
| Panaché américain (american fawn & white) | panache-americain-canard.jpg | panache-americain-cane.jpg | recadrée dans un tirage papier, à remplacer; groupe |
| Splash | splash-canard.jpg ✎ | splash-cane.jpg ▲ |  |
| Lilas uni | lilas-canard.jpg ✎ | lilas-cane.jpg ▲ | groupe |
| Lavande uni | lavande-canard.jpg ▲ | lavande-cane.jpg ▲ | photo coupée à droite |

Les photos tenues en main ou penchées restent petites même au bon format : l'oiseau
est plus large que haut. Une photo debout, de profil, serait préférable.

### Rangement du 8 novembre 2026

- 10 copies exactes des photos Dusky Feathers, restées sous leur nom d'origine, supprimées.
- Photos réelles rattachées à leur variété à la place de l'image d'attente :
  abricot-dusky-canard.jpg → abricot-canard.jpg, sauvage-truiteedusky-cane.jpg →
  truite-dusky-cane.jpg, truite-bleue-cane.png → truite-bleu-cane.jpg (converti en JPEG).
- abricot-dusky-cane.jpg : photo collée dans une image d'attente ; cadre retiré →
  abricot-cane.jpg.
- « Sauvage fonce-canard.jpg » → fonce-canard.jpg, pour la nouvelle variété « Sauvage
  foncé (dusky) » ; le doublon _canard-sauvage-foncé-dusky-1-189x300.jpg (filigrane Plumes
  de Pyrène, 189 px) est supprimé.

### Récupération du 8 novembre 2026 (soir)

L'archive couleurs-dusky.zip contenait les 25 images d'attente régénérées ; décompressée
par-dessus le dossier, elle a remplacé les images d'attente dans lesquelles une photo
avait été collée. Ces 12 photos ont été récupérées dans img-avant/ (cadre d'attente
retiré, format 1:2) : appleyard-cane, brun-fonce-canard, jaune-pois-canard,
jaune-pois-cane, lavande-canard, lavande-cane, lilas-cane, panache-americain-cane,
sauvage-blanc-canard, splash-cane, truite-dusky-canard, truite-dusky-cane.
Pour éviter que cela se reproduise, `photos_a_faire.py --creer` refuse désormais
d'écraser un fichier qui contient une photo, et les livraisons ne contiennent plus
d'images d'attente pour des fichiers existants.

Une seule image par génotype et par sexe : quand deux photos existaient pour la même
place, la plus récente a été supprimée (doublon de sauvage foncé mâle ; la cane
truitée dusky existait deux fois, même photo).

### Images supprimées

`outils/supprimer_anciennes_images.sh` retire :

- les sources remplacées par une version normalisée : truite-canard.png, truite-cane.png,
  truite-abricot-canard.jpg, truite-abricot-cane.jpg, noir-canard.png, bleu-cane.png,
  chocolat-canard.png, chocolat-cane.png, blanc-canard.png, sauvage-canard.jpg,
  sauvage-cane.jpg, bleu-cumberland.jpeg, apricot-dusky.png, panache-canard.jpg ;
- les doublons ou images inutilisées : truites.jpg (couple, remplacé par truite-*),
  colvert.jpg (inutilisée), apricot-duskies.jpg (groupe) ;
- les images fausses : cumberland.gif (oiseau brun-rouge, détourage dentelé, alors que
  le bleu Cumberland est un bleu uni), truitebleue-cane.png (plumage beige-abricot,
  pas truité bleu ; fond d'herbe).

Les nouvelles photos de terrain fauve-canard.jpg et fauve-cane.jpg sont écrasées par
les versions détourées : garde-les ailleurs si tu y tiens.

### Où chercher les images manquantes

Droits : le site de l'Indian Runner Duck Club (runnerduck.net) est « tous droits
réservés », et Plumes de Pyrène interdit toute copie, même partielle, de ses textes et
photos. Leurs photos ne doivent donc pas être copiées dans ce projet : elles servent de
référence pour reconnaître les couleurs. Pour un usage diffusé, il faut des photos
personnelles, des photos d'éleveurs avec leur accord, ou une autorisation écrite.

| Manque | Piste |
|---|---|
| Bleu uni (photo debout) | IRDC : gallery/blues_with_black.jpg (groupe) |
| Bleu dusky (cane) | IRDC : gallery/dusky_group_4716.jpg ne montre que des mâles ; élevages britanniques |
| Panaché américain | IRDC : images/amercut.gif (couple, détourage médiocre) |
| Jaune pois | standard allemand « erbsgelb » (pas de photo sur le site du Laufenten SV) |
| Truité bleu, splash, lilas, lavande, brun sauvage foncé | photos d'éleveurs ; ces couleurs ne sont reconnues ni en France ni en Allemagne |
