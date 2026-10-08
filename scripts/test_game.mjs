import assert from 'node:assert/strict';
import {createGame,stepGame,difficulty,WEAPONS,EQUIPMENT,BOSS_NAMES,ENEMY_TYPES,cleanLoadout,purchaseUpgrade,applyLoadout,spawnEnemy,spawnBoss,hitEnemy,drop,chooseEvolution,damage,reviveGame,firingRate,weaponStats,frameSeconds,supplyPurchase,BOSS_SKILLS,castBossSkill} from '../play/game-core.mjs';
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function isolated(){const g=createGame();g.running=true;g.spawn=g.foodTimer=-999;g.nextSupply=g.nextBoss=g.nextEvent=99999;return g;}
assert.equal(WEAPONS.length,6);assert.equal(EQUIPMENT.length,5);assert.equal(ENEMY_TYPES.length,15);assert.equal(BOSS_NAMES.length,11);
{
 const g=isolated();assert.equal(damage(g,'广告'),false);assert.equal(g.shield,0);assert.equal(damage(g,'广告'),false);g.invincible=0;assert.equal(damage(g,'广告'),true);assert.equal(g.running,false);assert.equal(reviveGame(g),true);assert.equal(g.hp,1);assert.equal(g.invincible,2);
}
{
 let loadout=cleanLoadout(),bank=1000;const before=JSON.stringify(loadout);
 assert.equal(purchaseUpgrade(loadout,1,'bomb').ok,false);assert.equal(JSON.stringify(loadout),before);
 const invalid=purchaseUpgrade(loadout,bank,'unknown');assert.equal(invalid.ok,false);
 for(let i=0;i<3;i++){const result=purchaseUpgrade(loadout,bank,'bomb');assert.equal(result.ok,true);bank=result.balance;loadout=result.loadout;}
 assert.equal(bank,330);assert.equal(purchaseUpgrade(loadout,bank,'bomb').ok,false);
 loadout.selected='bomb';loadout.levels.shell=2;loadout.levels.boots=3;loadout.levels.collector=3;
 const g=createGame();applyLoadout(g,loadout);assert.equal(g.weapon,'bomb');assert.equal(g.weaponLevel,3);assert.equal(g.shield,3);assert.equal(g.pickupRadius,54);assert.equal(g.moveSpeed,1.24);
 assert.equal(cleanLoadout({selected:'beam',levels:{beam:0,shell:99,power:-99}}).selected,'worm');assert.equal(cleanLoadout({levels:{shell:99}}).levels.shell,2);
}
for(const weapon of WEAPONS){
 const g=isolated(),loadout=cleanLoadout();loadout.levels[weapon.id]=1;loadout.selected=weapon.id;applyLoadout(g,loadout);stepGame(g,.02);
 const shots=g.bullets.filter(b=>b.active);assert.ok(shots.length);assert.ok(shots.every(b=>b.weapon===weapon.id));
 if(weapon.id==='scatter')assert.equal(shots.length,3);
 if(weapon.id==='beam')assert.ok(shots[0].pierce>=3);
 if(weapon.id==='seeker')assert.ok(shots[0].track>=2);
 if(weapon.id==='frost')assert.ok(shots[0].frost>0);
 if(weapon.id==='bomb')assert.ok(shots[0].splash>0);
 assert.ok(firingRate(g)>0);
}
for(const type of ENEMY_TYPES){
 const g=isolated(),e=spawnEnemy(g,type,{x:100,y:100});assert.equal(e.type,type);stepGame(g,.5,rng(3));assert.ok(Number.isFinite(e.x+e.y+e.hp));
}
{
 const g=isolated(),boss=spawnBoss(g,0,0);stepGame(g,.5);assert.ok(Math.abs(boss.age-.5)<.0001,'Boss clock advances once per step');
}
for(let i=0;i<BOSS_NAMES.length;i++){
 const g=isolated(),e=spawnBoss(g,0,i);stepGame(g,4,rng(10));assert.ok(e.active);assert.ok(Number.isFinite(e.x+e.y));assert.equal(e.roster,i);
 for(let tries=0;tries<12&&g.groups.some(o=>o.active);tries++)for(const m of g.enemies)if(m.active&&m.boss)hitEnemy(g,m,10000);
 assert.equal(g.bossesDefeated,1);assert.equal(g.groups.some(o=>o.active),false);
}
{
 const encountered=new Set();
 for(let seed=1;seed<=30;seed++){
  const g=isolated();g.elapsed=116.9;g.nextBoss=120;stepGame(g,.2,rng(seed*1000003));assert.equal(g.enemies.some(e=>e.boss&&e.active),false);
  const warning=g.pendingBossRoster;assert.ok(warning>=0&&warning<BOSS_NAMES.length);
  stepGame(g,3,rng(seed+2));const b=g.enemies.find(e=>e.active&&e.boss);assert.equal(b.roster,warning);encountered.add(b.roster);
  g.elapsed=g.nextBoss+.1;const groupCount=g.groups.filter(o=>o.active).length;stepGame(g,.01);assert.equal(g.groups.filter(o=>o.active).length,groupCount);
 }
 assert.ok(encountered.size>=6,`randomized first bosses: ${encountered.size}`);
}
{
 const g=isolated();g.fireTimer=999;g.choice=true;g.choiceQueue=1;assert.equal(chooseEvolution(g,'pierce'),true);assert.equal(g.build.pierce,1);assert.equal(g.choice,false);
 for(const kind of ['magnet','egg','rage','slow','double','rapid','repair','clear','fortune']){const p=drop(g,kind,g.x,g.y);p.speed=0;stepGame(g,.01);assert.equal(p.active,false);}
 g.combo=0;g.rewardBonus=0;g.effects.fortune=0;const p=drop(g,'peanut',g.x,g.y,4);p.speed=0;const previous=g.score;stepGame(g,.01);assert.equal(g.score-previous,8);
 g.paused=true;const t=g.elapsed;stepGame(g,10);assert.equal(g.elapsed,t);
}
{
 const g=isolated();g.weapon='bomb';g.weaponLevel=1;const a=spawnEnemy(g,'ad',{x:g.x,y:g.y-125,hp:20,maxHp:20}),b=spawnEnemy(g,'ad',{x:g.x+40,y:g.y-125,hp:20,maxHp:20});stepGame(g,.16);assert.ok(a.hp<20);assert.ok(b.hp<20,'splash hits neighbour');
}
// Early progression must not snowball even when a dense wave is cleared instantly.
{
 const g=isolated();g.fireTimer=999;
 const clearWave=()=>{for(let i=0;i<36;i++){const e=spawnEnemy(g,'ad',{x:100,y:100});hitEnemy(g,e,10000);}};
 clearWave();assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,0,'no kill chip before the opening gate');
 g.elapsed=55;clearWave();assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,1);
 g.elapsed=65;clearWave();assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,1,'kill sources share 60s cooldown');
 g.items.filter(p=>p.kind==='chip').forEach(p=>p.active=false);g.elapsed=120;clearWave();assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,1);
}
{
 const g=isolated();g.nextSupply=65;g.fireTimer=999;g.invincible=100;
 stepGame(g,64.9);assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,0,'no chip before configured test schedule');
 stepGame(g,.2);assert.equal(g.items.filter(p=>p.active&&p.kind==='chip').length,1);assert.equal(g.nextSupply,155);
}
{
 const g=isolated();const rates=[];
 for(const kind of ['pierce','track','spread','pierce','track','spread']){
  g.choice=true;g.choiceQueue=1;assert.equal(chooseEvolution(g,kind),true);rates.push(firingRate(g));
 }
 assert.deepEqual(rates,[2.5,3.3,3.3,4.3,4.3,5.5],'six evolutions required to reach maximum fire rate');
 assert.ok(difficulty(0).hp>1,'unupgraded cannon needs two hits on ordinary starting monsters');
 assert.ok(difficulty(0).interval<1.3&&difficulty(0).speed>1.07,'opening pressure increased');
}
// Frame hitches stay bounded and never require an automatic foreground pause.
assert.equal(frameSeconds(16),.016);assert.equal(frameSeconds(800),.05);assert.equal(frameSeconds(8000),.05);assert.equal(frameSeconds(-20),0);
for(const w of WEAPONS){const stats=weaponStats(w.id,1);assert.ok(stats.rate>0&&stats.damage>0);assert.ok(weaponStats(w.id,2).damage>stats.damage);}
// Every Boss has two reachable signature mechanics, with warning before damage.
for(let roster=0;roster<BOSS_NAMES.length;roster++)for(let skill=0;skill<2;skill++){
 const g=isolated();g.fireTimer=999;g.invincible=10;const e=spawnBoss(g,0,roster);const h=castBossSkill(g,e,skill);
 assert.equal(h.label,BOSS_SKILLS[roster][skill].name);assert.ok(h.warning>=1.2);stepGame(g,.5);assert.ok(h.age<h.warning);
 stepGame(g,2);assert.ok(Number.isFinite(h.r+h.x+h.y));
 for(let i=0;i<12&&g.groups.some(p=>p.active);i++)for(const boss of g.enemies)if(boss.active&&boss.boss)hitEnemy(g,boss,10000);
 assert.equal(g.hazards.some(p=>p.active),false,'victory clears pending hazards');
}
{
 const g=isolated();g.fireTimer=999;const e=spawnBoss(g,0,0);hitEnemy(g,e,e.maxHp*.36);assert.equal(e.group.phase,2);hitEnemy(g,e,e.maxHp*.35);assert.equal(e.group.phase,3);
 const h=castBossSkill(g,e,1);g.shield=1;g.invincible=0;g.target=h.x;g.targetY=h.y;e.attack=999;
 stepGame(g,h.warning-.1);assert.equal(g.shield,1,'warning zone is harmless');stepGame(g,.15);assert.equal(g.shield,0,'active zone damages');
}
{
 const g=isolated();g.fireTimer=999;const p=drop(g,'fake',100,100);stepGame(g,.1);assert.equal(g.tutorial.seen.fake,true);
 drop(g,'fake',100,100);assert.equal(g.tutorial.queue.filter(line=>line.startsWith('真假花生')).length,0,'first-use hint appears only once');
}
// Marked wave gap is safe, outside it the active wave can hit.
{
 const g=isolated();g.fireTimer=999;const e=spawnBoss(g,0,3);e.attack=999;e.group.skillTimer=999;const h=castBossSkill(g,e,0);
 h.age=h.warning+.1;h.y=g.y-1;g.target=g.x;g.targetY=g.y;stepGame(g,.01);assert.equal(g.shield,1);
 g.x=h.gap+h.gapWidth+40;g.target=g.x;h.y=g.y-1;stepGame(g,.01);assert.equal(g.shield,0);
}
// Soak both arena sizes with actual random spawns, all pools and chip choices.
for(const [w,h] of [[600,760],[900,600]]){
 const g=createGame(w,h);g.running=true;const random=rng(37);let seenBoss=false;
 for(let i=0;i<300*60;i++){
  g.invincible=10;g.target=w/2+Math.sin(i/200)*w*.28;
  if(g.supplyChoice)supplyPurchase(g,'save');
  if(g.choice)chooseEvolution(g,['pierce','track','spread'].find(k=>g.build[k]<3));
  stepGame(g,1/60,random);if(g.enemies.some(e=>e.active&&e.boss))seenBoss=true;
  assert.ok(Number.isFinite(g.score+g.elapsed+g.x+g.y));
 }
 assert.ok(seenBoss);assert.ok(g.kills>0);assert.ok(g.score>0);assert.equal(g.enemies.length,64);assert.equal(g.bullets.length,256);assert.ok(g.elapsed>295);
}
{
 const g=isolated();g.fireTimer=999;g.rewardBonus=.05;
 for(let i=0;i<20;i++){const p=drop(g,'peanut',g.x,g.y);p.speed=0;stepGame(g,.01);}
 assert.equal(g.score,21,'small passive gains accumulate instead of disappearing in rounding');
}
assert.ok(difficulty(120).speed>difficulty(0).speed);assert.ok(difficulty(121).hp-difficulty(119).hp<.03);
console.log('PASS: frame hitch budgets, slower/single-chip drops, 22 telegraphed Boss skills, 3 phases, safe wave gaps, shared shop/firing numbers, first-use hints, 6 weapons, 5 equipment lines, wallet validation, upgrades, 15 enemies, 11 bosses, random Boss roster with configurable timings, no overlapping Boss, 9 rewards, splash, pause, revive, smooth difficulty and 300s pooled simulation in both arenas.');
