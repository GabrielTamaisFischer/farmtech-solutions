# Design QA — FarmTech

## Source visual truth

- URL: https://farmtech-prototipo-2.vercel.app/dashboard
- Related source state: `/data` with the “Nova cultura” three-step modal.
- The source dashboard and data flow were opened and captured in the Codex in-app browser.

## Rendered implementation

- Local URL: http://127.0.0.1:4173/index.html
- Published URL: https://farmtech-solutions-demo.vercel.app/
- Browser-rendered evidence: Codex in-app browser screenshots captured during this QA run for the Dashboard, Dados table, and wizard confirmation.
- Desktop implementation capture viewport: 1280 × 720 CSS px, device scale factor 1.
- Desktop source capture viewport: 1280 × 720 CSS px; browser chrome was excluded from the comparison.
- Paired responsive capture viewport: 756 × 912 CSS px for both the source route and the published implementation, device scale factor 1.
- Pixel normalization: desktop and responsive comparisons used matching CSS viewports and density; browser chrome was excluded from the comparison.

## States and interactions checked

- Dashboard with all records, filters and calculated KPI cards.
- Culture filter and area/volume chart switch.
- Dados table with search, visible-column toggles, export action, edit and delete actions.
- Nova cultura wizard: terrain dimensions calculate `m²` and hectares; street and dosage fields calculate total liters; confirmation adds the record.
- Edit recalculates a record; delete removes it; restore returns the two base records.
- Análises estatísticas and Sobre o projeto routes.
- Console output was checked through the browser-rendered DOM; no runtime error was observed during these interactions.

## Findings

No actionable P0, P1 or P2 visual findings remain. The implementation preserves the source hierarchy, palette, spacing rhythm, sidebar navigation, cards, badges, tables, chart regions and wizard modal while keeping the requested CRUD visible in the Dados route.

Residual P3: the source loads Inter from Google Fonts, while this standalone implementation uses the source token with local system fallbacks so the deployment does not depend on a remote font asset. The resulting hierarchy and metrics remained visually consistent in the captured comparison.

## Comparison history

1. Initial local pass: the modal overlay remained visible after closing because the source modal display rule overrode the native `hidden` behavior.
2. Fix: added `[hidden] { display: none !important; }` to the local stylesheet.
3. Post-fix evidence: the Dados table rendered without the overlay; the wizard was reopened, completed, added a Milho record, edited its dosage from 300 to 400 mL/m, deleted it, and restored the two base records.

## Implementation checklist

- [x] Match source dashboard shell and visual tokens.
- [x] Match source Dados table and three-step modal flow.
- [x] Keep planting area calculation as `comprimento × largura`.
- [x] Keep volume calculation as `dosagem × comprimento da rua × ruas ÷ 1.000`.
- [x] Expose entry, output, update, delete and CSV export in the interface.
- [x] Validate responsive CSS and the available narrow source viewport.

final result: passed

