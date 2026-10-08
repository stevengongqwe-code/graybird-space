"""Real Chromium UI tests. Artificial encounter fixtures are identified in the report.
No debug object is shipped: the controller hook is added to an intercepted QA response.
"""
import asyncio,json,argparse
from pathlib import Path
from playwright.async_api import async_playwright
ap=argparse.ArgumentParser();ap.add_argument('--base-url',default='http://127.0.0.1:8042');ap.add_argument('--widths',default='360,375,390,412,430,768,1280,1920');args=ap.parse_args();out=Path('/tmp/patrol-upgrade-qa');out.mkdir(exist_ok=True)
OLD={'version':2,'id':'G-12345678','name':'老鸟','first':'2026-10-01','stamps':{'game':'2026-10-01'},'worms':15,'best':41,'peanutBest':150,'peanuts':1000,'letters':{},'night':False,'armory':{'selected':'beam','levels':{'worm':3,'beam':2,'shell':2,'fortune':3}}}
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in [(w,900)for w in map(int,args.widths.split(','))]+[(844,390)]:
   context=await browser.new_context(viewport={'width':width,'height':height},has_touch=width<600 or height<500,is_mobile=width<600 or height<500,device_scale_factor=2)
   await context.route('https://gc.zgo.at/**',lambda r:r.fulfill(status=200,body=''))
   await context.add_init_script('HTMLElement.prototype.requestFullscreen=undefined')
   # Old account remains intact. New mechanics never replace permanent upgrades.
   await context.add_init_script('if(!localStorage.getItem("graybird.explorer.v2"))localStorage.setItem("graybird.explorer.v2",'+json.dumps(json.dumps(OLD))+')')
   async def instrument(route):
    response=await route.fetch();body=await response.text();body=body.replace(' // Canvas is used for exact personal cards, never to redraw the bird.',' window.__patrolQA={get game(){return game},tick,hud,gameDraw,finish,supplyPanel};\n // Canvas is used for exact personal cards, never to redraw the bird.');await route.fulfill(response=response,body=body)
   await context.route('**/play/play.js*',instrument)
   page=await context.new_page();errors=[];bad=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append([r.status,r.url]) if r.status>=400 else None)
   await page.clock.install();await page.goto(args.base_url+'/play/?v=7-counter#game',wait_until='networkidle');await page.locator('#game-start').click();await page.clock.run_for(400)
   assert await page.evaluate('__patrolQA.game.weapon==="beam"&&__patrolQA.game.weaponLevel===2&&__patrolQA.game.shield===3')
   # Actual movement and automatic shooting through the page's controls.
   before=await page.evaluate('__patrolQA.game.x');await page.locator('#signal-game').focus();await page.keyboard.down('ArrowLeft');await page.clock.run_for(200);await page.keyboard.up('ArrowLeft');assert await page.evaluate('__patrolQA.game.x')<before
   assert await page.evaluate('__patrolQA.game.shots>0')
   await page.locator('#game-fullscreen').click();await page.clock.run_for(100)
   # Counter fixture sets energy only; input and subsequent projectile simulation are real.
   await page.evaluate('__patrolQA.game.energy=100;__patrolQA.hud(true)')
   if width<600 or height<500:
    box=await page.locator('#signal-game').bounding_box();skill=await page.locator('#game-counter').bounding_box();cdp=await context.new_cdp_session(page)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']*.35,'y':box['y']+box['height']*.65,'id':1}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']*.35,'y':box['y']+box['height']*.65,'id':1},{'x':skill['x']+skill['width']/2,'y':skill['y']+skill['height']/2,'id':2}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':box['x']+box['width']*.6,'y':box['y']+box['height']*.65,'id':1},{'x':skill['x']+skill['width']/2,'y':skill['y']+skill['height']/2,'id':2}]})
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await page.clock.run_for(150)
   else:
    await page.locator('#signal-game').focus();await page.keyboard.press('Space');await page.clock.run_for(100)
   assert await page.evaluate('__patrolQA.game.counters===1&&__patrolQA.game.energy===0'),(width,height,'counter')
   # First chip UI is reached by normal scheduling, with a survival-only fixture.
   await page.evaluate('__patrolQA.game.invincible=1000;__patrolQA.game.target=__patrolQA.game.x;__patrolQA.game.targetY=__patrolQA.game.y')
   await page.clock.run_for(28000)
   assert await page.locator('#game-evolution').is_visible(),(width,height,await page.evaluate('__patrolQA.game.elapsed'))
   await page.locator('[data-evolution="pierce"]').click();await page.clock.run_for(100);assert await page.evaluate('__patrolQA.game.build.pierce===1')
   # Show one real Boss at its configured 90s, then exercise victory and spending.
   await page.evaluate('''()=>{const g=__patrolQA.game;for(const a of [g.enemies,g.hostile,g.items])for(const o of a)o.active=false;g.elapsed=83.9;g.nextSupply=9999;g.nextEvent=9999;g.invincible=1000;}''');await page.clock.run_for(6300)
   assert await page.locator('#game-boss-bar').is_visible();await page.clock.run_for(1600)
   await page.locator('#game-shell').screenshot(path=str(out/f'battle-{width}x{height}.png'))
   # Defeat fixture uses the actual damage/kill and supply logic (not a claimed human victory).
   await page.evaluate('''async()=>{const core=await import('/play/game-core.mjs?v=7-counter'),g=__patrolQA.game;g.score=100;for(let i=0;i<12&&g.groups.some(o=>o.active);i++)for(const e of g.enemies)if(e.active&&e.boss)core.hitEnemy(g,e,10000);__patrolQA.supplyPanel();}''');await page.clock.run_for(100)
   assert await page.locator('#game-supply').is_visible();await page.locator('[data-supply="boost"]').click();await page.clock.run_for(100);assert await page.evaluate('__patrolQA.game.spent===24')
   # Background and frame hitches retain the earlier fixed behavior.
   await page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))');assert await page.evaluate('__patrolQA.game.paused');t=await page.evaluate('__patrolQA.game.elapsed');await page.clock.run_for(1000);assert await page.evaluate('__patrolQA.game.elapsed')==t
   await page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"))');await page.locator('#game-start').click()
   await page.evaluate('''()=>{const g=__patrolQA.game;cancelAnimationFrame(g.frame);g.last=performance.now()-4000;__patrolQA.tick(performance.now())}''');assert not await page.evaluate('__patrolQA.game.paused')
   # Death bank credit is exact and old account survives settings persistence/reload.
   await page.evaluate('''async()=>{const g=__patrolQA.game;g.score=100;g.shield=0;g.invincible=0;const c=await import('/play/game-core.mjs?v=7-counter');c.damage(g,'测试弹幕');__patrolQA.finish()}''')
   saved=await page.evaluate('JSON.parse(localStorage.getItem("graybird.explorer.v2"))');assert saved['peanuts']==1076,(width,saved['peanuts']);assert saved['armory']['levels']['beam']==2
   await page.locator('#game-start').click();await page.clock.run_for(100);assert await page.evaluate('__patrolQA.game.score===0&&__patrolQA.game.counters===0&&!__patrolQA.game.supplyChoice')
   await page.locator('#game-pause').click();await page.locator('#game-fullscreen').click();await page.locator('.game-settings').evaluate('(e)=>e.open=true');await page.locator('#combat-key').select_option('KeyE');await page.emulate_media(reduced_motion='reduce');await page.reload(wait_until='networkidle');assert await page.locator('#combat-key').input_value()=='KeyE'
   await page.locator('#game-start').click();await page.evaluate('__patrolQA.game.energy=100;__patrolQA.hud(true)');await page.locator('#signal-game').focus();await page.keyboard.press('e');assert await page.evaluate('__patrolQA.game.counters===1')
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors and not bad,(width,errors,bad)
   print(json.dumps({'viewport':[width,height],'input':'multi-touch'if width<600 or height<500 else 'keyboard','firstEvolution':'normal 28s schedule with invincible QA fixture','counter':'PASS','bossSupplyDeathRestart':'PASS (encounter/death fixtures)','legacySaveAndRemap':'PASS','reducedMotion':'PASS','errors':errors}))
   await context.close()
  await browser.close()
asyncio.run(main())
