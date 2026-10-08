// Small synthesized cues, unlocked by explicit game input. No audio downloads or loops.
const tones={shot:[310,.025],hit:[170,.03],kill:[420,.055],pickup:[850,.04],graze:[1080,.075],ready:[660,.18],counter:[110,.23],hurt:[90,.13],evolve:[760,.2],boss:[130,.25],victory:[980,.24],supply:[720,.1],'boss-hit':[180,.07]};
export function combatFeedback(preferences,reducedMotion){
 let audio=null,voices=0,lastHit=0,shakeUntil=0;
 const api={
  unlock(){if(!preferences.sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch(_){}},
  drain(game){const events=game.feedback.splice(0);for(const kind of events){if(['hurt','counter'].includes(kind)&&preferences.shake&&!reducedMotion.matches)shakeUntil=performance.now()+120;if(!audio||audio.state!=='running'||!preferences.sound||voices>=6)continue;const now=audio.currentTime;if((kind==='hit'||kind==='shot')&&now-lastHit<.06)continue;if(kind==='hit'||kind==='shot')lastHit=now;const [frequency,duration]=tones[kind]||tones.pickup;try{const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type=kind==='hurt'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,now);oscillator.frequency.exponentialRampToValueAtTime(Math.max(40,frequency*.7),now+duration);gain.gain.setValueAtTime(Math.max(.0001,preferences.volume*.2),now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);oscillator.connect(gain);gain.connect(audio.destination);voices++;oscillator.onended=()=>{voices--;oscillator.disconnect();gain.disconnect();};oscillator.start(now);oscillator.stop(now+duration);}catch(_){}}
  },
  offset(){if(performance.now()>shakeUntil||!preferences.shake||reducedMotion.matches)return [0,0];return [Math.sin(performance.now()*.11)*2,Math.cos(performance.now()*.09)*2];},
  suspend(){shakeUntil=0;if(audio)audio.suspend().catch(()=>{});},
  reset(){shakeUntil=0;},
 };
 return api;
}
