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

  var fonts = document.getElementById("gfonts");
  if (fonts) {
    var on = function () {
      fonts.media = "all";
    };
    if (fonts.sheet) on();
    else fonts.addEventListener("load", on);
  }
})();
