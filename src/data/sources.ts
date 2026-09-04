export type SourceKind = 'primary' | 'independent' | 'vendor' | 'standard' | 'method';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  kind: SourceKind;
  /** Omitted where the exact deep link still needs confirming — see `verified`. */
  url?: string;
  /**
   * false = the claim comes from the research report's citation of this source,
   * but the exact document/URL has not been re-checked against the publisher.
   * The sources page surfaces these so they can be closed out before launch.
   */
  verified: boolean;
  note?: string;
}

export const sources: Source[] = [
  {
    id: 'nv-gb200',
    title: 'GB200 NVL72 product page',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
    verified: true,
    note: 'Source of the "acts as a single, massive GPU" framing and the 30x/10x inference claims.',
  },
  {
    id: 'nv-gb300',
    title: 'GB300 NVL72 product page',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/',
    verified: true,
  },
  {
    id: 'nv-blackwell',
    title: 'Blackwell architecture overview',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/',
    verified: true,
  },
  {
    id: 'nv-grace',
    title: 'Grace CPU Superchip datasheet',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/grace-cpu-superchip/',
    verified: true,
    note: 'Quotes 512 GB LPDDR5X / 546 GB/s for the standalone superchip; the GB200 Grace differs.',
  },
  {
    id: 'nv-nvlink',
    title: 'NVLink and NVLink Switch',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/nvlink/',
    verified: true,
  },
  {
    id: 'nv-devblog-nvl72',
    title: 'GB200 NVL72 Delivers Trillion-Parameter LLM Training and Real-Time Inference',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/',
    verified: false,
    note: 'Deep link not confirmed; locate the post on the NVIDIA Technical Blog before launch.',
  },
  {
    id: 'nv-devblog-mlperf',
    title: 'MLPerf Training v5.1 results on GB200/GB300 NVL72',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/',
    verified: false,
    note: 'Origin of the 3.2x-over-Hopper and 4.2x/1.9x Blackwell Ultra training figures.',
  },
  {
    id: 'nv-dynamo',
    title: 'NVIDIA Dynamo — disaggregated prefill/decode serving',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://github.com/ai-dynamo/dynamo',
    verified: true,
  },
  {
    id: 'nv-mnnvl',
    title: 'Multi-Node NVLink (MNNVL) and the IMEX service',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/',
    verified: false,
  },
  {
    id: 'nv-ocp',
    title: "NVIDIA's GB200 NVL72 contribution to the Open Compute Project",
    publisher: 'NVIDIA / OCP',
    kind: 'standard',
    url: 'https://www.opencompute.org/',
    verified: false,
    note: 'Specifies four NVLink cartridges, >5,000 copper cables, 260 TB/s AllReduce bandwidth.',
  },
  {
    id: 'mlcommons',
    title: 'MLPerf Inference & Training results',
    publisher: 'MLCommons',
    kind: 'primary',
    url: 'https://mlcommons.org/benchmarks/',
    verified: true,
  },
  {
    id: 'coreweave-pr',
    title: 'MLPerf Training v5.0: 2,496 Blackwell GPUs, Llama 3.1 405B in 27.3 minutes',
    publisher: 'CoreWeave / NVIDIA / IBM',
    kind: 'vendor',
    verified: false,
    note: 'June 2025 joint press release.',
  },
  {
    id: 'semianalysis-gb200',
    title: 'GB200 hardware architecture and component supply chain',
    publisher: 'SemiAnalysis',
    kind: 'independent',
    url: 'https://semianalysis.com/',
    verified: false,
  },
  {
    id: 'semianalysis-optical',
    title: "Nvidia's Optical Boogeyman",
    publisher: 'SemiAnalysis',
    kind: 'independent',
    url: 'https://semianalysis.com/',
    verified: false,
    note: 'Computes ~19.4 kW/rack for an all-optical NVLink spine (648 × 1.6T transceivers ≈ 30 W each).',
  },
  {
    id: 'sth-teardown',
    title: 'GB200 NVL72 rack teardown and NVLink spine walkthrough',
    publisher: 'ServeTheHome',
    kind: 'independent',
    url: 'https://www.servethehome.com/',
    verified: false,
  },
  {
    id: 'supermicro',
    title: 'GB200 NVL72 rack-scale solution datasheet',
    publisher: 'Supermicro',
    kind: 'vendor',
    url: 'https://www.supermicro.com/en/accelerators/nvidia',
    verified: true,
  },
  {
    id: 'qct',
    title: 'QCT GB200 NVL72 rack specification',
    publisher: 'QCT',
    kind: 'vendor',
    verified: false,
    note: 'Source of the 45 °C max inlet / 65 °C max return and ~130 L/min per-rack flow figures.',
  },
  {
    id: 'schneider',
    title: 'Steven Carlini on 132 kW racks and the 240 kW next generation',
    publisher: 'Schneider Electric',
    kind: 'independent',
    verified: false,
  },
  {
    id: 'uptime-2025',
    title: 'Global Data Center Survey 2025 — mean rack density 7.6 kW',
    publisher: 'Uptime Institute',
    kind: 'independent',
    url: 'https://uptimeinstitute.com/resources/research-and-reports',
    verified: true,
  },
  {
    id: 'glennklockwood',
    title: 'NVLink and Grace reference notes',
    publisher: 'glennklockwood.com',
    kind: 'independent',
    url: 'https://www.glennklockwood.com/',
    verified: true,
  },
  {
    id: 'cf-static-assets',
    title: 'Workers Static Assets',
    publisher: 'Cloudflare Docs',
    kind: 'primary',
    url: 'https://developers.cloudflare.com/workers/static-assets/',
    verified: true,
  },
  {
    id: 'cf-pricing',
    title: 'Workers pricing',
    publisher: 'Cloudflare Docs',
    kind: 'primary',
    url: 'https://developers.cloudflare.com/workers/platform/pricing/',
    verified: true,
  },
  {
    id: 'cf-r2-pricing',
    title: 'R2 pricing',
    publisher: 'Cloudflare Docs',
    kind: 'primary',
    url: 'https://developers.cloudflare.com/r2/pricing/',
    verified: true,
  },
  {
    id: 'ciechanowski',
    title: 'Explorable explainers (Gears, Cameras and Lenses, Internal Combustion Engine)',
    publisher: 'Bartosz Ciechanowski',
    kind: 'method',
    url: 'https://ciechanow.ski/',
    verified: true,
  },
  {
    id: 'victor-explorable',
    title: 'Explorable Explanations',
    publisher: 'Bret Victor',
    kind: 'method',
    url: 'https://worrydream.com/ExplorableExplanations/',
    verified: true,
  },
  {
    id: 'distill',
    title: 'Distill — interactive machine learning research',
    publisher: 'Distill',
    kind: 'method',
    url: 'https://distill.pub/',
    verified: true,
  },
];

export const sourceById = new Map(sources.map((s) => [s.id, s]));

export const kindLabel: Record<SourceKind, string> = {
  primary: 'Primary',
  independent: 'Independent analysis',
  vendor: 'Vendor / integrator',
  standard: 'Standards body',
  method: 'Pedagogy reference',
};
