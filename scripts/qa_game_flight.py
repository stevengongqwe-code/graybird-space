"""Browser evidence for foreground hitch recovery, battle HUD, fullscreen and armory preview.
Controller access exists only in an intercepted QA response, never in production.
"""
import asyncio,argparse,json
from pathlib import Path
from playwright.async_api import async_playwright
ap=argparse.ArgumentParser();ap.add_argument('--base-url',default='http://127.0.0.1:8041');ap.add_argument('--widths',default='360,375,390,430,768,1280,1920');ap.add_argument('--output',default='/tmp/graybird-flight-qa');args=ap.parse_args();OUT=Path(args.output);OUT.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in map(int,args.widths.split(',')):
   context=await browser.new_context(viewport={'width':width,'height':900},has_touch=width<600,is_mobile=width<600)
   await context.route('https://gc.zgo.at/**',lambda r:r.fulfill(status=200,body=''))
   if width!=1280:await context.add_init_script('HTMLElement.prototype.requestFullscreen=undefined')
   async def instrument(route):
    response=await route.fetch();body=await response.text();body=body.replace(' // Canvas is used for exact personal cards, never to redraw the bird.',' window.__flightQA={get game(){return game},tick,hud,gameDraw,get focused(){return focused}};\n // Canvas is used for exact personal cards, never to redraw the bird.');await route.fulfill(response=response,body=body)
   await context.route('**/play/play.js*',instrument)
   page=await context.new_page();errors=[];bad=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:bad.append([r.status,r.url]) if r.status>=400 else None)
   await page.clock.install();await page.goto(args.base_url+'/play/?v=6-flight#game',wait_until='networkidle')
   assert await page.locator('#game-shell #game-time').count()==1
   assert await page.locator('#game-shell #game-build').count()==1
   assert await page.locator('#game-rules').get_attribute('open') is None
   await page.locator('#game-start').click();await page.clock.run_for(500)
   # Exercise the actual frame controller with repeated 850ms and 4s gaps.
   result=await page.evaluate('''()=>{const q=__flightQA,g=q.game;g.invincible=10;const before=g.elapsed;for(const lag of [850,4000,600]){cancelAnimationFrame(g.frame);g.last=performance.now()-lag;q.tick(performance.now())}return {paused:g.paused,advance:g.elapsed-before,running:g.running}}''')
   assert result['running'] and not result['paused'] and .13<result['advance']<.16,result
   assert await page.locator('#game-overlay').is_hidden()
   # A simulated browser visibility event follows the real background handler.
   await page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))')
   assert await page.evaluate('__flightQA.game.paused')
   t=await page.evaluate('__flightQA.game.elapsed');await page.clock.run_for(1500);assert await page.evaluate('__flightQA.game.elapsed')==t
   await page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"))')
   assert await page.evaluate('__flightQA.game.paused');await page.locator('#game-start').click()
   await page.locator('#game-fullscreen').click();await page.clock.run_for(100)
   assert await page.evaluate('__flightQA.focused')
   if width==1280:assert await page.evaluate('document.fullscreenElement?.id==="game-shell"')
   assert not await page.evaluate('__flightQA.game.paused')
   box=await page.locator('#game-shell').bounding_box();assert box['width']==width and abs(box['height']-900)<2,(width,box)
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   # Touch maps through the letterboxed canvas rather than the outer rectangle.
   if width<600:
    canvas=page.locator('#signal-game');box=await canvas.bounding_box();await canvas.tap(position={'x':box['width']*.6,'y':box['height']*.6})
    assert await page.evaluate('Number.isFinite(__flightQA.game.target+__flightQA.game.targetY)')
   await page.locator('#game-shell').screenshot(path=str(OUT/f'fullscreen-{width}.png'))
   await page.locator('#game-fullscreen').click();assert await page.evaluate('!__flightQA.focused')
   await page.locator('#game-shop-jump').click();assert await page.locator('#game-shop').evaluate('(e)=>e.open');assert await page.evaluate('__flightQA.game.paused')
   assert await page.locator('.weapon-preview canvas').count()==6
   assert await page.locator('.shop-stats').count()==17
   preview=page.locator('.weapon-preview').first;await preview.scroll_into_view_if_needed();await page.clock.run_for(100)
   before=await preview.locator('canvas').evaluate('(c)=>c.toDataURL()');await preview.locator('button').click();await page.clock.run_for(600)
   after=await preview.locator('canvas').evaluate('(c)=>c.toDataURL()');assert before!=after,'ballistics preview really animates'
   await page.emulate_media(reduced_motion='reduce');await page.wait_for_timeout(100);await page.clock.run_for(100)
   static=await preview.locator('canvas').evaluate('(c)=>c.toDataURL()');await page.clock.run_for(500);assert static==await preview.locator('canvas').evaluate('(c)=>c.toDataURL()')
   await page.locator('#game-shop').screenshot(path=str(OUT/f'armory-{width}.png'))
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors and not bad,(width,errors,bad)
   print(json.dumps({'width':width,'hitchRecovery':'PASS','backgroundPause':'PASS (simulated visibility event)','fullscreen':'native' if width==1280 else 'CSS fallback','insideBattleHUD':'PASS','weaponPreviewAndReducedMotion':'PASS','errors':errors}))
   await context.close()
  await browser.close()
asyncio.run(main())
