from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import json,argparse,re
parser=argparse.ArgumentParser(description='Audit generated Graybird page links and resources.')
parser.add_argument('--base-url',default='http://127.0.0.1:8000')
args=parser.parse_args();BASE=args.base_url.rstrip('/');HOST=urlsplit(BASE).hostname
root=Path(__file__).resolve().parents[1];targets=set();fragments=[]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  for key in ('src','href'):
   if key in a:self.links.append(a[key])
  if 'srcset' in a:self.links.append(a['srcset'])
files=[root/'index.html',root/'404.html',root/'nest/index.html',root/'play/index.html']+list((root/'archive').rglob('*.html'))
for f in files:
 page=Page();page.feed(f.read_text());assert len(page.ids)==len(set(page.ids)),f
 rel=f.relative_to(root).as_posix();base='/'+(rel[:-10] if rel.endswith('index.html') else rel)
 for link in page.links:
  u=urlsplit(urljoin(BASE+base,link))
  if u.hostname!=HOST:continue
  targets.add(u.path+('?' +u.query if u.query else ''))
  if u.fragment:fragments.append((u.path,u.fragment))
def get(path):
 with urlopen(BASE+path) as r:
  assert r.status==200,(path,r.status)
  return r.read()
with ThreadPoolExecutor(max_workers=6) as pool:contents=dict(zip(sorted(targets),pool.map(get,sorted(targets))))
notes=re.findall(r"\{subject:'([^']*)',",(root/'script.js').read_text().split('const $ =')[0])
valid_observations={f'observation-{i+1:03}' for i in range(len(notes))}|{'observation-'+subject for subject in notes}|{'observation-unfiled'}
for path,frag in fragments:
 if path=='/' and frag.startswith('observation-'):
  assert frag in valid_observations,(path,frag)
  continue
 content=contents.get(path) or get(path);p=Page();p.feed(content.decode());assert unquote(frag) in p.ids,(path,frag)
print(json.dumps({'HTMLPages':len(files),'uniqueResourcesAndLinks':len(targets),'internalFragments':len(fragments),'status':'PASS'}))
