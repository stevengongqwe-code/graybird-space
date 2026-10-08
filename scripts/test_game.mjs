import assert from 'node:assert/strict';
import {createGame,stepGame,difficulty,FIRE_RATES} from '../play/game-core.mjs';

function isolated(){const g=createGame();g.running=true;g.spawn=g.foodTimer=-999;g.nextBoost=999;g.fireTimer=999;return g;}
for(const label of ['广告','弹窗','无效信息']){
 const g=isolated();g.items=[{kind:'hazard',label,x:g.x,y:g.height-72,speed:0}];
 assert.equal(stepGame(g,.016),'hit');assert.equal(g.running,false);assert.equal(g.cause,label);
}
{
 const g=isolated();g.items=[{kind:'hazard',label:'广告',x:g.x,y:300,speed:0}];g.bullets=[{x:g.x,y:350}];
 stepGame(g,.08);assert.equal(g.kills,1);assert.equal(g.bullets.length,0);assert.equal(g.items[0].kind,'peanut');assert.equal(g.score,0);
 g.items[0].y=g.height-72;stepGame(g,.016);assert.equal(g.score,1);
}
{
 const g=isolated();g.items=[{kind:'boost',x:g.x,y:g.height-72,speed:0}];stepGame(g,.016);assert.equal(g.gun,2);
 for(let i=0;i<5;i++){g.items=[{kind:'boost',x:g.x,y:g.height-72,speed:0}];stepGame(g,.016);}
 assert.equal(g.gun,4);assert.equal(g.score,0);
 const shots=[];for(let gun=1;gun<=4;gun++){const a=isolated();a.gun=gun;a.fireTimer=0;stepGame(a,2);shots.push(a.shots);assert.ok(a.shots>=FIRE_RATES[gun-1]*2);}
 assert.ok(shots.every((v,i)=>!i||v>shots[i-1]));
}
{
 const g=isolated();g.paused=true;stepGame(g,10);assert.equal(g.elapsed,0);assert.equal(g.shots,0);
 g.paused=false;assert.equal(stepGame(g,31),'clear');assert.equal(g.elapsed,30);
 assert.equal(stepGame(g,10),null);assert.equal(g.elapsed,30);
 assert.ok(difficulty(29).speed>difficulty(1).speed);assert.ok(difficulty(29).interval<difficulty(1).interval);
 assert.equal(difficulty(29).level,5);
}
// Both orientations are survivable with the actual spawning/shooting rules.
for(const [w,h] of [[600,760],[900,600]]){
 const g=createGame(w,h);g.running=true;let result;
 for(let i=0;i<1900&&g.running;i++)result=stepGame(g,1/60,()=>.5);
 assert.equal(result,'clear');assert.ok(g.gun>1);assert.ok(g.score>0);assert.ok(g.kills>0);
 const fresh=createGame(w,h);assert.equal(fresh.gun,1);assert.equal(fresh.score,0);assert.equal(fresh.elapsed,0);
}
console.log('PASS: fatal contact, caterpillar hits/drops, peanut pickup, four firing rates, upgrade cap, pause, 30s clear, increasing difficulty, restart, both orientations.');
