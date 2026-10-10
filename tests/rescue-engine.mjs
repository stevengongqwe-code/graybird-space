import assert from 'node:assert/strict';
import {RescueGame} from '../save-graybird/engine.js';
const tick=(g,s,input={})=>{for(let t=0;t<s;t+=.05)g.step(.05,input)};
const at=(g,p)=>{g.player={x:p.x,y:p.y};};
let g=new RescueGame({assist:true});assert.equal(g.select('graybird'),false);g.start();g.pause();tick(g,5,{x:1});assert.equal(g.total,0);g.resume();tick(g,.1,{x:1});assert(g.player.x>100);
at(g,{x:280,y:195});tick(g,1,{x:1});assert(g.player.x<290);
for(const item of g.items){at(g,item);tick(g,.1)}assert(g.items.every(i=>i.done));at(g,g.exit);tick(g,.1);assert.equal(g.status,'chapter-complete');
g.setup(1);g.start();at(g,g.nodes[0]);assert.equal(g.interact(),false);assert.equal(g.sequence,0);for(const i of [1,0,2]){at(g,g.nodes[i]);assert.equal(g.interact(),true)}assert.equal(g.status,'chapter-complete');
g.setup(2);g.start();for(const n of g.nodes){at(g,n);g.interact()}assert.equal(g.status,'chapter-complete');
g.setup(3);g.start();g.select('mage');at(g,{x:480,y:320});for(let i=0;i<550&&g.status==='playing';i++){g.ability();g.step(.05)}assert.equal(g.status,'chapter-complete');
g.setup(4);g.start();for(const n of g.nodes){at(g,n);g.interact()}assert.equal(g.status,'chapter-complete');
g.setup(5);g.start();assert(g.select('graybird'));at(g,g.nodes[0]);g.interact();at(g,g.exit);g.shield=10;tick(g,3);assert.equal(g.status,'chapter-complete');
g.setup(6);g.start();for(const n of g.nodes){at(g,n);g.interact()}at(g,{x:480,y:320});g.shield=30;tick(g,13);assert.equal(g.status,'won');assert(g.completed);const total=g.total;tick(g,5);assert.equal(g.total,total);
for(const id of ['captain','engineer','runner','mage','scout','healer','guardian','graybird']){const a=new RescueGame();a.setup(6);a.start();a.select(id);a.hp=3;a.bullets=[{x:1,y:1}];a.strikes=[{x:1,y:1}];assert(a.ability());assert.equal(a.ability(),false);if(id==='healer')assert.equal(a.hp,4);if(id==='engineer')assert.equal(a.nodes.filter(n=>n.done).length,1);if(id==='runner')assert(a.speedBoost>0);if(id==='scout')assert(a.stealth>0)}
g=new RescueGame();g.start();for(let i=0;i<5;i++){g.invulnerable=0;g.hit()}assert.equal(g.status,'failed');assert.equal(g.retries,1);g.setup(0);assert.equal(g.hp,5);assert.equal(g.retries,1);
console.log('PASS: all seven chapter objectives, pause, collision, sequence reset, escort, eight abilities, cooldown, loss/retry, terminal state');
