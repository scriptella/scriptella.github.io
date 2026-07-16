# Website page templates

Use `page.html` for standard pages such as downloads, support, and short guides.
Use `docs-page.html` for reference pages that need the documentation navigation.
Both templates use the shared `../style.css` stylesheet.

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
