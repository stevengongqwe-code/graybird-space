// Reproducible strategy proxies, not human play or Android hardware measurements.
import * as current from '../play/game-core.mjs';
import {threatUsed} from '../play/game-config.mjs';
import {writeFileSync} from 'node:fs';
const rng=seed=>()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const rows=[];
for(const ability of [false,true])for(const strategy of ['stationary','dodge','collector','risk'])for(const route of ['pierce','spread','track']){
 const g=current.createGame(600,760);g.running=true;g.counterEnabled=ability;g.random=rng(37);let growth=null,hurt=null,death=null,firstBoss=null,bossStart=null,bossDuration=null,peakEnemies=0,peakBullets=0,peakThreat=0;
 for(let frame=0;frame<180*60&&g.running;frame++){
  if(g.choice){growth??=+g.elapsed.toFixed(2);current.chooseEvolution(g,g.build[route]<3?route:['pierce','spread','track'].find(k=>g.build[k]<3));}
  if(g.supplyChoice)current.supplyPurchase(g,'save');
  if(frame%6===0&&strategy!=='stationary'){
   const danger=(x,y)=>{let score=0;for(const e of g.enemies)if(e.active){const d=Math.hypot(x-e.x,y-(e.y+e.speed*.35));if(current.segmentDistance(e.x,e.y,g.x,g.y,x,y)<e.r+(strategy==='risk'?20:45))score+=15;score+=4000/Math.max(15,d-e.r)**2;}for(const b of g.hostile)if(b.active&&b.age>=b.delay){const d=Math.hypot(x-(b.x+b.vx*.5),y-(b.y+b.vy*.5));score+=2500/Math.max(10,d-b.r)**2;}for(const h of g.hazards)if(h.active){if(h.kind==='lane'&&Math.abs(x-h.x)<70)score+=8;if(h.kind==='zone'&&Math.hypot(x-h.x,y-h.y)<100)score+=8;}return score;};
   let target=null;if(strategy!=='dodge')for(const p of g.items)if(p.active&&p.kind!=='fake'){const weight=p.kind==='chip'?.08:p.kind==='energy'?.35:1,d=Math.hypot(p.x-g.x,p.y-g.y)*weight;if(!target||d<target.d)target={x:p.x,y:p.y,d};}
   let best=null,bestScore=Infinity;const xs=[80,180,300,420,520,g.x],ys=[570,650,710,g.y];if(strategy==='risk')for(const e of g.enemies)if(e.active&&!e.boss&&e.y>200){xs.push(Math.max(35,Math.min(565,e.x+e.r+24)),Math.max(35,Math.min(565,e.x-e.r-24)));ys.push(e.y+e.speed*.15);}
   if(target){xs.push(target.x);ys.push(Math.max(160,target.y));}
   for(const x of xs)for(const y of ys){let score=danger(x,y)*(strategy==='risk'?.16:1);score+=Math.hypot(x-g.x,y-g.y)/1600;if(target)score+=Math.hypot(x-target.x,y-target.y)/300;else{const boss=g.enemies.find(e=>e.active&&e.boss);score+=Math.abs(x-(boss?.x||300))/800;score+=Math.abs(y-700)/1000;}if(strategy==='risk'){let near=Infinity;for(const b of g.hostile)if(b.active)near=Math.min(near,Math.abs(Math.hypot(x-b.x,y-b.y)-(b.r+24)));for(const e of g.enemies)if(e.active)near=Math.min(near,Math.abs(Math.hypot(x-e.x,y-e.y)-(e.r+24)));score+=Math.min(8,near/35);} if(score<bestScore){bestScore=score;best={x,y};}}
   g.target=best.x;g.targetY=best.y;
  }
  if(ability&&g.energy===100)current.releaseCounter(g);
  current.stepGame(g,1/60);g.feedback.length=0;
  if(g.shield===0)hurt??=+g.elapsed.toFixed(2);if(!g.running)death=+g.elapsed.toFixed(2);
  if(g.groups.some(o=>o.active)){firstBoss??=+g.elapsed.toFixed(2);bossStart??=g.elapsed;}else if(bossStart!==null&&g.bossesDefeated)bossDuration??=+(g.elapsed-bossStart).toFixed(2);
  peakEnemies=Math.max(peakEnemies,g.enemies.filter(e=>e.active).length);peakBullets=Math.max(peakBullets,g.hostile.filter(b=>b.active).length);peakThreat=Math.max(peakThreat,threatUsed(g));
 }
 rows.push({ability,strategy,route,firstEvolution:growth,firstShieldLoss:hurt,death,seconds:+g.elapsed.toFixed(2),peanuts:g.score,kills:g.kills,grazes:g.grazes,counters:g.counters,bosses:g.bossesDefeated,firstBoss,bossDuration,peakEnemies,peakBullets,peakThreat:+peakThreat.toFixed(1)});
}
writeFileSync('/tmp/patrol-simulation.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
