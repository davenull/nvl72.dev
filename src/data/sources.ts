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

  // ── The fabric: InfiniBand and Ethernet ─────────────────────────────
  {
    id: 'ieee-ib-credits',
    title: 'InfiniBand Credit-Based Link-Layer Flow-Control (802.1 DCB TG tutorial)',
    publisher: 'Mellanox Technologies, presented to IEEE 802.1',
    kind: 'standard',
    url: 'https://www.ieee802.org/1/files/public/docs2014/new-dcb-crupnicoff-ibcreditstutorial-0314.pdf',
    verified: true,
    date: 'March 2014',
    note: 'Read directly. The clearest public account of why InfiniBand does not drop: "In-band Delivery of Flow Control Credits — vs. pause/xon-xoff schemes", credits counted absolutely as the "total allowed since initialization of the link", and resiliency — losing a credit update — named as the primary challenge. Points at IBTA Volume 1, section 7.9.',
  },
  {
    id: 'ibta-spec',
    title: 'InfiniBand Architecture Specification, Volume 1 — section 7.9, flow control',
    publisher: 'InfiniBand Trade Association',
    kind: 'standard',
    url: 'https://www.infinibandta.org/',
    verified: false,
    note: 'The normative source, but it is not openly downloadable — access requires IBTA registration, so it has not been read here. The section reference and the per-virtual-lane credit behaviour are corroborated by the IEEE tutorial above, which cites it directly. Confirm against the specification itself before treating any wording as normative.',
  },
  {
    id: 'nv-quantum-x800',
    title: 'NVIDIA Quantum-X800 InfiniBand platform',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/networking/products/infiniband/quantum-x800/',
    verified: true,
    note: '144 ports of 800 Gb/s; SHARP v4; adaptive routing; telemetry-based congestion control.',
  },
  {
    id: 'nv-xdr-switches',
    title: 'NVIDIA Quantum-X800 (XDR) clusters — switch systems and cabling',
    publisher: 'NVIDIA Networking Docs',
    kind: 'primary',
    url: 'https://networking-docs.nvidia.com/nvidia-quantum-x800-xdr-clusters',
    verified: true,
    note: 'Q3400-RA "144 XDR Ports over 72 OSFP Cages"; Q3200-RA "36 XDR Ports over 18 OSFP cages"; twin-port 1.6 Tb/s transceiver "1310nm SMF, up to 500m"; active copper 1.1–3 m.',
  },
  {
    id: 'nv-ib-switching',
    title: 'NVIDIA Quantum InfiniBand switches',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/networking/infiniband-switching/',
    verified: true,
    note: 'Separates the generations the site previously conflated: Quantum-X800 is XDR at 800 Gb/s and supports "over 10,000 nodes in two-level fat tree topology", while Quantum-2 is NDR at 400 Gb/s "for Hopper-generation or cost-optimized deployments".',
  },
  {
    id: 'nv-superpod-fabrics',
    title: 'DGX SuperPOD reference architecture (GB200) — Network Fabrics',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html',
    verified: true,
    note: '"Traffic per rail of each compute tray is always one hop away from other compute trays in the same Scalable Unit"; rail-aligned racks; spine-leaf-group design to 16 SUs with "8 leaf switches (one for each compute rack) and 6 spine switches"; fully non-blocking fat tree; fat-tree, Dragonfly and Torus all supported; SHIELD.',
  },
  {
    id: 'nv-superpod-components',
    title: 'DGX SuperPOD reference architecture (GB200) — Key Components',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-components.html',
    verified: true,
    note: 'Compute tray = two GB200 Superchips = four B200 and two Grace. "The compute tray integrates four ConnectX-7 (CX-7) NICs to support InfiniBand NDR (400Gbps) connectivity" and "two BlueFiled-3 (BF3) NICs to support 2x200Gbps connectivity for the In-band Management and Storage networks". SU = 8 racks; compute fabric on QM9700.',
  },
  {
    id: 'nv-ufm',
    title: 'NVIDIA UFM Enterprise — Subnet Manager and Adaptive Routing',
    publisher: 'NVIDIA Docs',
    kind: 'primary',
    url: 'https://networking-docs.nvidia.com/ufmenterpriseum/6201/sm-configurations',
    verified: true,
    note: 'The subnet manager is "a centralized entity running on the server that discovers and configures all the InfiniBand fabric devices to enable traffic flow throughout the fabric". As of UFM v6.4 adaptive routing is part of the core subnet manager and no longer needs a plugin for AR or SHIELD configuration.',
  },
  {
    id: 'nv-spectrumx',
    title: 'NVIDIA Spectrum-X Ethernet platform',
    publisher: 'NVIDIA',
    kind: 'primary',
    url: 'https://www.nvidia.com/en-us/networking/spectrumx/',
    verified: true,
    note: 'SN6600 "128 ports of 800 G OSFP"; SN6800 "512 ports of 800 G in a 5U form factor"; ConnectX-8 "800 Gb/s total throughput via 2×400 G"; ConnectX-9 "1,600 Gb/s per GPU via 4×200 G SerDes"; lossless networking; adaptive routing by switch and SuperNIC "in tight coordination"; telemetry-based congestion control. Its 1.6× and 1.9× figures are vendor claims published without a measured configuration.',
  },
  {
    id: 'nv-gpudirect',
    title: 'GPUDirect RDMA',
    publisher: 'NVIDIA CUDA Docs',
    kind: 'primary',
    url: 'https://docs.nvidia.com/cuda/gpudirect-rdma/',
    verified: true,
    note: 'GPU memory reachable by the NIC "without needing to copy data to host memory", over both InfiniBand and RoCE. Queue pairs comprise a send and a receive queue; verbs give OS-bypass, zero-copy and offload. `nvidia-peermem` registers GPU memory with the InfiniBand subsystem.',
  },

  {
    id: 'guo-roce',
    title: 'RDMA over Commodity Ethernet at Scale',
    publisher: 'Guo et al., Microsoft — ACM SIGCOMM',
    kind: 'independent',
    url: 'https://www.microsoft.com/en-us/research/publication/rdma-commodity-ethernet-scale/',
    verified: true,
    date: 'August 2016',
    note: 'The production account of what goes wrong when RoCEv2 is deployed at scale. Its abstract states outright: "We have addressed the safety challenges brought by PFC-induced deadlock (yes, it happened!), RDMA transport livelock, and the NIC PFC pause frame storm problem." Cited here so the site names the failure mode rather than alluding to one.',
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
