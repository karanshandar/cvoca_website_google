// Runs before first paint (blocking <script> in index.html <head>).
// A saved choice wins; otherwise follow the OS setting. App.tsx reads the result from <html class>.
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var dark = saved === 'dark' || saved === 'light'
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    // Storage blocked (e.g. some private modes): fall back to the OS setting
    try {
      document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e2) { /* light theme */ }
  }
})();
