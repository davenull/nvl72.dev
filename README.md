# nvl72.dev

An explorable explainer in two parts. **Part I — The Rack** covers the NVIDIA GB200 NVL72: 72
Blackwell GPUs wired closely enough to be programmed as a single accelerator. **Part II — The
Fabric** covers the InfiniBand and Ethernet network that joins those racks into a cluster.

Static Astro site deployed to **Cloudflare Workers Static Assets**. No server-side rendering,
no Worker code path, and therefore no billable requests: static asset requests are unmetered on
both the Free and Paid plans.

- **Live:** https://nvl72.dev
- **Plan of record:** [`docs/research-report.md`](docs/research-report.md)
- **Hosting notes:** [`docs/hosting.md`](docs/hosting.md)

## Running it

```bash
npm install
npm run dev          # Astro dev server
npm run build        # static output to dist/
npm run preview      # serve dist/ through workerd, exactly as Cloudflare will
```

Deploying needs two environment variables that are deliberately **not** in the repo:

```bash
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run deploy
```

## How the site is put together

```
src/
  data/
    specs.ts       every number the site states, defined exactly once
    sources.ts     every citation, with a verified flag
    glossary.ts    every term, defined exactly once
    chapters.ts    part structure, sitemap, prev/next ordering and kicker derivation
  components/      S (spec), T (term), L (depth gate), Cite, Callout, SpecTable, Widget…
  scripts/
    rack.ts        the procedural 3D rack
    rack-parts.ts  part descriptions, shared by the 3D view and the text fallback
  pages/           one file per chapter
```

Three rules hold the content together, and breaking any of them is a bug:

1. **Numbers live in `specs.ts`, never in prose.** Pages reference a figure by id
   (`<S id="alltoall" />`), so a correction lands everywhere at once and two chapters cannot
   disagree with each other.
2. **Disputed figures render as ranges.** A spec marked `disputed` shows a `±` marker and its
   range on hover, and is listed on `/sources#disputed`. Announced roadmap figures are marked
   separately and never sit beside measured benchmarks unlabelled.
3. **Nothing lives only in an interactive figure.** Every part the 3D rack shows is also written
   out in text on the same page, and every widget's numbers appear in the surrounding prose.
   The non-3D path is the accessibility floor and the SEO content.

### Two parts

`chapters.ts` exports a nested `parts` array; `part` is back-filled onto each chapter at module
load, and the two reference pages live in a separate `refs` export. Chapter numbers restart at 1
within each part, so kickers must be derived (`kickerFor`) rather than hand-written — two
chapters legitimately claim "Chapter 03".

The header shows one part's stepper at a time, with a switch of two real links between them. The
active pill carries `aria-current="true"`, not `"page"`: it points at its part's first chapter,
which is usually not the current page. `/glossary`, `/sources` and `/404` belong to no part and
fall back to Part I's stepper with nothing marked current — do not add a "light the first dot if
nothing matched" fallback, which would break that.

`siblings()` walks chapters only, so reference pages are outside prev/next. It does cross the
part boundary, and flags the crossing so both the header arrow and the bottom card can label it.

### The depth control

The header toggle switches `data-depth` on `<html>` between `1` (new grad), `2` (engineer) and
`3` (architect). `<L min={2}>` and `<L at={1}>` gate blocks; all depths render server-side and
are hidden with CSS, so crawlers and no-JS readers get the complete text. Depth 2 is the
server-rendered default.

### The 3D rack

Generated procedurally in `src/scripts/rack.ts` rather than authored in Blender and exported as
glTF. NVIDIA publishes no CAD for this rack, so original geometry was required either way — and a
rack is a stack of trays on a regular pitch, which parameterises cleanly. The consequences:

- no asset bytes over the wire, no Draco decoder, no KTX2, no R2 object, no LOD ladder;
- every part named and individually addressable, which is what the exploded view needs;
- dimensions sit in code beside the sourced figures they came from.

It is a schematic diagram in three dimensions, not a fabrication drawing. Controls are
hand-rolled (no `OrbitControls` import), the three.js chunk is dynamically imported only when a
canvas approaches the viewport, and `mountRack` returns `null` when WebGL is unavailable so the
caller can fall back to the text path.

## Legal

Not affiliated with, endorsed by, or sponsored by NVIDIA Corporation. No NVIDIA artwork,
branding, logo or CAD is reproduced anywhere in this repository. Word marks are used
nominatively. Mechanical proportions follow public teardown photography and openly licensed Open
Compute Project documentation. **Have counsel review the trademark usage and disclaimer before
treating this as launched.**
