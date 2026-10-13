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

  // An explicit language pick always wins over the browser-language guess in
  // index.html, and is remembered so that guess never sends the user back.
  function langOf(href) {
    if (/-de\.html$/.test(href)) return 'de';
    if (/-en\.html$/.test(href)) return 'en';
    return 'fr';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.lang-switch a').forEach(function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('snackup-lang', langOf(link.getAttribute('href'))); } catch (e) {}
      });
    });
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
