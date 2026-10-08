import asyncio,json,os,argparse
from pathlib import Path
from playwright.async_api import async_playwright
from urllib.parse import urlsplit
parser=argparse.ArgumentParser(description='Actual browser QA for Graybird; requires Playwright and an installed Chromium.')
parser.add_argument('--base-url',default='http://127.0.0.1:8000')
parser.add_argument('--widths',default='375,390,768,1280,1920')
parser.add_argument('--browser',default='/usr/bin/chromium')
parser.add_argument('--output',default='/tmp/graybird-qa')
parser.add_argument('--stub-analytics',action='store_true',help='Local-only QA: replace GoatCounter with an empty script to avoid counting test visits.')
args=parser.parse_args()
BASE=args.base_url.rstrip('/')
if args.stub_analytics and urlsplit(BASE).hostname not in ('localhost','127.0.0.1'):
 parser.error('--stub-analytics is only available for a local development server')
WIDTHS=[int(value) for value in args.widths.split(',')]
OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=args.browser,args=['--no-sandbox','--disable-dev-shm-usage'])
  reports=[]
  for w in WIDTHS:
   page=await b.new_page(viewport={'width':w,'height':900},is_mobile=w<600,has_touch=w<600)
   if args.stub_analytics:
    await page.route('https://gc.zgo.at/**',lambda route:route.fulfill(status=200,body=''))
   errors=[];warnings=[];resources=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('console',lambda m:errors.append(m.text) if m.type=='error' else warnings.append(m.text) if m.type=='warning' else None)
   page.on('response',lambda r:resources.append([r.status,r.url]) if r.status>=400 else None)
   for path in ['/','/nest/','/archive/','/archive/observation-001/','/archive/maomao-came-to-see-me/']:
    r=await page.goto(BASE+path,wait_until='networkidle');assert r.status==200
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(w,path)
    assert await page.locator('.brand').evaluate('(e)=>e.getBoundingClientRect().right<=document.querySelector(".header nav").getBoundingClientRect().left')
    assert await page.evaluate('Array.from(document.querySelectorAll("a[target=_blank]")).every(e=>e.rel.includes("noopener")&&e.rel.includes("noreferrer"))')
    if path=='/':
     assert await page.locator('#earth-globe,canvas').count()==0
     assert await page.locator('.status-notice-photo img').count()==1
     assert await page.locator('#now-discussing .topic-card').count()==4
     await page.locator('[data-subject="ai"]').click();await page.wait_for_timeout(180)
     assert await page.locator('#record').get_attribute('aria-busy')=='false'
     await page.locator('#art-life .archive-image').click();assert await page.locator('#art-dialog').evaluate('(e)=>e.open');await page.keyboard.press('Escape')
    if path in ['/nest/','/archive/']:
     assert await page.locator('.topic-card:visible').count()==17
     inp=page.locator('#record-search-input');await inp.fill('毛毛球');await page.wait_for_timeout(160)
     assert await page.locator('.topic-card:visible').count()==1
     assert 'q=' in page.url
     await page.reload();assert await page.locator('.topic-card:visible').count()==1
     filter_value='observations'
     await page.locator('[data-filter="observations"]').click()
     assert await page.locator('.topic-card:visible').count()==0
     assert await page.locator('.search-empty').is_visible()
     await page.go_back();assert await page.locator('.topic-card:visible').count()==1
     await inp.fill('definitely-no-matching-record');await page.wait_for_timeout(160)
     assert await page.locator('.search-empty').is_visible()
     await (page.locator('[data-reset-results]').tap() if w<600 else page.locator('[data-reset-results]').click());assert await page.locator('.topic-card:visible').count()==17
     await page.locator('[data-filter="observations"]').click();assert await page.locator('.topic-card:visible').count()==12
     await page.locator('[data-filter="observations"]').press('ArrowRight')
     assert await page.locator('.topic-card:visible').count()==(2 if path=='/nest/' else 1)
     await page.locator('[data-filter="all"]').click()
     if path=='/nest/':
      assert await page.locator('.forum-room').count()==5
      await page.locator('[data-room-link="submissions"]').click()
      assert await page.locator('.community-empty:visible').count()==1
      await page.locator('[data-filter="all"]').click()
     await inp.focus();assert await inp.evaluate('(e)=>getComputedStyle(e).outlineStyle!="none"')
     targets=await page.locator('.community-filters button,.record-search button,.record-search input,.topic-read,.topic-card h3 a').evaluate_all('(els)=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(s=>s.w>0&&s.h>0)')
     assert all(t['w']>=44 and t['h']>=44 for t in targets),(w,path,targets)
     await page.emulate_media(reduced_motion='reduce');await page.evaluate('scrollTo(0,0)');await page.wait_for_timeout(80)
     await page.screenshot(path=str(OUT / f'{path.strip("/")}-{w}.png'))
     await page.locator('.record-search').evaluate('(e)=>e.scrollIntoView({block:"start",behavior:"instant"})')
     await page.screenshot(path=str(OUT / f'{path.strip("/")}-search-{w}.png'))
     await page.emulate_media(reduced_motion='no-preference')
    if path.startswith('/archive/') and path!='/archive/':
     assert await page.locator('.related-topics a').count()==(1 if 'maomao' in path else 2)
     if 'maomao' in path:
      await page.locator('.entry-image img').scroll_into_view_if_needed()
      assert await page.locator('.entry-image img').evaluate('(e)=>e.complete&&e.naturalWidth===1280')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,(w,errors);assert not resources,(w,resources)
   reports.append({'width':w,'pages':5,'errors':errors,'warnings':warnings,'resourceErrors':resources,'status':'PASS'})
   await page.close()
  page=await b.new_page(java_script_enabled=False,viewport={'width':390,'height':900})
  for path in ['/nest/','/archive/']:
   await page.goto(BASE+path);assert await page.locator('.topic-card:visible').count()==17
   assert not await page.locator('.record-search').is_visible()
  print(json.dumps({'base':BASE,'viewports':reports,'noJavaScript':'PASS','localAnalyticsStub':args.stub_analytics}));await b.close()
asyncio.run(main())
