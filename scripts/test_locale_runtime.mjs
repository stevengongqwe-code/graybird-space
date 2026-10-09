import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const rows=JSON.parse(fs.readFileSync('i18n/home-copy.json','utf8'));
const runtime=fs.readFileSync('i18n/home-runtime.js','utf8');
for(const locale of ['en','ja']) {
 const copy=Object.fromEntries(rows.map(row=>[row.key,row[locale]]));
 const code=runtime.slice(0,runtime.indexOf('const $ = selector'))+'\nglobalThis.result=observations;';
 const context={window:{GRAYBIRD_COPY:copy}};
 vm.runInNewContext(code,context);
 assert.equal(context.result.length,12);
 assert.equal(new Set(context.result.map(note=>note.subject)).size,6);
 for(const note of context.result) {
  assert(note.title.includes('\n'));
  assert(note.body.length>0 && note.aside.length>0);
 }
}
const chooser=fs.readFileSync('i18n/languages.js','utf8');
for(const storageBlocked of [false,true]) {
 const listeners={},docListeners={},writes=[];
 const links=['zh','en','ja'].map(lang=>({dataset:{language:lang},cloneNode(){return this;}}));
 const recommendation={hidden:true,append(...args){this.args=args;}};
 const summary={focus(){this.focused=true;}};
 const picker={open:false,querySelectorAll(){return links;},querySelector(s){return s==='summary'?summary:recommendation;},addEventListener(event,fn){listeners[event]=fn;},contains(){return false;}};
 let redirected=false;
 const location={set href(value){redirected=true;}};
 vm.runInNewContext(chooser,{document:{documentElement:{lang:'en'},querySelector(){return picker;},addEventListener(event,fn){docListeners[event]=fn;}},navigator:{languages:['ja-JP']},localStorage:{getItem(){if(storageBlocked)throw Error('blocked');return null;},setItem(k,v){if(storageBlocked)throw Error('blocked');writes.push([k,v]);}},location});
 assert.equal(recommendation.hidden,false);
 assert.equal(recommendation.args[1].dataset.language,'ja');
 listeners.click({target:{closest(){return links[2];}}});
 if(!storageBlocked)assert.equal(writes[0][1],'ja');
 picker.open=true;docListeners.keydown({key:'Escape'});
 assert.equal(picker.open,false);assert.equal(summary.focused,true);
 assert.equal(redirected,false);
}
console.log('PASS: 12 localized terminal records across six channels, explicit language persistence, blocked-storage fallback, recommendation without redirect, Escape focus. DOM mocks; browser layout not tested.');
