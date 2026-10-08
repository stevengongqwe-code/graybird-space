"""Browser acceptance for the independent explorer. External analytics is mocked only in QA."""
import asyncio,json,argparse,datetime
from pathlib import Path
from playwright.async_api import async_playwright
ap=argparse.ArgumentParser();ap.add_argument('--base-url',default='http://127.0.0.1:8038');ap.add_argument('--browser',required=True);ap.add_argument('--output',default='/tmp/graybird-play-qa');args=ap.parse_args()
BASE=args.base_url.rstrip('/');OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=args.browser,args=['--no-sandbox','--disable-dev-shm-usage'])
  results=[]
  for w in [375,390,768,1280,1920]:
   context=await browser.new_context(viewport={'width':w,'height':900},is_mobile=w<600,has_touch=w<600,reduced_motion='reduce',accept_downloads=True)
   await context.route('https://gc.zgo.at/**',lambda route:route.fulfill(status=200,body=''))
   page=await context.new_page();errors=[];failed=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
   await page.clock.install(time=datetime.datetime(2026,10,8,4,0,tzinfo=datetime.timezone.utc))
   await page.goto(BASE+'/play/',wait_until='networkidle')
   assert await page.locator('#stamp-progress').inner_text()=='1 / 9 枚印章'
   assert await page.locator('#room-scene img').evaluate('(e)=>e.complete&&e.naturalWidth===1536')
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),w
   assert await page.locator('#sound-toggle').get_attribute('aria-pressed')=='false'
   await page.screenshot(path=str(OUT/f'room-{w}.png'))
   await page.locator('[data-object="journal"]').click();assert await page.locator('#object-dialog').evaluate('(e)=>e.open')
   assert await page.locator('[data-stamp="journal"]').get_attribute('class')=='is-earned'
   title=await page.locator('#object-title').inner_text();await page.locator('.journal-next').click();assert await page.locator('#object-title').inner_text()!=title
   await page.keyboard.press('Escape')
   await page.locator('[data-object="earth"]').click();await page.locator('#object-content img').evaluate('(e)=>e.decode()');await page.locator('#object-close').click()
   await page.locator('[data-object="archive"]').click();assert await page.locator('#object-content a').count()==5;await page.locator('#object-close').click()
   await page.locator('[data-object="cup"]').click();assert '杯子' in await page.locator('#bird-says').inner_text()
   await page.locator('[data-object="secret"]').click();assert await page.locator('[data-stamp="secret"]').get_attribute('class')=='is-earned'
   await page.locator('[data-object="lamp"]').click();assert await page.locator('#room-scene').evaluate('(e)=>e.classList.contains("lamp-on")')
   await page.locator('#night-toggle').click();assert await page.locator('[data-stamp="night"]').get_attribute('class')=='is-earned'
   assert await page.locator('.shooting-star').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
   await page.locator('#sound-toggle').click();assert await page.locator('#sound-toggle').get_attribute('aria-pressed')=='true'
   await page.locator('#sound-mode').select_option('radio');await page.clock.run_for(500)
   await page.locator('#sound-toggle').click();assert await page.locator('#sound-toggle').get_attribute('aria-pressed')=='false'
   if w==1280:
    await page.locator('#room-scene').evaluate('(e)=>e.scrollIntoView({block:"center",behavior:"instant"})')
    worm=await page.locator('#worm').bounding_box();bird=await page.locator('#feed-bird').bounding_box()
    await page.mouse.move(worm['x']+worm['width']/2,worm['y']+worm['height']/2);await page.mouse.down();await page.mouse.move(bird['x']+bird['width']/2,bird['y']+bird['height']/2,steps=12);await page.mouse.up()
   else:
    await (page.locator('#worm').tap() if w<600 else page.locator('#worm').click());await (page.locator('#feed-bird').tap() if w<600 else page.locator('#feed-bird').click())
   await page.clock.run_for(250)
   assert '1 条毛毛虫' in await page.locator('#feed-count').inner_text(),(w,await page.locator('#bird-says').inner_text())
   await page.locator('#worm').click();await page.locator('#feed-bird').click();assert '1 条毛毛虫' in await page.locator('#feed-count').inner_text()
   for _ in range(3):
    await page.clock.run_for(950);await page.locator('#worm').click();await page.locator('#feed-bird').click();await page.clock.run_for(250)
   assert '3 条毛毛虫' in await page.locator('#feed-count').inner_text()
   assert '够了' in await page.locator('#bird-says').inner_text()
   await page.locator('#open-letter').click();assert await page.locator('#open-letter').is_hidden();assert await page.locator('#mail-history-count').inner_text()=='1'
   letter=await page.locator('#letter-title').inner_text()
   await page.locator('#nickname').fill('<img src=x>');await page.locator('#nickname-form button').click()
   assert await page.locator('#visitor-name').inner_text()=='<img src=x>';assert await page.locator('#visitor-name img').count()==0
   ident=await page.locator('#visitor-id').inner_text()
   async with page.expect_download() as d:
    await page.locator('#save-passport').click();await page.locator('#passport-download').click()
   await (await d.value).save_as(OUT/f'visitor-{w}.png')
   assert await page.locator('#passport-image').evaluate('(e)=>e.complete&&e.naturalWidth===1000')
   await page.locator('#passport').screenshot(path=str(OUT/f'passport-{w}.png'))
   await page.reload(wait_until='networkidle');assert await page.locator('#visitor-id').inner_text()==ident
   assert await page.locator('#visitor-name').inner_text()=='<img src=x>';assert await page.locator('#letter-title').inner_text()==letter
   assert await page.locator('#sound-toggle').get_attribute('aria-pressed')=='false'
   await page.evaluate('Math.random=()=>0')
   await page.locator('#game-start').click()
   await page.locator('#signal-game').press('ArrowLeft')
   await page.locator('#signal-game').focus();await page.keyboard.down('ArrowLeft');await page.clock.run_for(1100);await page.keyboard.up('ArrowLeft')
   await page.locator('#game-pause').click();time=await page.locator('#game-time').inner_text();await page.clock.run_for(4000);assert await page.locator('#game-time').inner_text()==time
   await page.locator('#game-pause').click();await page.clock.run_for(30050)
   assert await page.locator('#game-result').is_visible();assert int(await page.locator('#game-score').inner_text())>0
   assert '30 秒' in await page.locator('#game-result-text').inner_text()
   assert await page.locator('[data-stamp="game"]').get_attribute('class')=='is-earned'
   await page.locator('#save-score').click()
   await page.locator('#score-export').wait_for(state='visible');await page.locator('#score-image').evaluate('(e)=>e.decode()');assert await page.locator('#score-image').evaluate('(e)=>e.naturalWidth===1000')
   await page.locator('#game').screenshot(path=str(OUT/f'game-{w}.png'))
   assert await page.locator('#stamp-progress').inner_text()=='9 / 9 枚印章'
   assert await page.locator('#wall-load').is_hidden();assert await page.locator('.giscus iframe').count()==0
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),w
   targets=await page.locator('.room-scene button,.room-tools button,#worm,.passport-controls button,.passport-controls input,.play-tabs a,.game-controls button').evaluate_all('(els)=>els.filter(e=>!e.hidden&&!e.disabled&&e.getBoundingClientRect().width>0).map(e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height])')
   assert all(x>=44 and y>=44 for x,y in targets),(w,targets)
   assert not errors and not failed,(w,errors,failed)
   results.append({'width':w,'dragOrTouch':'PASS','nineStamps':'PASS','twoAudioModes':'PASS','dailyLetterAndPersistence':'PASS','real30SecondGameAndPause':'PASS','PNGCards':'PASS','overflow':False,'pageErrors':errors})
   await context.close()
  # Denied local storage still leaves a working in-memory experience.
  context=await browser.new_context(viewport={'width':390,'height':900})
  await context.route('https://gc.zgo.at/**',lambda route:route.fulfill(status=200,body=''))
  await context.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw Error("storage denied")}})')
  page=await context.new_page();await page.goto(BASE+'/play/',wait_until='networkidle');assert '无法保存' in await page.locator('#storage-note').inner_text()
  await page.locator('#worm').click();await page.locator('#feed-bird').click();await page.wait_for_timeout(750);assert '1 条毛毛虫' in await page.locator('#feed-count').inner_text()
  await context.close()
  context=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900})
  page=await context.new_page();await page.goto(BASE+'/play/');assert await page.locator('#feed-bird').is_disabled();assert await page.locator('#game-start').is_disabled();assert await page.locator('.play-footer a').count()==3
  await context.close();await browser.close()
  print(json.dumps({'viewports':results,'deniedStorage':'PASS','noJavaScript':'PASS','liveGiscus':'pending-owner-authorization'},ensure_ascii=False))
asyncio.run(main())
