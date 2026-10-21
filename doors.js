/* "SnackUp in 3 numbers": each door card unfolds its bento panel, one at a time.
   The panels stay in the page (closed = collapsed + inert), so they are still indexed,
   and #snack / #seances / #local open the matching door on arrival. Opening a door
   also writes its anchor in the address bar and scrolls it into view; its tiles fade
   in one after the other, in reading order. */
(function () {
  var doors = Array.prototype.slice.call(document.querySelectorAll('.door'));
  if (!doors.length) return;
  var grid = doors[0].parentNode;
  var wide = window.matchMedia('(min-width: 761px)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  // shown: fade in, then drop the reveal classes so the element's own transitions take over
  function show(el) {
    el.classList.add('in');
    var delay = parseInt(el.style.transitionDelay, 10) || 0;
    setTimeout(function () {
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
      if (!wide.matches && e.target.classList.contains('door')) {
        setTimeout(function () { e.target.classList.add('nudge'); }, 700);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  // a panel's tiles, one after the other in reading order: quick on a wide screen where
  // they all land in view at once, 0.5 s apart on a phone where they stack down the page
  function reveal(panel) {
    if (still.matches || !seen) return;
    var tiles = Array.prototype.slice.call(panel.querySelectorAll('.tile, .privacy-note'));
    var step = wide.matches ? 90 : 500;
    tiles.forEach(function (t) { t.classList.remove('in'); t.style.transitionDelay = ''; t.classList.add('reveal'); });
    // next frame, so the browser paints the hidden state before fading in
    requestAnimationFrame(function () {
      tiles.forEach(function (t, i) { t.style.transitionDelay = (120 + i * step) + 'ms'; show(t); });
    });
  }

  function set(door, open) {
    var panel = document.getElementById(door.getAttribute('aria-controls'));
    var was = panel.classList.contains('open');
    door.setAttribute('aria-expanded', open ? 'true' : 'false');
    door.querySelector('.go-label').textContent = open ? door.dataset.close : door.dataset.open;
    panel.classList.toggle('open', open);
    if (open) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
    if (open && !was) reveal(panel);
  }

  function openOnly(target) {
    doors.forEach(function (d) { set(d, d === target); });
    grid.classList.toggle('has-open', !!target);
  }

  function anchor(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }

  function bring(door, smooth) {
    // wide: the whole row of doors stays in sight above the panel; phone: the tapped door
    (wide.matches ? grid : door).scrollIntoView({ block: 'start', behavior: smooth && !still.matches ? 'smooth' : 'auto' });
  }

  doors.forEach(function (d) {
    d.addEventListener('click', function () {
      var closing = d.getAttribute('aria-expanded') === 'true';
      openOnly(closing ? null : d);
      anchor(closing ? null : d.getAttribute('aria-controls'));
      if (!closing) bring(d, true);
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
    openOnly(door);
    bring(door, false);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
