/* Runs in <head>, before first paint:
   1. applies the saved/OS theme so dark-mode visitors never see a light flash
   2. switches the (non-blocking) Google Fonts stylesheet on once loaded
   Keep the theme rule in sync with preferredTheme() in main.js. */
(function () {
  try {
    var saved = null;
    try {
      saved = localStorage.getItem("theme");
    } catch (e) {}
    var dark =
      saved === "dark" ||
      (saved !== "light" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}

  // Content marked .reveal starts hidden only when JS is running (html.js), and the
  // page script flags html.ready once it has taken over. If that never happens (script
  // blocked, failed, or an out-of-date cached copy), show everything after 3s rather
  // than leave the page blank.
  var root = document.documentElement;
  root.classList.add("js");
  setTimeout(function () {
    if (!root.classList.contains("ready")) root.classList.add("reveal-failsafe");
  }, 3000);

  var fonts = document.getElementById("gfonts");
  if (fonts) {
    var on = function () {
      fonts.media = "all";
    };
    if (fonts.sheet) on();
    else fonts.addEventListener("load", on);
  }
})();
