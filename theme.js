(function () {
  var KEY = 'snackup-theme';

  function safeGet() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function safeSet(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function apply(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme-choice') === theme);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(safeGet() || 'system');
    document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var choice = btn.getAttribute('data-theme-choice');
        safeSet(choice);
        apply(choice);
      });
    });
  });
})();
