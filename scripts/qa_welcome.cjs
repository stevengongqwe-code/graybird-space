/* Real browser acceptance; game controller exposed only in intercepted test responses. */
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = process.env.QA_OUTPUT || '/tmp/graybird-welcome-qa';
const base = process.env.QA_BASE || 'http://127.0.0.1:8000';
fs.mkdirSync(out, {recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.QA_BROWSER,args:['--no-sandbox','--disable-dev-shm-usage']});
 const results=[];
 try {
  for(const width of [375,390,768,1280,1920]) {
   const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce'});
   await context.route('https://gc.zgo.at/**',r=>r.fulfill({body:'window.__events=[];window.goatcounter={count:e=>window.__events.push(e)};',contentType:'text/javascript'}));
   await context.route('https://giscus.app/**',r=>r.fulfill({body:'',contentType:'text/javascript'}));
   await context.route('**/play/play.js*',async route=>{
    const response=await route.fetch();let text=await response.text();
    text=text.replace(' // Canvas is used for exact personal cards, never to redraw the bird.', ' window.__gameQA={get game(){return game},finish};\n // Canvas is used for exact personal cards, never to redraw the bird.');
    await route.fulfill({response,body:text});
   });
   const page=await context.newPage();const errors=[],failures=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failures.push(r.url());});
   await page.goto(base+'/',{waitUntil:'networkidle'});
   assert(await page.locator('.first-visit a').count()===2);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:out+`/home-${width}.png`});
   await page.locator('.first-visit a[href="/about/"]').click();
   await page.waitForURL('**/about/');
   assert(await page.locator('h1').innerText()==='Graybird 是谁？');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:out+`/about-${width}.png`});
   await page.locator('.about-links a[href="/play/#game"]').click();
   await page.waitForFunction(()=>window.__gameQA&&document.querySelector('#game-start').disabled===false);
   assert(await page.locator('#game-first-guide').evaluate(e=>e.open));
   await page.locator('#game').scrollIntoViewIfNeeded();
   await page.screenshot({path:out+`/guide-${width}.png`});
   await page.locator('#game-start').click();
   assert(await page.evaluate(()=>window.__gameQA.game.running));
   assert(!await page.locator('#game-first-guide').evaluate(e=>e.open));
   await page.locator('#signal-game').focus();await page.keyboard.down('ArrowLeft');await page.waitForTimeout(180);await page.keyboard.up('ArrowLeft');
   assert(await page.evaluate(()=>window.__gameQA.game.x<window.__gameQA.game.width/2));
   await page.locator('#game-pause').click();
   await page.evaluate(async()=>{const m=await import('/play/game-core.mjs?v=8-sound'),g=window.__gameQA.game;g.score=42;g.shield=0;g.invincible=0;m.damage(g,'诈骗短信');window.__gameQA.finish();window.__gameQA.finish();});
   assert((await page.locator('#game-next-tip').innerText()).includes('裂壳'));
   assert(await page.evaluate(()=>window.__events.filter(e=>e.path==='game-start').length===1&&window.__events.filter(e=>e.path==='game-end').length===1));
   await page.locator('#game-result').scrollIntoViewIfNeeded();
   await page.screenshot({path:out+`/result-${width}.png`});
   await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__copied=text}});});
   await page.locator('#share-score').click();
   assert(await page.evaluate(()=>window.__copied.includes('42 粒花生')&&window.__copied.includes('/play/#game')));
   await page.locator('#save-score').click();
   await page.waitForFunction(()=>document.querySelector('#score-image').naturalWidth===1000);
   await page.locator('#score-image').screenshot({path:out+`/score-${width}.png`});
   if(width===390) {
    await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__share=data;}});Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});});
    await page.locator('#share-score').click();
    assert(await page.evaluate(()=>window.__share.files[0].type==='image/png'&&window.__share.text.includes('/play/#game')));
    await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancel','AbortError')}}));
    await page.locator('#share-score').click();assert((await page.locator('#score-share-status').innerText()).includes('取消'));
    await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('blocked')}}});});
    await page.locator('#share-score').click();assert(await page.locator('#score-share-fallback input').isVisible());
   }
   if(width===390) {
    await page.evaluate(()=>{const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,type){setTimeout(()=>original.call(this,callback,type),300);};});
    await page.locator('#save-score').click();
   }
   await page.locator('#game-retry').click();assert(await page.evaluate(()=>window.__gameQA.game.running));
   if(width===390) {await page.waitForTimeout(500);assert(await page.locator('#score-export').isHidden());}
   assert(await page.locator('#game-result').isHidden());
   await page.reload({waitUntil:'networkidle'});assert(!await page.locator('#game-first-guide').evaluate(e=>e.open));
   assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
   results.push({width,status:'PASS',errors,failures});await context.close();
  }
  console.log(JSON.stringify(results));fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
