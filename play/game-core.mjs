// Peanut Hunter: isolated, dependency-free simulation. All moving entities are pooled.
export const FIRE_RATES = [2.5, 4, 6, 8];
export const REVIVE_COSTS = [50,150,400,1000];
export const BOSS_NAMES = ['弹窗矩阵','标题党巨兽','AI 味聚合体','水军头目','诈骗短信王','算法茧房','键盘侠'];
export const BOSS_LINES = ['又弹。你没别的事吗。','标题挺大，脑子呢。','咕，又开始绕了。','人挺多。都没话说。','花生还带诈骗？','圈这么小，房租挺贵吧。','哟，嘴替来了。'];
export const DEATH_LINES = ['被弹窗撞死了，丢鸟现眼，嘎。','花生没吃完。先躺了。','翅膀还在，信号没了。','这广告，物理攻击啊。','咕。刚才不算。','说好再活一秒的。','嘎，手比嘴慢。','花生归仓，鸟归零。','地球太挤了。','啾……啾不动了。'];
export const difficulty = t => ({interval:Math.max(.25,1.4-t*.004),speed:Math.min(3.5,1+t/240),hp:1+Math.floor(t/90),cap:Math.min(30,6+Math.floor(t/45)),level:1+Math.floor(t/90)});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
let nextID=0;
function pool(size){return Array.from({length:size},()=>({active:false}));}
function take(p){for(let i=0;i<p.length;i++)if(!p[i].active){const o=p[i];o.active=true;o.id=++nextID;return o;}return null;}
export function createGame(width=900,height=600){
 return {width,height,running:false,paused:false,elapsed:0,x:width/2,y:height-72,target:width/2,targetY:height-72,hp:1,shield:1,invincible:0,score:0,kills:0,combo:0,maxCombo:0,grazes:0,shots:0,gun:1,build:{pierce:0,spread:0,track:0},effects:{magnet:0,rage:0,slow:0},enemies:pool(64),bullets:pool(256),hostile:pool(1024),items:pool(320),particles:pool(96),texts:pool(48),groups:pool(32),spawn:0,foodTimer:0,fireTimer:0,nextBoss:180,bossIndex:0,bossesDefeated:0,warningIndex:-1,nextEvent:90,event:'',eventUntil:0,notice:'',noticeTime:0,noticeSerial:0,choice:false,choiceQueue:0,revives:0,cause:'',frame:0,last:0,random:Math.random};
}
export function notice(g,line,seconds=2.5){g.notice=line;g.noticeTime=seconds;g.noticeSerial++;}
function floating(g,x,y,label,color='#d5e8f3'){const p=take(g.texts);if(p)Object.assign(p,{x,y,label,color,life:1.1});}
function sparks(g,x,y){for(let i=0;i<5;i++){const p=take(g.particles);if(p)Object.assign(p,{x,y,vx:(g.random()-.5)*130,vy:(g.random()-.5)*130,life:.35});}}
export function drop(g,kind,x,y,value=1){let p=take(g.items);if(!p&&kind==='chip'){p=g.items.find(o=>o.kind==='peanut'||o.kind==='fake');if(p){p.active=true;p.id=++nextID;}}if(p)Object.assign(p,{kind,x:clamp(x,24,g.width-24),y,speed:145,vx:0,vy:0,value,age:0,flash:-1,r:kind==='peanut'||kind==='fake'?14:20});return p;}
function enemySlot(g,priority=false){
 const count=g.enemies.reduce((n,e)=>n+(e.active&&!e.retiring?1:0),0);
 if(count>=difficulty(g.elapsed).cap){if(!priority)return null;let victim=null,far=-1;for(const e of g.enemies)if(e.active&&!e.boss&&!e.retiring){const distance=Math.hypot(e.x-g.x,e.y-g.y);if(distance>far){far=distance;victim=e;}}if(!victim)return null;victim.active=false;}
 return take(g.enemies);
}
export function spawnEnemy(g,type='ad',options={},priority=false){
 const d=difficulty(g.elapsed),e=enemySlot(g,priority);if(!e)return null;
 const hp=d.hp*(type==='elite'?3:type==='tank'?8:1),x=options.x??(55+g.random()*(g.width-110));
 Object.assign(e,{type,boss:false,retiring:false,x,y:options.y??-40,baseX:x,r:type==='tank'?36:25,hp,maxHp:hp,speed:(type==='tank'?32:75)*d.speed,age:0,phase:'drift',timer:0,vx:0,vy:0,affix:'',shield:0,graze:false,generation:0,flee:false,group:null,label:{ad:['广告','弹窗','无效信息'][Math.floor(g.random()*3)],headline:'标题党',army:'水军',elite:'精英',splitter:'分裂虫',small:'小虫',dash:'冲刺怪',tank:'坦克',healer:'奶妈'}[type]||type});
 if(type==='elite'){e.affix=['shield','swift','split'][Math.floor(g.random()*3)];if(e.affix==='shield')e.shield=hp;if(e.affix==='swift')e.speed*=1.8;}
 Object.assign(e,options);return e;
}
function army(g,y=-35){if(difficulty(g.elapsed).cap-g.enemies.reduce((n,e)=>n+(e.active&&!e.retiring?1:0),0)<5)return false;const center=clamp(g.random()*g.width,110,g.width-110);for(let i=0;i<5;i++)spawnEnemy(g,'army',{x:center+(i-2)*42,y:y-Math.abs(i-2)*20,speed:120*difficulty(g.elapsed).speed});return true;}
export function spawnBoss(g,index=g.bossIndex){
 const group=take(g.groups);if(!group)return null;
 const roster=index%7,scale=Math.pow(1.3,Math.floor(index/7)),hp=Math.round((40+g.bossesDefeated*60)*scale);
 Object.assign(group,{roster,index,scale,maxHp:hp,remaining:1,defeated:false,rage:false});
 const e=enemySlot(g,true);if(!e){group.active=false;return null;}
 Object.assign(e,{type:'boss',boss:true,retiring:false,label:BOSS_NAMES[roster],roster,x:g.width/2,y:g.height*.23,baseX:g.width/2,r:52,hp,maxHp:hp,speed:85*scale,age:0,phase:'drift',timer:0,attack:1/scale,vx:0,vy:0,affix:'',shield:0,graze:false,generation:0,flee:false,group,cocoonRadius:Math.hypot(g.width,g.height)*.65,tauntAt:10,flash:false});
 notice(g,BOSS_NAMES[roster]+' · '+BOSS_LINES[roster],3);return e;
}
function peanuts(g,x,y,count){for(let i=0;i<count;i++){const p=drop(g,'peanut',x+(g.random()-.5)*80,y,1);if(p){p.vx=(g.random()-.5)*240;p.vy=-80-g.random()*140;}}}
function kill(g,e){
 if(!e.active)return;e.active=false;g.kills++;g.combo++;g.maxCombo=Math.max(g.maxCombo,g.combo);sparks(g,e.x,e.y);
 if(e.boss){
  const group=e.group;
  if(e.roster===2&&e.generation<2){group.remaining++;e.active=true;e.retiring=true;for(let i=0;i<2;i++){const child=enemySlot(g,true);if(child)Object.assign(child,e,{active:true,retiring:false,id:++nextID,x:clamp(e.x+(i?45:-45),35,g.width-35),baseX:e.x+(i?45:-45),y:e.y+28,generation:e.generation+1,hp:Math.ceil(e.maxHp*.55),maxHp:Math.ceil(e.maxHp*.55),r:Math.max(24,e.r*.7),age:0,speed:e.speed*(group.rage?1.8:1),affix:group.rage?'swift':'',label:['再强调一下','总而言之'][i],phase:'drift',attack:.7});else group.remaining--;}
   e.active=false;e.retiring=false;floating(g,e.x,e.y,'换句话说……');return;
  }
  group.remaining--;
  if(group.remaining===0){group.defeated=true;group.active=false;g.bossesDefeated++;peanuts(g,e.x,e.y,30+Math.floor(g.random()*21));drop(g,'chip',e.x,e.y);notice(g,BOSS_NAMES[e.roster]+'，下线了。',3);if(e.roster===3)for(const m of g.enemies)if(m.active&&!m.boss)m.flee=true;}
  return;
 }
 const x=e.x,y=e.y,type=e.type,affix=e.affix,speed=e.speed;const count=type==='elite'?5:type==='tank'?4:1;peanuts(g,x,y,count);
 if(type==='splitter'||affix==='split'){for(let i=0;i<2;i++)spawnEnemy(g,'small',{x:x+(i?24:-24),y,r:14,hp:1,maxHp:1,speed:speed*1.25},true);}
 if(type==='elite'&&g.random()<.4)drop(g,'chip',x,y);
 const chance=Math.min(.22,.07+g.elapsed/9000);
 if(g.random()<chance)drop(g,['magnet','egg','rage','slow'][Math.floor(g.random()*4)],x,y);
}
export function hitEnemy(g,e,amount=1){if(!e.active)return;if(e.shield>0){e.shield=Math.max(0,e.shield-amount);sparks(g,e.x,e.y);return;}e.hp-=amount;if(e.boss&&e.hp<=e.maxHp*.5&&!e.group.rage){e.group.rage=true;notice(g,e.label+' · 狂暴',2);if(e.roster===2)for(const a of g.enemies)if(a.active&&a.group===e.group&&a.generation>0){a.speed*=1.8;a.affix='swift';}}if(e.hp<=0)kill(g,e);}
export function damage(g,cause,amount=1){
 if(g.invincible>0||!g.running)return false;
 g.combo=0;g.cause=cause;
 if(g.shield>0){g.shield--;g.invincible=1;floating(g,g.x,g.y-40,'蛋碎了','#a6cbe3');return false;}
 g.hp-=amount;if(g.hp<=0){g.running=false;g.choice=false;return true;}g.invincible=1;return false;
}
export function reviveGame(g){if(g.running)return false;g.revives++;g.hp=1;g.invincible=2;g.running=true;g.paused=false;g.choice=false;g.combo=0;g.cause='';notice(g,'花生买命。贵得要死。');return true;}
export function chooseEvolution(g,type){if(!g.choice||!(type in g.build)||g.build[type]>=3)return false;g.build[type]++;g.gun=Math.min(4,1+g.build.pierce+g.build.spread+g.build.track);g.choiceQueue--;if(Object.values(g.build).every(v=>v===3)&&g.choiceQueue>0){g.score+=10*g.choiceQueue;g.choiceQueue=0;}g.choice=g.choiceQueue>0;g.fireTimer=0;notice(g,{pierce:'穿透虫，串起来。',spread:'散射虫，别挤。',track:'追踪虫，追着烦。'}[type]);return true;}
function chip(g){if(Object.values(g.build).every(v=>v===3)){g.score+=10;floating(g,g.x,g.y-35,'芯片满级 +10');return;}g.choiceQueue++;g.choice=true;}
function fire(g){
 const n=g.build.spread?3:1,angle=g.build.spread?.15+g.build.spread*.055:0;
 for(let i=0;i<n;i++){const b=take(g.bullets);if(b){const a=n===1?0:(i-1)*angle;Object.assign(b,{x:g.x,y:g.y-35,prevX:g.x,prevY:g.y-35,vx:Math.sin(a)*610,vy:-Math.cos(a)*610,r:7,damage:1+(g.build.track===3?1:0),pierce:g.build.pierce?3+g.build.pierce-1:1,hit1:0,hit2:0,hit3:0,hit4:0,hit5:0,track:g.build.track,life:2.5});g.shots++;}}
}
function projectile(g,x,y,vx,vy,label='恶评',r=12,delay=0){const b=take(g.hostile);if(b)Object.assign(b,{x,y,prevX:x,prevY:y,vx,vy,label,r,age:0,delay,graze:false,life:14,damage:1});return b;}
function fan(g,e,n,speed,label='恶评',all=false){for(let i=0;i<n;i++){const a=all?i/n*TAU:Math.atan2(g.y-e.y,g.x-e.x)+(i-(n-1)/2)*.13;const p=projectile(g,e.x,e.y,Math.cos(a)*speed,Math.sin(a)*speed,label);if(p)p.damage=e.group?.scale||1;}}
export function triggerEvent(g,type){
 g.event=type;g.eventUntil=g.elapsed+({reverse:3,meteor:3.5,fog:5}[type]);
 notice(g,{reverse:'服务器波动 · 网卡了？',meteor:'全网热搜 · 又有什么掉下来了。',fog:'断网迷雾 · 咕，灯呢？'}[type],3);
 if(type==='meteor')for(let i=0;i<10;i++)projectile(g,35+g.random()*(g.width-70),-45,0,370,'热搜',24,.9+i*.13);
}
function spawnWave(g){
 const t=g.elapsed,r=g.random();
 if(t>=120&&r<.13){army(g);return;}
 const kinds=['ad','ad','ad'];if(t>=60)kinds.push('headline','splitter','dash');if(t>=90)kinds.push('tank','healer');if(t>=120)kinds.push('elite','elite');
 spawnEnemy(g,kinds[Math.floor(g.random()*kinds.length)]);
 if(t>=180&&g.random()<.12)drop(g,'fake',30+g.random()*(g.width-60),-30);
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
  e.x=g.width/2;e.y=g.height*.4;e.cocoonRadius=Math.max(95,e.cocoonRadius-dt*6*s*(rage?2:1));
  if(Math.hypot(g.x-e.x,g.y-e.y)>e.cocoonRadius)damage(g,'算法茧房',s);
  if(e.attack<=0){e.attack=(rage?.7:1.1)/s;fan(g,e,rage?18:12,80*s,'推荐',true);}
 }else if(e.roster===6){
  e.x=g.width/2+Math.sin(e.age*.5*s)*g.width*.22;
  if(e.attack<=0){e.attack=1.05/s;fan(g,e,rage?28:14,65*s,['就这？','急了','不行'][Math.floor(g.random()*3)]);}
  if(e.age>=e.tauntAt){e.tauntAt+=10;notice(g,['键盘侠：就这？\n灰鸟：你倒是下来。','键盘侠：急了？\n灰鸟：花生要凉了。','键盘侠：不行啊。\n灰鸟：你行你飞。'][Math.floor(g.random()*3)],3);}
 }
}
function enemyAI(g,e,dt,buff){
 e.age+=dt;if(e.flee){e.y-=260*dt;if(e.y<-70)e.active=false;return;}
 if(e.boss){bossAI(g,e,dt);return;}
 const speed=e.speed*buff;
 if(e.type==='headline'){e.x=clamp(e.baseX+Math.sin(e.age*3)*65,25,g.width-25);e.y+=speed*dt;}
 else if(e.type==='dash'){
  if(e.phase==='drift'){e.y+=speed*.35*dt;if(e.age>1){const a=Math.atan2(g.y-e.y,g.x-e.x);e.vx=Math.cos(a)*420*difficulty(g.elapsed).speed;e.vy=Math.sin(a)*420*difficulty(g.elapsed).speed;e.phase='warn';e.timer=.8;}}
  else if(e.phase==='warn'){e.timer-=dt;if(e.timer<=0)e.phase='dash';}
  else{e.x+=e.vx*dt;e.y+=e.vy*dt;}
 }else{e.y+=speed*dt;}
 if(e.type==='healer'&&e.age>=3){e.age-=3;for(const m of g.enemies)if(m.active&&m!==e&&!m.boss&&Math.hypot(m.x-e.x,m.y-e.y)<160)m.hp=Math.min(m.maxHp,m.hp+1);floating(g,e.x,e.y-20,'治疗 +1','#b7d66d');}
 if(e.y>g.height+80||e.x<-80||e.x>g.width+80)e.active=false;
}
function graze(g,o,distance,hitRadius){if(!o.graze&&g.invincible<=0&&distance>=hitRadius&&distance<hitRadius+10){o.graze=true;g.score+=2;g.grazes++;floating(g,g.x,g.y-45,'啾！','#e5bd7b');}}
function segmentDistance(x,y,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,len=vx*vx+vy*vy,k=len?clamp(((x-ax)*vx+(y-ay)*vy)/len,0,1):0;return Math.hypot(x-ax-k*vx,y-ay-k*vy);}
function pickup(g,p){
 p.active=false;if(p.kind==='fake'){damage(g,'诈骗短信');return;}
 if(p.kind==='peanut'){const v=Math.round(p.value*Math.min(5,1+Math.floor(g.combo/10)*.5));g.score+=v;return;}
 if(p.kind==='chip'){chip(g);return;}
 if(p.kind==='egg'){g.shield++;floating(g,g.x,g.y-35,'护盾蛋 +1');}
 else{g.effects[p.kind]={magnet:8,rage:10,slow:5}[p.kind];notice(g,{magnet:'磁铁 · 花生过来。',rage:'狂暴 · 翅膀加班了。',slow:'时间膨胀 · 慢点，挺好。'}[p.kind],1.7);}
}
export function stepGame(g,seconds,random=g.random){
 if(!g.running||g.paused||g.choice||seconds<=0)return null;g.random=random;
 let remain=seconds;
 while(remain>1e-7&&g.running&&!g.choice){const dt=Math.min(1/120,remain);remain-=dt;g.elapsed+=dt;const d=difficulty(g.elapsed);
  g.noticeTime=Math.max(0,g.noticeTime-dt);g.invincible=Math.max(0,g.invincible-dt);for(const k in g.effects)g.effects[k]=Math.max(0,g.effects[k]-dt);
  g.target=clamp(g.target,30,g.width-30);g.targetY=clamp(g.targetY,45,g.height-35);g.x+=(g.target-g.x)*Math.min(1,dt*18);g.y+=(g.targetY-g.y)*Math.min(1,dt*18);
  if(g.elapsed>=g.nextBoss-3&&g.warningIndex!==g.bossIndex){g.warningIndex=g.bossIndex;notice(g,'⚠ '+BOSS_NAMES[g.bossIndex%7]+' 接近',3);}
  if(g.elapsed>=g.nextBoss){spawnBoss(g,g.bossIndex++);g.nextBoss+=150;}
  if(g.elapsed>=g.nextEvent){triggerEvent(g,['reverse','meteor','fog'][Math.floor(random()*3)]);g.nextEvent+=90;}
  if(g.elapsed>=g.eventUntil)g.event='';
  g.spawn+=dt;if(g.spawn>=d.interval){g.spawn-=d.interval;spawnWave(g);}
  g.foodTimer+=dt;if(g.foodTimer>=2){g.foodTimer-=2;drop(g,'peanut',30+random()*(g.width-60),-25);}
  g.fireTimer-=dt;if(g.fireTimer<=0){fire(g);g.fireTimer+=1/(FIRE_RATES[Math.min(3,g.gun-1)]*(g.effects.rage>0?2:1));}
  const world=dt*(g.effects.slow>0?.35:1);let buff=1;
  for(const e of g.enemies)if(e.active&&e.boss&&e.roster===3)buff=Math.max(buff,1.4*e.group.scale*(e.group.rage?1.25:1));
  for(const e of g.enemies)if(e.active){enemyAI(g,e,world,buff);if(!e.active||e.flee)continue;const dist=Math.hypot(e.x-g.x,e.y-g.y),r=e.r+19;if(dist<r)damage(g,e.label,e.boss?e.group.scale:1);else graze(g,e,dist,r);}
  if(!g.running)return 'hit';
  for(const b of g.bullets)if(b.active){
   b.prevX=b.x;b.prevY=b.y;b.life-=dt;
   if(b.track){let target=null,best=Infinity;for(const e of g.enemies)if(e.active&&!e.flee&&e.y<b.y+25){const priority=e.type==='healer'?.45:e.type==='dash'?.7:1,dist=Math.hypot(e.x-b.x,e.y-b.y)*priority;if(dist<best){best=dist;target=e;}}if(target){const a=Math.atan2(target.y-b.y,target.x-b.x),k=Math.min(1,dt*(1.4+b.track*.8));b.vx+=(Math.cos(a)*610-b.vx)*k;b.vy+=(Math.sin(a)*610-b.vy)*k;}}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   // First intersection along the bullet path wins; tanks/minions really block shots.
   for(let pass=0;pass<5&&b.active;pass++){let target=null,nearest=Infinity;for(const e of g.enemies)if(e.active&&!e.flee&&e.id!==b.hit1&&e.id!==b.hit2&&e.id!==b.hit3&&e.id!==b.hit4&&e.id!==b.hit5){if(segmentDistance(e.x,e.y,b.prevX,b.prevY,b.x,b.y)<e.r+b.r){const dist=Math.hypot(e.x-b.prevX,e.y-b.prevY);if(dist<nearest){nearest=dist;target=e;}}}if(!target)break;
    b.hit5=b.hit4;b.hit4=b.hit3;b.hit3=b.hit2;b.hit2=b.hit1;b.hit1=target.id;hitEnemy(g,target,b.damage);if(--b.pierce<=0)b.active=false;
   }
   if(b.life<=0||b.y<-50||b.y>g.height+60||b.x<-60||b.x>g.width+60)b.active=false;
  }
  for(const b of g.hostile)if(b.active){b.age+=world;if(b.age<b.delay)continue;b.prevX=b.x;b.prevY=b.y;b.x+=b.vx*world;b.y+=b.vy*world;b.life-=world;const dist=segmentDistance(g.x,g.y,b.prevX,b.prevY,b.x,b.y),r=b.r+19;if(dist<r){if(g.invincible<=0){damage(g,b.label,b.damage||1);b.active=false;}}else graze(g,b,dist,r);if(b.life<=0||b.y>g.height+65||b.x<-80||b.x>g.width+80||b.y<-100)b.active=false;}
  if(!g.running)return 'hit';
  for(const p of g.items)if(p.active){p.age+=world;const fake=p.kind==='fake';if(fake&&p.flash<0&&Math.hypot(p.x-g.x,p.y-g.y)<155)p.flash=.3;
   if(p.flash>0)p.flash=Math.max(0,p.flash-dt);
   if(p.kind==='peanut'&&g.effects.magnet>0){const a=Math.atan2(g.y-p.y,g.x-p.x);p.x+=Math.cos(a)*650*dt;p.y+=Math.sin(a)*650*dt;}
   else{p.x=clamp(p.x+p.vx*world,18,g.width-18);p.y+=(p.speed+p.vy)*world;p.vy=Math.min(0,p.vy+240*world);p.vx*=1-world*.8;}
   if(Math.hypot(p.x-g.x,p.y-g.y)<p.r+22)pickup(g,p);if(!g.running)return 'hit';if(p.y>g.height+55||p.age>16)p.active=false;
  }
  for(const p of g.particles)if(p.active){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0)p.active=false;}
  for(const p of g.texts)if(p.active){p.life-=dt;p.y-=24*dt;if(p.life<=0)p.active=false;}
 }
 return !g.running?'hit':g.choice?'choice':null;
}
