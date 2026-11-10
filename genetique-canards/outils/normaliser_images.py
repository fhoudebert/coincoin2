#!/usr/bin/env python3
"""Normalise une photo de coureur indien pour le calculateur.

    python3 outils/normaliser_images.py source.png img/variete-canard.jpg [--crop x1,y1,x2,y2]

- recadrage manuel facultatif (--crop, en pixels de l'image source) ;
- sur fond clair (ou transparent), rognage automatique des marges blanches ;
- remise au format portrait 1:2 en complétant par du blanc (jamais de rognage
  de l'oiseau), petite marge autour ;
- 600 px de haut au maximum (pas d'agrandissement des petites images) ;
- export JPEG qualité 85, fond blanc.

Dépendance : Pillow (dnf install python3-pillow).
"""
import argparse
from PIL import Image, ImageChops, ImageFilter

RATIO = 2.0      # hauteur / largeur
HAUTEUR_MAX = 600
MARGE = 0.04     # 4 % de marge autour de l'oiseau


def sur_fond_blanc(im):
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        im = im.convert('RGBA')
        fond = Image.new('RGBA', im.size, (255, 255, 255, 255))
        fond.alpha_composite(im)
        return fond.convert('RGB')
    return im.convert('RGB')


def nettoyer_alpha(im, taille_min=0.002):
    """Supprime les petits îlots opaques isolés laissés par un détourage."""
    if im.mode != 'RGBA':
        return im
    a = im.getchannel('A').point(lambda v: 255 if v > 32 else 0)
    # Ouverture morphologique : efface les points isolés de quelques pixels.
    a2 = a.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    im.putalpha(ImageChops.multiply(im.getchannel('A'), a2))
    return im


def boite_sujet(rgb, seuil=238):
    gris = rgb.convert('L').point(lambda v: 255 if v < seuil else 0)
    return gris.getbbox() or (0, 0) + rgb.size


def normaliser(src, dst, crop=None, rogner=True):
    im = Image.open(src)
    if im.mode == 'P':
        im = im.convert('RGBA')
    im = nettoyer_alpha(im)
    rgb = sur_fond_blanc(im)
    if crop:
        rgb = rgb.crop(crop)
    if rogner:
        rgb = rgb.crop(boite_sujet(rgb))
    w, h = rgb.size
    h2 = int(h * (1 + 2 * MARGE))
    w2 = int(w * (1 + 2 * MARGE))
    if h2 / w2 < RATIO:
        h2 = int(w2 * RATIO)
    else:
        w2 = int(h2 / RATIO)
    fond = Image.new('RGB', (w2, h2), (255, 255, 255))
    # Oiseau centré horizontalement, posé en bas (pattes à hauteur constante).
    fond.paste(rgb, ((w2 - w) // 2, h2 - h - int(h * MARGE)))
    if h2 > HAUTEUR_MAX:
        fond = fond.resize((HAUTEUR_MAX // 2, HAUTEUR_MAX), Image.LANCZOS)
    fond.save(dst, 'JPEG', quality=85, optimize=True, progressive=True)
    return fond.size


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('source')
    p.add_argument('destination')
    p.add_argument('--crop', help='x1,y1,x2,y2 en pixels de la source')
    p.add_argument('--sans-rognage', action='store_true',
                   help='ne pas rogner les marges (photo sur fond non blanc)')
    a = p.parse_args()
    crop = tuple(int(v) for v in a.crop.split(',')) if a.crop else None
    print(a.destination, normaliser(a.source, a.destination, crop, not a.sans_rognage))
