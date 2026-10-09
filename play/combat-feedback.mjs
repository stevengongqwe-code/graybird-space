// Synthesized cues use the existing combat preferences; no downloads or loops.
// frequencies, duration, level, waveform, cooldown, priority
// Half-scale envelopes and eight voices bound the summed peak below 0.7 at full volume.
const cues={
 start:[[440,660,880],.24,.16,'sine',0,2],resume:[[440,660],.14,.12,'sine',0,2],
 shot:[[310,220],.035,.035,'triangle',.09,0],hit:[[170,110],.04,.045,'triangle',.07,0],
 kill:[[420,260],.09,.09,'triangle',.08,1],pickup:[[850,1120],.08,.09,'sine',.07,1],
 reward:[[660,990,1320],.18,.14,'sine',.12,2],graze:[[1080,1280],.075,.06,'sine',.12,1],
 ready:[[660,880,1320],.3,.17,'sine',.3,3],counter:[[110,440,220],.23,.16,'triangle',.2,3],
 hurt:[[180,70],.16,.13,'triangle',.12,3],death:[[240,140,60],.38,.17,'triangle',0,3],
 revive:[[220,440,880],.3,.16,'sine',0,3],evolve:[[760,1140,1520],.25,.16,'sine',.1,2],
 warning:[[220,440,220,440],.48,.17,'square',.5,3],boss:[[130,65,130],.32,.16,'triangle',.3,3],
 victory:[[660,880,990,1320],.42,.17,'sine',.3,3],supply:[[720,1080],.14,.12,'sine',.1,2],
 purchase:[[540,810,1080],.2,.14,'sine',.1,2],insufficient:[[180,120,180],.2,.12,'triangle',.3,2],
 'boss-hit':[[180,90],.07,.065,'triangle',.1,1],
};
export function combatFeedback(preferences,reducedMotion){
 let audio=null,master=null,shakeUntil=0,generation=0;
 const voices=new Set(),last=new Map();
 const volume=()=>Number.isFinite(preferences.volume)?Math.min(1,Math.max(0,preferences.volume)):0;
 function dispose(voice){if(!voices.delete(voice))return;try{voice.oscillator.disconnect();voice.gain.disconnect();}catch(_){}}
 function stop(){generation++;shakeUntil=0;last.clear();for(const voice of [...voices]){try{voice.oscillator.stop();}catch(_){}dispose(voice);}}
 function sync(){if(master&&audio)try{master.gain.setValueAtTime(preferences.sound?volume():0,audio.currentTime);}catch(_){}if(!preferences.sound||!volume())stop();}
 function play(kind){
  const cue=cues[kind];if(!cue||!audio||audio.state!=='running'||!preferences.sound||!volume()||document.hidden)return;
  const [frequencies,duration,level,type,interval,priority]=cue,now=audio.currentTime;
  if(now-(last.get(kind)??-Infinity)<interval)return;
  if(voices.size>=8){const expendable=[...voices].find(v=>v.priority<priority);if(!expendable)return;try{expendable.oscillator.stop();}catch(_){}dispose(expendable);}
  let voice;
  try{
   const oscillator=audio.createOscillator(),gain=audio.createGain();voice={oscillator,gain,priority};voices.add(voice);
   oscillator.type=type;frequencies.forEach((frequency,i)=>oscillator.frequency.setValueAtTime(frequency,now+i*duration/frequencies.length));
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level*.5,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
   oscillator.connect(gain);gain.connect(master);oscillator.onended=()=>dispose(voice);oscillator.start(now);oscillator.stop(now+duration);last.set(kind,now);
  }catch(_){if(voice){try{voice.oscillator.stop();}catch(_){}dispose(voice);}}
 }
 const api={
  unlock(){
   if(!preferences.sound||document.hidden)return Promise.resolve(false);
   try{
    if(!audio){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return Promise.resolve(false);audio=new Context();master=audio.createGain();master.connect(audio.destination);}
    sync();return Promise.resolve(audio.resume()).then(()=>audio.state==='running',()=>false);
   }catch(_){return Promise.resolve(false);}
  },
  // Only the current user action waits for unlock. Simulation events never queue.
  cue(kind){const token=generation;api.unlock().then(ok=>{if(ok&&token===generation)play(kind);});},
  drain(game){const events=game.feedback.splice(0);for(const kind of events){if(['hurt','counter'].includes(kind)&&preferences.shake&&!reducedMotion.matches)shakeUntil=performance.now()+120;play(kind);}},
  offset(){if(performance.now()>shakeUntil||!preferences.shake||reducedMotion.matches)return [0,0];return [Math.sin(performance.now()*.11)*2,Math.cos(performance.now()*.09)*2];},
  settings:sync,
  suspend(){stop();if(audio)try{Promise.resolve(audio.suspend()).catch(()=>{});}catch(_){}},
  reset:stop,
 };
 return api;
}
