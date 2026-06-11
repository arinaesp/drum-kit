// ── Sound Map ──────────────────────────────────────────────────
const SOUND_MAP = {
  w: 'sounds/tom-1.mp3',
  a: 'sounds/tom-2.mp3',
  s: 'sounds/tom-3.mp3',
  d: 'sounds/tom-4.mp3',
  j: 'sounds/crash.mp3',
  k: 'sounds/kick-bass.mp3',
  l: 'sounds/snare.mp3',
};

const SOUND_LABELS = {
  w: 'Tom 1', a: 'Tom 2', s: 'Tom 3', d: 'Tom 4',
  j: 'Crash',  k: 'Kick',  l: 'Snare',
};

// ── Audio Pool (new Audio() works reliably on file://) ─────────
// Pool of 4 per sound so rapid re-triggers don't cut each other off.
const POOL_SIZE = 4;
const pool      = {};
const poolIdx   = {};
let   vol       = 0.8;
let   reverbOn  = false;

Object.entries(SOUND_MAP).forEach(([key, path]) => {
  pool[key]    = Array.from({ length: POOL_SIZE }, () => new Audio(path));
  poolIdx[key] = 0;
});

function playSound(key, volume) {
  const v  = volume !== undefined ? volume : vol;
  const el = pool[key][poolIdx[key]];
  el.volume      = Math.min(1, Math.max(0, v));
  el.currentTime = 0;
  el.play().catch(() => {});
  poolIdx[key] = (poolIdx[key] + 1) % POOL_SIZE;
  triggerViz(key);

  // Reverb = two decaying echoes
  if (reverbOn && v > 0.05) {
    setTimeout(() => playSound(key, v * 0.36), 115);
    setTimeout(() => playSound(key, v * 0.13), 250);
  }
}

// ── Visualizer (energy model — no Web Audio API needed) ────────
const canvas = document.getElementById('visualizer');
const ctx2d  = canvas.getContext('2d');

const VIZ_BARS = 64;
const energy   = new Float32Array(VIZ_BARS).fill(0);

// Each drum lights up a characteristic frequency band
const drumBars = {
  k: [0,  14],   // kick  — sub-bass
  l: [5,  24],   // snare — low-mid
  w: [8,  26],   // tom 1
  a: [10, 30],   // tom 2
  s: [13, 34],   // tom 3
  d: [16, 38],   // tom 4
  j: [0,  64],   // crash — full spectrum
};

function triggerViz(key) {
  const [lo, hi] = drumBars[key] || [0, 32];
  for (let i = lo; i < hi; i++)
    energy[i] = Math.min(1, energy[i] + 0.45 + Math.random() * 0.55);
}

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawViz() {
  requestAnimationFrame(drawViz);
  for (let i = 0; i < VIZ_BARS; i++) energy[i] *= 0.85;

  const W = canvas.width, H = canvas.height;
  ctx2d.fillStyle = '#10101e';
  ctx2d.fillRect(0, 0, W, H);

  const bw = W / VIZ_BARS;
  for (let i = 0; i < VIZ_BARS; i++) {
    const t = energy[i];
    if (t < 0.01) continue;
    const bh = t * H;
    // pink (low) → cyan (high)
    const r = Math.round(224 - 224 * t);
    const g = Math.round(4   + 208 * t);
    const b = Math.round(122 + 133 * t);
    ctx2d.fillStyle = `rgb(${r},${g},${b})`;
    ctx2d.fillRect(i * bw, H - bh, bw - 1, bh);
  }
}
drawViz();

// ── Pad Animation ──────────────────────────────────────────────
function flashPad(key) {
  const btn = document.querySelector(`.drum[data-sound="${key}"]`);
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 140);
}

// ── Drum Pad Interactions ──────────────────────────────────────
document.querySelectorAll('.drum').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    const key = btn.dataset.sound;
    playSound(key);
    flashPad(key);
  });
});

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  if (SOUND_MAP[e.key]) {
    playSound(e.key);
    flashPad(e.key);
  }
});

// ── Controls ───────────────────────────────────────────────────
const volSlider  = document.getElementById('volume');
const bpmSlider  = document.getElementById('bpm');
const bpmDisplay = document.getElementById('bpm-display');
const reverbBtn  = document.getElementById('reverb-toggle');

volSlider.addEventListener('input', () => { vol = parseFloat(volSlider.value); });

bpmSlider.addEventListener('input', () => {
  bpmDisplay.textContent = bpmSlider.value;
  if (isPlaying) { stopSeq(); startSeq(); }
});

reverbBtn.addEventListener('click', () => {
  reverbOn = !reverbOn;
  reverbBtn.textContent = reverbOn ? 'ON' : 'OFF';
  reverbBtn.classList.toggle('active', reverbOn);
});

// ── Step Sequencer ─────────────────────────────────────────────
const KEYS  = ['w', 'a', 's', 'd', 'j', 'k', 'l'];
const STEPS = 16;

const grid = {};
KEYS.forEach(k => { grid[k] = new Array(STEPS).fill(false); });

let step      = 0;
let isPlaying = false;
let timer     = null;

// Build grid DOM
const seqGrid = document.getElementById('seq-grid');

KEYS.forEach(key => {
  const row     = document.createElement('div');
  row.className = 'seq-row';

  const lbl         = document.createElement('div');
  lbl.className     = 'seq-row-label';
  lbl.textContent   = SOUND_LABELS[key];

  const stepsEl     = document.createElement('div');
  stepsEl.className = 'seq-steps';

  for (let i = 0; i < STEPS; i++) {
    const cell         = document.createElement('button');
    cell.className     = 'seq-step';
    cell.dataset.key   = key;
    cell.dataset.step  = i;
    cell.addEventListener('click', () => {
      grid[key][i] = !grid[key][i];
      cell.classList.toggle('active', grid[key][i]);
    });
    stepsEl.appendChild(cell);
  }

  row.appendChild(lbl);
  row.appendChild(stepsEl);
  seqGrid.appendChild(row);
});

function getCell(key, i) {
  return seqGrid.querySelector(`.seq-step[data-key="${key}"][data-step="${i}"]`);
}

function tick() {
  const prev = (step - 1 + STEPS) % STEPS;
  KEYS.forEach(k => {
    getCell(k, prev)?.classList.remove('cursor');
    getCell(k, step)?.classList.add('cursor');
    if (grid[k][step]) {
      playSound(k);
      flashPad(k);
    }
  });
  step = (step + 1) % STEPS;
}

function startSeq() {
  const ms  = (60000 / parseInt(bpmSlider.value)) / 4;
  isPlaying = true;
  document.getElementById('play-seq').classList.add('active');
  tick();
  timer = setInterval(tick, ms);
}

function stopSeq() {
  clearInterval(timer);
  timer     = null;
  isPlaying = false;
  step      = 0;
  document.getElementById('play-seq').classList.remove('active');
  KEYS.forEach(k => {
    for (let i = 0; i < STEPS; i++) getCell(k, i)?.classList.remove('cursor');
  });
}

document.getElementById('play-seq').addEventListener('click', () => {
  isPlaying ? stopSeq() : startSeq();
});
document.getElementById('stop-seq').addEventListener('click', stopSeq);
document.getElementById('clear-seq').addEventListener('click', () => {
  KEYS.forEach(k => {
    grid[k].fill(false);
    for (let i = 0; i < STEPS; i++) {
      const cell = getCell(k, i);
      if (cell) cell.classList.remove('active');
    }
  });
});
