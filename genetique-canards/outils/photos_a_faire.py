#!/usr/bin/env python3
"""Images « photo à faire » pour le calculateur.

Lister les photos encore à faire (images d'attente présentes dans img/) :
    python3 outils/photos_a_faire.py

Créer une image d'attente :
    python3 outils/photos_a_faire.py --creer img/jaune-pois-cane.jpg "Jaune pois" cane

Une image d'attente porte le marqueur PHOTO_A_FAIRE dans son commentaire JPEG.
Pour la remplacer, enregistrer la vraie photo sous le même nom, par exemple :
    python3 outils/normaliser_images.py ma-photo.jpg img/jaune-pois-cane.jpg
Elle disparaît alors de la liste, sans rien changer dans donnees.js.

Dépendance : Pillow (dnf install python3-pillow).
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

MARQUEUR = b'PHOTO_A_FAIRE'
L, H = 300, 600
FOND = (238, 243, 240)
TRAIT = (150, 170, 162)
TEXTE = (45, 70, 62)

POLICES = [
    '/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf',          # Fedora
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',            # Debian, Ubuntu
    '/usr/share/fonts/TTF/DejaVuSans.ttf',                        # Arch
    '/usr/share/fonts/google-noto/NotoSans-Regular.ttf',
    'C:/Windows/Fonts/arial.ttf',
    '/Library/Fonts/Arial.ttf',
]


def police(taille):
    for p in POLICES:
        if os.path.exists(p):
            return ImageFont.truetype(p, taille)
    try:
        return ImageFont.load_default(size=taille)
    except TypeError:
        return ImageFont.load_default()


def silhouette(d):
    """Silhouette simplifiée d'un coureur debout, en pointillés."""
    pts = [(176, 92), (196, 84), (226, 92), (198, 104), (190, 122), (186, 200),
           (196, 290), (204, 380), (196, 440), (178, 470), (186, 500), (170, 500),
           (160, 474), (150, 500), (134, 500), (140, 470), (118, 440), (108, 380),
           (118, 300), (150, 210), (162, 128), (164, 102)]
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n = max(1, int(((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** .5 // 6))
        for k in range(0, n, 2):
            x1 = a[0] + (b[0] - a[0]) * k / n
            y1 = a[1] + (b[1] - a[1]) * k / n
            x2 = a[0] + (b[0] - a[0]) * (k + 1) / n
            y2 = a[1] + (b[1] - a[1]) * (k + 1) / n
            d.line([(x1, y1), (x2, y2)], fill=TRAIT, width=3)
    d.ellipse([180, 94, 186, 100], fill=TRAIT)


def lignes(texte, f, d, largeur):
    mots, res, cour = texte.split(), [], ''
    for m in mots:
        essai = (cour + ' ' + m).strip()
        if d.textlength(essai, font=f) <= largeur:
            cour = essai
        else:
            if cour:
                res.append(cour)
            cour = m
    if cour:
        res.append(cour)
    return res


def creer(chemin, nom, sexe):
    im = Image.new('RGB', (L, H), FOND)
    d = ImageDraw.Draw(im)
    d.rectangle([4, 4, L - 5, H - 5], outline=TRAIT, width=2)
    silhouette(d)
    f_titre, f_sexe, f_petit = police(24), police(20), police(14)
    ls = lignes(nom, f_titre, d, L - 30)
    if len(ls) > 2:                      # nom long : police plus petite
        f_titre = police(20)
        ls = lignes(nom, f_titre, d, L - 24)[:3]
    pas = 28 if f_titre.size >= 24 else 24
    y = 534 - pas * (len(ls) - 1) / 2 - 14
    for ligne in ls:
        d.text((L / 2, y), ligne, font=f_titre, fill=TEXTE, anchor='mm')
        y += pas
    d.text((L / 2, 30), 'Photo à faire', font=f_sexe, fill=TEXTE, anchor='mm')
    d.text((L / 2, 56), sexe, font=f_sexe, fill=TEXTE, anchor='mm')
    d.text((L / 2, H - 16), os.path.basename(chemin), font=f_petit, fill=TRAIT, anchor='mm')
    im.save(chemin, 'JPEG', quality=85, comment=MARQUEUR + b' ' + nom.encode() + b' / ' + sexe.encode())


def est_attente(chemin):
    try:
        with Image.open(chemin) as im:
            return MARQUEUR in (im.info.get('comment') or b'')
    except Exception:
        return False


def lister(dossier):
    restes = sorted(f for f in os.listdir(dossier) if est_attente(os.path.join(dossier, f)))
    if not restes:
        print('Toutes les photos sont faites.')
        return
    print(f'{len(restes)} photo(s) à faire :')
    for f in restes:
        with Image.open(os.path.join(dossier, f)) as im:
            info = im.info['comment'][len(MARQUEUR):].decode(errors='replace').strip()
        print(f'  {f:32s} {info}')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--creer' and len(a) == 4:
        creer(a[1], a[2], a[3])
        print('créée :', a[1])
    elif not a:
        lister(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img'))
    else:
        print(__doc__)
        sys.exit(1)
