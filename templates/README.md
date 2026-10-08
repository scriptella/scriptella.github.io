# Website page templates

Use `page.html` for standard pages such as downloads, support, and short guides.
Use `docs-page.html` for reference pages that need the documentation navigation.
The GitHub star aside lives in `github-prompt.html`. Copy that block
unchanged; do not rewrite the wording on individual pages.
Both templates use the shared `../style.css` stylesheet. Its `?v=YYYYMMDD`
query parameter busts browser caches. When changing `style.css`, update the date
on affected pages and templates; update all pages for shared style changes.
For another change on the same day, add a suffix such as `20261008-2`.
They also load `../theme.js`, which applies and persists the Light, Dark, or
System theme selected in the header. Keep the language menu next to the theme
control when creating or refreshing a page header.

The templates live one directory below the site root, so local paths begin with
`../`. After copying a template, adjust the stylesheet, favicon, logo, and
navigation paths for the destination depth. The logo path is
`images/scriptella-logo.svg` from the site root.

For each published page:

1. Remove the `robots` meta element.
2. Set the title, description, heading, and optional lede.
3. Add `aria-current="page"` to the current primary and documentation links.
4. Preserve useful IDs from the legacy page so inbound fragment links continue
   to work.

Use `.note` and `.warning` for labeled callouts. Wrap wide tables in the
keyboard-focusable `.table-scroll` structure shown in `docs-page.html`.
Site-wide colors, fonts, widths, and radii are CSS variables at the top of
`style.css`; prefer changing those variables over adding page-specific colors.
