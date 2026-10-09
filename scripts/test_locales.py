#!/usr/bin/env python3
"""Additive-site contract and locale build regression checks, standard library only."""
import hashlib, json, re, subprocess, unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
ROOT=Path(__file__).resolve().parents[1]
BASE='4ea2c94c589a7731c03c8a4dd79d7c21cb53e009'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.feed(text)
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
class Locales(unittest.TestCase):
 def test_original_files_unchanged(self):
  names=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True).splitlines()
  for name in names:
   expected=subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT)
   self.assertEqual(hashlib.sha256(expected).digest(),hashlib.sha256((ROOT/name).read_bytes()).digest(),name)
 def test_translations_complete(self):
  rows=json.loads((ROOT/'i18n/home-copy.json').read_text());self.assertEqual(len(rows),241)
  self.assertEqual(len({r['key'] for r in rows}),len(rows))
  for row in rows:
   for locale in ('en','ja'):self.assertTrue(row[locale].strip(),row['key'])
  self.assertEqual(rows[28]['en'],'A gray bird, watching humans.')
  self.assertEqual(rows[28]['ja'],'人間を観察する灰色の鳥。')
  for locale in ('en','ja'):
   page=(ROOT/locale/'index.html').read_text()
   data=json.loads(re.search(r'window.GRAYBIRD_COPY=(.*?);</script>',page).group(1))
   for row in rows:self.assertEqual(data[row['key']],row[locale])
   self.assertEqual(data['home.187'].count('\n'),1)
 def test_routes_metadata_resources_and_fragments(self):
  for locale in ('en','ja'):
   text=(ROOT/locale/'index.html').read_text();page=Page(text)
   self.assertIn(('html',{'lang':locale}),page.tags)
   canon=[a for t,a in page.tags if t=='link' and a.get('rel')=='canonical']
   self.assertEqual(canon[0]['href'],f'https://graybird.space/{locale}/')
   alternates={a['hreflang'] for t,a in page.tags if t=='link' and a.get('rel')=='alternate'}
   self.assertEqual(alternates,{'zh','en','ja','x-default'})
   ids={a['id'] for t,a in page.tags if 'id' in a}
   for tag,attrs in page.tags:
    for attr in ('src','srcset','href'):
     url=attrs.get(attr)
     if not url:continue
     parts=urlsplit(url)
     if parts.scheme or parts.netloc:continue
     if not parts.path:
      if parts.fragment:self.assertIn(parts.fragment,ids,url)
      continue
     path=ROOT/parts.path.lstrip('/') if parts.path.startswith('/') else ROOT/locale/parts.path
     self.assertTrue(path.exists(),url)
     if path.is_dir():self.assertTrue((path/'index.html').exists(),url)
   if locale=='en':
    clean=text.replace('>中文<','><')
    self.assertIsNone(re.search('[\u4e00-\u9fff]',clean))
   # Original artwork may contain Chinese inscriptions: bytes remain unchanged.
   self.assertIn('data-language="zh">中文',text)
 def test_runtime_shared_and_read_only(self):
  runtime=(ROOT/'i18n/home-runtime.js').read_text()
  self.assertIsNone(re.search('[\u4e00-\u9fff]',runtime))
  for locale in ('en','ja'):
   self.assertIn('/i18n/home-runtime.js',(ROOT/locale/'index.html').read_text())
  for path in ('i18n/home-runtime.js','i18n/languages.js'):
   subprocess.run(['node','--check',path],cwd=ROOT,check=True)
 def test_repeatable_build(self):
  paths=[ROOT/'en/index.html',ROOT/'ja/index.html',*sorted((ROOT/'i18n').glob('*'))]
  before={str(p):p.read_bytes() for p in paths if p.is_file()}
  subprocess.run(['python3','scripts/build_locales.py'],cwd=ROOT,check=True)
  for p,value in before.items():self.assertEqual(Path(p).read_bytes(),value,p)
if __name__=='__main__':unittest.main()
