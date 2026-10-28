#!/usr/bin/env python3
"""Builds feed.xml (RSS 2.0) from the root blog-*.html posts. Run from the repo root after adding a post:
   python3 tools/make-feed.py
"""
import glob, re, html, datetime, email.utils
SITE = 'https://mozlyt.com/'
def meta(s, pat):
    m = re.search(pat, s, re.S | re.I)
    return html.unescape(m.group(1)).strip() if m else ''
items = []
for f in sorted(glob.glob('blog-*.html')):
    s = open(f, encoding='utf-8').read()
    title = re.sub(r'\s*\|\s*MOZLYT\s*$', '', meta(s, r'<title>(.*?)</title>'))
    desc = meta(s, r'<meta name="description" content="(.*?)"')
    date = meta(s, r'"datePublished":"(\d{4}-\d{2}-\d{2})"') or '2026-10-15'
    img = meta(s, r'<meta property="og:image" content="(.*?)"')
    d = datetime.datetime.strptime(date, '%Y-%m-%d').replace(hour=8, tzinfo=datetime.timezone.utc)
    items.append((d, title, desc, SITE + f, img))
items.sort(key=lambda x: x[0], reverse=True)
esc = lambda t: html.escape(t, quote=False)
out = ['<?xml version="1.0" encoding="UTF-8"?>',
 '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
 '<channel>',
 '<title>The MOZLYT blog</title>',
 '<link>' + SITE + 'blog.html</link>',
 '<atom:link href="' + SITE + 'feed.xml" rel="self" type="application/rss+xml"/>',
 '<description>Practical guides on opening an online shop, learning a skill and running a small business in Ghana and across Africa.</description>',
 '<language>en-gh</language>',
 '<lastBuildDate>' + email.utils.format_datetime(items[0][0] if items else datetime.datetime.now(datetime.timezone.utc)) + '</lastBuildDate>']
for d, t, de, link, img in items:
    out += ['<item>', '<title>' + esc(t) + '</title>', '<link>' + link + '</link>',
            '<guid isPermaLink="true">' + link + '</guid>',
            '<pubDate>' + email.utils.format_datetime(d) + '</pubDate>',
            '<description>' + esc(de) + '</description>']
    if img:
        out.append('<media:thumbnail url="' + html.escape(img) + '"/>')
    out.append('</item>')
out += ['</channel>', '</rss>']
open('feed.xml', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(items), 'posts written to feed.xml')
