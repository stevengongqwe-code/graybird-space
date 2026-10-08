"""Build lightweight original monster illustrations; never modifies Graybird artwork."""
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'assets/game';OUT.mkdir(exist_ok=True)
regular={
'ad':('#ad8994','screen'),'headline':('#c19b6c','jaw'),'army':('#899cad','screen'),
'elite':('#bda573','beetle'),'splitter':('#a697bc','bug'),'small':('#a697bc','bug'),
'dash':('#b48b74','dart'),'tank':('#8a969c','tank'),'healer':('#9aac86','medic'),
'drone':('#86a6bb','drone'),'sniper':('#c5a875','scope'),'ghost':('#9aabc4','ghost'),
'mine':('#bba084','mine'),'leech':('#aa8998','leech'),'beetle':('#819f9c','beetle')}
shapes={
'screen':'<rect x="18" y="23" width="60" height="47" rx="8"/><path d="M24 34h48M31 77h34M38 70v7M58 70v7" fill="none"/><path d="M30 61l10-8 8 8 8-8 10 8" fill="none"/>',
'jaw':'<path d="M12 32l18-12 18 6 18-6 18 12-7 39-29 12-29-12z"/><path d="M24 58l8 12 8-12 8 12 8-12 8 12 8-12" fill="#111a22"/>',
'beetle':'<path d="M27 25l-8-10M69 25l8-10M21 40L8 35M21 58L8 64M75 40l13-5M75 58l13 6" fill="none"/><path d="M48 17C12 23 12 71 48 84c36-13 36-61 0-67z"/><path d="M48 39v39" fill="none"/>',
'bug':'<path d="M27 35L14 23M69 35l13-12M25 53L10 56M71 53l15 3M28 70L17 82M68 70l11 12" fill="none"/><ellipse cx="48" cy="53" rx="25" ry="32"/><path d="M25 60h46M31 72h34" fill="none"/>',
'dart':'<path d="M48 10L84 78 48 64 12 78z"/><path d="M48 64v22M26 83l-5 6M70 83l5 6" fill="none"/>',
'tank':'<rect x="10" y="40" width="76" height="35" rx="10"/><rect x="25" y="27" width="46" height="36" rx="6"/><path d="M44 27v-17h8v17"/><path d="M20 70h56" fill="none"/><circle cx="22" cy="75" r="6"/><circle cx="74" cy="75" r="6"/>',
'medic':'<rect x="22" y="24" width="52" height="53" rx="14"/><path d="M32 24v-9h32v9M17 46H8M79 46h9M34 77v10M62 77v10" fill="none"/><path d="M44 56h8v7h7v8h-7v7h-8v-7h-7v-8h7z" fill="#e4efdc" stroke="none"/>',
'drone':'<path d="M26 42H10M70 42h16M26 65H10M70 65h16" fill="none"/><circle cx="12" cy="35" r="9" fill="none"/><circle cx="84" cy="35" r="9" fill="none"/><rect x="25" y="28" width="46" height="43" rx="14"/><path d="M37 73l11 11 11-11"/>',
'scope':'<path d="M23 79l9-22M73 79l-9-22M20 32h56" fill="none"/><circle cx="48" cy="47" r="28"/><circle cx="48" cy="47" r="19" fill="#182632"/><path d="M48 24v12M48 58v12M25 47h12M59 47h12" fill="none"/>',
'ghost':'<path d="M18 81V44C18 6 78 6 78 44v37L66 73 54 83 42 73 30 83z"/><path d="M16 51h-8M80 64h8M22 23h9" fill="none"/>',
'mine':'<path d="M48 7v13M48 76v13M7 48h13M76 48h13M18 18l10 10M68 68l10 10M18 78l10-10M68 28l10-10" fill="none"/><circle cx="48" cy="48" r="28"/><circle cx="48" cy="48" r="16" fill="none"/><path d="M45 31h6v22h-6zM45 60h6v6h-6z" fill="#e8ddd0" stroke="none"/>',
'leech':'<path d="M26 73C8 51 20 21 48 21S88 50 70 73l-7-5-7 12-8-9-8 9-7-12z"/><path d="M34 55q14 14 28 0" fill="none"/>'}
for name,(color,shape) in regular.items():
 eyes='' if shape in ['scope','mine'] else '<path d="M30 39l11 4M66 39l-11 4" fill="none"/><ellipse cx="37" cy="47" rx="4" ry="5" fill="#101920" stroke="none"/><ellipse cx="59" cy="47" rx="4" ry="5" fill="#101920" stroke="none"/>'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g fill="{color}" stroke="#24333e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">{shapes[shape]}{eyes}</g></svg>'
 (OUT/f'{name}.svg').write_text(svg)
bosses=['screen','jaw','ghost','drone','scope','beetle','screen','ghost','mine','tank','leech']
colors=['#b3919c','#c6a07c','#aaa1bd','#a09cb8','#c3aa8b','#8baaa6','#b092a1','#9cacc7','#b9a78d','#96a0a5','#b293ac']
for i,(shape,color) in enumerate(zip(bosses,colors)):
 detail=['<path d="M34 63h28M34 68h20"/>','<path d="M16 24l8-12 14 8 10-14 10 14 14-8 8 12"/>','<path d="M10 48h12M74 57h12"/>','<path d="M18 15h60M24 9v12M72 9v12"/>','<path d="M72 13l10 8-8 10"/>','<ellipse cx="48" cy="50" rx="44" ry="39" fill="none"/>','<path d="M31 62h34M37 68h22"/>','<path d="M12 34h13M74 72h14"/>','<path d="M48 29v19l12 8" fill="none"/>','<path d="M28 56l8-12 12 12 12-12 8 12" fill="none"/>','<path d="M28 60l8 8 8-8 8 8 8-8 8 8" fill="none"/>'][i]
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g fill="none" stroke="{color}" stroke-width="2"><path d="M12 8H8v12M76 8h12v12M8 76v12h12M76 88h12V76"/></g><g fill="{color}" stroke="#26333e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">{shapes[shape]}<path d="M31 38l11 5M65 38l-11 5" fill="none"/><circle cx="37" cy="47" r="4" fill="#16212b"/><circle cx="59" cy="47" r="4" fill="#16212b"/>{detail}</g></svg>'
 (OUT/f'boss-{i}.svg').write_text(svg)
print(f'Built {len(regular)} enemy and {len(bosses)} boss SVG textures.')
