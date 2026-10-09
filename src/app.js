(function () {
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = s => esc(s).replace(/\[\[(.+?)\]\]/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const plain = s => String(s).replace(/\[\[(.+?)\]\]/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1');
const byId = id => TOPICS.find(t => t.id === id);

/* ---------- saved state (per browser, optional) ---------- */
const store = { quiz: {}, rate: 1, voice: '' };
try { Object.assign(store, JSON.parse(localStorage.getItem('xlguide') || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem('xlguide', JSON.stringify(store)); } catch (e) { /* ignore */ } };
const answers = t => store.quiz[t.id] || (store.quiz[t.id] = []);
const scoreOf = t => t.quiz.reduce((n, q, i) => n + (answers(t)[i] === q.a ? 1 : 0), 0);
const doneCount = t => t.quiz.filter((q, i) => answers(t)[i] != null).length;

/* ---------- figures ---------- */
function gridFig(f) {
  const marks = { '!': 'h', '~': 'in', '*': 'sel', '+': 'ok', '^': 'err' };
  const cols = f.cols.split('');
  let h = '<tr><th></th>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';
  f.rows.forEach((r, i) => {
    h += `<tr><th>${f.row + i}</th>` + r.map(v => {
      let cls = [];
      while (v && marks[v[0]]) { cls.push(marks[v[0]]); v = v.slice(1); }
      if (/^\(?-?\$?[\d,]+(\.\d+)?%?\)?$/.test(v.trim()) && !cls.includes('h')) cls.push('num');
      return `<td class="${cls.join(' ')}">${esc(v)}</td>`;
    }).join('') + '</tr>';
  });
  return `<div class="xl"><div class="fbar"><span class="nb">${esc(f.name)}</span><span class="fxi">fx</span><span class="f">${esc(f.fx)}</span></div><div class="scroll"><table>${h}</table></div></div>`;
}
function chartFig(f) {
  const W = 560, H = f.line ? 304 : 290, l = 58, r = f.line ? 50 : 18, t = f.line ? 54 : 40, b = 36, pw = W - l - r, ph = H - t - b;
  const y = v => t + ph - v / f.max * ph, n = f.labels.length, bw = pw / n;
  const bars = f.bars || f.values;
  let s = `<text class="ttl" x="${l}" y="22">${esc(f.title)}</text>`;
  for (let v = 0; v <= f.max; v += f.step) {
    s += `<line class="grid" x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}"/><text x="${l - 8}" y="${y(v) + 4}" text-anchor="end">$${v.toLocaleString('en-US')}</text>`;
  }
  bars.forEach((v, i) => {
    const x = l + i * bw + bw * 0.22, w = bw * 0.56;
    s += `<rect class="bar" x="${x}" y="${y(v)}" width="${w}" height="${t + ph - y(v)}" rx="2"/>`;
    s += `<text x="${x + w / 2}" y="${H - 14}" text-anchor="middle">${esc(f.labels[i])}</text>`;
    if (!f.line) s += `<text class="val" x="${x + w / 2}" y="${y(v) - 6}" text-anchor="middle">$${v.toLocaleString('en-US')}</text>`;
  });
  if (f.line) {
    const y2 = v => t + ph - v / f.max2 * ph;
    for (let v = 0; v <= f.max2; v += f.step2) s += `<text class="blue" x="${W - r + 8}" y="${y2(v) + 4}">${v}</text>`;
    const pts = f.line.map((v, i) => [l + i * bw + bw / 2, y2(v)]);
    s += `<polyline class="ln" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
    pts.forEach((p, i) => { s += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="4"/><text class="blue val" x="${p[0]}" y="${p[1] - 9}" text-anchor="middle">${f.line[i]}</text>`; });
    s += `<text x="${l}" y="${t - 6}">Revenue ($)</text><text class="blue" x="${W - r + 8}" y="${t - 6}" text-anchor="start">Units</text>`;
  }
  s += `<line class="axis" x1="${l}" x2="${W - r}" y1="${t + ph}" y2="${t + ph}"/>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.title)}">${s}</svg>`;
}
function regionFig() {
  const W = 480, H = 360, l = 52, b = 44, t = 26, r = 24, pw = W - l - r, ph = H - t - b;
  const X = v => l + v / 70 * pw, Y = v => t + ph - v / 110 * ph, P = (a, c) => `${X(a)},${Y(c)}`;
  let s = `<polygon class="area" points="${P(0, 0)} ${P(50, 0)} ${P(30, 40)} ${P(0, 80)}"/>`;
  for (let v = 0; v <= 60; v += 10) s += `<text x="${X(v)}" y="${H - b + 18}" text-anchor="middle">${v}</text>`;
  for (let v = 0; v <= 100; v += 20) s += `<text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  s += `<line class="axis" x1="${l}" y1="${Y(0)}" x2="${W - r}" y2="${Y(0)}"/><line class="axis" x1="${l}" y1="${t}" x2="${l}" y2="${Y(0)}"/>`;
  s += `<line class="ln" x1="${X(0)}" y1="${Y(80)}" x2="${X(60)}" y2="${Y(0)}"/><line class="ln2" x1="${X(0)}" y1="${Y(100)}" x2="${X(50)}" y2="${Y(0)}"/>`;
  s += `<text class="blue" x="${X(9)}" y="${Y(72)}">Carpentry: 4T + 3C = 240</text><text class="red" x="${X(13)}" y="${Y(90)}">Finishing: 2T + C = 100</text>`;
  [[0, 80, '$2,400', 8, -8], [50, 0, '$2,500', 6, -10], [0, 0, '$0', 8, -8]].forEach(c => { s += `<circle class="box" cx="${X(c[0])}" cy="${Y(c[1])}" r="5"/><text x="${X(c[0]) + c[3]}" y="${Y(c[1]) + c[4]}">${c[2]}</text>`; });
  s += `<circle class="pk" cx="${X(30)}" cy="${Y(40)}" r="7"/><text class="val" x="${X(30) + 12}" y="${Y(40) + 2}">(30, 40) profit $2,700</text>`;
  s += `<text x="${X(35)}" y="${H - 6}" text-anchor="middle">Tables (T)</text><text x="14" y="${t - 8}">Chairs (C)</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Feasible region for the tables and chairs model">${s}</svg>`;
}
function curveFig() {
  const W = 560, H = 300, l = 62, r = 20, t = 30, b = 42, pw = W - l - r, ph = H - t - b;
  const X = p => l + (p - 6) / 24 * pw, Y = v => t + ph - (v + 2000) / 6000 * ph;
  const prof = p => (p - 6) * (1200 - 40 * p) - 2000;
  let s = '';
  for (let v = -2000; v <= 4000; v += 2000) s += `<line class="grid" x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end">${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString('en-US')}</text>`;
  for (let p = 6; p <= 30; p += 4) s += `<text x="${X(p)}" y="${H - b + 18}" text-anchor="middle">$${p}</text>`;
  let pts = []; for (let p = 6; p <= 30; p += 0.5) pts.push(X(p) + ',' + Y(prof(p)));
  s += `<line class="axis" x1="${l}" x2="${W - r}" y1="${Y(0)}" y2="${Y(0)}"/><polyline class="ln" points="${pts.join(' ')}"/>`;
  s += `<line class="grid" stroke-dasharray="4 4" x1="${X(18)}" x2="${X(18)}" y1="${Y(3760)}" y2="${Y(-2000)}"/>`;
  s += `<circle class="pk" cx="${X(18)}" cy="${Y(3760)}" r="7"/><text class="val" x="${X(18)}" y="${Y(3760) - 12}" text-anchor="middle">Price $18, profit $3,760</text>`;
  s += `<circle class="box" cx="${X(10)}" cy="${Y(1200)}" r="5"/><text x="${X(10) + 9}" y="${Y(1200) + 14}">Start: $10, profit $1,200</text>`;
  s += `<text x="${l + pw / 2}" y="${H - 6}" text-anchor="middle">Price</text><text x="14" y="${t - 10}">Profit</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Profit curve by price">${s}</svg>`;
}
function traceFig() {
  const box = (x, y, ref, label, val, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="210" height="46" rx="4"/><text x="${x + 10}" y="${y + 18}">${ref}  ${label}</text><text class="val" x="${x + 10}" y="${y + 36}">${val}</text>`;
  let s = `<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path class="ah" d="M0,0 L9,4.5 L0,9 Z"/></marker></defs>`;
  s += box(20, 20, 'B12', 'Operating income', '$1,500', 'box') + box(20, 96, 'B13', 'Tax rate', '25%', 'box') + box(320, 58, 'B14', 'Net income', '=B12*(1-B13)  →  $1,125', 'boxsel');
  s += `<circle class="dot" cx="230" cy="43" r="4"/><circle class="dot" cx="230" cy="119" r="4"/>`;
  s += `<path class="arrow" marker-end="url(#ah)" d="M230,43 L318,74"/><path class="arrow" marker-end="url(#ah)" d="M230,119 L318,90"/>`;
  return `<svg class="chart" viewBox="0 0 550 162" role="img" aria-label="Trace precedents arrows pointing into cell B14">${s}</svg>`;
}
function fig(f) {
  if (!f) return '';
  let h = '';
  if (f.type === 'grid') h = gridFig(f);
  else if (f.type === 'bars' || f.type === 'combo') h = chartFig(f);
  else if (f.type === 'region') h = regionFig();
  else if (f.type === 'curve') h = curveFig();
  else if (f.type === 'trace') h = traceFig();
  else if (f.type === 'dialog') h = `<div class="dialog"><div class="bar">${esc(f.title)}</div><dl>${f.fields.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl></div>`;
  else if (f.type === 'path') h = `<div class="path">${f.items.map(x => `<span>${esc(x)}</span>`).join('<i>&#9656;</i>')}</div>`;
  else if (f.type === 'tabs') h = `<div class="tabsfig">${f.tabs.map((n, i) => `<div class="sheet"><b>${esc(f.vals[i])}</b><small>${esc(n)}!B5</small></div>`).join('<span class="op">+</span>')}<span class="op">=</span><div class="sheet total"><b>${esc(f.total)}</b><small>Q1 total</small></div></div>`;
  return `<figure>${h}<figcaption class="say">${fmt(f.cap)}</figcaption></figure>`;
}

/* ---------- topic page ---------- */
function partHtml(p, i) {
  let h = `<section class="part" id="p${i}"><h2><span class="say">${esc(p.h)}</span></h2>`;
  (p.p || []).forEach(x => h += `<p class="say">${fmt(x)}</p>`);
  if (p.table) {
    h += `<div class="scroll say" data-say="The table on screen covers: ${esc(p.table.rows.map(r => plain(r[0])).join('; '))}."><table class="plain"><thead><tr>${p.table.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>` +
      p.table.rows.map(r => `<tr>${r.map(c => `<td class="${/^[={']|^Sub /.test(c) ? 'f' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('') + `</tbody></table></div>`;
  }
  const steps = p.steps ? `<div class="label">Follow along</div><ol class="steps">${p.steps.map((x, k) => `<li class="say" data-say="Step ${k + 1}. ${esc(plain(x))}"><span>${fmt(x)}</span></li>`).join('')}</ol>` : '';
  const code = p.code ? `<pre class="code say" data-say="The V B A code is shown on screen.">${esc(p.code)}</pre>` : '';
  h += p.code ? steps + code + fig(p.fig) : fig(p.fig) + fig(p.fig2) + steps;
  (p.p2 || []).forEach(x => h += `<p class="say">${fmt(x)}</p>`);
  if (p.list) h += `<ul>${p.list.map(x => `<li class="say">${fmt(x)}</li>`).join('')}</ul>`;
  if (p.tip) h += `<p class="tip say"><b>Tip</b>${fmt(p.tip)}</p>`;
  return h + '</section>';
}
function quizHtml(t) {
  const ans = answers(t), L = 'ABCD';
  let h = `<section class="quiz" id="quiz"><h2>Test your understanding</h2>`;
  t.quiz.forEach((q, i) => {
    const pick = ans[i], done = pick != null;
    h += `<div class="qcard"><p class="qq">${i + 1}. ${fmt(q.q)}</p><div class="opts">`;
    q.o.forEach((o, k) => {
      const cls = done ? (k === q.a ? ' right' : (k === pick ? ' wrong' : '')) : '';
      const tag = done ? (k === q.a ? 'Correct answer' : (k === pick ? 'Your answer' : '')) : '';
      h += `<button type="button" class="opt${cls}" data-q="${i}" data-o="${k}" ${done ? 'disabled' : ''}><span class="k">${L[k]}</span><span>${fmt(o)}</span><span class="tag">${tag}</span></button>`;
    });
    h += '</div>';
    if (done) {
      const ok = pick === q.a;
      h += `<div class="explain${ok ? '' : ' miss'}" id="ex${i}"><p><strong>${ok ? 'Correct.' : 'Not quite.'}</strong> ${ok ? '' : fmt(q.not[pick]) + ' '}</p>` +
        `<p><strong>Why ${L[q.a]} is right:</strong> ${fmt(q.why)}</p>` +
        `<details><summary>Why the other options are wrong</summary><ul>${q.o.map((o, k) => k === q.a ? '' : `<li><strong>${L[k]}.</strong> ${fmt(q.not[k])}</li>`).join('')}</ul></details>` +
        `<div><button type="button" class="btn ghost small" data-speak="ex${i}">Listen to this explanation</button></div></div>`;
    }
    h += '</div>';
  });
  const d = doneCount(t);
  h += `<div class="score"><span>${d === t.quiz.length ? `Score: ${scoreOf(t)} of ${t.quiz.length}` : `${d} of ${t.quiz.length} answered`}</span>${d ? '<button type="button" class="btn ghost small" id="retry">Clear answers and try again</button>' : ''}</div></section>`;
  return h;
}
function topicPage(t) {
  const i = TOPICS.indexOf(t), prev = TOPICS[i - 1], next = TOPICS[i + 1];
  return `<header class="thead">
    <div class="eyebrow">Topic ${t.n} of ${TOPICS.length} &middot; Workbook sheet: ${esc(t.sheet)}</div>
    <h1>${esc(t.title)}</h1>
    <div class="fbar" title="A formula from this topic"><span class="nb">${esc(t.sheet.split(' ')[0])}</span><span class="fxi">fx</span><span class="f">${esc(t.fx)}</span></div>
    <p class="lead say">${fmt(t.intro)}</p>
    ${playerHtml()}
    <div class="chips" aria-label="Keywords">${t.kw.map(k => `<button type="button" class="chip" data-kw="${esc(k)}">${esc(k)}</button>`).join('')}</div>
    <div class="legend"><span><i style="background:var(--input-bg)"></i>Input you can change</span><span><i style="background:var(--check-bg)"></i>Answer check</span><span><i style="outline:2px solid var(--accent);outline-offset:-2px"></i>Selected cell (formula shown in the bar)</span></div>
  </header>` + t.parts.map(partHtml).join('') + quizHtml(t) +
  `<nav class="pager">${prev ? `<button type="button" class="btn ghost" data-go="${prev.id}">&larr; ${prev.n}. ${esc(prev.title)}</button>` : '<span></span>'}${next ? `<button type="button" class="btn" data-go="${next.id}">${next.n}. ${esc(next.title)} &rarr;</button>` : `<button type="button" class="btn" data-go="ask">Ask a question &rarr;</button>`}</nav>`;
}

/* ---------- audio (browser speech synthesis) ---------- */
const synth = ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) ? window.speechSynthesis : null;
const audio = { queue: [], i: 0, token: 0, playing: false, paused: false, voices: [] };
function playerHtml() {
  if (!synth) return `<p class="note">Audio narration needs a browser with speech support. It is not available in this view.</p>`;
  return `<div class="player" id="player"><button type="button" class="btn" id="play">&#9654; Listen</button><button type="button" class="btn ghost" id="stop" disabled>Stop</button>
    <span class="now" id="now" aria-live="polite">Narration reads this topic aloud and highlights each part.</span>
    <label class="note" for="rate">Speed</label><select id="rate">${[0.8, 1, 1.2, 1.5].map(r => `<option value="${r}" ${+store.rate === r ? 'selected' : ''}>${r}x</option>`).join('')}</select>
    <label class="note" for="voice">Voice</label><select id="voice"><option value="">Default</option></select></div>`;
}
function loadVoices() {
  if (!synth) return;
  audio.voices = synth.getVoices().filter(v => /^en/i.test(v.lang));
  const sel = $('#voice'); if (!sel) return;
  sel.innerHTML = '<option value="">Default</option>' + audio.voices.map(v => `<option value="${esc(v.name)}" ${v.name === store.voice ? 'selected' : ''}>${esc(v.name.replace(/Microsoft |Google /, ''))}</option>`).join('');
}
if (synth) { try { synth.addEventListener('voiceschanged', loadVoices); } catch (e) { /* older browsers */ } }
function chunks(text) {
  let parts; try { parts = text.split(new RegExp('(?<=[.!?])\\s+')); } catch (e) { parts = [text]; }
  const out = []; let cur = '';
  parts.forEach(s => { if ((cur + ' ' + s).length > 220 && cur) { out.push(cur); cur = s; } else cur = cur ? cur + ' ' + s : s; });
  if (cur) out.push(cur);
  return out;
}
function sayText(el) {
  return (el.dataset.say || el.textContent).replace(/\s+/g, ' ').replace(/>=/g, ' at least ').replace(/<=/g, ' at most ').replace(/ > /g, ', then ').replace(/[▸→←]/g, ' ').trim();
}
function stopAudio() {
  audio.token++; audio.playing = false; audio.paused = false;
  if (synth) synth.cancel();
  $$('.reading').forEach(e => e.classList.remove('reading'));
  const p = $('#play'), s = $('#stop'), n = $('#now');
  if (p) p.innerHTML = '&#9654; Listen'; if (s) s.disabled = true; if (n) n.textContent = 'Narration stopped.';
}
function speakEls(els, label) {
  if (!synth) return;
  stopAudio();
  audio.queue = [];
  els.forEach(el => chunks(sayText(el)).forEach(c => audio.queue.push({ el, text: c })));
  if (!audio.queue.length) return;
  audio.i = 0; audio.playing = true; audio.label = label || '';
  const p = $('#play'), s = $('#stop');
  if (p) p.innerHTML = '&#10074;&#10074; Pause'; if (s) s.disabled = false;
  next(audio.token);
}
function next(token) {
  if (token !== audio.token) return;
  $$('.reading').forEach(e => e.classList.remove('reading'));
  const item = audio.queue[audio.i];
  if (!item) { stopAudio(); const n = $('#now'); if (n) n.textContent = 'Finished.'; return; }
  item.el.classList.add('reading');
  if (audio.i === 0 || audio.queue[audio.i - 1].el !== item.el) { try { item.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* ignore */ } }
  const sec = item.el.closest('.part'), n = $('#now');
  if (n) n.textContent = 'Reading: ' + (audio.label || (sec ? $('h2', sec).textContent : 'Introduction'));
  const u = new SpeechSynthesisUtterance(item.text);
  u.rate = +store.rate || 1; u.lang = 'en-US';
  const v = audio.voices.find(x => x.name === store.voice); if (v) { u.voice = v; u.lang = v.lang; }
  u.onend = () => { if (token === audio.token) { audio.i++; next(token); } };
  u.onerror = e => { if (token === audio.token && e.error !== 'interrupted' && e.error !== 'canceled') { audio.i++; next(token); } };
  synth.speak(u);
}
function togglePlay() {
  if (!audio.playing) return speakEls($$('#page .thead .say, #page .part .say'));
  if (audio.paused) { synth.resume(); audio.paused = false; $('#play').innerHTML = '&#10074;&#10074; Pause'; }
  else { synth.pause(); audio.paused = true; $('#play').innerHTML = '&#9654; Resume'; }
}

/* ---------- search ---------- */
const INDEX = [];
TOPICS.forEach(t => {
  INDEX.push({ kind: 'Topic', t, part: null, title: `${t.n}. ${t.title}`, text: t.intro, boost: t.title + ' ' + t.kw.join(' ') });
  t.parts.forEach((p, i) => {
    const text = [].concat(p.p || [], p.p2 || [], p.list || [], p.steps || [], p.tip || [], p.fig ? p.fig.cap : [], p.fig2 ? p.fig2.cap : [], p.table ? p.table.rows.map(r => r.join(' ')) : [], p.code || []).map(plain).join(' ');
    const bits = [].concat(p.p || [], p.p2 || [], p.list || [], p.tip || [], p.fig ? p.fig.cap : [], p.fig2 ? p.fig2.cap : []).map(plain);
    INDEX.push({ kind: `Topic ${t.n} section`, t, part: i, title: p.h, text, boost: p.h, bits, steps: (p.steps || []).map(plain) });
  });
  t.quiz.forEach(q => INDEX.push({ kind: `Topic ${t.n} quiz`, t, part: 'quiz', title: q.q, text: q.why, boost: '' }));
});
FAQ.forEach((f, i) => INDEX.push({ kind: 'FAQ', faq: i, t: f.t ? byId(f.t) : null, title: f.q, text: f.a, boost: f.q }));
const STOP = new Set('a an the is are was do does did i my me you your how what why when where which who to of in on for with and or it its this that can be as at by from into use using than then should would could tell about explain please make build create show give want need get there if so not no yes mean means'.split(' '));
const toks = q => (q.toLowerCase().match(/[a-z0-9#/!?.+-]+/g) || []).map(w => w.replace(/[?.!]+$/, '')).filter(w => w && !STOP.has(w));
function searchIndex(q, limit) {
  const ws = toks(q); if (!ws.length) return [];
  const run = all => INDEX.map(e => {
    const title = e.title.toLowerCase(), boost = e.boost.toLowerCase(), text = e.text.toLowerCase();
    let s = 0, hit = 0;
    ws.forEach(w => { const a = boost.includes(w), b = title.includes(w), c = text.includes(w); if (a || b || c) hit++; s += (a ? 4 : 0) + (b ? 3 : 0) + (c ? 1 : 0); });
    if (title.includes(q.toLowerCase().trim())) s += 6;
    return { e, s: (all && hit < ws.length) ? 0 : s, cover: hit / ws.length };
  }).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  let r = run(true); if (!r.length) r = run(false);
  return r.slice(0, limit || 30);
}
function hilite(text, q) {
  const ws = toks(q).sort((a, b) => b.length - a.length); let h = esc(text);
  if (!ws.length) return h;
  const re = new RegExp('(' + ws.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return h.replace(re, '<mark>$1</mark>');
}
function snippet(text, q) {
  const ws = toks(q), low = text.toLowerCase(); let at = -1;
  ws.some(w => (at = low.indexOf(w)) >= 0);
  const start = Math.max(0, at - 60), s = text.slice(start, start + 190);
  return (start ? '… ' : '') + s + (start + 190 < text.length ? ' …' : '');
}
function searchPage(q) {
  const r = searchIndex(q);
  const kws = []; TOPICS.forEach(t => t.kw.forEach(k => { if (k.toLowerCase().includes(q.toLowerCase().trim())) kws.push([k, t]); }));
  return `<header class="thead"><div class="eyebrow">Search</div><h1>${r.length} result${r.length === 1 ? '' : 's'} for &ldquo;${esc(q)}&rdquo;</h1></header>` +
    (kws.length ? `<div class="chips">${kws.slice(0, 14).map(k => `<button type="button" class="chip" data-go="${k[1].id}">${esc(k[0])} &middot; Topic ${k[1].n}</button>`).join('')}</div>` : '') +
    (r.length ? `<div class="results">${r.map(x => { const e = x.e; return `<button type="button" class="res" ${e.kind === 'FAQ' ? `data-faq="${e.faq}"` : `data-go="${e.t.id}" data-part="${e.part == null ? '' : e.part}"`}><span class="where">${esc(e.kind)}${e.kind === 'FAQ' && e.t ? ' &middot; Topic ' + e.t.n : ''}</span><b>${hilite(e.title, q)}</b><span>${hilite(snippet(e.text, q), q)}</span></button>`; }).join('')}</div>`
      : `<p>Nothing matched. Try a function name such as PMT or VLOOKUP, or open the keyword index.</p>`);
}
function indexPage() {
  const map = {};
  TOPICS.forEach(t => t.kw.forEach(k => { (map[k] = map[k] || []).push(t); }));
  const groups = {};
  Object.keys(map).sort((a, b) => a.replace(/^[#.]+/, '').localeCompare(b.replace(/^[#.]+/, ''), 'en', { sensitivity: 'base' })).forEach(k => {
    const ch = (k.replace(/^[^A-Za-z]+/, '')[0] || '#').toUpperCase(); (groups[ch] = groups[ch] || []).push(k);
  });
  return `<header class="thead"><div class="eyebrow">Keyword index</div><h1>${Object.keys(map).length} keywords, A to Z</h1><p class="lead">Each keyword opens the topic that teaches it.</p></header><div class="az">` +
    Object.keys(groups).sort().map(ch => `<section><h3>${ch}</h3>${groups[ch].map(k => `<button type="button" data-go="${map[k][0].id}">${esc(k)} <small>${map[k].map(t => 'T' + t.n).join(' ')}</small></button>`).join('')}</section>`).join('') + '</div>';
}

/* ---------- home ---------- */
/* Standalone = served as its own site (for example GitHub Pages), not inside a Claude artifact. */
const STANDALONE = !window.claude && /^https?:$/.test(location.protocol);
function homePage() {
  const total = TOPICS.reduce((n, t) => n + t.quiz.length, 0), got = TOPICS.reduce((n, t) => n + scoreOf(t), 0);
  return `<header class="cover"><div class="eyebrow">Course companion &middot; ${TOPICS.length} topics &middot; ${total} check questions</div>
    <h1>Advanced Excel, one worked example at a time</h1>
    <p class="lead">Each topic explains the idea, shows it on a picture of the real worksheet, walks you through the clicks, then checks your understanding with explained answers. The numbers match the practice workbook, so you can follow along in Excel.</p>
    <div class="fbar"><span class="nb">A1</span><span class="fxi">fx</span><span class="f">=COUNTIF(QuizAnswers, "correct")  &rarr;  ${got} of ${total} so far</span></div></header>
  <div class="how"><div><b>Read or listen</b>Press Listen on any topic to have it read aloud while each part is highlighted.</div><div><b>Follow along</b>Open the matching sheet in the practice workbook and do the numbered steps.</div><div><b>Check yourself</b>Answer three questions per topic. Every option is explained.</div><div><b>Search or ask</b>Search keywords from the top bar, or ask a question in Ask &amp; FAQ.</div></div>
  ${STANDALONE ? `<div class="chips"><a class="btn" href="Advanced_Excel_Practice_Workbook.xlsx" download>Download the practice workbook</a><a class="btn ghost" href="regional_targets.csv" download>Download regional_targets.csv</a></div><p class="note">To keep this guide on your phone: in Safari tap Share, then Add to Home Screen. In Chrome open the menu and choose Install app or Add to Home screen. It then opens like an app and works offline.</p>` : ''}
  <div class="toc">${TOPICS.map(t => `<button type="button" data-go="${t.id}"><span class="n">${String(t.n).padStart(2, '0')} &middot; ${doneCount(t) ? scoreOf(t) + '/' + t.quiz.length + ' correct' : 'not started'}</span><b>${esc(t.title)}</b><small>${esc(t.kw.slice(0, 4).join(', '))}</small></button>`).join('')}</div>`;
}

/* ---------- ask & FAQ ---------- */
let sample = null;
const chat = [];
function corpus() {
  let c = '';
  TOPICS.forEach(t => {
    c += `\n\n### Topic ${t.n}: ${t.title} (workbook sheet "${t.sheet}")\n${plain(t.intro)}\nKeywords: ${t.kw.join(', ')}\n`;
    t.parts.forEach(p => {
      c += `\n# ${p.h}\n` + [].concat(p.p || [], p.p2 || []).map(plain).join('\n') + '\n';
      if (p.table) c += p.table.head.join(' | ') + '\n' + p.table.rows.map(r => r.join(' | ')).join('\n') + '\n';
      [p.fig, p.fig2].forEach(f => { if (f) { c += `Figure: ${plain(f.cap)}${f.fx && f.type === 'grid' ? ' Formula in ' + f.name + ': ' + f.fx : ''}\n`; if (f.type === 'grid') c += f.rows.map(r => r.map(v => v.replace(/^[!~*+^]+/, '')).join(' | ')).join('\n') + '\n'; if (f.fields) c += f.fields.map(x => x.join(': ')).join('; ') + '\n'; } });
      if (p.steps) c += 'Steps:\n' + p.steps.map((s, i) => `${i + 1}. ${plain(s)}`).join('\n') + '\n';
      if (p.code) c += 'VBA:\n' + p.code + '\n';
      if (p.list) c += p.list.map(s => '- ' + plain(s)).join('\n') + '\n';
      if (p.tip) c += 'Tip: ' + plain(p.tip) + '\n';
    });
    t.quiz.forEach(q => { c += `Q: ${q.q}\nA: ${q.o[q.a]}. ${q.why}\n`; });
  });
  c += '\n\n### Frequently asked questions\n' + FAQ.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n');
  return c;
}
let CORPUS = null;
function botHtml(text) {
  return esc(text).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/Topic (\d{1,2})\b/g, (m, n) => +n >= 1 && +n <= TOPICS.length ? `<button type="button" class="linkbtn" data-go="t${n}">Topic ${n}</button>` : m)
    .replace(/\n/g, '<br>');
}
function localAnswer(q) {
  const ws = toks(q);
  const r = searchIndex(q, 12).filter(x => x.cover >= 0.6 && x.e.kind !== 'Topic');
  const secs = r.filter(x => x.e.bits).slice(0, 3).map(x => x.e);
  const top = r[0];
  if (!top) return { text: `The guide does not seem to cover that. Try a function name such as PMT or VLOOKUP, or browse the keyword index.`, links: [] };
  const e = top.e; let text;
  if (e.kind === 'FAQ') text = FAQ[e.faq].a;
  else if (!e.bits) text = e.text;
  else {
    const rank = e.bits.map(b => ({ b, n: ws.filter(w => b.toLowerCase().includes(w)).length })).sort((a, b) => b.n - a.n);
    text = (rank[0] && rank[0].n ? rank[0].b : (e.bits[0] || e.title));
    if (e.steps.length && /^\s*how\b/i.test(q)) text += '\n' + e.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }
  if (e.t) text += `\nTaught in Topic ${e.t.n}.`;
  return { text, links: secs };
}
function askPage() {
  return `<header class="thead"><div class="eyebrow">Ask &amp; FAQ</div><h1>Ask a question about the course</h1>
    <p class="lead" id="botmode">Answers come only from this guide's 15 topics and its FAQ.</p></header>
  <div class="chat"><div class="log" id="log" aria-live="polite">${chat.length ? '' : `<div class="msg bot"><span class="src">Study assistant</span><div>Ask me anything covered in the guide, for example how a function works, which tool to use, or why an answer is what it is. I will point you to the topic it comes from.</div></div>`}</div>
    <form class="askform" id="askform"><input id="q" type="text" placeholder="For example: why is my PMT result negative?" aria-label="Your question" autocomplete="off" maxlength="400"><button class="btn" type="submit" id="send">Ask</button></form></div>
  <div class="chips" id="sugg">${[`Which Solver method should I use?`, `How do I build a two-variable data table?`, `What does #N/A mean?`, `How do I keep a macro when saving?`].map(s => `<button type="button" class="chip" data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <section class="part"><h2>Frequently asked questions</h2><div class="faq">${FAQ.map((f, i) => `<details id="faq${i}"><summary>${esc(f.q)}</summary><div><p id="faqa${i}">${esc(f.a)}</p><div class="meta" style="display:flex;gap:8px;flex-wrap:wrap">${f.t ? `<button type="button" class="btn ghost small" data-go="${f.t}">Open Topic ${byId(f.t).n}</button>` : ''}${synth ? `<button type="button" class="btn ghost small" data-speak="faqa${i}">Listen</button>` : ''}</div></div></details>`).join('')}</div></section>`;
}
function drawChat() {
  const log = $('#log'); if (!log || !chat.length) return;
  log.innerHTML = chat.map((m, i) => m.role === 'user' ? `<div class="msg me">${esc(m.text)}</div>` :
    `<div class="msg bot"><span class="src">${m.src}</span><div id="bot${i}">${m.text ? botHtml(m.text) : 'Thinking&hellip;'}</div>${m.done ? `<div class="meta">${(m.links || []).map(e => `<button type="button" class="btn ghost small" data-go="${e.t.id}" data-part="${e.part == null ? '' : e.part}">Topic ${e.t.n}: ${esc(e.part === 'quiz' ? 'quiz' : e.title.replace(/^\d+\. /, ''))}</button>`).join('')}${synth ? `<button type="button" class="btn ghost small" data-speak="bot${i}">Listen</button>` : ''}</div>` : ''}</div>`).join('');
  log.scrollTop = log.scrollHeight;
}
function botMode() {
  const el = $('#botmode'); if (!el) return;
  el.textContent = sample ? `Claude answers your question using only this guide's 15 topics and its FAQ, and names the topic each answer comes from.`
    : `Answers are matched from this guide's 15 topics and its FAQ.`;
}
async function ask(q) {
  q = q.trim(); if (!q) return;
  const send = $('#send'); if (send) send.disabled = true;
  chat.push({ role: 'user', text: q });
  const m = { role: 'bot', text: '', src: sample ? 'Claude, from the guide' : 'Matched from the guide', done: false };
  chat.push(m); drawChat();
  const fallback = note => { const a = localAnswer(q); m.text = (note ? note + ' ' : '') + a.text; m.links = a.links; m.src = 'Matched from the guide'; };
  if (sample) {
    try {
      CORPUS = CORPUS || corpus();
      const hist = chat.slice(0, -2).slice(-6).map(x => (x.role === 'user' ? 'Student: ' : 'Assistant: ') + x.text).join('\n');
      const prompt = `You are the study assistant inside "Advanced Excel Walkthrough", a course guide for a student learning advanced Excel.\n` +
        `Answer the student's question using ONLY the guide content between the <guide> tags. Rules:\n` +
        `- If the guide does not cover the question, say so plainly and name the closest topic. Do not add Excel facts that are not in the guide.\n` +
        `- Be concise: under 140 words. Plain sentences, or short numbered steps when describing clicks.\n` +
        `- Write formulas exactly, wrapped in backticks. Use the guide's own example numbers when they help.\n` +
        `- End by naming where it is taught, written exactly like "Topic 6".\n` +
        `- No headings, no tables, no preamble.\n\n<guide>${CORPUS}\n</guide>\n\n` +
        (hist ? `Conversation so far:\n${hist}\n\n` : '') + `Student's question: ${q}`;
      const me = chat.length - 1;
      const res = await sample(prompt, { cache: false, onText: ({ text }) => { m.text = text; const el = $('#bot' + me); if (el && text) el.innerHTML = botHtml(text); } });
      m.text = res.text || m.text;
      if (!m.text) fallback();
      else m.links = searchIndex(q, 8).filter(x => x.e.kind !== 'FAQ' && x.e.t && new RegExp('Topic ' + x.e.t.n + '\\b').test(m.text)).slice(0, 2).map(x => x.e);
    } catch (e) {
      if (e && e.code === 'not_granted') { sample = null; botMode(); fallback(); }
      else if (e && e.code === 'rate_limited') fallback('Claude is busy right now, so here is the closest match from the guide.');
      else fallback('Claude could not answer just now, so here is the closest match from the guide.');
    }
  } else fallback();
  m.done = true; drawChat();
  const s2 = $('#send'); if (s2) s2.disabled = false;
}

/* ---------- navigation ---------- */
let view = 'home';
function rail() {
  $('#rail').innerHTML = `<h2>Course topics</h2><ol>${TOPICS.map(t => { const d = doneCount(t), s = scoreOf(t); return `<li><button type="button" data-go="${t.id}" ${view === t.id ? 'aria-current="page"' : ''}><span class="n">${String(t.n).padStart(2, '0')}</span><span>${esc(t.title)}</span><span class="sc${d === t.quiz.length && s === d ? ' done' : ''}">${d ? s + '/' + t.quiz.length : ''}</span></button></li>`; }).join('')}</ol>`;
  $('#indexBtn').toggleAttribute('aria-current', view === 'index'); if (view === 'index') $('#indexBtn').setAttribute('aria-current', 'page');
  $('#askBtn').toggleAttribute('aria-current', view === 'ask'); if (view === 'ask') $('#askBtn').setAttribute('aria-current', 'page');
}
function show(v, opts) {
  opts = opts || {};
  stopAudio();
  view = v;
  const t = byId(v), page = $('#page');
  if (t) page.innerHTML = topicPage(t);
  else if (v === 'index') page.innerHTML = indexPage();
  else if (v === 'ask') page.innerHTML = askPage();
  else if (v === 'search') page.innerHTML = searchPage(opts.q || '');
  else { view = 'home'; page.innerHTML = homePage(); }
  rail(); loadVoices();
  if (view === 'ask') { botMode(); drawChat(); }
  if (view !== 'search') { $('#search').value = ''; try { if (location.hash.slice(1) !== view) history.replaceState(null, '', '#' + view); } catch (e) { /* ignore */ } }
  $('#rail').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false');
  const target = opts.part === 'quiz' ? $('#quiz') : (opts.part !== undefined && opts.part !== '' && opts.part != null ? $('#p' + opts.part) : null);
  if (target) { try { target.scrollIntoView({ block: 'start' }); } catch (e) { /* ignore */ } }
  else if (!opts.keep) window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'homeBtn') return show('home');
  if (b.id === 'indexBtn') return show('index');
  if (b.id === 'askBtn') return show('ask');
  if (b.id === 'menuBtn') { const o = $('#rail').classList.toggle('open'); b.setAttribute('aria-expanded', o); return; }
  if (b.id === 'play') return togglePlay();
  if (b.id === 'stop') return stopAudio();
  if (b.id === 'retry') { const y = window.scrollY; store.quiz[view] = []; save(); show(view, { keep: true }); window.scrollTo(0, y); $('#quiz').scrollIntoView({ block: 'start' }); return; }
  if (b.dataset.speak) { const el = document.getElementById(b.dataset.speak); if (el) { if (audio.playing && audio.label === b.dataset.speak) stopAudio(); else speakEls([el], b.dataset.speak); } return; }
  if (b.dataset.ask) return ask(b.dataset.ask);
  if (b.dataset.kw) { $('#search').value = b.dataset.kw; return show('search', { q: b.dataset.kw }); }
  if (b.dataset.faq != null) { show('ask'); const d = $('#faq' + b.dataset.faq); if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); } return; }
  if (b.dataset.go) return show(b.dataset.go, { part: b.dataset.part });
  if (b.classList.contains('opt')) {
    const t = byId(view); if (!t) return;
    const y = window.scrollY;
    answers(t)[+b.dataset.q] = +b.dataset.o; save();
    show(view, { keep: true }); window.scrollTo(0, y);
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'rate') { store.rate = +e.target.value; save(); }
  if (e.target.id === 'voice') { store.voice = e.target.value; save(); }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'askform') { const i = $('#q'); const v = i.value; i.value = ''; ask(v); }
});
let st;
$('#search').addEventListener('input', e => {
  clearTimeout(st); const q = e.target.value;
  st = setTimeout(() => { if (q.trim().length >= 2) show('search', { q, keep: true }); else if (view === 'search') show('home'); }, 180);
});
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== view && (byId(h) || ['home', 'index', 'ask'].includes(h))) show(h); });
window.addEventListener('pagehide', () => { if (synth) synth.cancel(); });

const start = location.hash.slice(1);
show(byId(start) || ['index', 'ask'].includes(start) ? start : 'home');
if (STANDALONE && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ }); });
}
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('sample').then(s => { sample = s || null; botMode(); }).catch(() => {});
}
})();
