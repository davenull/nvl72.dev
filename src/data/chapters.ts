export interface Chapter {
  n: number | null;
  slug: string;
  title: string;
  nav: string;
  blurb: string;
  /** The interaction that carries this chapter's idea. */
  interaction: string;
}

export const chapters: Chapter[] = [
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
  { n: null, slug: '/glossary', title: 'Glossary', nav: 'Glossary',
    blurb: 'Every term the site uses, defined once.', interaction: '—' },
  { n: null, slug: '/sources', title: 'Sources & Method', nav: 'Sources',
    blurb: 'What is measured, what is announced, and what the sources disagree about.', interaction: '—' },
];

export const numbered = chapters.filter((c) => c.n !== null);

export function siblings(slug: string) {
  const i = chapters.findIndex((c) => c.slug === slug);
  return { prev: i > 0 ? chapters[i - 1] : undefined, next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : undefined };
}
