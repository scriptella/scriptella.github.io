import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

function highlight(source) {
  const tokens = [];
  const code = {
    textContent: source,
    children: [],
    classList: { contains: (name) => name === "language-xml", add() {} },
    replaceChildren() {}
  };
  const document = {
    documentElement: { removeAttribute() {} },
    readyState: "complete",
    querySelectorAll: (selector) => selector === "pre code" ? [code] : [],
    createDocumentFragment: () => ({ appendChild: (token) => tokens.push(token) }),
    createTextNode: (textContent) => ({ textContent }),
    createElement: () => ({})
  };
  const theme = readFileSync(new URL("../theme.js", import.meta.url), "utf8");
  runInNewContext(theme, { document });

  return tokens;
}

test("highlights CDATA as SQL and preserves its delimiters and whitespace", () => {
  const source = "<etl>\n  <query><![CDATA[\n    select '<tag>' WHERE score < 5;\n  ]]></query>\n</etl>";
  const tokens = highlight(source);

  assert.equal(tokens.map((token) => token.textContent).join(""), source);
  assert.deepEqual(tokens.filter((token) => token.className === "syntax-keyword")
    .map((token) => token.textContent), ["select", "WHERE"]);
  assert.ok(tokens.some((token) => token.className === "syntax-string" && token.textContent === "'<tag>'"));
  assert.deepEqual(tokens.filter((token) => token.className === "syntax-tag")
    .map((token) => token.textContent), ["etl", "query", "query", "etl"]);
  for (const delimiter of ["<![CDATA[", "]]>"]) {
    assert.ok(tokens.some((token) => token.className === "syntax-punctuation" && token.textContent === delimiter));
  }
});


test("handles repeated opening brackets without scanning each suffix", () => {
  const prefix = "<".repeat(256 * 1024 - 32);
  const source = prefix + "<etl/>";
  const start = performance.now();
  const tokens = highlight(source);
  assert.ok(performance.now() - start < 2000, "malformed input should finish promptly");
  assert.equal(tokens.map((token) => token.textContent).join(""), source);
  assert.deepEqual(tokens.filter((token) => token.className === "syntax-tag")
    .map((token) => token.textContent), ["etl"]);
});
