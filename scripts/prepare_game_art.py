"""Slice the approved 4x7 illustrated atlas into lightweight transparent runtime sprites.

Usage: python scripts/prepare_game_art.py [source-atlas]
This only packages enemy illustrations; official Graybird art is never processed.
"""
from pathlib import Path
import sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/game'
SOURCE=Path(sys.argv[1]) if len(sys.argv)>1 else OUT/'monster-atlas.webp'
NAMES=['ad','headline','army','elite','splitter','small','dash','tank','healer','drone','sniper','ghost','mine','leech','beetle']+[f'boss-{i}' for i in range(11)]
im=Image.open(SOURCE).convert('RGBA')
if len(sys.argv)>1:
 im.save(OUT/'monster-atlas.webp',quality=94,method=6)
 # Build from the persisted atlas so later re-runs produce the same output.
 im=Image.open(OUT/'monster-atlas.webp').convert('RGBA')
for i,name in enumerate(NAMES):
 col,row=i%4,i//4
 cell=im.crop((round(col*im.width/4),round(row*im.height/7),round((col+1)*im.width/4),round((row+1)*im.height/7)))
 bbox=cell.getchannel('A').getbbox()
 if bbox is None:raise ValueError(f'Missing artwork: {name}')
 # Normalize transparent padding only; preserve the supplied illustration/colors.
 cell=cell.crop(bbox);size=224 if name.startswith('boss-') else 160
 cell.thumbnail((round(size*.88),round(size*.88)),Image.Resampling.LANCZOS)
 sprite=Image.new('RGBA',(size,size));sprite.paste(cell,((size-cell.width)//2,(size-cell.height)//2))
 sprite.save(OUT/(name+'.webp'),quality=88,method=6)
print(f'Packaged {len(NAMES)} transparent hand-painted monster textures ({sum((OUT/(n+".webp")).stat().st_size for n in NAMES):,} bytes).')
