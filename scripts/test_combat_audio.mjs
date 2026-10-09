import assert from 'node:assert/strict';
import {combatFeedback} from '../play/combat-feedback.mjs';
import {createGame,stepGame,damage,drop,chargeCounter,releaseCounter,spawnBoss,hitEnemy,chooseEvolution} from '../play/game-core.mjs';

// Controlled AudioContext double checks lifecycle and resource bounds, not audible quality.
const contexts=[];
class Param {setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
class Context {
 constructor(){this.state='suspended';this.currentTime=0;this.destination={};this.oscillators=[];this.gains=[];contexts.push(this);}
 resume(){if(this.rejected)return Promise.reject(Error('blocked'));this.state='running';return this.pending||Promise.resolve();}
 suspend(){this.state='suspended';return Promise.resolve();}
 createGain(){const n={gain:new Param(),connect(){},disconnect(){this.disconnected=true;}};this.gains.push(n);return n;}
 createOscillator(){const n={frequency:new Param(),connect(){},disconnect(){this.disconnected=true;},start(){if(this.fail)throw Error('failed');this.started=true;},stop(){this.stopped=true;}};this.oscillators.push(n);return n;}
}
globalThis.window={AudioContext:Context};globalThis.document={hidden:false};
const preferences={sound:true,volume:.5,shake:true};
const fx=combatFeedback(preferences,{matches:false});
assert.equal(contexts.length,0,'no autoplay or context at import');
const queue={feedback:['shot','hit']};fx.drain(queue);assert.deepEqual(queue.feedback,[]);assert.equal(contexts.length,0);
await fx.unlock();const audio=contexts.at(-1);
const events=['start','resume','shot','hit','kill','pickup','reward','graze','ready','counter','hurt','death','revive','evolve','warning','boss','victory','supply','purchase','insufficient'];
for(const kind of events){audio.currentTime+=1;fx.drain({feedback:[kind]});const n=audio.oscillators.at(-1);assert.ok(n.started,kind);n.onended();}
audio.currentTime+=1;const before=audio.oscillators.length;fx.drain({feedback:Array(100).fill('shot').concat(Array(100).fill('hit'))});assert.equal(audio.oscillators.length-before,2,'independent shot/hit rate limits');
fx.reset();for(let i=0;i<20;i++){audio.currentTime+=.2;fx.drain({feedback:['shot']});}assert.ok(audio.oscillators.filter(n=>n.started&&!n.disconnected).length<=8,'bounded voices');
fx.drain({feedback:['death']});assert.ok(audio.oscillators.at(-1).started,'critical cue displaces a quiet shot');
preferences.volume=.2;fx.settings();assert.equal(audio.gains[0].gain.value,.2,'live master volume');
preferences.sound=false;fx.settings();assert.equal(audio.gains[0].gain.value,0);assert.ok(audio.oscillators.every(n=>n.disconnected),'mute truncates active voices');
preferences.sound=true;await fx.unlock();fx.suspend();const suspended=audio.oscillators.length;fx.drain({feedback:['shot','warning']});await fx.unlock();assert.equal(audio.oscillators.length,suspended,'no replay of suspended events');
let resolve;audio.pending=new Promise(r=>resolve=r);fx.cue('start');fx.reset();resolve();await Promise.resolve();await Promise.resolve();assert.equal(audio.oscillators.length,suspended,'reset cancels pending action');audio.pending=null;
document.hidden=true;fx.cue('boss');await Promise.resolve();assert.equal(audio.oscillators.length,suspended);document.hidden=false;
audio.rejected=true;fx.cue('start');await Promise.resolve();await Promise.resolve();audio.rejected=false;
const broken=combatFeedback(preferences,{matches:true});window.AudioContext=class {constructor(){throw Error('unsupported');}};await broken.unlock();broken.drain({feedback:['hurt']});
window.AudioContext=Context;const failing=combatFeedback(preferences,{matches:false});await failing.unlock();const failure=contexts.at(-1),original=failure.createOscillator;failure.createOscillator=function(){const n=original.call(this);n.fail=true;return n;};for(let i=0;i<20;i++){failure.currentTime+=1;failing.drain({feedback:['kill']});}assert.ok(failure.oscillators.every(n=>n.disconnected),'failed start releases resources');

const game=createGame();game.running=true;damage(game,'test');assert.ok(game.feedback.includes('hurt'));game.invincible=0;damage(game,'test');assert.ok(game.feedback.includes('death'));
const arena=createGame();arena.running=true;arena.invincible=999;arena.nextSupply=999;arena.nextEvent=999;
arena.elapsed=83.99;stepGame(arena,.02,()=>.5);assert.ok(arena.feedback.includes('warning'));arena.feedback.length=0;arena.elapsed=89.99;stepGame(arena,.02,()=>.5);assert.ok(arena.feedback.includes('boss'));
const boss=arena.enemies.find(e=>e.active&&e.boss);hitEnemy(arena,boss,9999);assert.ok(arena.feedback.includes('victory'));
const rewards=createGame();rewards.running=true;rewards.invincible=999;drop(rewards,'peanut',rewards.x,rewards.y);stepGame(rewards,.01);assert.ok(rewards.feedback.includes('pickup'));rewards.feedback.length=0;drop(rewards,'egg',rewards.x,rewards.y);stepGame(rewards,.01);assert.ok(rewards.feedback.includes('reward'));
chargeCounter(rewards,100);assert.ok(rewards.feedback.includes('ready'));assert.ok(releaseCounter(rewards));assert.ok(rewards.feedback.includes('counter'));
rewards.choice=true;rewards.choiceQueue=1;assert.ok(chooseEvolution(rewards,'pierce'));assert.ok(rewards.feedback.includes('evolve'));
console.log('PASS: 20 cue schedules; independent throttles; 8-voice cap and priority; live volume/mute; suspend/restart and delayed-unlock cancellation; unsupported/rejected/failed audio; engine death/rewards/Boss/counter/evolution events. Audible output and Android hardware not tested.');
