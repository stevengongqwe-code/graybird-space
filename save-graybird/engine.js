export const WORLD={w:960,h:640};
export const CHAPTERS=[
 {title:'潜入小黑屋',subtitle:'营救计划',art:'/assets/rescue/01-operation.webp',text:'灰鸟的信号消失了。伙伴们在围墙外集合，决定悄悄靠近小黑屋。先找到三枚信号碎片，再从右上方的入口进入。',goal:'收集 3 枚信号碎片 → 抵达入口',help:'蓝色菱形是信号碎片。避开探照灯；黑帽小熊的潜行可以降低警戒。',mode:'collect'},
 {title:'最后的决定',subtitle:'最终决定',art:'/assets/rescue/02-decision.webp',text:'最后一分钟，没有人转身。终端留下了接入顺序：先月亮，再星星，最后太阳。伙伴们要把封锁的信号重新接起来。',goal:'按「月亮 → 星星 → 太阳」接入三台终端',help:'靠近终端后按 E / 接入。顺序不对会重置；红衣伙伴能远程解码。',mode:'sequence'},
 {title:'启动救援装置',subtitle:'启动',art:'/assets/rescue/03-activation.webp',text:'那一按，所有人都听见了。电源、天线、控制台，缺一不可。伙伴们分头守住通道，把装置逐一接通。',goal:'接通电源、天线、控制台',help:'接入三台金色装置。注意红色落点；披风队长的护盾可以挡住危险。',mode:'activate'},
 {title:'守住零点',subtitle:'零点',art:'/assets/rescue/04-midnight.webp',text:'时钟向零点靠近。信号要连续穿过黑夜，救援才会生效。站在传送装置附近稳定信号，离开时进度会保留。',goal:'在中央信号圈内守住 24 秒',help:'待在金色信号圈内充能；躲开落点后再回来。紫袍伙伴的屏障可以清除弹幕。',mode:'hold'},
 {title:'让灰鸟回来',subtitle:'重生',art:'/assets/rescue/05-resurrection.webp',text:'金色光芒照亮大厅。伙伴们把最后的三枚光点送入装置。为了一个朋友，他们试着创造奇迹。',goal:'接入三枚光点，打开小黑屋',help:'接入三个光点。粉猫的疗愈能恢复生命；别忘了还有伙伴在等你。',mode:'revive'},
 {title:'一起冲出去',subtitle:'突围',art:'/assets/rescue/06-breakthrough.webp',text:'灰鸟的身影重新出现。现在它可以加入行动了。所有人沿着通道突围，方向只有一个：一起出去。',goal:'打开出口闸门 → 带灰鸟抵达出口',help:'灰鸟已解锁，空格 / 能力可以反击。先接通右下闸门，再走到右上出口。',mode:'escort'},
 {title:'最后一道屏障',subtitle:'守护',art:'/assets/rescue/alex-01-shield.webp',text:'舰队挡在前方，伙伴们没有停下。三座屏障节点接通后，中央的信号阵才能反击。守住屏障，让灰鸟和所有伙伴离开。',goal:'接通 3 座屏障节点 → 在中央反击舰队',help:'接通紫色节点，再进入中央屏障圈自动反击。能力也能削弱敌方信号。',mode:'finale'}
];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class RescueGame{
 constructor({assist=false}={}){this.assist=assist;this.total=0;this.retries=0;this.completed=false;this.setup(0);}
 setup(chapter){this.chapter=chapter;this.mode=CHAPTERS[chapter].mode;this.status='ready';this.time=0;this.hp=5;this.alarm=0;this.cooldown=0;this.shield=0;this.stealth=0;this.speedBoost=0;this.invulnerable=0;this.message='';this.messageTime=0;this.tickSpawn=0;this.tickShot=0;this.progress=0;this.bossHp=12;this.sequence=0;this.player={x:100,y:545};this.character=chapter>=5?'graybird':'scout';this.bird={x:60,y:555};this.bullets=[];this.strikes=[];this.particles=[];this.walls=chapter>=3?[]:[{x:290,y:180,w:150,h:32},{x:480,y:365,w:180,h:32},{x:740,y:230,w:32,h:145}];this.exit={x:865,y:85};this.patrols=chapter<3?[{x:450,y:110,ox:450,oy:110,phase:0},{x:640,y:510,ox:640,oy:510,phase:2}]:[];
 this.items=[{x:195,y:120,done:false,label:'碎片'},{x:640,y:150,done:false,label:'碎片'},{x:610,y:510,done:false,label:'碎片'}];
 this.nodes=this.mode==='sequence'?[{x:245,y:135,label:'星星',done:false},{x:660,y:150,label:'月亮',done:false},{x:650,y:510,label:'太阳',done:false}]:this.mode==='escort'?[{x:810,y:515,label:'闸门',done:false}]:[{x:225,y:155,label:this.mode==='finale'?'屏障 I':'电源',done:false},{x:730,y:170,label:this.mode==='finale'?'屏障 II':'天线',done:false},{x:660,y:520,label:this.mode==='finale'?'屏障 III':'控制台',done:false}];
 if(this.mode==='revive')this.nodes.forEach((n,i)=>n.label=['光点 I','光点 II','光点 III'][i]);
 }
 start(){if(this.status==='ready')this.status='playing';}
 pause(){if(this.status==='playing')this.status='paused';}
 resume(){if(this.status==='paused')this.status='playing';}
 select(id){if(id==='graybird'&&this.chapter<5)return false;if(!['captain','engineer','runner','mage','scout','healer','guardian','graybird'].includes(id))return false;this.character=id;return true;}
 say(s){this.message=s;this.messageTime=3;}
 hit(){if(this.shield>0||this.invulnerable>0)return;this.hp--;this.invulnerable=this.assist?4:2.5;this.say('被发现了！换个方向，伙伴们还在。');if(this.hp<=0){this.status='failed';this.retries++;}}
 canMove(x,y){if(x<28||y<30||x>WORLD.w-28||y>WORLD.h-28)return false;return !this.walls.some(r=>x>r.x-20&&x<r.x+r.w+20&&y>r.y-20&&y<r.y+r.h+20);}
 move(dx,dy,dt){const n=Math.hypot(dx,dy);if(!n)return;const s=(this.speedBoost>0?275:170)*dt;const x=this.player.x+dx/n*s,y=this.player.y+dy/n*s;if(this.canMove(x,this.player.y))this.player.x=x;if(this.canMove(this.player.x,y))this.player.y=y;}
 interact(remote=false){if(this.status!=='playing')return false;if(this.mode==='collect'){this.say('先收集蓝色碎片，再去右上入口。');return false;}if(this.mode==='hold'){this.say('进入中央信号圈，保持信号稳定。');return false;}
 const available=this.mode==='sequence'?this.nodes:this.nodes.filter(n=>!n.done);const n=available.filter(n=>dist(n,this.player)<(remote?1200:100)).sort((a,b)=>dist(a,this.player)-dist(b,this.player))[0];if(!n){this.say('再靠近一点，接入发光的装置。');return false;}
 if(this.mode==='sequence'){const expected=[1,0,2][this.sequence];if(n!==this.nodes[expected]){this.nodes.forEach(x=>x.done=false);this.sequence=0;this.alarm=Math.min(90,this.alarm+12);this.say('顺序是：月亮 → 星星 → 太阳。再试一次。');return false;}if(n.done)return false;n.done=true;this.sequence++;this.say(n.label+'接入成功');if(this.sequence===3)this.finish();}
 else{n.done=true;this.shield=Math.max(this.shield,1.2);this.say(n.label+'已接通');if(['activate','revive'].includes(this.mode)&&this.nodes.every(x=>x.done))this.finish();}return true;
 }
 ability(){if(this.status!=='playing'||this.cooldown>0)return false;this.cooldown=this.character==='healer'?14:6;
 switch(this.character){case'captain':this.shield=4;this.alarm=Math.max(0,this.alarm-20);this.say('披风队长：跟紧我，护盾已展开。');break;case'engineer':if(this.interact(true))this.say('红衣伙伴：信号已远程接通。');break;case'runner':this.speedBoost=3.5;this.invulnerable=Math.max(this.invulnerable,1);this.say('香蕉驴：这个时候，跑快一点。');break;case'mage':this.shield=4;this.bullets=[];this.strikes=[];this.say('紫袍伙伴：屏障展开。');break;case'scout':this.stealth=5;this.alarm=Math.max(0,this.alarm-35);this.say('黑帽小熊：嘘，轻一点。');break;case'healer':this.hp=Math.min(5,this.hp+1);this.shield=2;this.say('粉猫 Evan：别掉队，再坚持一下。');break;case'guardian':this.bullets=[];this.strikes=[];this.alarm=Math.max(0,this.alarm-25);this.shield=2;this.say('紫毛伙伴：给朋友让个路！');break;case'graybird':this.bullets=[];this.shield=1.5;this.say('灰鸟：啾。现在换我保护你们。');break;}
 if(this.mode==='finale'&&this.nodes.every(n=>n.done)){this.bossHp=Math.max(0,this.bossHp-2);if(this.bossHp===0)this.finish();}return true;
 }
 finish(){if(this.status!=='playing')return;this.status=this.chapter===6?'won':'chapter-complete';if(this.chapter===6)this.completed=true;this.bullets=[];this.strikes=[];}
 step(dt,input={}){if(this.status!=='playing')return;dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.total+=dt;for(const k of ['cooldown','shield','stealth','speedBoost','invulnerable','messageTime'])this[k]=Math.max(0,this[k]-dt);this.move(input.x||0,input.y||0,dt);if(input.interact)this.interact();if(input.ability)this.ability();
 if(this.chapter>=5){const d=dist(this.bird,this.player);if(d>45){this.bird.x+=(this.player.x-this.bird.x)*Math.min(1,dt*3);this.bird.y+=(this.player.y-this.bird.y)*Math.min(1,dt*3);}}
 let spotted=false;for(const p of this.patrols){p.x=p.ox+Math.sin(this.time*.65+p.phase)*120;p.y=p.oy+Math.cos(this.time*.5+p.phase)*35;if(dist(p,this.player)<(this.stealth>0?30:100))spotted=true;}
 this.alarm=Math.max(0,Math.min(100,this.alarm+dt*(spotted?(this.assist?15:30):-10)));if(this.alarm>=100){this.hit();this.alarm=55;}
 if(this.mode==='collect'){for(const item of this.items)if(!item.done&&dist(item,this.player)<40){item.done=true;this.say('信号碎片 '+this.items.filter(i=>i.done).length+' / 3');}if(this.items.every(i=>i.done)&&dist(this.exit,this.player)<50)this.finish();}
 if(this.mode==='hold'&&dist(this.player,{x:480,y:320})<145){this.progress=Math.min(24,this.progress+dt);if(this.progress>=24)this.finish();}
 if(this.mode==='escort'&&this.nodes[0].done&&dist(this.exit,this.player)<55&&dist(this.bird,this.exit)<95)this.finish();
 if(this.mode==='finale'&&this.nodes.every(n=>n.done)&&dist(this.player,{x:480,y:320})<145){this.progress+=dt;if(this.progress>=1){this.progress-=1;this.bossHp=Math.max(0,this.bossHp-1);this.shield=Math.max(this.shield,.3);if(this.bossHp===0)this.finish();}}
 if(this.status!=='playing')return;
 if(this.chapter>=2){this.tickSpawn+=dt;const interval=this.assist?3.6:2.3;if(this.tickSpawn>interval){this.tickSpawn=0;if(this.strikes.length<10)this.strikes.push({x:this.player.x,y:this.player.y,t:1.6,hit:false});}
 this.tickShot+=dt;if(this.tickShot>(this.assist?2:1.2)){this.tickShot=0;const x=480+Math.sin(this.time)*250,y=45;const d=Math.hypot(this.player.x-x,this.player.y-y)||1;if(this.bullets.length<40)this.bullets.push({x,y,vx:(this.player.x-x)/d*110,vy:(this.player.y-y)/d*110});}
 }
 for(const s of this.strikes){s.t-=dt;if(s.t<0&&!s.hit){s.hit=true;if(dist(s,this.player)<43)this.hit();}}this.strikes=this.strikes.filter(s=>s.t>-.35);
 for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(dist(b,this.player)<23){b.dead=true;this.hit();}}this.bullets=this.bullets.filter(b=>!b.dead&&b.x>-30&&b.y>-30&&b.x<WORLD.w+30&&b.y<WORLD.h+30);
 }
 snapshot(){return {chapter:this.chapter,status:this.status,character:this.character,hp:this.hp,alarm:this.alarm,player:{...this.player},nodes:this.nodes.map(n=>({...n})),items:this.items.map(n=>({...n})),progress:this.progress,bossHp:this.bossHp,cooldown:this.cooldown,total:this.total,retries:this.retries,assist:this.assist};}
}
