export type PartId = 'rack' | 'fabric';

export interface Chapter {
  /**
   * Position within the chapter's own part, 1-based. Null on the shared
   * reference pages, which belong to no part.
   */
  n: number | null;
  slug: string;
  /**
   * Short enough to sit inline in the header as the current chapter's name —
   * roughly 22 characters is the ceiling. The page's own `heading` prop
   * carries the long form.
   */
  title: string;
  nav: string;
  blurb: string;
  /** The interaction that carries this chapter's idea. */
  interaction: string;
  /** Back-filled below; never written by hand. Undefined on reference pages. */
  part?: PartId;
}

export interface Part {
  id: PartId;
  /** "Part I" — used in kickers, the switch's accessible name and headings. */
  ordinal: string;
  /** "The Rack" — the switch's visible label. Two words. */
  label: string;
  /** One line, shown above each group on the home index. */
  blurb: string;
  chapters: Chapter[];
}

export const parts: Part[] = [
  {
    id: 'rack',
    ordinal: 'Part I',
    label: 'The Rack',
    blurb: 'Seventy-two GPUs wired closely enough to be programmed as one accelerator.',
    chapters: [
      { n: 1, slug: '/', title: 'One Giant GPU', nav: 'Start',
        blurb: 'Why a rack of 72 accelerators is better understood as a single machine than as a cluster.',
        interaction: '3D rack, exploded on scroll' },
      { n: 2, slug: '/anatomy', title: 'Anatomy of the Rack', nav: 'Anatomy',
        blurb: 'Eighteen compute trays, nine switch trays, a copper spine and 120 kW of power — pulled apart part by part.',
        interaction: 'Interactive exploded view with hotspots' },
      { n: 3, slug: '/compute-tray', title: 'Inside a Compute Tray', nav: 'Compute tray',
        blurb: 'One 1U slice: two Grace CPUs, four Blackwell GPUs, and the coherent link that replaced PCIe.',
        interaction: 'Zoomed tray diagram' },
      { n: 4, slug: '/blackwell', title: 'The Blackwell GPU', nav: 'Blackwell',
        blurb: 'Two reticle-limited dies pretending to be one, 192 GB of HBM3e, and what FP4 actually buys you.',
        interaction: 'Precision slider' },
      { n: 5, slug: '/nvlink', title: 'NVLink & NVSwitch', nav: 'NVLink',
        blurb: 'The port arithmetic behind a single-layer non-blocking fabric, and why the switches sit in the middle.',
        interaction: 'Fabric explorer + bandwidth calculator' },
      { n: 6, slug: '/power-cooling', title: 'Power & Cooling', nav: 'Power',
        blurb: '120 kW in one footprint: busbars instead of power supplies, water instead of air.',
        interaction: 'Coolant loop with adjustable inlet temperature' },
      { n: 7, slug: '/scale-out', title: 'Scale-Out: SuperPODs', nav: 'Scale-out',
        blurb: 'What happens past the rack boundary, where bandwidth drops by an order of magnitude.',
        interaction: 'Zoom-out topology' },
      { n: 8, slug: '/inference', title: 'Software & Inference', nav: 'Inference',
        blurb: 'Prefill and decode have opposite bottlenecks. Splitting them is the payoff for owning a 72-GPU domain.',
        interaction: 'Disaggregation simulator' },
      { n: 9, slug: '/comparison', title: 'NVL72 vs HGX vs DGX', nav: 'Comparison',
        blurb: 'Scale-up against scale-out, and a roofline that explains why bandwidth beats FLOPS here.',
        interaction: 'Roofline plot' },
      { n: 10, slug: '/roadmap', title: 'Roadmap', nav: 'Roadmap',
        blurb: 'GB300 today, Vera Rubin NVL144 announced for 2H 2026 — and the power curve underneath it all.',
        interaction: 'Timeline' },
    ],
  },
  {
    id: 'fabric',
    ordinal: 'Part II',
    label: 'The Fabric',
    blurb: 'What carries the traffic once it leaves the rack, and why that network refuses to drop a packet.',
    chapters: [
      { n: 1, slug: '/lossless', title: 'Lossless by Design', nav: 'Lossless',
        blurb: 'Ethernet drops under congestion and lets a higher layer sort it out. A collective cannot afford that, so the fabric buys credit before it sends.',
        interaction: 'Credit versus drop simulator' },
      { n: 2, slug: '/rdma', title: 'RDMA & Kernel Bypass', nav: 'RDMA',
        blurb: 'Queue pairs, verbs, and a network adapter that writes into remote memory without waking either CPU.',
        interaction: 'Data-path walkthrough' },
      { n: 3, slug: '/switches-optics', title: 'Switches & Optics', nav: 'Optics',
        blurb: 'The physical plant: switch radix, OSFP cages, and the reach budget that decides where a rack may stand.',
        interaction: 'Link budget calculator' },
      { n: 4, slug: '/routing', title: 'Addressing & Routing', nav: 'Routing',
        blurb: 'One subnet manager assigns every address and computes every forwarding table — then adaptive routing overrules it.',
        interaction: 'Forwarding table explorer' },
      { n: 5, slug: '/topology', title: 'Fat-Trees & Rails', nav: 'Topology',
        blurb: 'Radix sets how many endpoints fit, oversubscription is what you sell to save money, and rails are what make a collective cheap.',
        interaction: 'Topology builder' },
      { n: 6, slug: '/sharp', title: 'Collectives on the Wire', nav: 'SHARP',
        blurb: 'An all-reduce that reduces inside the switch stops generating most of its own traffic.',
        interaction: 'All-reduce cost model' },
      { n: 7, slug: '/infiniband-vs-ethernet', title: 'InfiniBand vs Ethernet', nav: 'IB vs Ethernet',
        blurb: 'Spectrum-X is Ethernet rebuilt to behave like InfiniBand. Where the two still differ, and where they no longer do.',
        interaction: 'Stack comparison' },
    ],
  },
];

/** Shared reference pages. They belong to no part and sit outside prev/next. */
export const refs: Chapter[] = [
  { n: null, slug: '/glossary', title: 'Glossary', nav: 'Glossary',
    blurb: 'Every term the site uses, defined once.', interaction: '—' },
  { n: null, slug: '/sources', title: 'Sources & Method', nav: 'Sources',
    blurb: 'What is measured, what is announced, and what the sources disagree about.', interaction: '—' },
];

// Back-fill part membership once, so no consumer has to scan for it.
for (const p of parts) for (const c of p.chapters) c.part = p.id;

/** Every chapter of every part, in reading order. Reference pages excluded. */
export const allChapters: Chapter[] = parts.flatMap((p) => p.chapters);

/** Reading order across the whole site, references last. */
export const chapters: Chapter[] = [...allChapters, ...refs];

const bySlug = new Map<string, Chapter>(chapters.map((c) => [c.slug, c]));
const partById = new Map<PartId, Part>(parts.map((p) => [p.id, p]));

export function chapterOf(slug: string): Chapter | undefined {
  return bySlug.get(slug);
}

/** The part a path belongs to. Undefined on /glossary, /sources and /404. */
export function partOf(slug: string): Part | undefined {
  const id = bySlug.get(slug)?.part;
  return id ? partById.get(id) : undefined;
}

/** "Part II · Chapter 03". Undefined for anything that is not a numbered chapter. */
export function kickerFor(slug: string): string | undefined {
  const c = bySlug.get(slug);
  const p = partOf(slug);
  if (!c || c.n === null || !p) return undefined;
  return `${p.ordinal} · Chapter ${String(c.n).padStart(2, '0')}`;
}

/**
 * Prev/next in reading order, over chapters only.
 *
 * The sequence crosses the part boundary — a reader who finishes Part I is
 * offered Part II, because the part switch is discoverable but is not in the
 * reading flow. The crossing is flagged so both call sites can label it,
 * rather than swapping the whole stepper out from under the reader silently.
 *
 * Reference pages return {} and so drop out of the sequence entirely. Before
 * parts existed this walked the full array, which made /roadmap's "next" the
 * glossary — an artifact of the flat walk rather than a decision.
 */
export function siblings(slug: string): {
  prev?: Chapter;
  next?: Chapter;
  crossesPrev?: boolean;
  crossesNext?: boolean;
} {
  const i = allChapters.findIndex((c) => c.slug === slug);
  if (i < 0) return {};
  const prev = i > 0 ? allChapters[i - 1] : undefined;
  const next = i < allChapters.length - 1 ? allChapters[i + 1] : undefined;
  return {
    prev,
    next,
    crossesPrev: !!prev && prev.part !== allChapters[i].part,
    crossesNext: !!next && next.part !== allChapters[i].part,
  };
}
