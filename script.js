(() => {
const $ = id => document.getElementById(id);
const pages = [...document.querySelectorAll('.page')];
const flash = $('flash');
let current = 1, locked = false;

/* ---------- navigation ---------- */
function go(n) {
  pages.forEach(p => p.classList.remove('active'));
  $('p' + n).classList.add('active');
  current = n;
  document.body.classList.toggle('show-clouds', n === 1 || n === 6 || n === 7);
  document.body.classList.toggle('scene7', n === 7);
  if (n === 7) enterLetter(); else stopConfetti();
}
function flashTo(n, ms = 500) {
  flash.classList.add('on');
  setTimeout(() => { go(n); flash.classList.remove('on'); }, ms);
}

/* ---------- pixel clouds ---------- */
const cloudRects = [[10,0,8,2],[6,2,14,2],[18,2,6,2],[2,4,26,2],[0,6,30,2]];
function cloudSVG() {
  const r = cloudRects.map(([x,y,w,h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>`).join('')
    + '<rect x="2" y="8" width="26" height="2" fill="#cfe9ff"/>';
  return `<svg viewBox="0 0 30 10" shape-rendering="crispEdges">${r}</svg>`;
}
function makeClouds() {
  const box = $('clouds');
  for (let i = 0; i < 7; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const w = 90 + Math.random() * 150;
    c.style.cssText = `top:${4 + Math.random() * 88}%;width:${w}px;opacity:${.55 + Math.random() * .4};animation-duration:${40 + Math.random() * 50}s;animation-delay:${-Math.random() * 60}s`;
    c.innerHTML = cloudSVG();
    c.firstChild.style.width = '100%';
    box.appendChild(c);
  }
  document.querySelectorAll('.sparks').forEach(s => {
    for (let i = 0; i < 6; i++) {
      const sp = document.createElement('span');
      sp.className = 'spark';
      sp.style.cssText = `left:${6 + Math.random() * 86}%;top:${6 + Math.random() * 80}%;animation-delay:${-Math.random() * 1.4}s`;
      s.appendChild(sp);
    }
  });
}

function makeHearts() {
  const box = $('hearts'), map = ['0110110','1111111','1111111','0111110','0011100','0001000'];
  const cols = ['#ff4f7b', '#ff8fb0', '#ffffff', '#ffd23f'];
  for (let i = 0; i < 16; i++) {
    const c = cols[i % 4];
    const rects = map.map((row, y) => [...row].map((v, x) => v === '1' ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>` : '').join('')).join('');
    const d = document.createElement('div'); d.className = 'heart';
    d.style.cssText = `left:${Math.random() * 96}%;--w:${16 + Math.random() * 26}px;--d:${7 + Math.random() * 7}s;--sx:${(Math.random() - .5) * 80}px;animation-delay:${-Math.random() * 12}s`;
    d.innerHTML = `<svg viewBox="0 0 7 6" shape-rendering="crispEdges" style="width:100%;display:block">${rects}</svg>`;
    box.appendChild(d);
  }
}
makeHearts();
makeClouds();
document.body.classList.add('show-clouds');

/* ---------- cover ---------- */
$('playBtn').onclick = () => go(2);

/* ---------- password ---------- */
function login() {
  const v = $('pwInput').value.trim().toLowerCase();
  if (v === 'lamentus') { $('pwErr').textContent = ''; go(3); startPortal(); }
  else {
    $('pwErr').textContent = v ? 'WRONG PASSWORD!' : 'TYPE THE PASSWORD!';
    const p = document.querySelector('#p2 .panel');
    p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
  }
}
$('loginBtn').onclick = login;
$('pwInput').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

/* ---------- portal ---------- */
const cv = $('portal'), cx = cv.getContext('2d');
const W = cv.width, H = cv.height;
const swirl = ['#0a1fd8', '#2457ff', '#14b8ff', '#6a2cff', '#a24dff', '#ffffff'];
const stone = ['#2b2b33', '#3a3a45', '#4b4b58', '#1f1f26'];
let pT = 0, pSpeed = 1, portalRAF = null, lastDraw = 0;
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function drawPortal(ts) {
  portalRAF = requestAnimationFrame(drawPortal);
  if (ts - lastDraw < 80) return;
  lastDraw = ts; pT += .08 * pSpeed;
  cx.clearRect(0, 0, W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x - W / 2 + .5) / (W / 2), ny = (y - H / 2 + .5) / (H / 2);
    const d = nx * nx + ny * ny;
    if (d > 1) continue;
    let col;
    if (d > .78) {
      col = stone[Math.floor(hash(x, y) * 4)];
      if (d > .78 && d < .84) col = '#ffffff';
      const gem = (Math.abs(nx) < .12 && Math.abs(ny) > .9) || (Math.abs(ny) < .1 && Math.abs(nx) > .9);
      if (gem) col = '#a24dff';
    } else {
      const r = Math.sqrt(d), a = Math.atan2(ny, nx);
      const v = Math.sin(a * 3 + r * 11 - pT * 3) + Math.sin(r * 18 - pT * 2) * .5;
      let i = Math.floor(((v + 1.5) / 3) * 5);
      if (r < .12) i = 5;
      col = swirl[Math.max(0, Math.min(5, i))];
    }
    cx.fillStyle = col; cx.fillRect(x, y, 1, 1);
  }
}
function startPortal() { if (!portalRAF) portalRAF = requestAnimationFrame(drawPortal); }

const leds = $('leds'), pbtns = $('pbtns'), knob = $('knob'), track = $('track'), status = $('status');
const ledState = Array(6).fill(false);
for (let i = 0; i < 6; i++) {
  const l = document.createElement('div'); l.className = 'led'; leds.appendChild(l);
  const b = document.createElement('button'); b.className = 'pbtn'; b.setAttribute('aria-label', 'button ' + (i + 1));
  b.onclick = () => {
    if (portalOpened) return;
    ledState[i] = !ledState[i];
    l.classList.toggle('on', ledState[i]);
    b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140);
    refreshStatus();
  };
  pbtns.appendChild(b);
}
const allGreen = () => ledState.every(Boolean);
function refreshStatus() {
  if (allGreen()) { status.textContent = 'ALL GREEN! NOW PULL THE LEVER DOWN!'; knob.classList.add('ready'); pSpeed = 2.5; }
  else { status.textContent = 'PRESS THE BUTTONS: ALL LIGHTS MUST BE GREEN'; knob.classList.remove('ready'); pSpeed = 1; }
}
let dragging = false, startY = 0, moved = 0, portalOpened = false;
const maxY = () => track.clientHeight - knob.offsetHeight - 6;
function setKnob(y) { knob.style.top = Math.max(0, Math.min(maxY(), y)) + 'px'; }
knob.addEventListener('pointerdown', e => {
  if (portalOpened) return;
  if (!allGreen()) {
    status.textContent = 'LOCKED! TURN ALL LIGHTS GREEN FIRST';
    knob.classList.remove('nope'); void knob.offsetWidth; knob.classList.add('locked', 'nope');
    return;
  }
  dragging = true; startY = e.clientY; moved = 0; knob.setPointerCapture(e.pointerId);
});
knob.addEventListener('pointermove', e => {
  if (!dragging) return;
  const rect = track.getBoundingClientRect();
  moved = Math.max(moved, Math.abs(e.clientY - startY));
  setKnob(e.clientY - rect.top - knob.offsetHeight / 2);
});
knob.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;
  const pulled = parseFloat(knob.style.top || 0) >= maxY() * .85;
  if (pulled || moved < 6) openPortal(); else setKnob(0);
});
function openPortal() {
  if (portalOpened) return;
  portalOpened = true; knob.classList.remove('ready');
  setKnob(maxY()); pSpeed = 6;
  const scene = document.querySelector('.portal-scene'), pe = $('portal');
  scene.classList.add('opening');
  const r = pe.getBoundingClientRect();
  pe.style.setProperty('--tx', (innerWidth / 2 - (r.left + r.width / 2)) + 'px');
  pe.style.setProperty('--ty', (innerHeight / 2 - (r.top + r.height / 2)) + 'px');
  setTimeout(() => pe.classList.add('center'), 350);
  setTimeout(() => pe.classList.add('enter'), 1100);
  setTimeout(() => flash.classList.add('on'), 2300);
  setTimeout(() => { go(4); flash.classList.remove('on'); resetPortal(); }, 2900);
}
function resetPortal() {
  portalOpened = false; ledState.fill(false);
  document.querySelectorAll('.led').forEach(l => l.classList.remove('on'));
  $('portal').classList.remove('enter','center'); document.querySelector('.portal-scene').classList.remove('opening'); knob.classList.remove('locked'); setKnob(0); pSpeed = 1; refreshStatus();
}

/* ---------- page 4 ---------- */
const no4 = $('no4'), yes4 = $('yes4');
let ph4 = null;
function hopNo(e) {
  e.preventDefault();
  const r = no4.getBoundingClientRect();
  if (!ph4) {
    ph4 = document.createElement('span');
    ph4.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px`;
    no4.parentNode.insertBefore(ph4, no4);
    no4.classList.add('moving');
    no4.style.left = r.left + 'px'; no4.style.top = r.top + 'px';
  }
  const yr = yes4.getBoundingClientRect(), w = r.width, h = r.height;
  let nx, ny, tries = 0;
  do {
    nx = 8 + Math.random() * (innerWidth - w - 16);
    ny = 8 + Math.random() * (innerHeight - h - 16);
    tries++;
  } while (tries < 40 && (
    (nx < yr.right + 20 && nx + w > yr.left - 20 && ny < yr.bottom + 20 && ny + h > yr.top - 20) ||
    Math.hypot(nx - r.left, ny - r.top) < 120));
  no4.style.left = nx + 'px'; no4.style.top = ny + 'px';
}
no4.addEventListener('pointerdown', hopNo);
no4.addEventListener('click', e => e.preventDefault());
yes4.onclick = () => {
  no4.classList.remove('moving'); no4.style.left = no4.style.top = '';
  if (ph4) { ph4.remove(); ph4 = null; }
  go(5);
};

/* ---------- page 5 ---------- */
const box5 = $('choices5'), noA = $('noA'), noB = $('noB'), yes5 = $('yes5');
const tease = $('tease');
const teases = ['REALLY?', 'ARE YOU SURE?', 'THINK AGAIN...', 'HMM, REALLY REALLY?', 'LAST CHANCE TO CHANGE YOUR MIND!', 'YOU CAN\'T BE SERIOUS...'];
let teaseI = 0;
function say(t) { tease.textContent = t; tease.classList.remove('say'); void tease.offsetWidth; tease.classList.add('say'); }
const cnt = new Map([[noA, 0], [noB, 0]]); const MAX5 = 5;
function growNo(btn) {
  const n = cnt.get(btn);
  if (n >= MAX5) return;
  cnt.set(btn, n + 1);
  say(teases[Math.min(teaseI++, teases.length - 1)]);
  btn.style.setProperty('--s', n + 1);
  box5.style.setProperty('--cs', Math.max(cnt.get(noA), cnt.get(noB)));
  if (n + 1 >= MAX5) {
    burst(btn);
    setTimeout(() => {
      if (yes5.classList.contains('hidden')) {
        box5.insertBefore(yes5, btn);
        yes5.classList.remove('hidden'); yes5.classList.add('pop-in');
        say('I KNEW IT!');
      }
      btn.classList.add('hidden');
      box5.style.setProperty('--cs', Math.max(...[noA, noB].filter(b => !b.classList.contains('hidden')).map(b => cnt.get(b)), 0));
    }, 250);
  }
}
function burst(el) {
  const r = el.getBoundingClientRect(), cx0 = r.left + r.width / 2, cy0 = r.top + r.height / 2;
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('div'); s.className = 'shard';
    const a = (i / 18) * Math.PI * 2, d = 80 + Math.random() * 120;
    s.style.cssText = `left:${cx0}px;top:${cy0}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${['#e5493f', '#fde0dc', '#ffd23f'][i % 3]}`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}
noA.onclick = () => growNo(noA);
noB.onclick = () => growNo(noB);
yes5.onclick = () => { go(6); resetTaps(); };

/* ---------- envelopes ---------- */
const LETTER = `Happy 1st Anniversary, Lamentus!!! It's been an incredible year watching you all shine and bring so much joy to everyone. Here's to many more years of amazing milestones and unforgettable memories. Thank you for all your hard work, dedication, and the amazing content/music you've shared with us!!`;
function envHTML() {
  return `<div class="env-back"></div><div class="letter"><p>${LETTER}</p><hr></div><div class="env-front"></div><div class="flap"></div><div class="seal"><b></b></div>`;
}
$('env6').innerHTML = envHTML();
$('env7').innerHTML = envHTML();

/* ---------- page 6 ---------- */
const env6 = $('env6'), hint = $('tapHint'); let taps = 0; const NEED = 5;
function resetTaps() { taps = 0; locked = false; hint.textContent = `TAP THE LETTER ${NEED} TIMES`; env6.classList.add('tilt'); }
env6.addEventListener('click', () => {
  if (locked) return;
  taps++;
  env6.classList.remove('shaking', 'tilt'); void env6.offsetWidth; env6.classList.add('shaking');
  if (taps >= NEED) {
    locked = true; hint.textContent = 'IT OPENS!';
    setTimeout(() => flashTo(7, 450), 450);
  } else hint.textContent = `TAP ${NEED - taps} MORE TIME${NEED - taps > 1 ? 'S' : ''}!`;
});

/* ---------- page 7 ---------- */
function enterLetter() {
  const e = $('env7'), home = $('homeBtn');
  e.classList.remove('go'); home.classList.remove('show');
  void e.offsetWidth;
  setTimeout(() => e.classList.add('go'), 400);
  setTimeout(startConfetti, 900);
  setTimeout(() => home.classList.add('show'), 2600);
}
$('homeBtn').onclick = () => {
  stopConfetti();
  [noA, noB].forEach(b => { cnt.set(b, 0); b.style.setProperty('--s', 0); });
  box5.style.setProperty('--cs', 0); box5.appendChild(yes5);
  teaseI = 0; tease.textContent = ''; tease.classList.remove('say');
  noA.classList.remove('hidden'); noB.classList.remove('hidden');
  yes5.classList.add('hidden'); yes5.classList.remove('pop-in');
  $('pwInput').value = '';
  go(1);
};

/* ---------- confetti ---------- */
const cc = $('confetti'), ctx = cc.getContext('2d');
let parts = [], confRAF = null, spawnTill = 0;
const colors = ['#ff5d8f', '#ffd23f', '#6bd6ff', '#7dff9b', '#b080ff', '#ffffff', '#ff9a3c'];
function fit() { cc.width = innerWidth; cc.height = innerHeight; }
addEventListener('resize', fit); fit();
function spawn(n) {
  for (let i = 0; i < n; i++) parts.push({
    x: Math.random() * cc.width, y: -10 - Math.random() * 40,
    vx: (Math.random() - .5) * 2.5, vy: 2 + Math.random() * 3.5,
    s: 6 + Math.floor(Math.random() * 3) * 3, c: colors[Math.floor(Math.random() * colors.length)], sw: Math.random() * 6
  });
}
function tick(ts) {
  ctx.clearRect(0, 0, cc.width, cc.height);
  if (ts < spawnTill) spawn(3);
  parts.forEach(p => { p.sw += .1; p.x += p.vx + Math.sin(p.sw) * .8; p.y += p.vy; ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); });
  parts = parts.filter(p => p.y < cc.height + 20);
  if (parts.length || ts < spawnTill) confRAF = requestAnimationFrame(tick); else confRAF = null;
}
function startConfetti() {
  if (current !== 7) return;
  spawnTill = performance.now() + 6000; spawn(120);
  if (!confRAF) confRAF = requestAnimationFrame(tick);
}
function stopConfetti() {
  spawnTill = 0; parts = []; if (confRAF) { cancelAnimationFrame(confRAF); confRAF = null; }
  ctx.clearRect(0, 0, cc.width, cc.height);
}
resetTaps();
})();