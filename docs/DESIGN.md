# Design

## Who it is for

A student taking an advanced Excel course who wants to see each feature worked through on a small example, try it in Excel, and confirm they understood it. The guide assumes basic Excel skills and no programming background.

## Teaching pattern

Every topic follows the same order, so the student always knows where they are:

1. **Idea** in one or two sentences.
2. **Reference** table or list of the options.
3. **Worked example** shown as a picture of the worksheet, with the selected cell's formula in the formula bar.
4. **Follow along** numbered steps that match the practice workbook.
5. **Tip** covering the most common mistake.
6. **Test your understanding**: three questions. After answering, the student sees why the correct option is right and, on request, why each other option is wrong.

All examples use one small invented dataset (20 orders, 5 products, 4 regions, 4 reps) so numbers recur and become familiar: total revenue is $42,575 everywhere it appears.

## Information architecture

| Entry point | Purpose |
|---|---|
| Home | What the guide is, how to use it, all 15 topics with progress |
| Topic rail | Course order, with a score per topic |
| Search box | Free-text search across topics, sections, quizzes and FAQ |
| Keyword index | A to Z list of 232 terms, each linked to its topic |
| Ask & FAQ | Ready-made questions and a free question box |
| Topic keywords | Chips under each title that run a search |

## Visual language

The look is taken from the subject: a worksheet.

- **Formula bar as a signature.** Each topic opens with a name box, an fx mark and a formula from that topic. Figures use the same bar to show the selected cell's formula.
- **Cell legend shared with the workbook.** Pale yellow cells with blue text are inputs, pale green cells are answer checks, a green outline marks the selected cell. The same colours mean the same things in the Excel file.
- **Colour.** A green accent on a slightly green-tinted neutral background. Red is reserved for wrong answers and error values. Blue is used for the second data series and trace arrows.
- **Type.** Archivo for headings, Source Sans 3 for reading text, JetBrains Mono for formulas, cell references and code.
- **Numbering.** Topic and step numbers are shown because order matters in both cases.

## Themes and responsiveness

- Every colour is a CSS custom property defined on `:root`, redefined for dark mode under `prefers-color-scheme` and under an explicit `data-theme` attribute.
- At widths under 900px the topic rail collapses behind a Topics button and the content becomes a single column.
- Wide worksheets, tables and code scroll inside their own container. The page body never scrolls sideways.

## Accessibility

- Semantic headings, lists, tables, `figure` and `figcaption`.
- All actions are real buttons with visible keyboard focus.
- SVG figures have a text label; captions state the takeaway in words.
- Quiz results use text labels ("Correct answer", "Your answer") as well as colour.
- Audio narration offers a non-visual way through each topic; a live region announces what is being read.
- Smooth scrolling is only enabled when the user has not asked for reduced motion.

## Writing style

Plain sentences, active voice, Excel's own names for menus and dialogs, and ribbon paths written as `Data > What-If Analysis > Data Table`. Explanations say what a result means with the example's actual numbers.

## Known limits

- Figures are drawings of Excel, not screenshots, so ribbons may look slightly different between Excel versions.
- Menu paths follow Excel for Microsoft 365 on Windows. Mac paths differ in places.
- Example data is invented and is not taken from any course textbook.
