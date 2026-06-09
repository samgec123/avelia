# AURELIA — AEM EDS

Luxury fashion e-commerce built on [AEM Edge Delivery Services](https://www.aem.live/) with Universal Editor authoring.

## Local Development

```bash
npm install
npx aem up
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
blocks/       Per-block JS + CSS (header, footer, hero, cards, …)
icons/        SVG icons
models/       Source component model JSON (compiled → root component-*.json)
scripts/      EDS core runtime + site init + deferred scripts
styles/       Global CSS (custom properties, base elements)
tools/        Build scripts, sidekick config
```

## Blocks

| Block | Description |
|-------|-------------|
| `header` | Site header, nav, utility bar |
| `footer` | Footer columns + social links |
| `hero` | Full-viewport and split hero sections |
| `cards` | Category duo-cards and article cards |
| `columns` | Generic N-column layout |
| `fragment` | Included HTML fragments (nav, footer) |
| `product-grid` | Catalog product grid (fetches `/products.json`) |
| `product-detail` | PDP: gallery + info, swatches, sizes |
| `tabs` | Tabbed content panels |
| `accordion` | Expandable FAQ / details |
| `form` | Generic form with ACDL tracking |

## AEM Author

Update `fstab.yaml` with your AEM Cloud author URL:

```yaml
mountpoints:
  /: aem:https://author-pXXXXX-eYYYYY.adobeaemcloud.com/content/aurelia-eds/en
```

Then update `data-aue-resource` base paths in page HTML, or configure them via the UE connection metadata.
