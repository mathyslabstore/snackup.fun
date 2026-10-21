/* "SnackUp in 3 numbers": each door card unfolds its bento panel, one at a time.
   The panels stay in the page (closed = collapsed + inert), so they are still indexed,
   and #snack / #seances / #local open the matching door on arrival. */
(function () {
  var doors = Array.prototype.slice.call(document.querySelectorAll('.door'));
  if (!doors.length) return;
  var grid = doors[0].parentNode;

  function set(door, open) {
    var panel = document.getElementById(door.getAttribute('aria-controls'));
    door.setAttribute('aria-expanded', open ? 'true' : 'false');
    door.querySelector('.go-label').textContent = open ? door.dataset.close : door.dataset.open;
    panel.classList.toggle('open', open);
    if (open) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
  }

  function openOnly(target) {
    doors.forEach(function (d) { set(d, d === target); });
    grid.classList.toggle('has-open', !!target);
  }

  doors.forEach(function (d) {
    d.addEventListener('click', function () {
      openOnly(d.getAttribute('aria-expanded') === 'true' ? null : d);
    });
  });

  function fromHash() {
    var id = location.hash.slice(1);
    var door = id && doors.filter(function (d) { return d.getAttribute('aria-controls') === id; })[0];
    if (!door) return;
    openOnly(door);
    door.scrollIntoView({ block: 'start' });
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
