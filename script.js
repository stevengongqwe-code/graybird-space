'use strict';
// Original website field notes. These are not fetched posts or live X data.
const observations = [
 {subject:'internet',label:'INTERNET',title:'大家都在说话。\n谁在听？',body:'在这里，发出声音很容易。难的是，一句话离开熟人的评论区之后，还有人愿意把它带走。',aside:'先记下来。再观察一会儿。'},
 {subject:'humans',label:'HUMANS',title:'人类会为一句话，\n想一整晚。',body:'我看见一个人反复打开聊天窗口。没有新消息。他又打开了一次。地球上有些等待，大概不能用时钟来量。',aside:'这条暂时没有结论。'},
 {subject:'ai',label:'ARTIFICIAL INTELLIGENCE',title:'答案越来越快。\n问题是谁的？',body:'人类把问题交给机器，再把机器的回答发给另一个人。我还在想：这中间，哪一步才是他自己的判断？',aside:'这只鸟也在使用工具。也得问自己。'},
 {subject:'life',label:'LIFE',title:'今天没发生大事。\n天还是暗下来了。',body:'有人认真记下了晚饭、路边的猫和一片云。没有什么道理要讲。我看了很久。',aside:'也许不用每一天都证明点什么。'},
 {subject:'technology',label:'TECHNOLOGY',title:'省下来的时间，\n去哪里了？',body:'这个设备替人类省了十分钟。人类用这十分钟，看了另一个能省时间的设备。观察到这里，我有点饿了。',aside:'工具很好。接下来做什么，还得自己决定。'},
 {subject:'curiosity',label:'CURIOSITY',title:'你说“本来就这样”。\n我还想问为什么。',body:'初来地球，有个好处：不懂的事可以直接问。待久了以后，会不会也开始不好意思？这件事得留意。',aside:'先保留这个问号。'}
];
const buttons = [...document.querySelectorAll('[data-subject]')];
let current = 0;
function selectRecord(index, updateUrl = true) {
 current=index;
 const note=observations[index];
 buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.subject===note.subject)));
 document.querySelector('#record-id').textContent=`OBSERVATION ${String(index+1).padStart(3,'0')}`;
 document.querySelector('#record-subject').textContent=`SUBJECT: ${note.label}`;
 const title=document.querySelector('#record-title');
 title.replaceChildren();
 note.title.split('\n').forEach((line,i)=>{if(i)title.append(document.createElement('br'));title.append(document.createTextNode(line));});
 document.querySelector('#record-body').textContent=note.body;
 document.querySelector('#record-aside').textContent=note.aside;
 document.querySelector('#record-count').textContent=`${String(index+1).padStart(2,'0')} / 06 RECORDS`;
 if(updateUrl)history.replaceState(null,'',`#observation-${note.subject}`);
}
buttons.forEach((button,index)=>button.addEventListener('click',()=>selectRecord(index)));
document.querySelector('#next-record').addEventListener('click',()=>selectRecord((current+1)%observations.length));
function readHash(){const i=observations.findIndex(note=>`#observation-${note.subject}`===location.hash);if(i>=0){selectRecord(i,false);document.querySelector('#terminal').scrollIntoView({behavior:'instant'});}}
readHash();
window.addEventListener('hashchange',readHash);
function updateClock(){document.querySelector('#clock').textContent=`EARTH TIME / ${new Date().toISOString().slice(11,16)} UTC`;}
updateClock();setInterval(()=>{if(!document.hidden)updateClock();},60000);
document.querySelector('#bird-note').addEventListener('click',()=>{const line=document.querySelector('#aside-message');line.textContent=line.textContent.trim()?'':'嗯，我也在观察正在看这里的你。';});
