"""Refresh search metadata without changing page bodies or application assets."""
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://graybird.space'
PAGES = {
    'index.html': ('/', 'zh-CN', 'Graybird 灰鸟 — 地球观察、故事与互动宇宙', 'Graybird 灰鸟的官方地球观测站：阅读关于人类、互联网和 AI 的原创观察与故事，探索鸟窝、花生猎人和互动宇宙。'),
    'en/index.html': ('/en/', 'en', 'Graybird — Earth Observations, Stories & Interactive Universe', 'Meet Graybird, a gray visitor observing Earth. Read original observations and stories about humans, the internet and AI, and explore the bird nest and interactive universe.'),
    'ja/index.html': ('/ja/', 'ja', 'Graybird — 地球観測・物語・インタラクティブな宇宙', '地球を訪れた灰色の鳥、Graybird。人間、ネット、AIについての観察や物語を読み、鳥の巣とインタラクティブな宇宙を探索しよう。'),
    'universe/index.html': ('/universe/', 'zh-CN', 'Graybird 灰鸟宇宙 — 星球探索、养灰鸟与 Boss 挑战', '探索 Graybird 的浏览器宇宙原型：发现星球与文明、收集物品、照顾灰鸟并试玩 Boss 挑战。进度保存在本机，无需注册。'),
}
ALTERNATES = [('zh', '/'), ('en', '/en/'), ('ja', '/ja/'), ('x-default', '/')]

def update_search_metadata():
    for file, (path, language, title, description) in PAGES.items():
        target = ROOT / file
        source = target.read_text()
        head, body = source.split('</head>', 1)
        head = re.sub(r'<title>.*?</title>', '<title>'+html.escape(title)+'</title>', head, count=1, flags=re.S)
        for name, value, attribute in [
            ('description', description, 'name'), ('og:title', title, 'property'),
            ('og:description', description, 'property'), ('og:url', ORIGIN+path, 'property'),
            ('og:type', 'website', 'property'), ('og:site_name', 'Graybird', 'property'),
            ('og:image', ORIGIN+'/assets/share.jpg', 'property'),
            ('twitter:card', 'summary_large_image', 'name'), ('twitter:title', title, 'name'),
            ('twitter:description', description, 'name'), ('twitter:image', ORIGIN+'/assets/share.jpg', 'name'),
        ]:
            tag = f'<meta {attribute}="{name}" content="{html.escape(value, quote=True)}">'
            pattern = rf'<meta\s+{attribute}="{re.escape(name)}"\s+content="[^"]*"\s*/?>'
            head, count = re.subn(pattern, lambda _: tag, head)
            if not count: head += '\n'+tag
        canonical = f'<link rel="canonical" href="{ORIGIN+path}">'
        head, count = re.subn(r'<link rel="canonical" href="[^"]*"\s*/?>', canonical, head)
        if not count: head += '\n'+canonical
        if path != '/universe/':
            head = re.sub(r'\n?<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*/?>', '', head)
            head += '\n'+'\n'.join(f'<link rel="alternate" hreflang="{code}" href="{ORIGIN+route}">' for code, route in ALTERNATES)
            # All language versions describe the same website identity.
            schema = {'@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Graybird',
                      'alternateName': 'Graybird 灰鸟', 'url': ORIGIN+'/', 'description': description,
                      'inLanguage': ['zh-CN', 'en', 'ja'],
                      'sameAs': ['https://www.instagram.com/graybird.space/']}
            tag = '<script type="application/ld+json">'+json.dumps(schema, ensure_ascii=True)+'</script>'
            head = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda _: tag, head, flags=re.S)
        target.write_text(head+'</head>'+body)
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', ns)
    ET.register_namespace('xhtml', 'http://www.w3.org/1999/xhtml')
    tree = ET.parse(ROOT/'sitemap.xml')
    urls = tree.getroot()
    existing = {node.text for node in urls.findall(f'{{{ns}}}url/{{{ns}}}loc')}
    # Preserve existing archive URLs; redirect-only mode aliases are intentionally omitted.
    for path, *_ in PAGES.values():
        location = ORIGIN+path
        if location not in existing:
            ET.SubElement(ET.SubElement(urls, f'{{{ns}}}url'), f'{{{ns}}}loc').text = location
    ET.indent(tree, space='  ')
    tree.write(ROOT/'sitemap.xml', encoding='UTF-8', xml_declaration=True)

if __name__ == '__main__':
    update_search_metadata()
    print('Updated four page heads and the root sitemap; page bodies preserved.')
