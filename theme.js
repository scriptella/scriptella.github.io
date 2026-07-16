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

  function appendToken(target, value, className) {
    if (!value) {
      return;
    }
    if (!className) {
      target.appendChild(document.createTextNode(value));
      return;
    }
    var token = document.createElement("span");
    token.className = className;
    token.textContent = value;
    target.appendChild(token);
  }

  var sqlKeywords = "ADD|ALTER|AND|AS|ASC|BEGIN|BETWEEN|BY|CASE|COMMIT|CREATE|DELETE|DESC|DISTINCT|DROP|ELSE|END|EXISTS|FROM|FULL|GROUP|HAVING|IN|INNER|INSERT|INTO|IS|JOIN|LEFT|LIKE|LIMIT|MERGE|NOT|NULL|OFFSET|ON|OR|ORDER|OUTER|PRIMARY|RIGHT|ROLLBACK|SELECT|SET|TABLE|THEN|UNION|UNIQUE|UPDATE|VALUES|WHEN|WHERE";
  var sqlPattern = new RegExp("(--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|('(?:''|[^'])*')|\\b(" + sqlKeywords + ")\\b|(\\?[A-Za-z_][\\w.]*|:[A-Za-z_][\\w.]*|\\$\\{[^}\\n]+\\})|\\b(\\d+(?:\\.\\d+)?)\\b", "gi");
  var sqlDetector = /(?:^|[\s;(])(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|MERGE)\b/i;

  function highlightSql(text, target) {
    var lastIndex = 0;
    sqlPattern.lastIndex = 0;
    text.replace(sqlPattern, function (match, comment, string, keyword, variable, number, offset) {
      appendToken(target, text.slice(lastIndex, offset));
      appendToken(target, match, comment ? "syntax-comment" : string ? "syntax-string" : keyword ? "syntax-keyword" : variable ? "syntax-variable" : "syntax-number");
      lastIndex = offset + match.length;
      return match;
    });
    appendToken(target, text.slice(lastIndex));
  }

  function highlightXmlTag(text, target) {
    if (text.indexOf("<!--") === 0) {
      appendToken(target, text, "syntax-comment");
      return;
    }
    if (/^<!DOCTYPE/i.test(text) || text.indexOf("<?") === 0) {
      appendToken(target, text, "syntax-punctuation");
      return;
    }

    var tokenPattern = /(<\/?|\?>|\/?>)|([A-Za-z_:][\w:.-]*)(?=\s*=)|("[^"]*"|'[^']*')|(=)|([A-Za-z_:][\w:.-]*)/g;
    var lastIndex = 0;
    var foundTagName = false;
    var match;
    while ((match = tokenPattern.exec(text)) !== null) {
      appendToken(target, text.slice(lastIndex, match.index));
      if (match[1] || match[4]) {
        appendToken(target, match[0], "syntax-punctuation");
      } else if (match[2]) {
        appendToken(target, match[0], "syntax-attribute");
      } else if (match[3]) {
        appendToken(target, match[0], "syntax-string");
      } else {
        appendToken(target, match[0], foundTagName ? "syntax-attribute" : "syntax-tag");
        foundTagName = true;
      }
      lastIndex = match.index + match[0].length;
    }
    appendToken(target, text.slice(lastIndex));
  }

  function highlightXml(text, target) {
    var tagPattern = /<!--[\s\S]*?-->|<[^>]+>/g;
    var lastIndex = 0;
    var match;
    while ((match = tagPattern.exec(text)) !== null) {
      highlightSql(text.slice(lastIndex, match.index), target);
      highlightXmlTag(match[0], target);
      lastIndex = match.index + match[0].length;
    }
    highlightSql(text.slice(lastIndex), target);
  }

  function initializeSyntaxHighlighting() {
    document.querySelectorAll("pre code").forEach(function (code) {
      // Leave deliberately formatted examples (for example, bold placeholders) intact.
      if (code.children.length) {
        return;
      }

      var source = code.textContent;
      var isXml = /<\/?[A-Za-z_:!]/.test(source);
      var isSql = sqlDetector.test(source);
      if (!isXml && !isSql) {
        return;
      }

      var highlighted = document.createDocumentFragment();
      if (isXml) {
        highlightXml(source, highlighted);
        code.classList.add("language-xml");
      } else {
        highlightSql(source, highlighted);
        code.classList.add("language-sql");
      }
      code.replaceChildren(highlighted);
      code.classList.add("syntax-highlighted");
    });
  }

  function initializePage() {
    initializeControls();
    initializeSyntaxHighlighting();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
  } else {
    initializePage();
  }
}());
