/* "SnackUp in 3 numbers": three door cards over one shared stage. Opening a door shows
   its panel in the stage; switching doors never drops the stage back to 0, it eases
   from one panel's height to the next while the new tiles fade in one by one, in
   reading order. Panels stay in the page (hidden ones invisible + inert) so they are
   still indexed; the door's anchor (#snack / #seances / #local) goes in the address
   bar, and opens the matching door on arrival. */
(function () {
  var doors = Array.prototype.slice.call(document.querySelectorAll('.door'));
  var stage = document.querySelector('.door-stage');
  if (!doors.length || !stage) return;
  var grid = doors[0].parentNode;
  var wide = window.matchMedia('(min-width: 761px)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE_MS = 350;
  var easing;

  function panelOf(door) { return document.getElementById(door.getAttribute('aria-controls')); }

  // shown: fade in, then drop the reveal classes so the element's own transitions take over
  function show(el) {
    el.classList.add('in');
    var delay = parseInt(el.style.transitionDelay, 10) || 0;
    clearTimeout(el._shown);
    el._shown = setTimeout(function () {
      el.classList.remove('reveal', 'in');
      el.style.transitionDelay = '';
    }, delay + 650);
  }

  var seen = 'IntersectionObserver' in window && new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      show(e.target);
      seen.unobserve(e.target);
      // phone: once a door is in, its arrow nudges to say "this opens"
      if (!wide.matches) setTimeout(function () { e.target.classList.add('nudge'); }, 700);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  // a panel's tiles fade in one after the other, in reading order, 0.5 s apart
  function reveal(panel) {
    if (still.matches) return;
    var tiles = Array.prototype.slice.call(panel.querySelectorAll('.tile, .privacy-note'));
    tiles.forEach(function (t) { clearTimeout(t._shown); t.classList.remove('in'); t.style.transitionDelay = ''; t.classList.add('reveal'); });
    // commit the hidden state first (a rAF alone runs before the style pass, so the
    // tiles would land straight on 'in' with nothing to fade from)
    void panel.offsetHeight;
    tiles.forEach(function (t, i) { t.style.transitionDelay = (120 + i * 500) + 'ms'; show(t); });
  }

  // ease the stage from `from` to `to` (px), then hand its height back to the page
  function ease(from, to, done) {
    clearTimeout(easing);
    if (still.matches) { stage.style.height = to === 0 ? '0px' : 'auto'; if (done) done(); return; }
    stage.classList.remove('easing');
    stage.style.height = from + 'px';
    void stage.offsetHeight;                       // commit the start height
    stage.classList.add('easing');
    stage.style.height = to + 'px';
    easing = setTimeout(function () {
      stage.classList.remove('easing');
      stage.style.height = to === 0 ? '0px' : 'auto';
      if (done) done();
    }, EASE_MS + 30);
  }

  function setDoor(door, open) {
    door.setAttribute('aria-expanded', open ? 'true' : 'false');
    door.querySelector('.go-label').textContent = open ? door.dataset.close : door.dataset.open;
  }

  function showPanel(panel) {
    doors.forEach(function (d) {
      var p = panelOf(d);
      var on = p === panel;
      p.classList.toggle('open', on);
      if (on) p.removeAttribute('inert'); else p.setAttribute('inert', '');
    });
  }

  function open(door) {
    var panel = panelOf(door);
    var from = stage.offsetHeight;                 // measured before the panels swap
    doors.forEach(function (d) { setDoor(d, d === door); });
    grid.classList.add('has-open');
    showPanel(panel);
    if (from === 0) {
      // straight to full height: the space is there before anything fades in
      clearTimeout(easing);
      stage.classList.remove('easing');
      stage.style.height = 'auto';
    } else {
      ease(from, panel.offsetHeight);
    }
    reveal(panel);
  }

  function close() {
    doors.forEach(function (d) { setDoor(d, false); });
    grid.classList.remove('has-open');
    ease(stage.offsetHeight, 0, function () { showPanel(null); });
  }

  function anchor(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }

  function bring(smooth) {
    // wide: the row of doors stays in sight above the stage; phone: straight to the stage
    (wide.matches ? grid : stage).scrollIntoView({ block: 'start', behavior: smooth && !still.matches ? 'smooth' : 'auto' });
  }

  doors.forEach(function (d) {
    d.addEventListener('click', function () {
      if (d.getAttribute('aria-expanded') === 'true') { close(); anchor(null); return; }
      open(d);
      anchor(d.getAttribute('aria-controls'));
      bring(true);
    });
  });

  // the doors themselves fade in as the section scrolls into view
  if (seen && !still.matches) {
    doors.forEach(function (d, i) {
      d.classList.add('reveal');
      d.style.transitionDelay = wide.matches ? (i * 110) + 'ms' : '';
      seen.observe(d);
    });
  }

  function fromHash() {
    var id = location.hash.slice(1);
    var door = id && doors.filter(function (d) { return d.getAttribute('aria-controls') === id; })[0];
    if (!door) return;
    open(door);
    bring(false);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
