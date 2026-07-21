// ---- edition data comes from window.EDITIONS, populated by the small
// per-edition files in assets/js/editions/ (loaded before this file). ----
const editions = window.EDITIONS || [];

const grid = document.getElementById('editions-grid');
editions.forEach(ed => {
  const card = document.createElement('div');
  card.className = 'ed-card';
  card.innerHTML = `
    <div class="ed-cover">
      <span class="ed-tag">${ed.tag}</span>
      <img src="${ed.cover}" alt="${ed.title}">
    </div>
    <h3>${ed.title.split('—')[1] || ed.title}</h3>
    <p class="ed-date">${ed.date}</p>
    <div class="ed-actions">
      <button class="btn btn-primary" data-open-reader="${ed.id}">Ler</button>
      <a class="btn btn-ghost" href="${ed.pdf}" download="${ed.filename}">Baixar</a>
    </div>
  `;
  grid.appendChild(card);
});

const soon = document.createElement('div');
soon.className = 'ed-card soon';
soon.innerHTML = `<div class="icon">🗞️</div><h3>Próxima edição</h3><p>Em breve, novidades por aqui!</p>`;
grid.appendChild(soon);

// ---- render a full edition "page" into the homepage: hero, sticker
// callouts, ticker headlines, preview grid and the music player all
// switch to that edition's own content. This is what makes each month's
// launch page a permanent, revisitable thing instead of a one-shot
// homepage that gets overwritten. ----
function renderEdition(ed){
  document.getElementById('edition-badge-text').textContent = ed.badge;
  document.getElementById('edition-lead').innerHTML = ed.lead;
  document.getElementById('hero-cover').src = ed.cover;
  document.getElementById('hero-cover').alt = ed.title;
  document.getElementById('sticker-top').innerHTML = ed.stickerTop;
  document.getElementById('sticker-bottom').innerHTML = ed.stickerBottom;

  const tickerHTML = ed.ticker.map(t => `<span>${t}</span>`).join('');
  document.getElementById('ticker-track').innerHTML = tickerHTML + tickerHTML;

  document.getElementById('preview-eyebrow').textContent = ed.previewEyebrow;
  document.getElementById('preview-title').innerHTML = ed.previewTitle;
  document.getElementById('preview-sub').textContent = ed.previewSub;
  document.getElementById('preview-grid').innerHTML = ed.preview.map(p => `
    <div class="clip"><div class="thumb"><img src="${p.img}"></div><h3><span class="pin"></span>${p.title}</h3><p>${p.desc}</p></div>
  `).join('');

  document.getElementById('hero-read-btn').setAttribute('data-open-reader', ed.id);
  const dl = document.getElementById('hero-download');
  dl.href = ed.pdf;
  dl.setAttribute('download', ed.filename);

  document.querySelectorAll('.side-nav-item').forEach(el => el.classList.toggle('is-viewing', el.dataset.ed === ed.id));

  if (ed.playlist && ed.playlist.length) renderPlayer(ed);
}

// ---- side nav: quick access to every past edition, by month ----
// Newest first, so this month's launch never gets buried once a future
// edition replaces it as the homepage's featured edition. Clicking a
// month brings back that whole edition's page — not just the PDF.
const sideList = document.getElementById('side-nav-list');
editions.slice().reverse().forEach(ed => {
  const parts = ed.date.split('·');
  const editionLabel = (parts[0] || '').trim();
  const monthLabel = (parts[1] || ed.date).trim();
  const item = document.createElement('button');
  item.type = 'button';
  item.dataset.ed = ed.id;
  item.className = 'side-nav-item' + (ed.current ? ' is-current' : '');
  item.innerHTML = `
    <img src="${ed.cover}" alt="">
    <span class="m">${monthLabel}<small>${editionLabel}</small></span>
  `;
  item.addEventListener('click', () => {
    renderEdition(ed);
    document.getElementById('side-nav').classList.add('collapsed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  sideList.appendChild(item);
});
document.getElementById('side-nav-tab').addEventListener('click', () => {
  document.getElementById('side-nav').classList.toggle('collapsed');
});

// ---- music player (Spotify iFrame API — official, licensed, and lets us
// detect when a track ends so we can auto-advance to the next one) ----
// There is only ONE real Spotify player (mainController, in the "Trilha
// sonora" section). The mini bar at the top is plain HTML/CSS, not a
// second embed — it just shows the current track and sends play/pause/
// next/prev commands to that same controller. Two embeds loading the
// same track used to mean two audio streams playing over each other.
let currentEd = null;
let currentTrackIndex = 0;
let pendingIndex = null;
let mainController = null;
let trackGeneration = 0;
let endTimer = null;

function highlightTrack(i){
  document.querySelectorAll('#tracklist .track-btn').forEach((b, idx) => b.classList.toggle('active', idx === i));
}

function updateMiniTrack(t){
  document.getElementById('mini-track-title').textContent = t ? t.title : '—';
  document.getElementById('mini-track-artist').textContent = (currentEd && currentEd.artist) || '—';
}

// Belt-and-suspenders auto-advance: Spotify's "paused at the end" event
// isn't always reliable, so alongside listening for it, we keep a timer
// synced to the track's own reported duration/position and force the
// next track once that time is up — this is what actually guarantees
// the playlist advances instead of stalling or looping the same song.
function scheduleEndTimer(remainingMs){
  if (endTimer) clearTimeout(endTimer);
  const myGen = trackGeneration;
  endTimer = setTimeout(() => {
    if (myGen === trackGeneration) playNextTrack();
  }, Math.max(remainingMs, 300) + 800);
}

function playTrackAt(i){
  if (!currentEd || !currentEd.playlist[i]) return;
  if (!mainController){ pendingIndex = i; return; }
  currentTrackIndex = i;
  trackGeneration++;
  if (endTimer) { clearTimeout(endTimer); endTimer = null; }
  highlightTrack(i);
  updateMiniTrack(currentEd.playlist[i]);
  const uri = 'spotify:track:' + currentEd.playlist[i].spotifyId;
  mainController.loadUri(uri);
  mainController.play();
}

function playNextTrack(){
  if (!currentEd || !currentEd.playlist.length) return;
  playTrackAt((currentTrackIndex + 1) % currentEd.playlist.length);
}

function tryInitialPlay(){
  if (!mainController || !currentEd) return;
  playTrackAt(pendingIndex !== null ? pendingIndex : 0);
  pendingIndex = null;
}

function renderPlayer(ed){
  currentEd = ed;
  currentTrackIndex = 0;
  const list = document.getElementById('tracklist');
  list.innerHTML = '';
  ed.playlist.forEach((t, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'track-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span> ${t.title}`;
    btn.addEventListener('click', () => playTrackAt(i));
    li.appendChild(btn);
    list.appendChild(li);
  });
  document.querySelectorAll('.player-tab').forEach(t => t.classList.toggle('active', t.dataset.ed === ed.id));
  if (mainController) playTrackAt(0);
}

document.getElementById('mini-prev').addEventListener('click', () => {
  if (!currentEd || !currentEd.playlist.length) return;
  playTrackAt((currentTrackIndex - 1 + currentEd.playlist.length) % currentEd.playlist.length);
});
document.getElementById('mini-next').addEventListener('click', () => playNextTrack());
document.getElementById('mini-toggle').addEventListener('click', () => {
  if (mainController) mainController.togglePlay();
});

const playerTabs = document.getElementById('player-tabs');
const withPlaylist = editions.filter(ed => ed.playlist && ed.playlist.length);
if (withPlaylist.length > 1) {
  withPlaylist.forEach(ed => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'player-tab';
    tab.dataset.ed = ed.id;
    tab.textContent = ed.date.split('·').pop().trim();
    tab.addEventListener('click', () => renderPlayer(ed));
    playerTabs.appendChild(tab);
  });
}
if (withPlaylist.length) {
  document.getElementById('mini-player').style.display = 'block';
}

// ---- initial paint: show whichever edition is marked "current" ----
const currentEdition = editions.find(ed => ed.current) || editions[editions.length - 1];
if (currentEdition) renderEdition(currentEdition);

// Spotify's iFrame API loads asynchronously and calls window.onSpotifyIframeApiReady
// once ready — the shim that queues callbacks is defined inline at the top of
// index.html (it has to run before the external, async Spotify script does).
whenSpotifyReady(function(IFrameAPI){
  IFrameAPI.createController(document.getElementById('player-embed'), { width: '100%', height: '152' }, function(ctrl){
    mainController = ctrl;
    let wasPlaying = false;
    ctrl.addListener('playback_update', e => {
      const d = e.data;
      if (!d.isPaused && !d.isBuffering) wasPlaying = true;

      document.getElementById('mini-toggle').textContent = d.isPaused ? '▶' : '⏸';

      // Primary path: keep a timer synced to how much of the track is
      // actually left, so the next track loads on schedule even if
      // Spotify never reports a clean "paused at the end" state (it can
      // loop the preview instead of stopping, in which case this timer
      // is the only thing that will ever advance the playlist).
      if (!d.isPaused && !d.isBuffering && d.duration > 0) {
        scheduleEndTimer(d.duration - d.position);
      }

      // Secondary path: if Spotify DOES pause right at the end, jump
      // ahead immediately instead of waiting for the timer.
      const nearEnd = d.duration > 0 && d.position >= d.duration - 1200;
      if (wasPlaying && d.isPaused && !d.isBuffering && nearEnd) {
        wasPlaying = false;
        playNextTrack();
      }
    });
    tryInitialPlay();
  });
});

// ---- reader modal: 3D page-flip when the edition has rendered page
// images (ed.pages), falling back to the plain embedded PDF otherwise ----
const overlay = document.getElementById('reader-overlay');
const body = document.getElementById('reader-body');
const titleEl = document.getElementById('reader-title');
const dlEl = document.getElementById('reader-download');
let readerFlip = null;
let readerZoom = 1;
const READER_ZOOM_STEP = 0.25;
const READER_ZOOM_MIN = 1;
const READER_ZOOM_MAX = 2.5;

function destroyReaderFlip(){
  if (readerFlip) {
    try { readerFlip.destroy(); } catch (e) {}
    readerFlip = null;
  }
}

function applyReaderZoom(){
  const wrap = body.querySelector('.reader-flip-wrap');
  if (wrap) wrap.style.transform = `scale(${readerZoom})`;
  const label = document.getElementById('reader-zoom-label');
  if (label) label.textContent = Math.round(readerZoom * 100) + '%';
  const zoomOut = document.getElementById('reader-zoom-out');
  const zoomIn = document.getElementById('reader-zoom-in');
  if (zoomOut) zoomOut.classList.toggle('disabled', readerZoom <= READER_ZOOM_MIN);
  if (zoomIn) zoomIn.classList.toggle('disabled', readerZoom >= READER_ZOOM_MAX);
  // The "grab and drag to pan" layer only needs to intercept the mouse once
  // there's actually somewhere to pan to — at 100% it stays inactive so
  // clicking/dragging the page still turns it normally.
  const panLayer = document.getElementById('reader-pan-layer');
  if (panLayer) panLayer.classList.toggle('active', readerZoom > READER_ZOOM_MIN);
}

// Wraps the book the same way for every reader view (cover or content
// spread): a scrollable viewport so that once zoomed in, the page can be
// panned by dragging the scrollbars / trackpad / mouse wheel, plus an inner
// wrap that gets scaled via CSS transform for the zoom itself. transform
// (not the "zoom" CSS property) is used deliberately — it doesn't change the
// box the page-flip library measures to size itself, so zooming never
// confuses its own layout math. The nav arrows are passed in separately and
// rendered OUTSIDE the scaled/scrollable area, so they stay put — a fixed
// size, fixed position — no matter the zoom level or scroll position.
// reader-pan-layer sits on top of everything while zoomed in: a transparent
// "grab and drag" surface that scrolls the viewport directly, instead of
// making people hunt for scrollbars (or fight the page-flip library, which
// otherwise treats the same drag as a page-turn gesture).
function readerShell(bookHTML, arrowsHTML){
  return `<div class="reader-zoom-viewport"><div class="reader-flip-wrap">${bookHTML}</div></div><div class="reader-pan-layer" id="reader-pan-layer"></div>${arrowsHTML}`;
}

// Pan (drag-to-scroll while zoomed) state lives at module scope and the
// window-level mousemove/mouseup listeners are attached exactly once — the
// pan layer itself gets destroyed and recreated on every view change, but
// these don't, so re-registering them per view would leak a new pair every
// time the reader opens.
let panDragging = false;
let panStartX = 0, panStartY = 0, panStartLeft = 0, panStartTop = 0;

function beginPan(clientX, clientY){
  const viewport = body.querySelector('.reader-zoom-viewport');
  if (!viewport) return;
  panDragging = true;
  panStartX = clientX; panStartY = clientY;
  panStartLeft = viewport.scrollLeft; panStartTop = viewport.scrollTop;
  const panLayer = document.getElementById('reader-pan-layer');
  if (panLayer) panLayer.classList.add('grabbing');
}
function movePan(clientX, clientY){
  if (!panDragging) return;
  const viewport = body.querySelector('.reader-zoom-viewport');
  if (!viewport) return;
  viewport.scrollLeft = panStartLeft - (clientX - panStartX);
  viewport.scrollTop = panStartTop - (clientY - panStartY);
}
function endPan(){
  panDragging = false;
  const panLayer = document.getElementById('reader-pan-layer');
  if (panLayer) panLayer.classList.remove('grabbing');
}
window.addEventListener('mousemove', (e) => movePan(e.clientX, e.clientY));
window.addEventListener('mouseup', endPan);
window.addEventListener('touchmove', (e) => { if (panDragging && e.touches[0]) movePan(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchend', endPan);

// Called once per fresh view (the pan layer element itself is recreated
// each time, so its own listeners never accumulate).
function wirePanLayer(){
  const panLayer = document.getElementById('reader-pan-layer');
  if (!panLayer) return;
  panLayer.addEventListener('mousedown', (e) => { beginPan(e.clientX, e.clientY); e.preventDefault(); });
  panLayer.addEventListener('touchstart', (e) => { if (e.touches[0]) beginPan(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
}

// The cover and the last page are just regular pages in the same flip book
// as everything else — same drag-to-turn, same arrows, same real page-turn
// animation. The one thing to work around: the page-flip library always
// lays pages out in two-page-wide spreads, and a page with no partner (a
// cover at either end) has nothing to visually animate against, which reads
// as an abrupt swap instead of a page turning. ed.pages already pairs a
// plain, unlabeled filler page against the cover and the back cover for
// exactly this reason — see the edition data file — so every position has a
// real partner to flip against, and the extra page reads as a blank inside
// cover (normal in printed magazines) rather than as a second "content"
// page competing for attention.
function showBook(ed){
  destroyReaderFlip();
  body.innerHTML = readerShell(
    `<div id="reader-book"></div>`,
    `<div class="reader-arrow prev" id="reader-prev" title="Página anterior">&#8592;</div>
     <div class="reader-arrow next" id="reader-next" title="Próxima página">&#8594;</div>`
  );
  readerZoom = 1;
  applyReaderZoom();
  wirePanLayer();

  readerFlip = new St.PageFlip(document.getElementById('reader-book'), {
    width: 460,
    height: 651,
    size: 'stretch',
    minWidth: 240,
    maxWidth: 1400,
    minHeight: 340,
    maxHeight: 2000,
    maxShadowOpacity: 0.6,
    showCover: false,
    mobileScrollSupport: false,
    usePortrait: true,
    disableFlipByClick: false
  });
  readerFlip.loadFromImages(ed.pages);

  const prevBtn = document.getElementById('reader-prev');
  const nextBtn = document.getElementById('reader-next');
  const total = ed.pages.length;
  function updateArrows(){
    const idx = readerFlip.getCurrentPageIndex();
    prevBtn.classList.toggle('disabled', idx <= 0);
    nextBtn.classList.toggle('disabled', idx >= total - 1);
  }
  readerFlip.on('flip', updateArrows);
  prevBtn.addEventListener('click', () => readerFlip.flipPrev());
  nextBtn.addEventListener('click', () => readerFlip.flipNext());
  updateArrows();
}

function openReader(id){
  const ed = editions.find(e => e.id === id) || editions[0];
  if (!ed) return;
  titleEl.textContent = ed.title;
  dlEl.href = ed.pdf;
  dlEl.setAttribute('download', ed.filename);
  destroyReaderFlip();

  if (ed.pages && ed.pages.length > 1) {
    showBook(ed);
  } else {
    body.innerHTML = `<iframe src="${ed.pdf}" title="${ed.title}"></iframe>
      <noscript><div class="reader-fallback">Seu navegador bloqueou a pré-visualização. Use o botão de download acima.</div></noscript>`;
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeReader(){
  if (document.fullscreenElement) document.exitFullscreen();
  overlay.classList.remove('open');
  destroyReaderFlip();
  body.innerHTML = '';
  document.body.style.overflow = '';
}
document.getElementById('reader-zoom-in').addEventListener('click', () => {
  readerZoom = Math.min(READER_ZOOM_MAX, readerZoom + READER_ZOOM_STEP);
  applyReaderZoom();
});
document.getElementById('reader-zoom-out').addEventListener('click', () => {
  readerZoom = Math.max(READER_ZOOM_MIN, readerZoom - READER_ZOOM_STEP);
  applyReaderZoom();
});
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-open-reader]');
  if (trigger){ openReader(trigger.getAttribute('data-open-reader')); }
});
document.getElementById('reader-close').addEventListener('click', closeReader);
// Deliberately no "click outside closes" handler — it was closing the
// reader on accidental clicks while browsing the magazine.
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeReader(); });

document.getElementById('reader-fullscreen').addEventListener('click', () => {
  const panel = document.querySelector('.reader-panel');
  if (!document.fullscreenElement) {
    (panel.requestFullscreen || panel.webkitRequestFullscreen)?.call(panel);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  }
});
