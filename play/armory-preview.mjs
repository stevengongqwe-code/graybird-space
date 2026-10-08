/* One optional ballistic preview at a time; no loop when hidden, closed or reduced motion. */
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let active=null,frame=0;const controllers=new Set();
function stop(){cancelAnimationFrame(frame);frame=0;}
function paint(c,time=0){
 const g=c.canvas.getContext('2d');if(!g)return;const W=c.canvas.width,H=c.canvas.height,id=c.id;
 g.fillStyle='#0c151e';g.fillRect(0,0,W,H);g.strokeStyle='#31404c';g.beginPath();g.moveTo(24,H/2);g.lineTo(W-24,H/2);g.stroke();
 g.fillStyle='#899ba9';g.fillRect(W-28,H/2-13,16,26);g.fillStyle='#dce8e0';g.beginPath();g.arc(22,H/2,5,0,Math.PI*2);g.fill();
 const colors={worm:'#b7d66d',scatter:'#d8b67a',seeker:'#b9d497',beam:'#b7cce2',bomb:'#bba185',frost:'#92c8df'};
 for(let i=0;i<3;i++)for(let j=0;j<c.stats.projectiles;j++){
  const progress=(time*c.stats.rate*.23+i/3)%1,x=30+progress*(W-58),spread=(j-(c.stats.projectiles-1)/2)*.24;
  let y=H/2+Math.sin(spread)*progress*90;
  if(id==='seeker')y=H/2+Math.sin(progress*Math.PI)*18*(i%2?1:-1);
  g.fillStyle=colors[id];g.strokeStyle=colors[id];g.lineWidth=id==='beam'?3:2;g.beginPath();
  if(id==='beam'){g.moveTo(x-22,y);g.lineTo(x+14,y);g.stroke();}
  else{g.ellipse(x,y,id==='bomb'?5:3,3,0,0,Math.PI*2);g.fill();}
 }
 if(id==='bomb'||id==='frost'){
  g.strokeStyle=colors[id];g.globalAlpha=.6;g.beginPath();g.arc(W-21,H/2,id==='bomb'?8+((time*.8)%1)*16:20,0,Math.PI*2);g.stroke();g.globalAlpha=1;
 }
}
function tick(now){frame=0;if(!active||!active.visible||document.hidden||reducedMotion.matches)return;paint(active,now/1000);frame=requestAnimationFrame(tick);}
function resume(){stop();if(active?.visible&&!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(tick);}
export function stopWeaponPreviews(){stop();active=null;for(const c of controllers)c.observer?.disconnect();controllers.clear();}
export function weaponPreview(id,stats,reduced){
 const wrap=document.createElement('div'),canvas=document.createElement('canvas'),button=document.createElement('button');wrap.className='weapon-preview';canvas.width=280;canvas.height=92;canvas.setAttribute('aria-label','基础弹道预览');canvas.setAttribute('role','img');
 button.type='button';button.textContent='预览弹道';button.setAttribute('aria-pressed','false');const c={canvas,button,id,stats,reduced,visible:true};controllers.add(c);
 button.addEventListener('click',()=>{if(active===c){active=null;button.setAttribute('aria-pressed','false');stop();paint(c,.4);}else{if(active)active.button.setAttribute('aria-pressed','false');active=c;button.setAttribute('aria-pressed','true');resume();}});
 if('IntersectionObserver'in window){c.observer=new IntersectionObserver(entries=>{c.visible=entries[0].isIntersecting;if(active===c)resume();});c.observer.observe(canvas);}
 wrap.append(canvas,button);paint(c,.4);return wrap;
}
document.addEventListener('visibilitychange',resume);
reducedMotion.addEventListener('change',event=>{stop();if(active)paint(active,.4);if(!event.matches)resume();});
