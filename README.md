# Advanced Excel Walkthrough

An interactive study guide for an advanced Excel course, with a matching practice workbook.

## What is here

| File | What it is |
|---|---|
| `index.html` | The guide: 15 topics, illustrated worked examples, audio narration, keyword search and index, 45 quiz questions with explained answers, and an Ask & FAQ page. Open it in a browser. |
| `Advanced_Excel_Practice_Workbook.xlsx` | One sheet per topic, using the same numbers as the guide. |
| `regional_targets.csv` | Small file for the Topic 4 import exercise. |
| `manifest.webmanifest`, `sw.js`, `icons/` | Make the page installable and usable offline. |
| `docs/` | Architecture, design and code documentation. |
| `src/` | Source for the page (`shell.html`, `content.js`, `app.js`) and the workbook (`build_workbook.py`). |

## Install it as an app

Once GitHub Pages is switched on for this repository, the guide is served at
`https://hardymichelle11.github.io/advanced-excel-walkthrough-/`.

- **iPhone or iPad (Safari):** open the address, tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the address, open the menu, then **Install app** or **Add to Home screen**.
- **Desktop (Chrome or Edge):** click the install icon in the address bar.

After the first visit it works offline, including the workbook download.

To publish an update, rebuild `index.html`, increase `VERSION` in `sw.js`, and push.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): how the page and workbook are put together.
- [Design](docs/DESIGN.md): teaching pattern, layout and visual language.
- [Code guide](docs/CODE.md): file layout, content format and how to extend it.

## Topics

Charting; date and time functions; PivotTables; internal and external data; sorting and filtering; extracting and querying data; multiple worksheets and workbooks; formula auditing; controlling user input; financial functions; Solver (linear and nonlinear); one- and two-variable data tables; scenario management; macros.

## Notes

- All example data is invented for teaching.
- Audio uses the browser's built-in speech synthesis.
- The Ask box answers by matching the guide's own text. When the page is published as a Claude artifact, it asks Claude instead, restricted to the guide's content.
- Quiz progress is saved in the browser only.

## Rebuilding

```
python src/build_page.py        # rebuilds index.html after editing src/
python src/build_workbook.py    # rebuilds the workbook and CSV (needs openpyxl)
```
