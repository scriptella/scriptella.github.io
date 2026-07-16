(function () {
  "use strict";

  var storageKey = "scriptella-theme";
  var themes = ["system", "light", "dark"];

  function readTheme() {
    try {
      var savedTheme = localStorage.getItem(storageKey);
      return themes.indexOf(savedTheme) === -1 ? "system" : savedTheme;
    } catch (error) {
      return "system";
    }
  }

  function applyTheme(theme) {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }

  var currentTheme = readTheme();
  applyTheme(currentTheme);

  function saveTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Theme selection still applies when storage is unavailable.
    }
  }

  function updateControls() {
    var currentIndex = themes.indexOf(currentTheme);
    var nextTheme = themes[(currentIndex + 1) % themes.length];
    var currentLabel = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    var nextLabel = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.setAttribute("data-theme-current", currentTheme);
      button.setAttribute("aria-label", "Color theme: " + currentLabel + ". Switch to " + nextLabel + ".");
      button.setAttribute("title", currentLabel + " theme — switch to " + nextLabel);
    });
  }

  function initializeControls() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var currentIndex = themes.indexOf(currentTheme);
        currentTheme = themes[(currentIndex + 1) % themes.length];
        applyTheme(currentTheme);
        saveTheme(currentTheme);
        updateControls();
      });
    });
    updateControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControls);
  } else {
    initializeControls();
  }
}());
