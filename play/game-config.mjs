// Adjustable gameplay rules. No saved permanent upgrade levels are changed.
export const GAME_CONFIG = Object.freeze({
 pacing:{firstChip:28,chipCooldown:65,supplyInterval:90,elite:50,firstEvent:65,eventInterval:90,firstBoss:90,firstBossHp:72,bossArrivalGrace:1.2,bossWarning:6,bossInterval:120},
 counter:{enabled:true,max:100,graze:12,elite:20,energyPeanut:15,threatKill:5,damage:12,bossMultiplier:1.5,pierce:8,speed:780,clearRadius:28,interrupt:.55,interruptCooldown:8},
 routes:{pierceStep:.08,pierceCap:.3,bossPierceFactor:.35,scatterRadius:170,scatterBonus:.2},
 economy:{repair:18,boost:24,reviveLimit:4},
 threat:{ad:1,headline:1.5,army:1,elite:6,splitter:2,small:.5,dash:3,tank:4,healer:3,drone:2,sniper:4,ghost:2,mine:3,leech:2.5,beetle:3},
 feedback:{events:32,voices:6,hitFlash:.09,grazeRing:.3,hurtRing:.4},
});
export const COMBOS = Object.freeze([
 {id:'boomerang',name:'回旋虫',requires:{pierce:2,track:1}},
 {id:'storm',name:'虫群风暴',requires:{spread:2,pierce:1}},
 {id:'hunter',name:'猎手虫',requires:{track:2,spread:1}},
]);
export const unlockedCombos=build=>COMBOS.filter(c=>Object.entries(c.requires).every(([k,v])=>build[k]>=v));
export const threatLimit = g => Math.max(5,Math.min(26,7+g.elapsed/12)*(g.groups.some(o=>o.active)?.55:g.event?.8:1)*(g.shield===0?.85:1));
export const threatUsed = g => g.enemies.reduce((n,e)=>n+(e.active&&!e.boss&&!e.retiring?(GAME_CONFIG.threat[e.type]||1):0),0);
export const canSpawn = (g,type) => threatUsed(g)+(GAME_CONFIG.threat[type]||1)<=threatLimit(g)&&g.hostile.reduce((n,b)=>n+Boolean(b.active),0)<(g.groups.some(o=>o.active)?140:90);
export function cleanPreferences(value={}){return {sound:value?.sound===true,volume:Number.isFinite(value?.volume)?Math.max(0,Math.min(.5,value.volume)):.15,shake:value?.shake!==false,flash:value?.flash!==false,mouseFollow:value?.mouseFollow!==false,counterKey:value?.counterKey==='KeyE'?'KeyE':'Space'};}
export function cleanTutorial(value={}){const out={};for(const key of ['move','first-kill','combo','early','chip','fake','graze','counter','ready','supply','energy'])if(value?.[key]===true)out[key]=true;return out;}
