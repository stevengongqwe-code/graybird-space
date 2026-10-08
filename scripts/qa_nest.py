"""Exercise the personal passport, feeding and existing routes in a real browser.

Requires the development-only Playwright package and an installed Chromium.
No browser packages or extra services are shipped with the website.
"""
import argparse, asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base-url',default='http://127.0.0.1:8000')
parser.add_argument('--browser',required=True)
parser.add_argument('--output',default='/tmp/graybird-nest-qa')
args=parser.parse_args()
BASE=args.base_url.rstrip('/')
OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
KEY='graybird.visitor.v1'

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=args.browser,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
  reports=[]
  for width in [375,390,768,1280,1920]:
   context=await browser.new_context(viewport={'width':width,'height':900},is_mobile=width<600,has_touch=width<600,reduced_motion='reduce',accept_downloads=True)
   # Local QA verifies the site's no-analytics fallback without polluting production data.
   await context.route('https://gc.zgo.at/**',lambda route:route.fulfill(status=200,body=''))
   page=await context.new_page();errors=[];failed=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
   await page.add_init_script("""window.__nestPerf={cls:0,lcp:0};
    new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__nestPerf.cls+=e.value})).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__nestPerf.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});""")
   response=await page.goto(BASE+'/nest/',wait_until='networkidle');assert response.status==200
   assert await page.locator('#passport-progress').inner_text()=='1 / 6 枚印章'
   assert await page.locator('#nest-bird img').evaluate('(e)=>e.complete&&e.naturalWidth===512')
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   assert await page.locator('#nest-bird').evaluate('(e)=>getComputedStyle(e).transitionDuration==="0s"')
   targets=await page.locator('.nest-play button,.passport-controls button,.passport-controls input,.nest-passport-link').evaluate_all('(els)=>els.filter(e=>e.getBoundingClientRect().width>0).map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
   assert all(t['w']>=44 and t['h']>=44 for t in targets),(width,targets)
   await page.locator('.nest-play').screenshot(path=str(OUT/f'room-{width}.png'))
   await page.locator('.nest-passport').screenshot(path=str(OUT/f'passport-{width}.png'))
   perf=await page.evaluate('window.__nestPerf')
   for key in ['window','journal','signal']:
    await page.locator(f'[data-nest-object="{key}"]').click()
    assert await page.locator(f'[data-stamp="{key}"]').get_attribute('class')=='is-earned'
   if width<600:
    await page.locator('#nest-peanut').tap();await page.locator('#nest-bird').tap()
   elif width==1280:
    await page.locator('#nest-peanut').scroll_into_view_if_needed()
    # Move both ends into a single viewport before genuine pointer dragging.
    await page.locator('.nest-room').evaluate('(e)=>e.scrollIntoView({block:"start",behavior:"instant"})')
    food=await page.locator('#nest-peanut').bounding_box();bird=await page.locator('#nest-bird').bounding_box()
    await page.mouse.move(food['x']+food['width']/2,food['y']+food['height']/2);await page.mouse.down()
    await page.mouse.move(bird['x']+bird['width']/2,bird['y']+bird['height']/2,steps=12);await page.mouse.up()
   else:
    await page.locator('#nest-peanut').focus();await page.keyboard.press('Enter')
    await page.locator('#nest-bird').focus();await page.keyboard.press('Enter')
   assert await page.locator('[data-stamp="feed"]').get_attribute('class')=='is-earned'
   assert (await page.locator('#nest-feed-count').inner_text()).endswith('1 颗花生')
   await page.locator('#nest-peanut').click();await page.locator('#nest-bird').click()
   assert (await page.locator('#nest-feed-count').inner_text()).endswith('1 颗花生'),'rapid feed must not increase accepted count'
   name='<img src=x>'
   await page.locator('#passport-nickname').fill(name);await page.locator('#passport-form button').click()
   assert await page.locator('#passport-name-display').inner_text()==name
   assert await page.locator('#passport-name-display img').count()==0
   ident=await page.locator('#passport-id').inner_text()
   await page.reload(wait_until='networkidle')
   assert await page.locator('#passport-id').inner_text()==ident
   assert await page.locator('#passport-name-display').inner_text()==name
   assert await page.locator('#passport-progress').inner_text()=='5 / 6 枚印章'
   await page.locator('.passport-controls>a').click();assert '/archive/observation-001/' in page.url
   await page.wait_for_load_state('networkidle')
   assert await page.evaluate('(key)=>Boolean(JSON.parse(localStorage.getItem(key)).stamps.archive)',KEY)
   await page.goto(BASE+'/nest/',wait_until='networkidle')
   assert await page.locator('#passport-progress').inner_text()=='6 / 6 枚印章'
   async with page.expect_download() as download_info:
    await page.locator('#passport-save').click()
   download=await download_info.value
   await download.save_as(OUT/f'export-{width}.png')
   assert (OUT/f'export-{width}.png').read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
   assert await page.locator('#passport-export-image').evaluate('(e)=>e.complete&&e.naturalWidth===1000&&e.naturalHeight===1280')
   assert not errors,(width,errors);assert not failed,(width,failed)
   reports.append({'width':width,'twoTapOrKeyboardOrDrag':'PASS','persistence':'PASS','actualArticleStamp':'PASS','PNGExport':'PASS','noOverflow':'PASS','localDesktopOrTouchPerformance':perf})
   await context.close()
  context=await browser.new_context(viewport={'width':390,'height':900})
  await context.route('https://gc.zgo.at/**',lambda route:route.fulfill(status=200,body=''))
  await context.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw new Error("storage unavailable")}})')
  page=await context.new_page();await page.goto(BASE+'/nest/',wait_until='networkidle')
  assert '无法保存' in await page.locator('#passport-storage-note').inner_text()
  await page.locator('#nest-peanut').click();await page.locator('#nest-bird').click()
  assert await page.locator('#passport-progress').inner_text()=='2 / 6 枚印章'
  await context.close()
  context=await browser.new_context(java_script_enabled=False,viewport={'width':390,'height':900})
  page=await context.new_page();await page.goto(BASE+'/nest/')
  assert await page.locator('#nest-bird').is_disabled()
  assert await page.locator('.topic-card:visible').count()==17
  assert not await page.locator('.nest-feeding').is_visible()
  await context.close();await browser.close()
  print(json.dumps({'viewports':reports,'deniedStorage':'PASS','noJavaScript':'PASS','analyticsExcludedFromLocalQA':True},ensure_ascii=False))
asyncio.run(main())
