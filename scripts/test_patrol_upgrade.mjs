import assert from 'node:assert/strict';
import {GAME_CONFIG as C,unlockedCombos,threatUsed,threatLimit,canSpawn,cleanPreferences,cleanTutorial} from '../play/game-config.mjs';
import {createGame,stepGame,spawnEnemy,spawnBoss,hitEnemy,chargeCounter,releaseCounter,graze,segmentDistance,chooseEvolution,drop,settleIncome,supplyPurchase,reviveGame,damage,cleanLoadout,frameSeconds} from '../play/game-core.mjs';
function game(){const g=createGame();g.running=true;g.spawn=g.foodTimer=g.fireTimer=-999;g.fireTimer=999;g.nextSupply=g.nextBoss=g.nextEvent=99999;return g;}
assert.equal(segmentDistance(5,3,0,0,10,0),3);assert.equal(segmentDistance(-5,0,0,0,10,0),5);assert.equal(segmentDistance(3,4,0,0,0,0),5);
{
 const g=game(),o={graze:false};graze(g,o,35,30);graze(g,o,35,30);assert.equal(g.grazes,1);assert.equal(g.energy,12);assert.equal(g.score,2);
 chargeCounter(g,1000);assert.equal(g.energy,100);chargeCounter(g,NaN);assert.equal(g.energy,100);
 for(const flag of ['paused','choice','supplyChoice']){g[flag]=true;assert.equal(releaseCounter(g),false);assert.equal(g.energy,100);g[flag]=false;}
 g.counterEnabled=false;assert.equal(releaseCounter(g),false);g.counterEnabled=true;assert.equal(releaseCounter(g),true);assert.equal(g.energy,0);assert.equal(releaseCounter(g),false);assert.equal(g.counters,1);assert.equal(g.invincible,0);
 const b=g.bullets.find(b=>b.counter&&b.active);assert.equal(b.pierce,8);assert.equal(b.damage,12);
}
{
 const g=game();g.energy=100;const e=spawnEnemy(g,'tank',{x:g.x,y:g.y-160,hp:100,shield:0,speed:0});releaseCounter(g);
 for(const [i,x] of [g.x,g.x+150].entries())Object.assign(g.hostile[i],{active:true,x,y:g.y-70,vx:0,vy:0,r:10,age:1,delay:0,life:5,damage:1,graze:false});
 stepGame(g,.15);assert.equal(g.hostile[0].active,false,'only bullets near counter path cleared');assert.equal(g.hostile[1].active,true);assert.ok(e.hp<100);
}
{
 const g=game();const b=spawnBoss(g,0,0);g.x=g.target=b.x;g.y=g.targetY=b.y+170;b.attack=999;b.group.skillTimer=999;g.energy=100;releaseCounter(g);stepGame(g,.16);assert.ok(b.hp<=b.maxHp-18);assert.ok(b.group.interruptUntil>g.elapsed);const cooldown=b.group.interruptUntil;g.energy=100;releaseCounter(g);stepGame(g,.16);assert.equal(b.group.interruptUntil,cooldown);
}
assert.deepEqual(unlockedCombos({pierce:2,track:1,spread:0}).map(c=>c.id),['boomerang']);assert.equal(unlockedCombos({pierce:2,track:2,spread:2}).length,3);
{
 const g=game();for(const key of ['pierce','pierce','track','spread','spread','track']){g.choice=true;g.choiceQueue=1;chooseEvolution(g,key);}assert.deepEqual([...g.combos].sort(),['boomerang','hunter','storm']);g.choice=true;g.choiceQueue=1;chooseEvolution(g,'track');assert.equal(new Set(g.combos).size,g.combos.length);
}
{
 const g=game();assert.equal(spawnEnemy(g,'ad',{x:g.x,y:g.y}),null,'no contact spawning');while(spawnEnemy(g,'tank',{x:100,y:-40})){}assert.ok(threatUsed(g)<=threatLimit(g));assert.equal(canSpawn(g,'tank'),false);
}
{
 const g=game();g.score=80;g.supplyChoice=true;g.shield=0;assert.equal(supplyPurchase(g,'repair'),true);assert.equal(g.spent,18);assert.equal(g.shield,1);assert.equal(settleIncome(g),62);assert.equal(settleIncome(g),0);damage(g,'广告');g.invincible=0;damage(g,'广告');reviveGame(g);g.score+=15;g.supplyChoice=true;assert.equal(supplyPurchase(g,'boost'),false,'cannot spend already credited money');assert.equal(supplyPurchase(g,'save'),true);assert.equal(settleIncome(g),15);assert.equal(settleIncome(g),0);
}
{
 const g=game();g.nextSupply=C.pacing.firstChip;stepGame(g,27.9);assert.ok(!g.items.some(p=>p.active&&p.kind==='chip'));stepGame(g,1);assert.equal(g.choice,true);assert.ok(g.elapsed>=28&&g.elapsed<29);chooseEvolution(g,'pierce');assert.equal(g.firstGrowth,true);const t=g.elapsed;stepGame(g,20);assert.equal(g.build.pierce,1);g.paused=true;stepGame(g,100);assert.ok(g.elapsed<t+21);assert.equal(frameSeconds(4000),.05);
}
{
 const old={selected:'beam',levels:{worm:3,beam:2,shell:2,fortune:3}};const clean=cleanLoadout(old);assert.equal(clean.selected,'beam');assert.equal(clean.levels.shell,2);assert.equal(clean.levels.fortune,3);assert.equal(cleanPreferences({volume:NaN}).volume,.15);assert.deepEqual(cleanTutorial({graze:true,injected:'bad'}),{graze:true});
}
{
 const g=game();g.fireTimer=0;g.weapon='seeker';const h=spawnEnemy(g,'healer',{x:100,y:100,speed:0}),a=spawnEnemy(g,'ad',{x:g.x,y:300,speed:0});stepGame(g,.02);const shot=g.bullets.find(b=>b.active);const target=shot.targetID;a.x=shot.x;a.y=shot.y-100;stepGame(g,.02);assert.equal(shot.targetID,target,'tracking target is stable');
}
console.log('PASS: swept collisions; once-only graze; energy limits; paused/disabled/cooldown guards; limited clearing; Boss damage and interrupt cooldown; three unique combos; safe spawn/threat cap; spend/settle/revive ledger; first growth at 28s; old loadout and preferences; stable targeting.');

{
 const g=game();g.x=g.target=g.width/2;g.y=g.targetY=g.height*.23;const boss=spawnBoss(g,0,0);boss.attack=999;stepGame(g,.3);assert.equal(g.shield,1,'Boss arrival cannot inflict contact damage immediately');
}
