# Code guide

## Repository layout

```
index.html                              built page (do not edit by hand)
Advanced_Excel_Practice_Workbook.xlsx   built workbook
regional_targets.csv                    built CSV for Topic 4
manifest.webmanifest                    web app manifest
sw.js                                   offline service worker
icons/                                  app icons
.nojekyll                               tells GitHub Pages to serve files as they are
src/
  shell.html        markup and CSS
  content.js        TOPICS and FAQ data
  app.js            behaviour
  build_page.py     assembles index.html
  build_workbook.py generates the workbook and CSV
docs/               architecture, design and this guide
```

## Build

```
python src/build_page.py        # after editing shell.html, content.js or app.js
python src/build_workbook.py    # needs: pip install openpyxl
```

`build_page.py` concatenates `shell.html`, then `content.js` and `app.js` in script tags, inside a minimal HTML skeleton. There is no bundler or dependency.

`build_workbook.py` writes formulas without cached results. Open the file in Excel once (or recalculate with LibreOffice) so values are stored.

## Content format (`src/content.js`)

### Topic

```js
{
  id: 't10',                 // view name and URL hash
  n: 10,                     // course order
  title: `Financial functions`,
  sheet: `10 Financial`,     // matching workbook tab
  fx: `=PMT(B5/12, B6*12, -B4)`,   // formula shown under the title
  kw: [`PMT`, `NPV`, ...],   // keywords: chips, index, search boost
  intro: `...`,
  parts: [ /* sections */ ],
  quiz:  [ /* questions */ ]
}
```

### Section (`parts[]`)

All fields except `h` are optional. Render order is: `p`, `table`, figures and steps, `p2`, `list`, `tip`. When `code` is present the order is steps, code, figure.

| Field | Type | Meaning |
|---|---|---|
| `h` | string | Heading |
| `p`, `p2` | string[] | Paragraphs before and after the figure |
| `table` | `{head: string[], rows: string[][]}` | Reference table. Cells starting with `=` are set in monospace |
| `fig`, `fig2` | object | Figure (see below) |
| `steps` | string[] | Numbered follow-along steps |
| `code` | string | VBA listing |
| `list` | string[] | Bulleted points |
| `tip` | string | Highlighted tip |

Inline markup inside any string: `[[text]]` becomes code, `**text**` becomes bold.

### Figure

```js
{ type: 'grid', name: 'B9', fx: '=PMT(B5/B7, B6*B7, -B4)',
  cols: 'AB', row: 4,                   // column letters and first row number
  rows: [['Loan amount', '~$25,000'], ['Monthly payment', '*$483.32']],
  cap: 'Caption text.' }
```

Grid cell prefixes (may be combined):

| Prefix | Meaning |
|---|---|
| `!` | Header cell |
| `~` | Input cell |
| `*` | Selected cell |
| `+` | Answer check |
| `^` | Error or wrong value |

Other types: `bars` and `combo` (`labels`, `values` or `bars`, `line`, `max`, `step`, `max2`, `step2`, `title`), `dialog` (`title`, `fields: [label, value][]`), `path` (`items`), `tabs` (`tabs`, `vals`, `total`), and `region`, `curve`, `trace` which take only `cap` because their drawing is specific to one example.

### Quiz question

```js
{ q: `Question text`,
  o: [`Option A`, `Option B`, `Option C`, `Option D`],
  a: 1,                         // index of the correct option
  why: `Why the correct option is right.`,
  not: [`Why A is wrong`, ``, `Why C is wrong`, `Why D is wrong`] }   // empty at index a
```

### FAQ entry

```js
{ q: `Question`, t: 't10', a: `Answer` }    // t is a topic id or null
```

## Behaviour (`src/app.js`)

One IIFE in strict mode. Main sections, in file order:

| Section | Key functions | Notes |
|---|---|---|
| Helpers | `esc`, `fmt`, `plain`, `byId` | `esc` HTML-escapes all content before any markup is applied |
| Saved state | `store`, `save`, `answers`, `scoreOf`, `doneCount` | `localStorage`, always in try/catch |
| Figures | `gridFig`, `chartFig`, `regionFig`, `curveFig`, `traceFig`, `fig` | Return HTML or SVG strings |
| Topic page | `partHtml`, `quizHtml`, `topicPage` | |
| Audio | `playerHtml`, `loadVoices`, `chunks`, `sayText`, `speakEls`, `next`, `togglePlay`, `stopAudio` | `audio.token` cancels stale callbacks |
| Search | `INDEX`, `toks`, `searchIndex`, `hilite`, `snippet`, `searchPage`, `indexPage` | |
| Home | `homePage` | |
| Ask & FAQ | `corpus`, `botHtml`, `localAnswer`, `askPage`, `drawChat`, `botMode`, `ask` | `sample` is null unless the Claude capability resolves |
| Navigation | `rail`, `show`, event listeners | One delegated click handler |

### Adding a topic

1. Append a topic object to `TOPICS` in `content.js` with the next `id` and `n`.
2. Add a matching sheet in `build_workbook.py` and an entry in its Start Here index.
3. Run both build scripts.
4. Check that every number in the new figures equals the workbook's calculated value.

No change to `app.js` is needed unless the topic needs a new figure type.

### Adding a figure type

1. Write a function in `app.js` that returns an HTML or SVG string. Use CSS classes and tokens for colour, never literal colours.
2. Add a branch for the new `type` in `fig()`.

### Assistant prompt

`ask()` builds one string: the rules, the corpus inside `<guide>` tags, up to six earlier turns, and the question. It calls `sample(prompt, {cache: false, onText})` and streams the text into the chat bubble. Errors with code `not_granted` switch the session to the offline matcher; any other error falls back for that question only.

## Workbook generator (`src/build_workbook.py`)

| Helper | Purpose |
|---|---|
| `sheet(name, title, sub, widths)` | New sheet with title rows and column widths |
| `put(ws, ref, value, kind, fmt)` | Write one cell. `kind` sets the role: `input`, `link`, `ftext` (formula shown as text), `hdr`, `check`, `todo`, `note`, `code` |
| `hdr(ws, row, col, labels)` | Header row |
| `steps(ws, row, lines, col, head)` | Block of instruction lines; returns the next free row |

Shared range strings (`REV`, `REG`, `CAT`, `DTE`, `UNITS`, `REP`) point at the Data sheet so every summary uses the same source.

## Testing done

- Workbook recalculated headlessly: 650 formulas, no error values. Key results were read back and compared with the figures in `content.js`.
- Page loaded in headless Chromium at 1280px and 400px, light and dark: every topic renders, no script errors, no horizontal overflow; quiz, search, keyword index and offline answers exercised.
- Not tested automatically: audible speech output, and the live Claude assistant, which only runs on a published Claude artifact.
