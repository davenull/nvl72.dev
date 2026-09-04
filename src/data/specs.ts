/**
 * The fact base. Every number the site states about NVL72 lives here once, so
 * that a correction lands in one place and so that disputed figures can never
 * be rendered as a bare single number.
 *
 * `disputed: true` means published sources genuinely disagree. Those render
 * with a range and a visible marker — see the Caveats section of the research
 * report and /sources#disputed.
 */
export interface Spec {
  id: string;
  label: string;
  /** Display value, already formatted. */
  value: string;
  unit?: string;
  /** Populated when sources disagree; shown instead of hidden. */
  range?: string;
  disputed?: boolean;
  /** Announced-but-not-shipping figures are labelled, never stated as measured. */
  announced?: boolean;
  note?: string;
  sources: string[];
}

const list: Spec[] = [
  // ── Rack ───────────────────────────────────────────────────────────────
  { id: 'gpus', label: 'Blackwell GPUs per rack', value: '72', sources: ['nv-gb200'] },
  { id: 'cpus', label: 'Grace CPUs per rack', value: '36', sources: ['nv-gb200'] },
  { id: 'superchips', label: 'GB200 Superchips per rack', value: '36', sources: ['nv-gb200'] },
  { id: 'compute-trays', label: 'Compute trays', value: '18', unit: '× 1U', note: 'Split 8 and 10 around the switch band rather than evenly — Supermicro’s rack diagram lists ten above the NVLink switches and eight below.', sources: ['supermicro', 'sth-teardown'] },
  { id: 'switch-trays', label: 'NVSwitch trays', value: '9', sources: ['sth-teardown'] },
  { id: 'switch-asics', label: 'NVSwitch5 ASICs', value: '18', note: '2 per switch tray.', sources: ['nv-nvlink'] },
  { id: 'rack-weight', label: 'Rack weight', value: '~1.36', unit: 't', note: 'About 3,000 lb — a floor-loading problem for most existing halls. NVIDIA’s OCP contribution describes over 100 lb of added reinforcement steel in the frame alone.', sources: ['sth-teardown', 'nv-ocp'] },
  { id: 'rack-height', label: 'Rack height', value: '2,236', unit: 'mm', note: 'Roughly a 42U-class footprint; ORv3-inspired / NVIDIA MGX reference rack.', sources: ['supermicro'] },
  { id: 'rack-width', label: 'Rack width', value: '600', unit: 'mm', sources: ['supermicro'] },
  { id: 'rack-depth', label: 'Rack depth', value: '1,068', unit: 'mm', sources: ['supermicro'] },
  { id: 'power-shelves', label: 'Power shelves', value: '8', unit: '× 1U', note: 'Arranged 4 + 4, each 33 kW from six 5.5 kW supplies — 132 kW of installed shelf capacity feeding the busbar.', sources: ['supermicro'] },
  { id: 'busbar-current', label: 'Busbar current capacity', value: '1,400', unit: 'A', sources: ['nv-ocp'] },

  // ── Memory ─────────────────────────────────────────────────────────────
  {
    id: 'hbm-total', label: 'Pooled HBM3e per rack', value: '~13.5', unit: 'TB',
    range: '13.4 – 13.8 TB', disputed: true,
    note: 'Sources differ on rounding, on physical versus usable-after-ECC capacity, and on SKU. NVIDIA’s 192 GB per GPU gives 13.82 TB physical and 12.96 TB after ECC; Supermicro’s datasheet quotes up to 372 GB per Superchip — 186 GB per GPU — which is where the 13.4 TB figure comes from.',
    sources: ['nv-gb200', 'supermicro', 'semianalysis-gb200'],
  },
  { id: 'hbm-per-gpu', label: 'HBM3e per Blackwell GPU', value: '192', unit: 'GB', note: '180 GB usable after ECC.', sources: ['nv-blackwell'] },
  { id: 'hbm-bw', label: 'Memory bandwidth per GPU', value: '8', unit: 'TB/s', sources: ['nv-blackwell'] },
  { id: 'lpddr-total', label: 'LPDDR5X per rack', value: '~17', unit: 'TB', sources: ['nv-gb200'] },
  { id: 'mem-total', label: 'Unified memory per rack', value: '~30', unit: 'TB', note: 'HBM3e + LPDDR5X, coherent across NVLink-C2C.', sources: ['nv-gb200'] },

  // ── Compute ────────────────────────────────────────────────────────────
  { id: 'fp4-sparse', label: 'FP4 with sparsity', value: '1,440', unit: 'PFLOPS', note: '1.44 exaFLOPS. This is the headline number and it is sparse — halve it for dense.', sources: ['nv-gb200'] },
  { id: 'fp4-dense', label: 'FP4 dense', value: '~720', unit: 'PFLOPS', sources: ['nv-gb200'] },
  { id: 'fp8', label: 'FP8', value: '720', unit: 'PFLOPS', sources: ['nv-gb200'] },
  { id: 'gpu-fp4', label: 'Peak FP4 per GPU', value: '~20', unit: 'PFLOPS', note: 'Sparse.', sources: ['nv-blackwell'] },
  { id: 'transistors', label: 'Transistors per Blackwell GPU', value: '208', unit: 'billion', note: '104 B per die, two dies per package.', sources: ['nv-blackwell'] },
  { id: 'nv-hbi', label: 'NV-HBI die-to-die link', value: '10', unit: 'TB/s', note: 'Makes the two reticle-limited dies present as one cache-coherent GPU.', sources: ['nv-blackwell'] },
  { id: 'l2', label: 'L2 cache per GPU', value: '126', unit: 'MB', sources: ['nv-blackwell'] },
  { id: 'process', label: 'Process node', value: 'TSMC 4NP', sources: ['nv-blackwell'] },
  { id: 'grace-cores', label: 'Arm Neoverse V2 cores per Grace CPU', value: '72', sources: ['nv-grace'] },
  { id: 'grace-mem', label: 'LPDDR5X per Grace CPU', value: 'up to 480', unit: 'GB', note: 'The standalone Grace superchip datasheet quotes 512 GB at 546 GB/s; the GB200 Grace is configured differently and uses a reduced 1 MB L2 per core.', sources: ['nv-grace'] },
  { id: 'grace-bw', label: 'LPDDR5X bandwidth per Grace CPU', value: 'up to ~500', unit: 'GB/s', sources: ['nv-grace'] },
  { id: 'scf', label: 'Scalable Coherency Fabric bisection', value: '3.2', unit: 'TB/s', sources: ['nv-grace'] },
  { id: 'c2c', label: 'NVLink-C2C, Grace ↔ Blackwell', value: '900', unit: 'GB/s', note: 'Coherent, roughly 7× PCIe Gen5.', sources: ['nv-gb200'] },
  { id: 'superchip-power', label: 'GB200 Superchip power', value: '~2,700', unit: 'W', sources: ['semianalysis-gb200'] },

  // ── Interconnect ───────────────────────────────────────────────────────
  { id: 'nvlink-per-gpu', label: 'NVLink 5 bandwidth per GPU', value: '1.8', unit: 'TB/s', note: 'Bidirectional: 18 links × 100 GB/s. About 14× PCIe Gen5.', sources: ['nv-nvlink'] },
  { id: 'nvlink-links', label: 'NVLink ports per GPU', value: '18', sources: ['nv-nvlink'] },
  { id: 'nvswitch-asic', label: 'Bandwidth per NVSwitch5 ASIC', value: '28.8', unit: 'Tb/s', note: '7.2 TB/s; 36 + 36 ports. Lower than a raw 51.2 Tb/s switch because silicon budget goes to SHARP in-network reduction engines.', sources: ['nv-nvlink'] },
  { id: 'alltoall', label: 'All-to-all NVLink bandwidth in-rack', value: '130', unit: 'TB/s', sources: ['nv-gb200'] },
  { id: 'allreduce', label: 'AllReduce bandwidth over the spine', value: '260', unit: 'TB/s', sources: ['nv-ocp'] },
  {
    id: 'spine-cables', label: 'Copper cables in the NVLink spine', value: '>5,000',
    range: '5,000 – 5,184', disputed: true,
    note: 'NVIDIA’s OCP contribution says "over 5,000"; other sources cite 5,184. Jensen Huang described it as "5,000 NVLink cables. In total, 2 miles."',
    sources: ['nv-ocp', 'sth-teardown'],
  },
  { id: 'spine-cartridges', label: 'NVLink cable cartridges', value: '4', sources: ['nv-ocp'] },
  { id: 'optical-penalty', label: 'Power an all-optical spine would have cost', value: '~20', unit: 'kW', note: 'NVIDIA’s stated rationale for copper. SemiAnalysis independently computed ~19.4 kW from 648 × 1.6T transceivers at ~30 W.', sources: ['semianalysis-optical'] },

  // ── Power & cooling ────────────────────────────────────────────────────
  {
    id: 'rack-power', label: 'Rack power', value: '~120', unit: 'kW',
    range: '120 kW nominal · 125–135 kW operating (Supermicro) · 132 kW fully loaded (Schneider Electric)', disputed: true,
    note: 'Supermicro’s datasheet states an operating power of 125–135 kW and 132 kW of installed power-shelf capacity. Steven Carlini, writing for Schneider Electric: "When fully loaded into a rack, the latest NVIDIA-based GPU servers require 132 kW of power." The commonly quoted ~120 kW is the nominal design figure, not a measured ceiling.',
    sources: ['supermicro', 'schneider', 'sth-teardown'],
  },
  { id: 'per-gpu-power', label: 'Power per GPU', value: '~1,200', unit: 'W', note: 'The commonly cited per-GPU board power for Blackwell in GB200. Rack power divided by 72 lands higher because the figure excludes the CPUs, NVSwitch trays, NICs and conversion losses.', sources: ['semianalysis-gb200', 'nv-blackwell'] },
  { id: 'mean-rack', label: 'Worldwide mean rack density', value: '7.6', unit: 'kW', note: 'Up from 6.8 kW the prior year; 8.4 kW if racks above 30 kW are excluded. An NVL72 is roughly sixteen average racks in one footprint.', sources: ['uptime-2025'] },
  { id: 'inlet-temp', label: 'Coolant inlet temperature', value: '32 – 45', unit: '°C', note: 'NVIDIA ACS reference design. A 45 °C maximum inlet and 65 °C maximum return are attributed to QCT across several sources; that document could not be read directly, so treat the limits as second-hand. Warm water is the point either way: it is what enables free cooling.', sources: ['qct'] },
  {
    id: 'flow-rate', label: 'Coolant flow', value: '~2–3 L/min per module', 
    range: '2–3 L/min per module · 30–40 L/min per rack (NVIDIA ACS) · up to ~130 L/min per rack (QCT)', disputed: true,
    note: 'Figures vary by whether they are quoted per cold plate or per rack, and by the assumed ΔT. Always state the basis.',
    sources: ['qct'],
  },
  {
    id: 'retrofit-cost', label: 'Cost of liquid cooling per MW', value: '~$2M retrofit',
    range: '~$2M per MW to retrofit · upwards of $11M per MW for a new greenfield liquid-cooled build', disputed: true,
    note: 'STL Partners, May 2026. A widely repeated "$5–10M per MW" retrofit figure is often attributed to Schneider Electric; it does not appear in the Schneider article this site cites, and no primary source for it could be found — so it is not used here.',
    sources: ['stl-retrofit'],
  },

  // ── Scale-out ──────────────────────────────────────────────────────────
  { id: 'superpod-racks', label: 'NVL72 racks per SuperPOD', value: '8', sources: ['nv-gb200'] },
  { id: 'superpod-gpus', label: 'GPUs per SuperPOD', value: '576', sources: ['nv-gb200'] },
  { id: 'superpod-bw', label: 'SuperPOD aggregate bandwidth', value: '~1', unit: 'PB/s', sources: ['nv-gb200'] },
  { id: 'superpod-mem', label: 'SuperPOD fast memory', value: '~240', unit: 'TB', sources: ['nv-gb200'] },
  { id: 'max-gpus', label: 'Maximum GPUs in one fabric', value: '9,216', note: 'With 128 leaf switches, rail-optimised.', sources: ['nv-gb200'] },
  { id: 'cx7', label: 'ConnectX-7 SuperNIC', value: '400', unit: 'Gb/s', sources: ['nv-gb200'] },
  { id: 'cx8', label: 'ConnectX-8 SuperNIC', value: '800', unit: 'Gb/s', note: 'PCIe Gen6; shipped on GB300.', sources: ['nv-gb300'] },
  { id: 'quantum-x800', label: 'Quantum-X800 InfiniBand switch', value: '144 × 800', unit: 'Gb/s', note: 'Q3400.', sources: ['nv-gb200'] },

  // ── Results ────────────────────────────────────────────────────────────
  { id: 'mlperf-405b', label: 'Llama 3.1 405B training time', value: '27.3', unit: 'min', note: 'MLPerf Training v5.0, 4 June 2025: 27.33 minutes on 2,496 Blackwell GPUs across 39 racks running 64 active GPUs each — not fully populated 72-GPU racks, which is why 2,496 does not divide by 72. CoreWeave puts an equivalent H100 setup at around 156 racks, assuming 32 GPUs per rack. A later round reached about 10 minutes on more than 5,000 Blackwell GPUs.', sources: ['coreweave-pr', 'mlcommons'] },
  { id: 'mlperf-nvfp4', label: 'Blackwell NVFP4 training speedup vs Hopper FP8', value: 'up to 3.2×', note: 'MLPerf Training v5.1, Llama 3.1 405B, at the same GPU count.', sources: ['nv-devblog-mlperf'] },
  { id: 'mlperf-ultra', label: 'GB300 training speedup', value: '4.2× vs Hopper, 1.9× vs GB200', note: 'At 512-GPU scale.', sources: ['nv-devblog-mlperf'] },
  { id: 'disagg-gain', label: 'Disaggregated vs aggregated serving', value: '~1.5×', unit: 'throughput', note: 'MLPerf Inference v5.1, Llama 3.1 405B interactive.', sources: ['mlcommons', 'nv-dynamo', 'nv-devblog-moe'] },
  { id: 'inference-30x', label: 'Real-time trillion-parameter LLM inference', value: '30×', note: 'NVIDIA’s measured configuration: TTL = 50 ms, FTL = 5 s, 32,768 input / 1,024 output tokens, GPT-MoE-1.8T, comparing 64 Hopper GPUs over InfiniBand against 32 Blackwell GPUs in an NVL72. Not a like-for-like GPU count.', sources: ['nv-gb200', 'nv-devblog-nvl72'] },
  { id: 'moe-10x', label: 'Mixture-of-experts performance', value: '10×', note: 'Same measured configuration as the 30× figure.', sources: ['nv-gb200'] },

  // ── Roadmap (announced, not measured) ──────────────────────────────────
  { id: 'gb300-hbm', label: 'HBM3e per Blackwell Ultra GPU', value: '288', unit: 'GB', range: '279 GB vs 288 GB', disputed: true, note: 'SKU and ECC accounting. Note that NVIDIA’s own MLPerf Training v5.1 blog quotes 279 GB, so this is not simply a case of secondary sources getting it wrong.', sources: ['nv-gb300', 'nv-devblog-mlperf'] },
  { id: 'gb300-power', label: 'Power per Blackwell Ultra GPU', value: '~1,400', unit: 'W', sources: ['nv-gb300'] },
  { id: 'gb300-fp4', label: 'GB300 FP4 uplift', value: '1.5×', note: 'Relative to GB200.', sources: ['nv-gb300'] },
  { id: 'rubin-fp4', label: 'Vera Rubin NVL144 FP4', value: '~3.6', unit: 'EF', announced: true, note: 'Announced for 2H 2026. Note that "144" counts dies, not packages — there are 72 Rubin packages.', sources: ['nv-gb300'] },
  { id: 'power-smoothing', label: 'Reduction in peak grid demand from power smoothing', value: 'up to 30', unit: '%', note: 'Measured on GB300 NVL72 training Megatron, using programmable power caps, energy-storage-enhanced power shelves with integrated electrolytic capacitors, and a hardware power burner across ramp-up, steady-state and ramp-down. NVIDIA states the feature is also coming to GB200 NVL72.', sources: ['nv-devblog-power'] },
  { id: 'next-gen-power', label: 'Next-generation rack power', value: '240', unit: 'kW', announced: true, note: 'Schneider Electric, forward-looking: "The next generation, expected in under a year, will require 240 kW per rack."', sources: ['schneider'] },
];

export const specs = new Map(list.map((s) => [s.id, s]));
export const allSpecs = list;

export function spec(id: string): Spec {
  const s = specs.get(id);
  if (!s) throw new Error(`Unknown spec id: ${id}`);
  return s;
}

/** Full display string, e.g. "~13.5 TB". */
export function specText(id: string): string {
  const s = spec(id);
  return s.unit ? `${s.value} ${s.unit}` : s.value;
}

export const disputedSpecs = list.filter((s) => s.disputed);
export const announcedSpecs = list.filter((s) => s.announced);
