// Pure game rules shared by the browser and deterministic acceptance tests.
export const ROUND_SECONDS = 30;
export const FIRE_RATES = [2.5, 4, 6, 8];
export const difficulty = seconds => ({
  level: Math.min(5, 1 + Math.floor(seconds / 6)),
  speed: 150 + Math.min(30, seconds) * 6,
  interval: Math.max(.36, .84 - seconds * .016)
});

export function createGame(width = 900, height = 600) {
  return {width, height, running:false, paused:false, elapsed:0, x:width/2,
    target:width/2, score:0, kills:0, shots:0, gun:1, items:[], bullets:[],
    spawn:0, foodTimer:0, fireTimer:0, nextBoost:3, notice:'', noticeTime:0,
    frame:0, last:0, cause:null};
}

function collides(a, b, rx, ry) {
  return Math.abs(a.x-b.x)<rx && Math.abs(a.y-b.y)<ry;
}

export function stepGame(game, seconds, random = Math.random) {
  if (!game.running || game.paused || seconds <= 0) return null;
  // Substeps prevent tunnelling at low frame rates. A stalled tab never teleports a hazard.
  let remaining = Math.min(seconds, ROUND_SECONDS-game.elapsed);
  while (remaining > .000001 && game.running) {
    const dt = Math.min(1/120, remaining);
    remaining -= dt; game.elapsed += dt;
    const level = difficulty(game.elapsed);
    game.target = Math.max(38, Math.min(game.width-38, game.target));
    game.x += (game.target-game.x) * Math.min(1, dt*18);
    const bird = {x:game.x, y:game.height-72};
    game.noticeTime = Math.max(0, game.noticeTime-dt);
    game.fireTimer -= dt;
    if (game.fireTimer <= 0) {
      game.bullets.push({x:game.x, y:bird.y-46});
      game.shots++; game.fireTimer += 1/FIRE_RATES[game.gun-1];
    }
    game.spawn += dt; game.foodTimer += dt;
    if (game.spawn >= level.interval) {
      game.spawn -= level.interval;
      game.items.push({kind:'hazard', x:72+random()*(game.width-144), y:-30,
        label:['广告','弹窗','无效信息'][Math.floor(random()*3)], speed:level.speed*(.9+random()*.2)});
    }
    if (game.foodTimer >= .95) {
      game.foodTimer -= .95;
      game.items.push({kind:'peanut', x:36+random()*(game.width-72), y:-28, speed:180});
    }
    if (game.elapsed >= game.nextBoost && game.nextBoost <= 24) {
      game.items.push({kind:'boost', x:Math.max(32,Math.min(game.width-32,game.x+(random()-.5)*140)), y:-30, speed:190});
      game.nextBoost += 6;
    }
    for (const bullet of game.bullets) bullet.y -= 620*dt;
    const drops=[];
    for (const item of game.items) {
      item.y += item.speed*dt;
      // Contact is fatal even if a caterpillar reaches the same obstacle this step.
      const contact = collides(item,bird,item.kind==='hazard'?82:43,item.kind==='hazard'?48:42);
      if (contact && item.kind==='hazard') {
        game.cause=item.label;game.running=false;return 'hit';
      }
      if (item.kind==='hazard') {
        const bullet = game.bullets.find(b=>!b.dead&&collides(b,item,74,40));
        if (bullet) {
          bullet.dead=true; item.dead=true; game.kills++;
          drops.push({kind:'peanut',x:item.x,y:item.y,speed:205});
        }
      } else if (contact) {
        item.dead=true;
        if (item.kind==='peanut') game.score++;
        else {
          game.gun=Math.min(4,game.gun+1);
          game.fireTimer=Math.min(game.fireTimer,.08);
          game.notice=game.gun===4?'射速已满 · 8 发/秒':`射速升级 · ${FIRE_RATES[game.gun-1]} 发/秒`;
          game.noticeTime=1.8;
        }
      }
    }
    game.items=game.items.filter(i=>!i.dead&&i.y<game.height+50).concat(drops);
    game.bullets=game.bullets.filter(b=>!b.dead&&b.y>-40);
  }
  if (game.elapsed >= ROUND_SECONDS-.000001) {game.elapsed=ROUND_SECONDS;game.running=false;return 'clear';}
  return null;
}
