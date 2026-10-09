import {GAME_CONFIG as C,unlockedCombos,canSpawn} from './game-config.mjs?v=7-counter';
// Peanut Hunter: isolated, dependency-free simulation. All moving entities are pooled.
export const FIRE_RATES = [2.5, 3.3, 4.3, 5.5];
export const REVIVE_COSTS = [50,150,400,1000];
export const BOSS_NAMES = ['弹窗矩阵','标题党巨兽','AI 味聚合体','水军头目','诈骗短信王','算法茧房','键盘侠','缓存幽灵','时钟螃蟹','垃圾回收王','数据吞噬者'];
export const BOSS_LINES = ['又弹。你没别的事吗。','标题挺大，脑子呢。','咕，又开始绕了。','人挺多。都没话说。','花生还带诈骗？','圈这么小，房租挺贵吧。','哟，嘴替来了。','删掉了，怎么还在。','别催。鸟没有考勤。','这些垃圾，也配当王。','吃数据行。花生不行。'];
export const DEATH_LINES = ['被弹窗撞死了，丢鸟现眼，嘎。','花生没吃完。先躺了。','翅膀还在，信号没了。','这广告，物理攻击啊。','咕。刚才不算。','说好再活一秒的。','嘎，手比嘴慢。','花生归仓，鸟归零。','地球太挤了。','啾……啾不动了。'];
export const ENEMY_TYPES = ['ad','headline','army','elite','splitter','small','dash','tank','healer','drone','sniper','ghost','mine','leech','beetle'];
export const WEAPONS = [
 {id:'worm',name:'毛毛虫机炮',description:'稳定直射，升级增加伤害。',prices:[0,45,110],rate:1,damage:1},
 {id:'scatter',name:'种子霰弹',description:'近距离三发扇射，擅长清理群怪。',prices:[60,130,240],rate:.68,damage:.8},
 {id:'seeker',name:'萤火追踪弹',description:'自动转向敌人，优先追击治疗怪。',prices:[85,160,280],rate:.8,damage:1.1},
 {id:'beam',name:'针叶穿透炮',description:'高速穿透直线目标，适合坦克和 Boss。',prices:[100,180,310],rate:.75,damage:1.4},
 {id:'bomb',name:'松果爆破弹',description:'命中后小范围爆破，射速较慢。',prices:[120,210,340],rate:.48,damage:2.1},
 {id:'frost',name:'冰晶羽弹',description:'命中减速，争取躲避弹幕的空间。',prices:[75,150,260],rate:.9,damage:.9}
];
export const EQUIPMENT = [
 {id:'shell',name:'护盾蛋壳',description:'每级多一枚开局护盾，最多额外两枚。',prices:[65,145]},
 {id:'boots',name:'轻羽推进器',description:'每级提升 8% 移动速度。',prices:[40,95,180]},
 {id:'collector',name:'花生收集器',description:'每级扩大 18 像素拾取范围。',prices:[45,100,190]},
 {id:'power',name:'虫虫供能器',description:'每级提升 6% 武器伤害。',prices:[70,155,290]},
 {id:'fortune',name:'花生幸运袋',description:'每级增加 5% 花生收益。',prices:[55,120,220]}
];
export function cleanLoadout(value={}) {
 const result={selected:'worm',levels:{}};
 for(const item of [...WEAPONS,...EQUIPMENT]) result.levels[item.id]=Number.isInteger(value?.levels?.[item.id])?Math.max(item.id==='worm'?1:0,Math.min(item.prices.length,value.levels[item.id])):item.id==='worm'?1:0;
 if(WEAPONS.some(w=>w.id===value?.selected)&&result.levels[value.selected]>0)result.selected=value.selected;
 return result;
}
export function purchaseUpgrade(value,balance,id) {
 const loadout=cleanLoadout(value),item=[...WEAPONS,...EQUIPMENT].find(i=>i.id===id);
 if(!Number.isSafeInteger(balance)||balance<0||!item)return {ok:false,balance,loadout};
 const level=loadout.levels[id],cost=item.prices[level];
 if(cost===undefined||balance<cost)return {ok:false,balance,loadout};
 loadout.levels[id]++;return {ok:true,balance:balance-cost,loadout};
}
export function applyLoadout(g,value) {
 const loadout=cleanLoadout(value);g.loadout=loadout;g.weapon=loadout.selected;g.weaponLevel=loadout.levels[g.weapon];
 g.shield=1+loadout.levels.shell;g.moveSpeed=1+loadout.levels.boots*.08;g.pickupRadius=loadout.levels.collector*18;g.rewardBonus=loadout.levels.fortune*.05;
}
export const difficulty = t => ({interval:Math.max(.4,1.12-t*.0032),speed:Math.min(2.7,1.18+t/300),hp:1.45+Math.max(0,t-25)/110,cap:Math.min(24,8+Math.floor(t/35)),level:1+Math.floor(t/60)});
export function weaponStats(id,level=1,build={pierce:0,spread:0,track:0},power=0){
 const weapon=WEAPONS.find(w=>w.id===id)||WEAPONS[0];level=clamp(level,1,3);
 const projectiles=weapon.id==='scatter'?3+(level===3?2:0):build.spread?3:1;
 return {projectiles,damage:weapon.damage*(projectiles>1?.65:1)*(1+(level-1)*.25)*(1+power*.06)+(build.track===3?.5:0),rate:FIRE_RATES[0]*weapon.rate,pierce:weapon.id==='beam'?3+level:build.pierce?2+build.pierce:1,splash:weapon.id==='bomb'?55+level*10:0,slow:weapon.id==='frost'?1.3+level*.35:0,track:weapon.id==='seeker'?Math.max(2,build.track+level):build.track};
}
// A foreground frame hitch discards overdue wall time instead of pausing or fast-forwarding danger.
export const frameSeconds=milliseconds=>Math.min(.05,Math.max(0,Number.isFinite(milliseconds)?milliseconds/1000:0));
export const firingRate = g => FIRE_RATES[Math.min(3,g.gun-1)]*(WEAPONS.find(w=>w.id===g.weapon)?.rate||1)*(g.effects.rage>0?1.7:1)*(g.effects.rapid>0?1.25:1);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
let nextID=0;
function pool(size){return Array.from({length:size},()=>({active:false}));}
function take(p){for(let i=0;i<p.length;i++)if(!p[i].active){const o=p[i];o.active=true;o.id=++nextID;return o;}return null;}
export function createGame(width=900,height=600){
 return {width,height,running:false,paused:false,elapsed:0,x:width/2,y:height-72,target:width/2,targetY:height-72,hp:1,shield:1,invincible:0,score:0,rewardCarry:0,spent:0,credited:0,energy:0,counterEnabled:C.counter.enabled,counters:0,combos:[],feedback:[],grazeRing:0,hurtRing:0,readyRing:0,hurtX:0,hurtY:0,supplyChoice:false,firstGrowth:false,eliteSpawned:false,reliefUntil:0,kills:0,combo:0,maxCombo:0,grazes:0,shots:0,gun:1,build:{pierce:0,spread:0,track:0},effects:{magnet:0,rage:0,slow:0,double:0,rapid:0,fortune:0},enemies:pool(64),bullets:pool(256),hostile:pool(1024),items:pool(320),particles:pool(96),texts:pool(48),groups:pool(32),spawn:0,foodTimer:0,fireTimer:0,nextBoss:C.pacing.firstBoss,bossIndex:0,bossBag:[],pendingBossRoster:null,weapon:'worm',weaponLevel:1,loadout:cleanLoadout(),moveSpeed:1,pickupRadius:0,rewardBonus:0,nextSupply:C.pacing.firstChip,lastChipDrop:-Infinity,tutorial:{seen:{},queue:[],line:"",left:0},hazards:pool(12),bossesDefeated:0,warningIndex:-1,nextEvent:C.pacing.firstEvent,event:'',eventUntil:0,notice:'',noticeTime:0,noticeSerial:0,choice:false,choiceQueue:0,revives:0,cause:'',frame:0,last:0,random:Math.random};
}
export function notice(g,line,seconds=2.5){g.notice=line;g.noticeTime=seconds;g.noticeSerial++;}
export function hint(g,key,line){if(g.tutorial.seen[key])return;g.tutorial.seen[key]=true;if(g.tutorial.queue.length<6)g.tutorial.queue.push(line);}
function floating(g,x,y,label,color='#d5e8f3'){const p=take(g.texts);if(p)Object.assign(p,{x,y,label,color,life:1.1});}
function sparks(g,x,y,color='#e5bd7b',count=5){for(let i=0;i<count;i++){const p=take(g.particles);if(p)Object.assign(p,{x,y,vx:(g.random()-.5)*130,vy:(g.random()-.5)*130,life:.35,color});}}
export function feedback(g,kind){if(g.feedback.length<C.feedback.events)g.feedback.push(kind);}
export function chargeCounter(g,amount){if(!g.counterEnabled||!Number.isFinite(amount)||amount<=0)return false;const before=g.energy;g.energy=Math.min(C.counter.max,g.energy+amount);if(before<C.counter.max&&g.energy===C.counter.max){g.readyRing=.6;feedback(g,'ready');hint(g,'ready','反击已充满：按技能键，或点右下角反击。');}return g.energy>before;}
export function releaseCounter(g){
 if(!g.counterEnabled||!g.running||g.paused||g.choice||g.supplyChoice||g.energy<C.counter.max)return false;
 const b=take(g.bullets);if(!b)return false;
 const target=priorityTarget(g,g.x,g.y),a=target?Math.atan2(target.y-g.y,target.x-g.x):-Math.PI/2;
 Object.assign(b,{x:g.x,y:g.y-30,prevX:g.x,prevY:g.y-30,vx:Math.cos(a)*C.counter.speed,vy:Math.sin(a)*C.counter.speed,r:12,damage:C.counter.damage,pierce:C.counter.pierce,weapon:'counter',counter:true,splash:0,frost:0,hit1:0,hit2:0,hit3:0,hit4:0,hit5:0,hit6:0,hit7:0,hit8:0,hits:0,track:0,targetID:0,turned:false,life:1.8,originX:g.x,originY:g.y});
 g.energy=0;g.counters++;feedback(g,'counter');sparks(g,g.x,g.y,'#b7d66d');return true;
}
export function priorityTarget(g,x,y,exclude=[],maxDistance=Infinity){let best=null,score=Infinity;for(const e of g.enemies)if(e.active&&!e.flee&&!exclude.includes(e.id)&&Math.hypot(e.x-x,e.y-y)<=maxDistance){const priority=e.boss?.55:e.type==='healer'?.35:e.type==='sniper'?.45:e.type==='elite'?.55:e.type==='mine'?.6:1,d=Math.hypot(e.x-x,e.y-y)*priority;if(d<score){best=e;score=d;}}return best;}
// Income is credited once; only uncredited run earnings can be spent at supply.
export function settleIncome(g){const net=Math.max(0,g.score-g.spent),reward=Math.max(0,net-g.credited);g.credited+=reward;return reward;}
export function supplyPurchase(g,kind){
 if(!g.supplyChoice||!g.running)return false;
 if(kind!=='save'&&!['repair','boost'].includes(kind))return false;
 const cost=kind==='save'?0:C.economy[kind],available=Math.max(0,g.score-g.spent-g.credited);
 if(cost>available||(kind==='repair'&&g.shield>=4))return false;
 g.spent+=cost;if(kind==='repair')g.shield=Math.min(4,g.shield+1);if(kind==='boost'){const effect=['rapid','rage','magnet'][Math.floor(g.random()*3)];g.effects[effect]=Math.max(g.effects[effect],15);}
 g.supplyChoice=false;g.reliefUntil=g.elapsed+5;feedback(g,'supply');return true;
}
export function drop(g,kind,x,y,value=1){let p=take(g.items);if(!p&&kind==='chip'){p=g.items.find(o=>o.kind==='peanut'||o.kind==='fake');if(p){p.active=true;p.id=++nextID;}}if(p){if(kind==='chip')hint(g,'chip','进化芯片：捡到后选一种成长。每两次进化提升一档射速。');if(kind==='fake')hint(g,'fake','裂壳、红色叉号的花生是诈骗，别捡。');if(kind==='energy')hint(g,'energy','带虫纹的花生：反击能量 +15。');}if(p)Object.assign(p,{kind,x:clamp(x,24,g.width-24),y,speed:145,vx:0,vy:0,value,age:0,flash:-1,r:kind==='peanut'||kind==='fake'?14:20});return p;}
function enemySlot(g,priority=false){
 const count=g.enemies.reduce((n,e)=>n+(e.active&&!e.retiring?1:0),0);
 if(count>=(g.groups.some(o=>o.active)?Math.min(10,difficulty(g.elapsed).cap):difficulty(g.elapsed).cap)){if(!priority)return null;let victim=null,far=-1;for(const e of g.enemies)if(e.active&&!e.boss&&!e.retiring){const distance=Math.hypot(e.x-g.x,e.y-g.y);if(distance>far){far=distance;victim=e;}}if(!victim)return null;victim.active=false;}
 return take(g.enemies);
}
export function spawnEnemy(g,type='ad',options={},priority=false){
 const d=difficulty(g.elapsed);if(!priority&&!canSpawn(g,type))return null;const sx=options.x??(55+g.random()*(g.width-110)),sy=options.y??-40;if(Math.hypot(sx-g.x,sy-g.y)<(type==='tank'?36:25)+19+70)return null;const e=enemySlot(g,priority);if(!e)return null;
 const hp=d.hp*(type==='elite'?2.3:type==='tank'?5:type==='beetle'?2:type==='mine'?1.5:1),x=sx;
 Object.assign(e,{type,boss:false,retiring:false,x,y:options.y??-40,baseX:x,r:type==='tank'?36:25,hp,maxHp:hp,speed:(type==='tank'?32:75)*d.speed,age:0,phase:'drift',timer:0,vx:0,vy:0,affix:'',shield:type==='beetle'?Math.ceil(d.hp):0,hitFlash:0,slow:0,attack:2.5,graze:false,generation:0,flee:false,group:null,label:{ad:['广告','弹窗','无效信息'][Math.floor(g.random()*3)],headline:'标题党',army:'水军',elite:'精英',splitter:'分裂虫',small:'小虫',dash:'冲刺怪',tank:'坦克',healer:'奶妈',drone:'巡逻无人机',sniper:'信号狙击手',ghost:'缓存幽灵',mine:'广告地雷',leech:'流量水蛭',beetle:'盾甲虫'}[type]||type});
 if(type==='elite'){e.affix=['shield','swift','split'][Math.floor(g.random()*3)];if(e.affix==='shield')e.shield=hp;if(e.affix==='swift')e.speed*=1.8;}
 Object.assign(e,options);return e;
}
function army(g,y=-35){if(difficulty(g.elapsed).cap-g.enemies.reduce((n,e)=>n+(e.active&&!e.retiring?1:0),0)<5)return false;const center=clamp(g.random()*g.width,110,g.width-110);for(let i=0;i<5;i++)spawnEnemy(g,'army',{x:center+(i-2)*42,y:y-Math.abs(i-2)*20,speed:120*difficulty(g.elapsed).speed});return true;}
export function spawnBoss(g,index=g.bossIndex,selectedRoster=index%BOSS_NAMES.length){
 const group=take(g.groups);if(!group)return null;
 const roster=selectedRoster%BOSS_NAMES.length,scale=1+Math.min(.8,Math.floor(index/3)*.1),hp=Math.round((g.bossesDefeated===0?C.pacing.firstBossHp:92+g.bossesDefeated*30)*scale*[1,1.05,.85,1,1,1,1,1,1.1,1.15,1.1][roster]);
 Object.assign(group,{roster,index,scale,maxHp:hp,remaining:1,defeated:false,rage:false,phase:1,skillTimer:6,skillIndex:0});
 const e=enemySlot(g,true);if(!e){group.active=false;return null;}
 Object.assign(e,{type:'boss',boss:true,retiring:false,label:BOSS_NAMES[roster],roster,x:g.width/2,y:g.height*.23,baseX:g.width/2,r:52,hp,maxHp:hp,speed:85*scale,age:0,phase:'drift',timer:0,attack:1.6/scale,slow:0,vx:0,vy:0,affix:'',shield:0,graze:false,generation:0,flee:false,group,cocoonRadius:Math.hypot(g.width,g.height)*.65,tauntAt:10,flash:false});
 g.event='';feedback(g,'boss');notice(g,BOSS_NAMES[roster]+' · '+BOSS_LINES[roster],3);return e;
}
function peanuts(g,x,y,count){for(let i=0;i<count;i++){const p=drop(g,'peanut',x+(g.random()-.5)*80,y,1);if(p){p.vx=(g.random()-.5)*240;p.vy=-80-g.random()*140;}}}
function kill(g,e){
 if(!e.active)return;e.active=false;g.kills++;g.combo++;if(g.kills===1)hint(g,'first-kill','首个干扰已清除。捡到的花生，阵亡后存进粮仓。');if(g.combo===5&&!g.tutorial.seen.combo){g.score+=3;hint(g,'combo','5 连击 · 花生 +3。躲开撞击，连击才留得住。');}g.maxCombo=Math.max(g.maxCombo,g.combo);if(g.kills%36===0&&!e.boss)dropEvolution(g,e.x,e.y);sparks(g,e.x,e.y,e.type==='ghost'?'#a6cbe3':e.type==='healer'?'#b7d66d':'#e5bd7b');feedback(g,e.boss?'boss-hit':'kill');if(['sniper','dash','mine'].includes(e.type))chargeCounter(g,C.counter.threatKill);if(e.type==='elite'){chargeCounter(g,C.counter.elite);drop(g,'energy',e.x,e.y);}
 if(e.boss){
  const group=e.group;
  if(e.roster===2&&e.generation<2){group.remaining++;e.active=true;e.retiring=true;for(let i=0;i<2;i++){const child=enemySlot(g,true);if(child)Object.assign(child,e,{active:true,retiring:false,id:++nextID,x:clamp(e.x+(i?45:-45),35,g.width-35),baseX:e.x+(i?45:-45),y:e.y+28,generation:e.generation+1,hp:Math.ceil(e.maxHp*.55),maxHp:Math.ceil(e.maxHp*.55),r:Math.max(24,e.r*.7),age:0,speed:e.speed*(group.rage?1.8:1),affix:group.rage?'swift':'',label:['再强调一下','总而言之'][i],phase:'drift',attack:.7});else group.remaining--;}
   e.active=false;e.retiring=false;floating(g,e.x,e.y,'换句话说……');return;
  }
  group.remaining--;
  if(group.remaining===0){group.defeated=true;group.active=false;for(const h of g.hazards)if(h.group===group)h.active=false;g.bossesDefeated++;g.supplyChoice=true;g.shield=Math.min(4,g.shield+1);hint(g,'supply','Boss 已下线：花生可换补给；花掉的部分不再入库。');feedback(g,'victory');g.reliefUntil=g.elapsed+5;for(const b of g.hostile)b.active=false;drop(g,'magnet',e.x,e.y);g.nextEvent=Math.max(g.nextEvent,g.elapsed+12);g.nextBoss=Math.max(g.nextBoss,g.elapsed+30);peanuts(g,e.x,e.y,30+Math.floor(g.random()*21));dropEvolution(g,e.x,e.y,true);notice(g,BOSS_NAMES[e.roster]+'，下线了。',3);if(e.roster===3)for(const m of g.enemies)if(m.active&&!m.boss)m.flee=true;}
  return;
 }
 const x=e.x,y=e.y,type=e.type,affix=e.affix,speed=e.speed;const count=type==='elite'?5:type==='tank'?4:1;peanuts(g,x,y,count);
 if(type==='splitter'||affix==='split'){for(let i=0;i<2;i++)spawnEnemy(g,'small',{x:x+(i?24:-24),y,r:14,hp:1,maxHp:1,speed:speed*1.25},true);}
 if(type==='elite'&&g.random()<.1)dropEvolution(g,x,y);
 const chance=Math.min(.14,.045+g.elapsed/12000);
 if(g.random()<chance)drop(g,['magnet','egg','rage','slow','double','rapid','repair','clear','fortune'][Math.floor(g.random()*9)],x,y);
}
export function hitEnemy(g,e,amount=1){if(!e.active)return;e.hitFlash=C.feedback.hitFlash;sparks(g,e.x,e.y,'#c6d1d7',2);feedback(g,'hit');if(e.shield>0){e.shield=Math.max(0,e.shield-amount);sparks(g,e.x,e.y);return;}e.hp-=amount;if(e.boss&&e.hp<=e.maxHp*.5&&!e.group.rage){e.group.rage=true;notice(g,e.label+' · 狂暴',2);if(e.roster===2)for(const a of g.enemies)if(a.active&&a.group===e.group&&a.generation>0){a.speed*=1.8;a.affix='swift';}}if(e.boss){const phase=e.hp/e.maxHp<=.3?3:e.hp/e.maxHp<=.65?2:1;if(phase>e.group.phase){e.group.phase=phase;e.group.skillTimer=Math.min(e.group.skillTimer,3);notice(g,e.label+' · 第 '+phase+' 阶段',2);}}if(e.hp<=0)kill(g,e);}
export function damage(g,cause,amount=1,source=null){
 if(g.invincible>0||!g.running)return false;
 g.combo=0;g.cause=cause;g.hurtRing=C.feedback.hurtRing;g.hurtX=source?.x??g.x;g.hurtY=source?.y??g.y;feedback(g,'hurt');
 if(g.shield>0){g.shield--;g.invincible=1;floating(g,g.x,g.y-40,'蛋碎了','#a6cbe3');return false;}
 g.hp-=amount;if(g.hp<=0){feedback(g,'death');g.running=false;g.choice=false;g.supplyChoice=false;return true;}g.invincible=1;return false;
}
export function reviveGame(g){if(g.running)return false;g.revives++;g.hp=1;g.invincible=2;g.running=true;g.paused=false;g.choice=false;g.combo=0;g.cause='';for(const b of g.hostile)if(b.active&&Math.hypot(b.x-g.x,b.y-g.y)<150)b.active=false;for(const e of g.enemies)if(e.active&&!e.boss&&Math.hypot(e.x-g.x,e.y-g.y)<120)e.active=false;for(const h of g.hazards)h.active=false;notice(g,'花生买命。贵得要死。');return true;}
export function chooseEvolution(g,type){if(!g.choice||!(type in g.build)||g.build[type]>=3)return false;g.build[type]++;g.gun=Math.min(4,1+Math.floor((g.build.pierce+g.build.spread+g.build.track)/2));g.choiceQueue--;if(Object.values(g.build).every(v=>v===3)&&g.choiceQueue>0){g.score+=10*g.choiceQueue;g.choiceQueue=0;}g.choice=g.choiceQueue>0;g.firstGrowth=true;g.combos=unlockedCombos(g.build).map(c=>c.id);feedback(g,'evolve');g.fireTimer=0;notice(g,{pierce:'穿透虫，串起来。',spread:'散射虫，别挤。',track:'追踪虫，追着烦。'}[type]);return true;}
// All ordinary chip sources share a cooldown: dense waves cannot snowball upgrades.
function dropEvolution(g,x,y,bossReward=false){
 if(!bossReward&&(g.elapsed<C.pacing.firstChip||g.elapsed-g.lastChipDrop<C.pacing.chipCooldown))return false;
 if(Object.values(g.build).every(v=>v===3))return false;
 const existing=g.items.find(p=>p.active&&p.kind==='chip');if(existing){if(bossReward){existing.x=x;existing.y=y;existing.age=0;g.lastChipDrop=g.elapsed;}return false;}
 const item=drop(g,'chip',x,y);if(!item)return false;g.lastChipDrop=g.elapsed;return true;
}
function chip(g){if(Object.values(g.build).every(v=>v===3)){g.score+=10;floating(g,g.x,g.y-35,'芯片满级 +10');return;}g.choiceQueue++;g.choice=true;}
function fire(g){
 const weapon=WEAPONS.find(w=>w.id===g.weapon)||WEAPONS[0],level=g.weaponLevel||1;
 const n=weapon.id==='scatter'?3+(level===3?2:0):g.build.spread?3:1,angle=.15+g.build.spread*.035;
 const damage=weaponStats(g.weapon,level,g.build,g.loadout.levels.power).damage;
 for(let i=0;i<n;i++){const b=take(g.bullets);if(b){const a=n===1?0:(i-(n-1)/2)*angle;Object.assign(b,{x:g.x,y:g.y-35,prevX:g.x,prevY:g.y-35,vx:Math.sin(a)*610,vy:-Math.cos(a)*610,r:7,damage,pierce:weapon.id==='beam'?3+level:g.build.pierce?2+g.build.pierce:1,weapon:weapon.id,splash:weapon.id==='bomb'?55+level*10:0,frost:weapon.id==='frost'?1.3+level*.35:0,hit1:0,hit2:0,hit3:0,hit4:0,hit5:0,track:weapon.id==='seeker'?Math.max(2,g.build.track+level):g.build.track,hit6:0,hit7:0,hit8:0,hits:0,counter:false,originX:g.x,originY:g.y,targetID:0,turned:false,life:2.5});if(g.combos.includes('storm'))b.pierce=Math.min(6,b.pierce+1);if(g.combos.includes('hunter')&&i!==Math.floor(n/2)){const main=priorityTarget(g,g.x,g.y),other=main?priorityTarget(g,main.x,main.y,[main.id],220):null;b.targetID=other?.id||0;}g.shots++;}}feedback(g,'shot');
}
function projectile(g,x,y,vx,vy,label='恶评',r=12,delay=0){if(g.hostile.reduce((n,b)=>n+Boolean(b.active),0)>=180)return null;const b=take(g.hostile);if(b)Object.assign(b,{x,y,prevX:x,prevY:y,vx,vy,label,r,age:0,delay,graze:false,life:14,damage:1});return b;}
function fan(g,e,n,speed,label='恶评',all=false){for(let i=0;i<n;i++){const a=all?i/n*TAU:Math.atan2(g.y-e.y,g.x-e.x)+(i-(n-1)/2)*.13;const p=projectile(g,e.x,e.y,Math.cos(a)*speed,Math.sin(a)*speed,label);if(p)p.damage=e.group?.scale||1;}}
export function triggerEvent(g,type){
 g.event=type;g.eventUntil=g.elapsed+({reverse:3,meteor:3.5,fog:5}[type]);
 notice(g,{reverse:'服务器波动 · 网卡了？',meteor:'全网热搜 · 又有什么掉下来了。',fog:'断网迷雾 · 咕，灯呢？'}[type],3);
 if(type==='meteor')for(let i=0;i<10;i++)projectile(g,35+g.random()*(g.width-70),-45,0,370,'热搜',24,.9+i*.13);
}
function spawnWave(g){
 const t=g.elapsed;
 if(t>=95&&g.random()<.09){army(g);return;}
 const kinds=['ad','ad','headline'];
 if(t>=15)kinds.push('drone','splitter');if(t>=35)kinds.push('dash','ghost','beetle');
 if(t>=50)kinds.push('tank','healer','sniper');if(t>=70)kinds.push('mine','leech','elite');
 spawnEnemy(g,kinds[Math.floor(g.random()*kinds.length)]);
 if(t>=180&&g.random()<.06)drop(g,'fake',30+g.random()*(g.width-60),-30);
}
function randomBoss(g){
 if(!g.bossBag.length){g.bossBag=Array.from({length:BOSS_NAMES.length},(_,i)=>i);for(let i=g.bossBag.length-1;i>0;i--){const j=Math.floor(g.random()*(i+1));[g.bossBag[i],g.bossBag[j]]=[g.bossBag[j],g.bossBag[i]];}}
 return g.bossBag.pop();
}
// Two complementary, telegraphed signature skills per Boss, in addition to its original attack.
export const BOSS_SKILLS=[
 [{name:'弹窗封锁',kind:'lane'},{name:'关闭按钮',kind:'zone'}],
 [{name:'断章冲锋',kind:'lane'},{name:'惊叹回声',kind:'ring'}],
 [{name:'上下文溢出',kind:'zone'},{name:'模型重采样',kind:'ring'}],
 [{name:'列队推进',kind:'wave'},{name:'集结号',kind:'adds'}],
 [{name:'钓鱼线路',kind:'lane'},{name:'验证码陷阱',kind:'zone'}],
 [{name:'信息屏障',kind:'wave'},{name:'茧房回声',kind:'ring'}],
 [{name:'退格洪流',kind:'wave'},{name:'定点恶评',kind:'zone'}],
 [{name:'缓存重放',kind:'ring'},{name:'残影侵入',kind:'adds'}],
 [{name:'钟摆锁定',kind:'lane'},{name:'秒针扫圈',kind:'ring'}],
 [{name:'回收压线',kind:'wave'},{name:'垃圾倾倒',kind:'zone'}],
 [{name:'吞噬震波',kind:'ring'},{name:'数据虫群',kind:'adds'}]
];
export function castBossSkill(g,e,index=0){
 const skill=BOSS_SKILLS[e.roster]?.[index%2];if(!skill||!e.active||!e.group.active)return null;
 // Never bury the arena in concurrent full-field hazards, even for splitting Bosses.
 if(g.hazards.filter(h=>h.active).length>=2)return null;
 const h=take(g.hazards);if(!h)return null;
 const angle=Math.atan2(g.y-e.y,g.x-e.x),warning=1.35;
 Object.assign(h,{kind:skill.kind,label:skill.name,group:e.group,age:0,warning,x:skill.kind==='zone'||skill.kind==='lane'?g.x:e.x,y:skill.kind==='zone'?g.y:e.y+45,r:skill.kind==='zone'?60:24,angle,gap:clamp(g.x,95,g.width-95),gapWidth:Math.max(95,g.width*.16),duration:skill.kind==='ring'?5:skill.kind==='wave'?6:skill.kind==='adds'?.15:.45,released:false,phase:e.group.phase,roster:e.roster});
 notice(g,'⚠ '+e.label+' · '+skill.name,2);
 return h;
}
function stepHazards(g,dt){
 for(const h of g.hazards)if(h.active){
  if(!h.group.active){h.active=false;continue;}h.age+=dt;if(h.age<h.warning)continue;
  const t=h.age-h.warning;let hit=false;
  if(h.kind==='lane')hit=Math.abs(g.x-h.x)<27+19;
  if(h.kind==='zone')hit=Math.hypot(g.x-h.x,g.y-h.y)<h.r+19;
  if(h.kind==='wave'){const old=h.y;h.y+=130*dt;hit=Math.abs(g.y-h.y)<18+19&&Math.abs(g.x-h.gap)>h.gapWidth-19;if(g.y>old&&g.y<h.y)hit=Math.abs(g.x-h.gap)>h.gapWidth-19;}
  if(h.kind==='ring'){
   h.r=24+t*120;const distance=Math.hypot(g.x-h.x,g.y-h.y),a=Math.atan2(g.y-h.y,g.x-h.x),difference=Math.abs(Math.atan2(Math.sin(a-h.angle),Math.cos(a-h.angle)));
   hit=Math.abs(distance-h.r)<17+19&&difference>.6;
  }
  if(h.kind==='adds'&&!h.released){h.released=true;const type=h.roster===3?'army':h.roster===7?'ghost':'leech';for(let i=0;i<Math.min(3,h.phase+1);i++)spawnEnemy(g,type,{x:clamp(h.x+(i-1)*80,45,g.width-45),y:h.y+25});}
  if(hit)damage(g,h.label,1,h);
  if(t>h.duration||h.y>g.height+80||h.r>Math.hypot(g.width,g.height)+80)h.active=false;
 }
}

function bossAI(g,e,dt){
 const group=e.group,s=group.scale,rage=group.rage;e.age+=dt;e.attack-=dt;
 e.flash=e.roster===4&&e.age%5<.5;
 if(e.roster===0){
  e.x=g.width/2+Math.sin(e.age*.55*s)*g.width*.18;
  if(e.attack<=0){e.attack=(rage?1.1:2.4)/s;if(rage)for(let i=0;i<8;i++)spawnEnemy(g,'ad',{x:(i+.5)/8*g.width,y:-35,speed:110*s,label:'弹窗'});else for(let i=0;i<3;i++)spawnEnemy(g,'ad',{x:clamp(e.x+(i-1)*64,35,g.width-35),y:e.y+65,speed:90*s,label:'弹窗'});}
 }else if(e.roster===1){
  if(e.phase==='dash'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.timer-=dt;if(e.x<e.r||e.x>g.width-e.r||e.y<e.r||e.y>g.height-e.r||e.timer<=0){e.x=clamp(e.x,e.r,g.width-e.r);e.y=clamp(e.y,e.r,g.height-e.r);peanuts(g,e.x,e.y,7);e.phase='drift';e.attack=(e.chain>0?.25:3)/s;}}
  else if(e.phase==='warn'){e.timer-=dt;if(e.timer<=0){e.phase='dash';e.timer=1.4/s;e.chain--;}}
  else{e.x=g.width/2+Math.sin(e.age*1.8*s)*g.width*.32;e.y+=(g.height*.23-e.y)*dt*2;if(e.attack<=0){if(!e.chain)e.chain=rage?3:1;const a=Math.atan2(g.y-e.y,g.x-e.x);e.vx=Math.cos(a)*520*s;e.vy=Math.sin(a)*520*s;e.phase='warn';e.timer=.8;}}
 }else if(e.roster===2){
  e.x=clamp(e.baseX+Math.sin(e.age*1.9*s)*g.width*.17,e.r,g.width-e.r);e.y+=Math.sin(e.age*1.4)*e.speed*.15*dt;
  if(e.attack<=0){e.attack=2/s;fan(g,e,3,95*s,'总而言之');if(e.generation)floating(g,e.x,e.y-30,e.generation===1?'换句话说':'再强调一下');}
 }else if(e.roster===3){e.x=g.width/2+Math.sin(e.age*s)*g.width*.24;if(e.attack<=0){e.attack=(rage?2:4)/s;army(g,e.y+50);fan(g,e,5,120*s,'+1');}}
 else if(e.roster===4){
  e.x=clamp(g.width/2+Math.sin(e.age*.8*s)*g.width*.38,e.r,g.width-e.r);e.y=g.height*.25+Math.sin(e.age*.5*s)*g.height*.13;
  if(e.attack<=0){e.attack=(rage?1:2)/s;for(let i=0;i<6;i++)drop(g,g.random()<.5?'peanut':'fake',30+g.random()*(g.width-60),-25);if(g.random()<.5)spawnEnemy(g,'elite');}
 }else if(e.roster===5){
  e.x=g.width/2;e.y=g.height*.4;e.cocoonRadius=Math.max(Math.min(g.width,g.height)*.32,e.cocoonRadius-dt*6*s*(rage?2:1));
  if(Math.hypot(g.x-e.x,g.y-e.y)>e.cocoonRadius)damage(g,'算法茧房',s,e);
  if(e.attack<=0){e.attack=(rage?1:1.5)/s;fan(g,e,rage?14:10,80*s,'推荐',true);}
 }else if(e.roster===6){
  e.x=g.width/2+Math.sin(e.age*.5*s)*g.width*.22;
  if(e.attack<=0){e.attack=1.05/s;fan(g,e,rage?16:10,70*s,['就这？','急了','不行'][Math.floor(g.random()*3)]);}
  if(e.age>=e.tauntAt){e.tauntAt+=10;notice(g,['键盘侠：就这？\n灰鸟：你倒是下来。','键盘侠：急了？\n灰鸟：花生要凉了。','键盘侠：不行啊。\n灰鸟：你行你飞。'][Math.floor(g.random()*3)],3);}
 }else if(e.roster===7){
  e.x=g.width/2+Math.sin(e.age*.8)*g.width*.27;e.y=g.height*.22+Math.cos(e.age*.6)*25;
  if(e.attack<=0){e.attack=(rage?1.5:2.1)/s;fan(g,e,7,105*s,'残影',true);}
 }else if(e.roster===8){
  e.x=g.width/2+Math.sin(e.age*.55)*g.width*.25;
  if(e.attack<=0){e.attack=(rage?1.6:2.4)/s;for(let i=0;i<5;i++)projectile(g,(i+.5)*g.width/5,-30,0,180*s,'滴答',12,.8+i*.12);}
 }else if(e.roster===9){
  e.x=g.width/2+Math.sin(e.age*.45)*g.width*.2;
  if(e.attack<=0){e.attack=(rage?2.6:3.6)/s;spawnEnemy(g,'tank',{x:clamp(e.x-80,40,g.width-40),y:e.y+65});fan(g,e,5,125*s,'回收');}
 }else if(e.roster===10){
  e.x=g.width/2+Math.sin(e.age*.9)*g.width*.3;
  if(e.attack<=0){e.attack=(rage?1.6:2.4)/s;fan(g,e,5,145*s,'吞噬');if(e.age>3)spawnEnemy(g,'leech',{x:clamp(e.x+80,35,g.width-35),y:e.y+60});}
 }
}
function enemyAI(g,e,dt,buff){
 if(!e.boss)e.age+=dt;if(e.flee){e.y-=260*dt;if(e.y<-70)e.active=false;return;}
 if(e.boss){e.slow=Math.max(0,(e.slow||0)-dt);bossAI(g,e,dt*(e.slow>0?.8:1));return;}
 e.slow=Math.max(0,(e.slow||0)-dt);const speed=e.speed*buff*(e.slow>0?.55:1);
 if(e.type==='headline'){e.x=clamp(e.baseX+Math.sin(e.age*3)*65,25,g.width-25);e.y+=speed*dt;}
 else if(e.type==='dash'){
  if(e.phase==='drift'){e.y+=speed*.35*dt;if(e.age>1){const a=Math.atan2(g.y-e.y,g.x-e.x);e.vx=Math.cos(a)*420*difficulty(g.elapsed).speed;e.vy=Math.sin(a)*420*difficulty(g.elapsed).speed;e.phase='warn';e.timer=.8;}}
  else if(e.phase==='warn'){e.timer-=dt;if(e.timer<=0)e.phase='dash';}
  else{e.x+=e.vx*dt;e.y+=e.vy*dt;}
  }else if(e.type==='drone'||e.type==='ghost'){e.x=clamp(e.baseX+Math.sin(e.age*(e.type==='drone'?2.5:1.2))*65,25,g.width-25);e.y+=speed*(e.type==='ghost'?.75:1)*dt;
 }else if(e.type==='sniper'){
  e.y+=speed*.42*dt;e.attack-=dt;
  if(e.phase==='warn'){e.timer-=dt;if(e.timer<=0){projectile(g,e.x,e.y,e.vx,e.vy,'信号',10);e.phase='drift';e.attack=3.4;}}
  else if(e.attack<=0){const a=Math.atan2(g.y-e.y,g.x-e.x);e.vx=Math.cos(a)*165;e.vy=Math.sin(a)*165;e.phase='warn';e.timer=.8;}
 }else if(e.type==='mine'){e.y+=speed*.5*dt;e.attack-=dt;if(e.attack<=0&&e.phase==='drift'){e.phase='warn';e.timer=1.1;}else if(e.phase==='warn'){e.timer-=dt;if(e.timer<=0){fan(g,e,6,105,'碎片',true);e.active=false;}}
 }else if(e.type==='leech'){e.x+=clamp(g.x-e.x,-35,35)*dt;e.y+=speed*.9*dt;
 }else{e.y+=speed*dt;}
 if(e.type==='healer'&&e.age>=3){e.age-=3;for(const m of g.enemies)if(m.active&&m!==e&&!m.boss&&Math.hypot(m.x-e.x,m.y-e.y)<160)m.hp=Math.min(m.maxHp,m.hp+1);floating(g,e.x,e.y-20,'治疗 +1','#b7d66d');}
 if(e.y>g.height+80||e.x<-80||e.x>g.width+80)e.active=false;
}
export function graze(g,o,distance,hitRadius){if(!o.graze&&g.invincible<=0&&distance>=hitRadius&&distance<hitRadius+10){o.graze=true;g.score+=2;g.grazes++;chargeCounter(g,C.counter.graze);g.grazeRing=C.feedback.grazeRing;feedback(g,'graze');hint(g,'graze','擦弹：花生 +2，反击能量 +12。同一危险只算一次。');floating(g,g.x,g.y-45,'擦弹 +12','#e5bd7b');}}
export function segmentDistance(x,y,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,len=vx*vx+vy*vy,k=len?clamp(((x-ax)*vx+(y-ay)*vy)/len,0,1):0;return Math.hypot(x-ax-k*vx,y-ay-k*vy);}
function pickup(g,p){
 p.active=false;if(p.kind==='fake'){damage(g,'诈骗短信',1,p);return;}
 feedback(g,p.kind==='peanut'||p.kind==='energy'?'pickup':'reward');if(p.kind==='energy'){chargeCounter(g,C.counter.energyPeanut);g.score+=2;return;}if(p.kind==='peanut'){const earned=p.value*Math.min(2,1+Math.floor(g.combo/18)*.2)*(1+g.rewardBonus)*(g.effects.double>0?2:1)*(g.effects.fortune>0?1.25:1)+g.rewardCarry;const v=Math.floor(earned+1e-9);g.rewardCarry=Math.max(0,earned-v);g.score+=v;return;}
 if(p.kind==='chip'){chip(g);return;}
 if(p.kind==='repair'){g.shield=Math.min(4,g.shield+1);g.invincible=Math.max(g.invincible,1.5);notice(g,'补给维修 · 重新罩好。');return;}
 if(p.kind==='clear'){for(const e of g.enemies)if(e.active)hitEnemy(g,e,e.boss?6:4);for(const b of g.hostile)b.active=false;notice(g,'净屏脉冲 · 清静一会儿。');return;}
 if(p.kind==='egg'){g.shield=Math.min(4,g.shield+1);floating(g,g.x,g.y-35,'护盾蛋 +1');}
 else{g.effects[p.kind]={magnet:8,rage:10,slow:5,double:12,rapid:10,fortune:14}[p.kind]||0;notice(g,{magnet:'磁铁 · 花生过来。',rage:'狂暴 · 翅膀加班了。',slow:'时间膨胀 · 慢点，挺好。',double:'双倍花生 · 多拿一点。',rapid:'急速装填 · 虫虫排队。',fortune:'幸运补给 · 今天手气不错。'}[p.kind],1.7);}
}
export function stepGame(g,seconds,random=g.random){
 if(!g.running||g.paused||g.choice||g.supplyChoice||seconds<=0)return null;g.random=random;
 let remain=seconds;
 while(remain>1e-7&&g.running&&!g.choice&&!g.supplyChoice){const dt=Math.min(1/120,remain);remain-=dt;g.elapsed+=dt;const d=difficulty(g.elapsed);
  for(const k of ['grazeRing','hurtRing','readyRing'])g[k]=Math.max(0,g[k]-dt);for(const e of g.enemies)if(e.active)e.hitFlash=Math.max(0,(e.hitFlash||0)-dt);g.noticeTime=Math.max(0,g.noticeTime-dt);const tutorial=g.tutorial;tutorial.left=Math.max(0,tutorial.left-dt);if(!tutorial.left&&tutorial.queue.length){tutorial.line=tutorial.queue.shift();tutorial.left=5;}if(g.elapsed>=18)hint(g,'early','先避开干扰，再收花生。军械库的解锁会留到下一轮。');g.invincible=Math.max(0,g.invincible-dt);for(const k in g.effects)g.effects[k]=Math.max(0,g.effects[k]-dt);
  g.target=clamp(g.target,30,g.width-30);g.targetY=clamp(g.targetY,45,g.height-35);g.x+=(g.target-g.x)*Math.min(1,dt*18*g.moveSpeed);g.y+=(g.targetY-g.y)*Math.min(1,dt*18*g.moveSpeed);
  const bossActive=g.groups.some(o=>o.active);
  if(!bossActive&&g.elapsed>=g.nextBoss-C.pacing.bossWarning&&g.warningIndex!==g.bossIndex){g.pendingBossRoster=randomBoss(g);g.warningIndex=g.bossIndex;feedback(g,'warning');notice(g,'⚠ '+BOSS_NAMES[g.pendingBossRoster]+' 接近',C.pacing.bossWarning);}
  if(g.elapsed>=g.nextBoss&&!bossActive){if(spawnBoss(g,g.bossIndex,g.pendingBossRoster??randomBoss(g))){g.bossIndex++;g.pendingBossRoster=null;g.nextBoss=g.elapsed+C.pacing.bossInterval;}}
  if(g.elapsed>=g.nextEvent&&g.elapsed<g.nextBoss-C.pacing.bossWarning-6&&!g.groups.some(o=>o.active)){triggerEvent(g,['reverse','meteor','fog'][Math.floor(random()*3)]);g.nextEvent=g.elapsed+C.pacing.eventInterval;}
  if(g.elapsed>=g.nextSupply){if(!g.firstGrowth&&!g.items.some(p=>p.active&&p.kind==='chip'))dropEvolution(g,g.x,g.y-95);else dropEvolution(g,g.x,-25);g.nextSupply+=C.pacing.supplyInterval;}if(!g.eliteSpawned&&g.elapsed>=C.pacing.elite){g.eliteSpawned=true;spawnEnemy(g,'elite',{x:g.width*.25,y:-40},true);notice(g,'⚠ 精英信号：优先清除，反击能量 +20。',2);}
  if(g.elapsed>=g.eventUntil)g.event='';
  g.spawn+=dt;const spawnInterval=d.interval*(bossActive?1.45:g.elapsed<g.reliefUntil?1.5:1);if(g.spawn>=spawnInterval){g.spawn-=spawnInterval;spawnWave(g);}
  g.foodTimer+=dt;if(g.foodTimer>=2){g.foodTimer-=2;drop(g,'peanut',30+random()*(g.width-60),-25);}
  g.fireTimer-=dt;if(g.fireTimer<=0){fire(g);g.fireTimer+=1/firingRate(g);}
  const world=dt*(g.effects.slow>0?.35:1);let buff=1;
  for(const e of g.enemies)if(e.active&&e.boss&&e.roster===3)buff=Math.max(buff,1.4*e.group.scale*(e.group.rage?1.25:1));
  for(const e of g.enemies)if(e.active){enemyAI(g,e,world,buff);if(!e.active||e.flee)continue;const dist=Math.hypot(e.x-g.x,e.y-g.y),r=e.r+19;if(dist<r&&(!e.boss||e.age>=C.pacing.bossArrivalGrace))damage(g,e.label,e.boss?e.group.scale:1,e);else graze(g,e,dist,r);}
  for(const group of g.groups)if(group.active){group.skillTimer-=world;if(group.skillTimer<=0){const leader=g.enemies.find(e=>e.active&&e.boss&&e.group===group);if(leader){castBossSkill(g,leader,group.skillIndex++%2);group.skillTimer=group.phase===3?8:group.phase===2?10:12;}}}
  stepHazards(g,world);
  if(!g.running)return 'hit';
  for(const b of g.bullets)if(b.active){
   b.prevX=b.x;b.prevY=b.y;b.life-=dt;
   if(b.track){let target=g.enemies.find(e=>e.active&&!e.flee&&e.id===b.targetID);if(!target){target=priorityTarget(g,b.x,b.y,[b.hit1,b.hit2,b.hit3,b.hit4,b.hit5,b.hit6,b.hit7,b.hit8]);b.targetID=target?.id||0;}if(target){const a=Math.atan2(target.y-b.y,target.x-b.x),k=Math.min(1,dt*(1.4+b.track*.8));b.vx+=(Math.cos(a)*610-b.vx)*k;b.vy+=(Math.sin(a)*610-b.vy)*k;}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   // First intersection along the bullet path wins; tanks/minions really block shots.
   for(let pass=0;pass<8&&b.active;pass++){let target=null,nearest=Infinity;for(const e of g.enemies)if(e.active&&!e.flee&&e.id!==b.hit1&&e.id!==b.hit2&&e.id!==b.hit3&&e.id!==b.hit4&&e.id!==b.hit5&&e.id!==b.hit6&&e.id!==b.hit7&&e.id!==b.hit8){if(segmentDistance(e.x,e.y,b.prevX,b.prevY,b.x,b.y)<e.r+b.r){const dist=Math.hypot(e.x-b.prevX,e.y-b.prevY);if(dist<nearest){nearest=dist;target=e;}}}if(!target)break;
    b.hit8=b.hit7;b.hit7=b.hit6;b.hit6=b.hit5;b.hit5=b.hit4;b.hit4=b.hit3;b.hit3=b.hit2;b.hit2=b.hit1;b.hit1=target.id;if(b.frost)target.slow=b.frost;b.hits++;let amount=b.damage;if(!b.counter&&g.build.pierce)amount*=1+Math.min(C.routes.pierceCap,(b.hits-1)*C.routes.pierceStep)*(target.boss?C.routes.bossPierceFactor:1);if(!b.counter&&g.build.spread&&Math.hypot(target.x-b.originX,target.y-b.originY)<C.routes.scatterRadius)amount*=1+C.routes.scatterBonus;if(b.counter&&target.boss){amount*=C.counter.bossMultiplier;if(g.elapsed>=(target.group.interruptUntil||0)){target.group.interruptUntil=g.elapsed+C.counter.interruptCooldown;target.attack+=C.counter.interrupt;target.group.skillTimer+=C.counter.interrupt;}}hitEnemy(g,target,amount);if(!b.counter&&g.combos.includes('boomerang')&&!b.turned){b.turned=true;b.track=Math.max(2,b.track);b.targetID=0;b.pierce=Math.max(2,b.pierce);}if(b.splash){for(const e of g.enemies)if(e.active&&e!==target&&Math.hypot(e.x-target.x,e.y-target.y)<=b.splash+e.r)hitEnemy(g,e,b.damage*.55);}if(--b.pierce<=0)b.active=false;
   }
   if(b.counter)for(const shot of g.hostile)if(shot.active&&shot.age>=shot.delay&&segmentDistance(shot.x,shot.y,b.prevX,b.prevY,b.x,b.y)<C.counter.clearRadius+shot.r)shot.active=false;
   if(b.life<=0||b.y<-50||b.y>g.height+60||b.x<-60||b.x>g.width+60)b.active=false;
  }
  for(const b of g.hostile)if(b.active){b.age+=world;if(b.age<b.delay)continue;b.prevX=b.x;b.prevY=b.y;b.x+=b.vx*world;b.y+=b.vy*world;b.life-=world;const dist=segmentDistance(g.x,g.y,b.prevX,b.prevY,b.x,b.y),r=b.r+19;if(dist<r){if(g.invincible<=0){damage(g,b.label,b.damage||1,b);b.active=false;}}else graze(g,b,dist,r);if(b.life<=0||b.y>g.height+65||b.x<-80||b.x>g.width+80||b.y<-100)b.active=false;}
  if(!g.running)return 'hit';
  for(const p of g.items)if(p.active){p.age+=world;const fake=p.kind==='fake';if(fake&&p.flash<0&&Math.hypot(p.x-g.x,p.y-g.y)<155)p.flash=.3;
   if(p.flash>0)p.flash=Math.max(0,p.flash-dt);
   if(p.kind==='peanut'&&g.effects.magnet>0){const a=Math.atan2(g.y-p.y,g.x-p.x);p.x+=Math.cos(a)*650*dt;p.y+=Math.sin(a)*650*dt;}
   else{p.x=clamp(p.x+p.vx*world,18,g.width-18);p.y+=(p.speed+p.vy)*world;p.vy=Math.min(0,p.vy+240*world);p.vx*=1-world*.8;}
   if(Math.hypot(p.x-g.x,p.y-g.y)<p.r+22+(p.kind==='fake'?0:g.pickupRadius))pickup(g,p);if(!g.running)return 'hit';if(p.y>g.height+55||p.age>16)p.active=false;
  }
  for(const p of g.particles)if(p.active){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0)p.active=false;}
  for(const p of g.texts)if(p.active){p.life-=dt;p.y-=24*dt;if(p.life<=0)p.active=false;}
 }
 return !g.running?'hit':g.choice?'choice':g.supplyChoice?'supply':null;
}
