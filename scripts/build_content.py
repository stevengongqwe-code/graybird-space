#!/usr/bin/env python3
"""Build Bird Nest static pages from one data file. Standard library only."""
from pathlib import Path
from html import escape
from string import Template
import json,re,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
KINDS={'observations':'观察','opinions':'观点','stories':'故事','experiments':'实验','discussions':'讨论'}
DATA=json.loads((ROOT/'data/topics.json').read_text())
ROOMS={r['id']:r for r in DATA['rooms']}
TOPICS=DATA['topics']
TEMPLATE=Template((ROOT/'templates/community.html').read_text())
def e(text):return escape(str(text),quote=True)
def url(t):return f"/archive/{t['id']}/"
def validate():
 ids=set()
 for t in TOPICS:
  if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',t['id']) or t['id'] in ids:raise ValueError('Invalid/duplicate topic ID')
  ids.add(t['id'])
  if t['room'] not in ROOMS or t['kind'] not in KINDS:raise ValueError('Unknown room/category')
  for field in ('title','excerpt','paragraphs','archivedAt'):assert t[field],field
  for key in ('archivedAt','publishedAt'):
   if t.get(key):
    from datetime import date
    date.fromisoformat(t[key])
  if t.get('discussionUrl') and not re.fullmatch(r'https://(?:x\.com|twitter\.com)/[A-Za-z0-9_]+/status/[0-9]+',t['discussionUrl']):raise ValueError('Discussion must point to a real X post, not a profile')
  for key in ('sourceUrl','image'):
   if t.get(key) and (not t[key].startswith('/') or t[key].startswith('//') or '..' in t[key]):raise ValueError('Use a site-root path')
  if t.get('image') and not (ROOT/t['image'].lstrip('/')).is_file():raise ValueError('Missing image')

def GarybirdHeader(current):
 links=[('/nest/','鸟窝','nest'),('/archive/','档案馆','archive'),('/#terminal','观测终端','terminal')]
 nav=''.join(f'<a href="{href}"'+(' aria-current="page"' if key==current else '')+f'>{name}</a>' for href,name,key in links)
 return f'<header class="header community-header"><a class="brand" href="/" aria-label="Graybird 首页"><img src="/assets/bird.webp" width="36" height="36" alt="">GRAYBIRD</a><nav aria-label="主导航">{nav}</nav></header>'

def date_meta(t):
 key='publishedAt' if t.get('publishedAt') else 'archivedAt'
 label='发布' if key=='publishedAt' else '收录'
 return f'<time datetime="{e(t[key])}">{label} · {e(t[key].replace("-","."))}</time>'

def discussion(t):
 if t.get('discussionUrl'):
  return f'<a class="topic-discuss" href="{e(t["discussionUrl"])}" target="_blank" rel="noopener noreferrer">参与讨论 ↗</a>'
 return '<span class="topic-pending"><button type="button" disabled>参与讨论</button><span>待开放</span></span>'

def TopicCard(t,archive=False):
 room=ROOMS[t['room']]
 return f'''<article class="topic-card {'archive-card' if archive else ''}" data-room="{e(t['room'])}" data-kind="{e(t['kind'])}">
<div class="topic-author"><img src="/assets/bird.webp" width="32" height="32" loading="lazy" alt=""><span>Garybird</span></div>
<div class="topic-content"><div class="topic-meta"><span>{e(room['name'])}</span><span>{e(KINDS[t['kind']])}</span>{date_meta(t)}</div><h3><a href="{url(t)}">{e(t['title'])}</a></h3><p>{e(t['excerpt'])}</p><div class="topic-actions"><a class="topic-read" href="{url(t)}">{'阅读记录' if archive else '进入话题'} →</a>{discussion(t)}</div></div></article>'''

def ForumSection(room):
 count=sum(t['room']==room['id'] for t in TOPICS)
 state=f'{count} 条收录' if count else '等待第一份来信'
 return f'<a class="forum-room" href="#room-{e(room["id"])}" data-room-link="{e(room["id"])}"><span class="forum-room-number">{list(ROOMS).index(room["id"])+1:02}</span><div><h2>{e(room["name"])}</h2><p>{e(room["description"])}</p></div><span class="forum-room-state">{state} →</span></a>'

def filters(scope,values):
 return f'<div class="community-filters" role="group" aria-label="{scope}" hidden><button type="button" data-filter="all" aria-pressed="true">全部</button>'+''.join(f'<button type="button" data-filter="{e(k)}" aria-pressed="false">{e(v)}</button>' for k,v in values.items())+'</div>'

def SearchRecords(label):
 return f'<form class="record-search" role="search" hidden><label for="record-search-input">{label}</label><div><input id="record-search-input" type="search" maxlength="80" autocomplete="off" placeholder="找一个词，或一个问题" aria-controls="search-results"><button type="button" data-clear-search>清空</button></div></form><div class="search-empty" hidden><p>这里暂时没有这条记录。换个词，或回到全部内容。</p><button type="button" data-reset-results>查看全部记录 →</button></div>'

def RelatedTopics(topic):
 matches=[item for item in TOPICS if item['id']!=topic['id'] and (item['room']==topic['room'] or item['kind']==topic['kind'])][:2]
 if not matches:return ''
 return '<aside class="related-topics" aria-labelledby="related-title"><h2 id="related-title">沿着这个问题，再看一会儿。</h2>'+''.join(f'<a href="{url(item)}"><span>{e(ROOMS[item["room"]]["name"])}</span>{e(item["title"])}<b aria-hidden="true">→</b></a>' for item in matches)+'</aside>'

def intro(kicker,title,body):
 return f'<div class="community-intro"><p class="eyebrow">{kicker}</p><h1>{title}</h1><p>{body}</p></div>'

def write_page(path,title,description,content,current,og_type='website'):
 target=ROOT/path.lstrip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
 target.write_text(TEMPLATE.substitute(title=e(title),description=e(description),path=e(path),content=content,header=GarybirdHeader(current),og_type=og_type))

def main():
 validate()
 featured=[t for t in TOPICS if t.get('featured')][:5]
 home='''<div class="section nest-home" id="now-discussing" role="region" aria-labelledby="nest-home-title">
<div class="nest-home-heading"><div><p class="eyebrow">BIRD NEST / 一只鸟的互联网领地</p><h2 id="nest-home-title">正在讨论<span> / Now Discussing</span></h2></div><a class="community-text-link" href="/nest/">进入鸟窝 →</a></div>
<p class="community-status">话题先留下。X 账号申诉中，评论现场暂未开放。</p>
'''+''.join(TopicCard(t) for t in featured)+'''<div class="nest-home-bottom"><p>网站留下记录，X 承接实时讨论。这里会慢慢长成这只鸟自己的地方。</p><a class="community-text-link" href="/archive/">翻翻内容档案 →</a><a class="community-text-link" href="#terminal">接入观测系统 →</a><a class="community-text-link" href="#visual-archive">看看全部画面 →</a><a class="community-text-link" href="/play/?v=6-flight">探索互动鸟窝 →</a></div></div>'''
 index=ROOT/'index.html';text=index.read_text()
 if '<!-- BIRD NEST START -->' not in text:raise ValueError('Home content markers missing')
 text=re.sub(r'<!-- BIRD NEST START -->.*?<!-- BIRD NEST END -->','<!-- BIRD NEST START -->\n'+home+'\n<!-- BIRD NEST END -->',text,flags=re.S)
 index.write_text(text)
 room_content=''.join(ForumSection(r) for r in DATA['rooms'])
 groups=''
 for room in DATA['rooms']:
  records=[t for t in TOPICS if t['room']==room['id']]
  groups+=f'<section class="room-records" id="room-{e(room["id"])}" data-filter-group="{e(room["id"])}"><div class="room-title"><p class="eyebrow">{e(room["english"])}</p><h2>{e(room["name"])}</h2></div>'
  groups+=''.join(TopicCard(t) for t in records) if records else '<p class="community-empty">这里先留空。投稿入口暂未开放，也还没有收录鸟友内容。</p>'
  groups+='</section>'
 content=intro('GRAYBIRD / BIRD NEST','鸟窝。<span>互联网里的一小块地方。</span>','问题可以留下来，不急着有答案。认识一只鸟，再看看它最近在想什么。')
 content+='<p class="community-status">X 账号申诉中。现阶段可以阅读和保存话题，评论现场暂未开放。</p><a class="community-text-link" href="/play/?v=6-flight">鸟在家。进入互动鸟窝 →</a><nav class="forum-rooms" aria-label="鸟窝栏目">'+room_content+'</nav>'
 content+='<div class="community-records" data-filter-scope="room">'+SearchRecords('在鸟窝里找一找')+filters('按栏目浏览',{k:r['name'] for k,r in ROOMS.items()})+'<p class="filter-summary" role="status" aria-live="polite"></p><div id="search-results">'+groups+'</div></div>'
 content+='<a class="community-text-link" href="/archive/">去档案馆慢慢翻 →</a>'
 write_page('/nest/','鸟窝 / Bird Nest — Graybird','Garybird 的私人互联网领地：议事厅、地球观察记录、夜话、实验室与鸟友投稿。',content,'nest')
 content=intro('GRAYBIRD / EARTH INTERNET ARCHIVE','留下来的东西。','观察、观点、故事、实验和讨论。一只鸟在地球互联网留下的记录。')
 content+='<p class="community-status">日期区分发布与收录；原始发布日期未知的记录显示收录日期。</p><div class="community-records" data-filter-scope="kind">'+SearchRecords('在档案里找一找')+filters('按内容类型筛选',KINDS)+'<p class="filter-summary" role="status" aria-live="polite"></p><h2 class="community-list-title">档案索引</h2><div class="archive-list" id="search-results">'
 content+=''.join(TopicCard(t,True) for t in TOPICS)+'</div></div>'
 write_page('/archive/','内容档案馆 — Graybird','Garybird 的长期内容档案馆，按观察、观点、故事、实验与讨论浏览。',content,'archive')
 for t in TOPICS:
  content=f'<a class="community-back" href="/archive/">← 返回档案馆</a><article class="archive-entry"><p class="eyebrow">{e(ROOMS[t["room"]]["name"])} / {e(KINDS[t["kind"]])}</p><h1>{e(t["title"])}</h1><div class="entry-byline"><img src="/assets/bird.webp" width="36" height="36" alt=""><span>Garybird</span>{date_meta(t)}</div>'
  if not t.get('publishedAt'):content+='<p class="entry-date-note">原始发布时间未记录；以上为本站收录日期。</p>'
  if t.get('image'):content+=f'<figure class="entry-image"><a href="{e(t["image"])}" target="_blank" rel="noopener noreferrer"><img src="{e(t["image"])}" width="{t["imageWidth"]}" height="{t["imageHeight"]}" loading="lazy" decoding="async" alt="{e(t["imageAlt"])}"></a></figure>'
  content+='<div class="entry-body">'+''.join('<p>'+e(p)+'</p>' for p in t['paragraphs'])+'</div>'
  if t.get('sourceUrl'):content+=f'<a class="community-text-link" href="{e(t["sourceUrl"])}">回到原始记录 →</a>'
  content+=f'<section class="entry-discussion" id="discussion"><h2>把话题带回广场。</h2><p>'+('在对应 X 原帖下继续讨论。' if t.get('discussionUrl') else '这条记录尚未绑定 X 原帖。账号仍在申诉中，讨论入口待开放。内容会先留在这里。')+f'</p>{discussion(t)}</section></article>'
  content+=RelatedTopics(t)
  write_page(url(t),t['title']+' — Graybird',t['excerpt'],content,'archive','article')
 # Preserve every existing sitemap entry and append current static content routes.
 sitemap=ROOT/'sitemap.xml';ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns)
 tree=ET.parse(sitemap);node=tree.getroot();existing={el.text for el in node.findall(f'{{{ns}}}url/{{{ns}}}loc')}
 for path in ['/nest/','/archive/','/play/']+[url(t) for t in TOPICS]:
  loc='https://graybird.space'+path
  if loc not in existing:ET.SubElement(ET.SubElement(node,f'{{{ns}}}url'),f'{{{ns}}}loc').text=loc
 ET.indent(tree,space='  ');tree.write(sitemap,encoding='UTF-8',xml_declaration=True)
 from optimize_search import update_search_metadata
 update_search_metadata()
 print(f'Built Bird Nest, archive and {len(TOPICS)} static entries. No framework or server required.')
if __name__=='__main__':main()
