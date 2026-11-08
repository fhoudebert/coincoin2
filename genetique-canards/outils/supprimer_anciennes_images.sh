#!/bin/sh
# Retire les images remplacées ou écartées (passes du 7 et du 8 novembre 2026).
# Le 8 novembre : photos Dusky Feathers renommées selon l'identifiant de variété.
# À lancer depuis le dossier calculateur-canards.
cd "$(dirname "$0")/../img" || exit 1
for f in truite-canard.png truite-cane.png truite-abricot-canard.jpg truite-abricot-cane.jpg \
         noir-canard.png bleu-cane.png chocolat-canard.png chocolat-cane.png blanc-canard.png \
         sauvage-canard.jpg sauvage-cane.jpg bleu-cumberland.jpeg apricot-dusky.png \
         panache-canard.jpg truites.jpg colvert.jpg apricot-duskies.jpg cumberland.gif \
         truitebleue-cane.png \
         "Dusky Pattern-Light-Harlequin Phase with Blue and Brown-canard.jpg" \
         "Dusky Pattern-Light-Harlequin Phase with Blue and Brown-cane.jpg" \
         "Sauvage foncé intermédiaire truité-argenté brun-cane.jpg" \
         "Sauvage intermédiaire truité-argenté bleu brun-cane.jpg" \
         "Sauvage truite brun-cane.jpg" \
         Sauvage-fonce-intermediaire-truite-argente-bleu-canard.jpg \
         Sauvage-fonce-intermediaire-truite-argente-bleu-cane.jpg \
         bleu-truite-fonce-cane.jpg \
         brun-fonce-intermédiaire-truite-argente-canard.jpg \
         brun-fonce-intermédiaire-truite-argente-cane.jpg; do
  [ -e "$f" ] && rm -v -- "$f"
done
exit 0
