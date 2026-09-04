export type SourceKind = 'primary' | 'independent' | 'vendor' | 'standard' | 'method';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  kind: SourceKind;
  url?: string;
  /**
   * true = the document at `url` was opened and confirmed to contain the claim
   * it is cited for. false = the claim is inherited from the research report and
   * the document could not be independently read; those are listed on /sources.
   */
  verified: boolean;
  /** Publication date where the source is a dated article rather than a living page. */
  date?: string;
  note?: string;
}

export const sources: Source[] = [
  // ── NVIDIA product pages ────────────────────────────────────────────
  {
    id: 'nv-gb200',
    title: 'GB200 NVL72 product page',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
    verified: true,
    note: 'Source of the "acts as a single, massive GPU" framing and the 30× / 10× inference claims, with their measured configuration.',
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
    title: 'Grace CPU Superchip',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/grace-cpu-superchip/',
    verified: true,
    note: 'Describes the standalone Grace Superchip. The GB200 Grace is configured differently — do not capacity-plan from this page.',
  },
  {
    id: 'nv-nvlink',
    title: 'NVLink and NVLink Switch',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/data-center/nvlink/',
    verified: true,
  },

  // ── NVIDIA Technical Blog ───────────────────────────────────────────
  {
    id: 'nv-devblog-nvl72',
    title: 'NVIDIA GB200 NVL72 Delivers Trillion-Parameter LLM Training and Real-Time Inference',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/',
    verified: true,
    note: 'Confirms 900 GB/s NVLink-C2C, 30 TB unified memory, 130 TB/s fabric, and the 30× GPT-MoE-1.8T figure.',
  },
  {
    id: 'nv-devblog-mlperf',
    title: 'NVIDIA Blackwell Architecture Sweeps MLPerf Training v5.1 Benchmarks',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/nvidia-blackwell-architecture-sweeps-mlperf-training-v5-1-benchmarks/',
    verified: true,
    note: 'GB300 NVL72 debut in MLPerf Training; NVFP4 used in training for the first time; the 10-minute Llama 3.1 405B record on more than 5,000 Blackwell GPUs.',
  },
  {
    id: 'nv-devblog-moe',
    title: 'How NVIDIA GB200 NVL72 and NVIDIA Dynamo Boost Inference Performance for MoE Models',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/how-nvidia-gb200-nvl72-and-nvidia-dynamo-boost-inference-performance-for-moe-models/',
    verified: true,
  },
  {
    id: 'nv-devblog-widep',
    title: 'Scaling Large MoE Models with Wide Expert Parallelism on NVL72 Rack-Scale Systems',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/scaling-large-moe-models-with-wide-expert-parallelism-on-nvl72-rack-scale-systems/',
    verified: true,
  },
  {
    id: 'nv-devblog-power',
    title: 'How New GB300 NVL72 Features Provide Steady Power for AI',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/how-new-gb300-nvl72-features-provide-steady-power-for-ai/',
    verified: true,
    note: 'The power-smoothing source: programmable power caps, integrated electrolytic capacitors, a hardware power burner, and a measured 30% reduction in peak grid demand training Megatron.',
  },
  {
    id: 'nv-devblog-ultra',
    title: 'Inside NVIDIA Blackwell Ultra: The Chip Powering the AI Factory Era',
    publisher: 'NVIDIA Technical Blog',
    kind: 'primary',
    url: 'https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/',
    verified: true,
  },
  {
    id: 'nv-ocp',
    title: 'NVIDIA Contributes NVIDIA GB200 NVL72 Designs to the Open Compute Project',
    publisher: 'NVIDIA Technical Blog',
    kind: 'standard',
    url: 'https://developer.nvidia.com/blog/nvidia-contributes-nvidia-gb200-nvl72-designs-to-open-compute-project/',
    verified: true,
    note: 'Specifies four NVLink cartridges with over 5,000 copper cables delivering 260 TB/s AllReduce bandwidth, a 1,400 A busbar, and over 100 lb of rack reinforcement steel.',
  },

  // ── NVIDIA docs ─────────────────────────────────────────────────────
  {
    id: 'nv-mnnvl',
    title: 'MNNVL User Guide — Overview',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/multi-node-nvlink-systems/mnnvl-user-guide/overview.html',
    verified: true,
  },
  {
    id: 'nv-imex',
    title: 'NVIDIA IMEX Service for NVLink Networks — Overview',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/multi-node-nvlink-systems/imex-guide/overview.html',
    verified: true,
    note: 'IMEX brokers GPU memory export/import across OS domains over NVLink; it does not depend on CUDA and communicates over TCP and gRPC.',
  },
  {
    id: 'nv-tuning',
    title: 'GB200 NVL Multi-Node Tuning Guide — Power and Thermals',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/multi-node-nvlink-systems/multi-node-tuning-guide/power-thermals.html',
    verified: true,
    note: 'Names Power Smoothing as implemented for bulk synchronous workloads, and covers power balancing within a provisioned rack limit.',
  },
  {
    id: 'nv-dynamo',
    title: 'NVIDIA Dynamo — disaggregated prefill/decode serving',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://github.com/ai-dynamo/dynamo',
    verified: true,
  },

  // ── Benchmarks ──────────────────────────────────────────────────────
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
    title: 'CoreWeave, NVIDIA and IBM Set MLPerf Record with the Largest GB200 Blackwell Cluster',
    publisher: 'CoreWeave',
    kind: 'vendor',
    url: 'https://www.coreweave.com/blog/coreweave-nvidia-and-ibm-set-mlperf-record-with-largest-nvidia-gb200-blackwell-cluster-achieving-over-2x-faster-training',
    verified: true,
    date: '4 June 2025',
    note: 'Confirmed verbatim: "2,496 NVIDIA Blackwell GPUs across 39 racks, each containing 64 active GPUs", Llama 3.1 405B "completed in 27.33 minutes", against "around 156 racks" for an equivalent H100 setup at 32 GPUs per rack.',
  },

  // ── Independent analysis ────────────────────────────────────────────
  {
    id: 'semianalysis-gb200',
    title: 'GB200 Hardware Architecture — Component Supply Chain & BOM',
    publisher: 'SemiAnalysis',
    kind: 'independent',
    url: 'https://newsletter.semianalysis.com/p/gb200-hardware-architecture-and-component',
    verified: true,
  },
  {
    id: 'semianalysis-optical',
    title: "Nvidia's Optical Boogeyman — NVL72, InfiniBand Scale Out, 800G & 1.6T Ramp",
    publisher: 'SemiAnalysis',
    kind: 'independent',
    url: 'https://newsletter.semianalysis.com/p/nvidias-optical-boogeyman-nvl72-infiniband',
    verified: true,
    note: 'Running the NVLink spine over optics would add roughly 20 kW for transceivers and retimers alone. Also the origin of the 5,184 cable count.',
  },
  {
    id: 'sth-teardown',
    title: 'This is the NVIDIA DGX GB200 NVL72',
    publisher: 'ServeTheHome',
    kind: 'independent',
    url: 'https://www.servethehome.com/this-is-the-nvidia-dgx-gb200-nvl72/',
    verified: true,
    note: 'Teardown coverage: half-width nodes two-abreast in 1U, nine switch trays of two chips each, four ports and 18 links per chip, power shelves and the CDU below the compute nodes.',
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

  // ── Vendors & integrators ───────────────────────────────────────────
  {
    id: 'supermicro',
    title: 'Supermicro NVIDIA GB200 NVL72 SuperCluster datasheet (PDF)',
    publisher: 'Supermicro',
    kind: 'vendor',
    url: 'https://www.supermicro.com/datasheet/datasheet_SuperCluster_GB200_NVL72.pdf',
    verified: true,
    note: 'Read directly. Rack 2236 × 600 × 1068 mm; 8 × 1U 33 kW power shelves totalling 132 kW; operating power 125–135 kW; 10 + 8 compute trays around 9 NVLink switch trays; up to 372 GB HBM3e and 480 GB LPDDR5X per Superchip; in-rack 250 kW CDU.',
  },
  {
    id: 'schneider',
    title: 'Why Liquid Cooling For AI Data Centers Is Harder Than It Looks',
    publisher: 'Steven Carlini, Schneider Electric — Forbes Technology Council',
    kind: 'independent',
    url: 'https://www.forbes.com/councils/forbestechcouncil/2025/06/30/why-liquid-cooling-for-ai-data-centers-is-harder-than-it-looks/',
    verified: true,
    date: '30 June 2025',
    note: 'Confirmed verbatim: "When fully loaded into a rack, the latest NVIDIA-based GPU servers require 132 kW of power" and "The next generation, expected in under a year, will require 240 kW per rack." This article does NOT contain the retrofit-cost figure that is often attributed to it.',
  },
  {
    id: 'stl-retrofit',
    title: 'The Retrofitting Roadmap: An Evolution of Liquid Cooling',
    publisher: 'STL Partners (supported by Airedale)',
    kind: 'independent',
    url: 'https://stlpartners.com/press/liquid-cooling-retrofits-can-cost-roughly-80-less/',
    verified: true,
    date: '28 May 2026',
    note: 'Liquid cooling retrofits at "around USD2 million per MW" against "upwards of USD11 million per MW" for new greenfield liquid-cooled builds.',
  },
  {
    id: 'qct',
    title: 'QCT QoolRack Stand-Alone — Advanced Liquid Cooling for NVIDIA GB200 NVL72 Systems (PDF)',
    publisher: 'QCT',
    kind: 'vendor',
    url: 'https://blog.qct.io/wp-content/uploads/2025/04/QCT-Qoolrack-Stand-Alone_Advanced-Liquid-Cooling-for-NVIDIA-GB200-NVL72-Systems.pdf',
    verified: false,
    note: 'The document exists and resolves, but its text is embedded as CID-encoded fonts and could not be extracted, so the 45 °C maximum inlet, 65 °C maximum return and ~130 L/min per-rack figures attributed to it are still second-hand here. Several secondary sources repeat exactly these numbers and credit QCT. Confirm against the readable document before treating them as primary.',
  },

  // ── Pedagogy ────────────────────────────────────────────────────────
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

  // ── Hosting ─────────────────────────────────────────────────────────
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
];

export const sourceById = new Map(sources.map((s) => [s.id, s]));

export const kindLabel: Record<SourceKind, string> = {
  primary: 'Primary',
  independent: 'Independent analysis',
  vendor: 'Vendor / integrator',
  standard: 'Standards contribution',
  method: 'Pedagogy reference',
};
