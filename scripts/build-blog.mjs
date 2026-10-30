// Builds the Insights blog from Markdown files in posts/.
//   posts/my-article.md  ->  insights/my-article/index.html
// Also writes insights/index.html (all articles), the three latest-article
// cards on the home page, sitemap.xml and robots.txt.
// Files whose name starts with "_" (like _template.md) and posts with
// "draft: true" are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://fuzentra.com';
const POSTS_DIR = path.join(ROOT, 'posts');
const OUT_DIR = path.join(ROOT, 'insights');

const AUTHORS = {
  'Feroz Ahamed': { role: 'Co-Founder & Director', initials: 'FA', linkedin: 'https://www.linkedin.com/in/ferozahamed/' },
  'Zahara Ansary': { role: 'Co-Founder & Director', initials: 'ZA', linkedin: 'https://www.linkedin.com/in/zahara-ansary-29b65772/' },
};

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing the --- front matter block at the top`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = [];
  for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
    const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'), file);
    if (String(meta.draft).toLowerCase() === 'true') continue;
    for (const k of ['title', 'date', 'summary']) if (!meta[k]) throw new Error(`${file}: "${k}" is required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${file}: date must look like 2026-10-30`);
    const slug = (meta.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''))
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      ...meta,
      slug,
      author: meta.author || 'Feroz Ahamed',
      html: marked.parse(body),
      minutes: Math.max(1, Math.round(words / 200)),
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

// ---------- shared page chrome ----------
const NAV_LINK = 'nav-link text-xs lg:text-[0.8125rem] xl:text-sm font-semibold tracking-widest text-slate-700 hover:text-brand-deep transition-colors';
const NAV_LINK_M = 'nav-link block text-sm font-semibold tracking-widest text-slate-700';

function layout({ base, title, description, canonical, ogType = 'website', ogImage = `${SITE}/og-image.jpg`, jsonLd = '', main }) {
  const links = [['#services', 'WHAT WE DO'], ['#approach', 'HOW WE ENGAGE'], ['#about', 'WHO WE ARE']];
  const desk = links.map(([h, t]) => `      <a href="${base}${h}" class="${NAV_LINK}">${t}</a>`).join('\n');
  const mob = links.map(([h, t]) => `    <a href="${base}${h}" class="${NAV_LINK_M}">${t}</a>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="${ogType}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${base}favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${base}assets/favicon-32.png">
<link rel="apple-touch-icon" href="${base}apple-touch-icon.png">
<meta name="theme-color" content="#1A9E8F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}styles.css">
${jsonLd}
</head>
<body>

<div class="progress-bar" id="progress-bar"></div>

<nav class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-line">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <a href="${base}" aria-label="fuzentra home">
      <img src="${base}assets/fuzentra-logo.png" alt="fuzentra." class="h-10 md:h-12 w-auto">
    </a>
    <div class="hidden lg:flex items-center gap-6 xl:gap-10">
${desk}
      <a href="${base}insights/" class="${NAV_LINK} is-current" aria-current="page">INSIGHTS</a>
      <a href="${base}#contact" class="px-5 py-3 xl:px-6 xl:py-3.5 bg-brand text-ink text-[0.8125rem] xl:text-sm font-extrabold tracking-wider rounded-xl hover:shadow-lg hover:shadow-brand/30 transition">START A CONVERSATION</a>
    </div>
    <button id="menu-btn" class="lg:hidden p-2 text-ink" aria-label="Open menu" aria-expanded="false">
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
  <div id="mobile-menu" class="lg:hidden hidden border-t border-line px-6 py-4 space-y-4 bg-white">
${mob}
    <a href="${base}insights/" class="${NAV_LINK_M} is-current" aria-current="page">INSIGHTS</a>
    <a href="${base}#contact" class="block text-center px-5 py-3 bg-brand text-ink text-sm font-bold tracking-widest rounded-xl">START A CONVERSATION</a>
  </div>
</nav>

${main}

<footer class="bg-night text-slate-400">
  <div class="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
    <p>© <span id="year"></span> fuzentra (Pvt) Ltd. All rights reserved.</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <a href="${base}" class="hover:text-white transition">Home</a>
      <a href="${base}insights/" class="hover:text-white transition">Insights</a>
      <a href="${base}#contact" class="hover:text-white transition">Contact</a>
      <a href="${base}privacy.html" class="hover:text-white transition">Privacy Statement</a>
    </div>
  </div>
</footer>

<script>
  document.getElementById('year').textContent = new Date().getFullYear();
  window.addEventListener('scroll', () => {
    const t = document.documentElement.scrollTop, h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progress-bar').style.width = (h > 0 ? t / h * 100 : 0) + '%';
  }, { passive: true });
  const menuBtn = document.getElementById('menu-btn'), mobileMenu = document.getElementById('mobile-menu');
  menuBtn.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', !mobileMenu.classList.toggle('hidden')));
  document.querySelectorAll('[data-copy-link]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); b.querySelector('span').textContent = 'Link copied'; }
    catch (_) { prompt('Copy this link:', location.href); }
  }));
</script>
</body>
</html>
`;
}

// ---------- pieces ----------
function authorBadge(name, size = 'sm') {
  const a = AUTHORS[name] || { role: '', initials: name.split(' ').map((w) => w[0]).join('').slice(0, 2) };
  const dim = size === 'lg' ? 'w-11 h-11 text-sm' : 'w-8 h-8 text-[0.7rem]';
  return `<span class="${dim} shrink-0 rounded-full bg-ink text-brand font-display font-extrabold flex items-center justify-center">${esc(a.initials)}</span>`;
}

function card(p, base, extra = '') {
  return `      <article class="card group relative p-7 flex flex-col ${extra}">${p.image ? `
        <img src="${base}${esc(p.image)}" alt="" loading="lazy" class="w-full aspect-[16/9] object-contain bg-white border border-line rounded-xl mb-5">` : `
        <div aria-hidden="true" class="relative w-full aspect-[16/9] rounded-xl mb-5 overflow-hidden bg-ink flex items-end p-5">
          <div class="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-brand/35 blur-2xl"></div>
          <div class="absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(255_255_255/.35)_1px,transparent_1px)] [background-size:18px_18px]"></div>
          <img src="${base}assets/fuzentra-logo-white.png" alt="" class="relative h-7 w-auto">
        </div>`}
        <p class="text-xs font-semibold text-slate-500">${fmtDate(p.date)} · ${p.minutes} min read</p>
        <h3 class="font-display text-xl font-bold text-ink mt-3 leading-snug group-hover:text-brand-deep transition"><a href="${base}insights/${p.slug}/" class="after:absolute after:inset-0">${esc(p.title)}</a></h3>
        <p class="text-slate-600 text-[0.95rem] leading-relaxed mt-2 flex-1">${esc(p.summary)}</p>
        <div class="mt-5 pt-4 border-t border-line flex items-center justify-between gap-3">
          <span class="flex items-center gap-2 text-sm font-semibold text-ink">${authorBadge(p.author)}${esc(p.author)}</span>
          <span class="text-sm font-bold text-brand-deep" aria-hidden="true">Read →</span>
        </div>
      </article>`;
}

function homeCards(posts) {
  if (!posts.length) {
    return `    <div class="card p-8 text-center">
      <p class="font-display text-xl font-bold text-ink">Our first articles are on the way.</p>
      <p class="text-slate-600 mt-2">Follow <a href="https://linkedin.com/company/fuzentra" target="_blank" rel="noopener" class="text-brand-deep font-semibold underline">fuzentra on LinkedIn</a> to see them first.</p>
    </div>`;
  }
  return `    <div class="swipe-row flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-6 -mx-6 px-6 pb-4 md:mx-0 md:px-0 md:pb-0">
${posts.slice(0, 3).map((p) => card(p, '', 'shrink-0 w-[84%] md:w-auto snap-start')).join('\n')}
    </div>`;
}

function listPage(posts) {
  const base = '../';
  const grid = posts.length
    ? `<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">\n${posts.map((p) => card(p, base)).join('\n')}\n    </div>`
    : `<div class="card p-10 text-center"><p class="font-display text-2xl font-bold text-ink">Our first articles are on the way.</p><p class="text-slate-600 mt-2">Follow <a href="https://linkedin.com/company/fuzentra" target="_blank" rel="noopener" class="text-brand-deep font-semibold underline">fuzentra on LinkedIn</a> to see them first.</p></div>`;
  const main = `<header class="relative overflow-hidden bg-[#E8F5F3] border-b border-brand/15 pt-32 pb-12 md:pt-36 md:pb-14">
  <div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-brand/15 blur-3xl"></div>
  <div class="relative max-w-7xl mx-auto px-6">
    <span class="eyebrow">Insights</span>
    <h1 class="font-display text-3xl sm:text-5xl font-extrabold text-ink mt-2 max-w-3xl text-balance">Thought Leadership &amp; Industry Perspectives</h1>
    <p class="text-slate-600 mt-4 text-lg max-w-2xl">Explore our latest thinking on business transformation, technology trends and strategic insights that drive measurable impact.</p>
  </div>
</header>

<main class="bg-mist">
  <div class="max-w-7xl mx-auto px-6 py-14 md:py-16">
    ${grid}
  </div>
</main>`;
  return layout({
    base,
    title: 'Insights | fuzentra',
    description: 'Thought leadership and industry perspectives from fuzentra on strategy, operations, digital transformation, and AI and data.',
    canonical: `${SITE}/insights/`,
    main,
  });
}

function postPage(p, posts) {
  const base = '../../';
  const url = `${SITE}/insights/${p.slug}/`;
  const a = AUTHORS[p.author] || { role: '' };
  const more = posts.filter((o) => o.slug !== p.slug).slice(0, 2);
  const share = encodeURIComponent(url);
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.summary,
    datePublished: p.date, dateModified: p.updated || p.date, url, image: p.image ? `${SITE}/${p.image}` : `${SITE}/og-image.jpg`,
    author: { '@type': 'Person', name: p.author, ...(a.linkedin ? { url: a.linkedin } : {}) },
    publisher: { '@type': 'Organization', name: 'fuzentra', logo: { '@type': 'ImageObject', url: `${SITE}/assets/fuzentra-logo.png` } },
    mainEntityOfPage: url,
  }, null, 2)}
</script>`;
  const btn = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-white text-sm font-semibold text-ink hover:border-brand hover:text-brand-deep transition';
  const main = `<header class="relative overflow-hidden bg-[#E8F5F3] border-b border-brand/15 pt-32 pb-10 md:pt-36 md:pb-12">
  <div aria-hidden="true" class="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-brand/15 blur-3xl"></div>
  <div class="relative max-w-3xl mx-auto px-6">
    <a href="${base}insights/" class="text-sm font-bold text-brand-deep hover:underline">← All insights</a>
    <h1 class="font-display text-3xl sm:text-[2.6rem] font-extrabold text-ink mt-4 leading-tight text-balance">${esc(p.title)}</h1>
    <p class="text-slate-600 mt-4 text-lg leading-relaxed">${esc(p.summary)}</p>
    <div class="mt-6 flex items-center gap-3">
      ${authorBadge(p.author, 'lg')}
      <div>
        <p class="font-semibold text-ink">${a.linkedin ? `<a href="${a.linkedin}" target="_blank" rel="noopener" class="hover:text-brand-deep">${esc(p.author)}</a>` : esc(p.author)}${a.role ? `<span class="block sm:inline font-normal text-slate-500"><span class="hidden sm:inline"> · </span>${esc(a.role)}</span>` : ''}</p>
        <p class="text-sm text-slate-500"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} min read</p>
      </div>
    </div>
  </div>
</header>

<main class="bg-white">
  <article class="max-w-3xl mx-auto px-6 py-12 md:py-14">${p.image ? `
    <img src="${base}${esc(p.image)}" alt="${esc(p.image_alt || p.title)}" class="w-full rounded-2xl mb-10 bg-mist">` : ''}
    <div class="article">
${p.html}
    </div>
${p.linkedin ? `
    <p class="mt-10 p-4 rounded-2xl bg-mist border border-line text-sm text-slate-600">This article first appeared on LinkedIn. <a href="${esc(p.linkedin)}" target="_blank" rel="noopener" class="text-brand-deep font-semibold underline">See the original post and discussion →</a></p>` : ''}

    <div class="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-3">
      <span class="text-sm font-semibold text-slate-500 mr-1">Share</span>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener" class="${btn}"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>LinkedIn</a>
      <a href="https://wa.me/?text=${encodeURIComponent(p.title + ' ' + url)}" target="_blank" rel="noopener" class="${btn}"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.9 9.9 0 0 0 12.04 2zm5.8 13.94c-.25.7-1.44 1.33-2.01 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.93-4.29-5.08-4.49-.14-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37h.57c.18.01.43-.07.67.51.25.6.84 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.14-.3.3-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.64-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.71-.17 1.41z"/></svg>WhatsApp</a>
      <button type="button" data-copy-link class="${btn}"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg><span>Copy link</span></button>
    </div>

    <aside class="mt-12 relative overflow-hidden rounded-3xl bg-ink p-8 sm:p-10">
      <div aria-hidden="true" class="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brand/25 blur-3xl"></div>
      <div class="relative">
        <p class="font-display text-2xl font-bold text-white">Want to talk about this?</p>
        <p class="text-slate-300 mt-2 max-w-xl">Tell us where you want to go. We'll come back with a clear first step - whether it's strategy, growth, process or technology.</p>
        <a href="${base}#contact" class="btn-primary mt-6">Start a Conversation <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></a>
      </div>
    </aside>
  </article>
${more.length ? `
  <section class="bg-mist border-t border-line">
    <div class="max-w-3xl mx-auto px-6 py-14">
      <h2 class="font-display text-2xl font-bold text-ink mb-6">More insights</h2>
      <div class="grid gap-6 sm:grid-cols-2">
${more.map((o) => card(o, base)).join('\n')}
      </div>
    </div>
  </section>` : ''}
</main>`;
  return layout({ base, title: `${p.title} | fuzentra`, description: p.summary, canonical: url, ogType: 'article', ogImage: p.image ? `${SITE}/${p.image}` : undefined, jsonLd, main });
}

// ---------- build ----------
const posts = loadPosts();

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), listPage(posts));
for (const p of posts) {
  fs.mkdirSync(path.join(OUT_DIR, p.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, p.slug, 'index.html'), postPage(p, posts));
}

const homePath = path.join(ROOT, 'index.html');
const home = fs.readFileSync(homePath, 'utf8');
const startTag = home.match(/ *<!-- INSIGHTS:START[^>]*-->\n/);
const endIdx = home.indexOf('    <!-- INSIGHTS:END -->');
if (!startTag || endIdx < 0) throw new Error('index.html: INSIGHTS:START / INSIGHTS:END markers not found');
const startEnd = startTag.index + startTag[0].length;
fs.writeFileSync(homePath, home.slice(0, startEnd) + homeCards(posts) + '\n' + home.slice(endIdx));

const today = new Date().toISOString().slice(0, 10);
const urls = [
  [`${SITE}/`, posts[0]?.date || today], [`${SITE}/insights/`, posts[0]?.date || today], [`${SITE}/privacy.html`, null],
  ...posts.map((p) => [`${SITE}/insights/${p.slug}/`, p.updated || p.date]),
];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Blog built: ${posts.length} article(s)${posts.length ? ' - ' + posts.map((p) => p.slug).join(', ') : ''}`);
