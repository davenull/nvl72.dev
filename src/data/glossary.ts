export interface Entry {
  id: string;
  term: string;
  /** One sentence, shown in the hover card. Aimed at the "new grad" level. */
  short: string;
  /** Shown on the glossary page under the short definition. */
  long?: string;
  see?: string[];
}

const list: Entry[] = [
  {
    id: 'hbm3e',
    term: 'HBM3e',
    short: 'High Bandwidth Memory — DRAM stacked vertically next to the GPU die, trading capacity for enormous bandwidth.',
    long: 'Each Blackwell package carries 192 GB of HBM3e delivering 8 TB/s. Stacking the DRAM on an interposer millimetres from the die is what makes that bandwidth physically possible; it is also why capacity is small compared to a CPU’s DDR and why the memory is soldered rather than socketed.',
    see: ['nvlink', 'roofline'],
  },
  {
    id: 'nvlink',
    term: 'NVLink',
    short: 'NVIDIA’s GPU-to-GPU interconnect — on NVL72 it carries 1.8 TB/s per GPU, about 14× PCIe Gen5.',
    long: 'NVLink 5 gives each GPU 18 ports of 100 GB/s. Crucially it is load/store coherent, not packet-and-DMA like a network: a kernel can read another GPU’s memory with an ordinary pointer dereference.',
    see: ['nvswitch', 'scale-up'],
  },
  {
    id: 'nvswitch',
    term: 'NVSwitch',
    short: 'The crossbar that turns point-to-point NVLink into an any-to-any fabric.',
    long: 'Each NVSwitch5 ASIC moves 28.8 Tb/s across 36 + 36 ports. Eighteen of them, one per GPU NVLink port, produce a single-layer non-blocking fabric across all 72 GPUs.',
    see: ['sharp', 'non-blocking'],
  },
  {
    id: 'non-blocking',
    term: 'non-blocking',
    short: 'Every port can run at full rate simultaneously — no traffic pattern can starve another.',
    long: 'Because each of a GPU’s 18 NVLink ports lands on a different switch ASIC, and each ASIC has enough ports for all 72 GPUs, any permutation of senders and receivers is served at line rate. There is no oversubscription ratio to reason about.',
  },
  {
    id: 'sharp',
    term: 'SHARP',
    short: 'Scalable Hierarchical Aggregation and Reduction Protocol — the switch does the arithmetic of a collective in-network.',
    long: 'For an all-reduce, partial sums are combined inside the NVSwitch ASICs as data passes through, rather than being shuttled back and forth between GPUs. This halves the bytes on the wire and is why the NVSwitch is 28.8 Tb/s rather than a raw 51.2 Tb/s — silicon that could have been ports went to reduction engines instead.',
  },
  {
    id: 'nvlink-c2c',
    term: 'NVLink-C2C',
    short: 'The 900 GB/s coherent link between a Grace CPU and its Blackwell GPUs, replacing PCIe.',
    long: 'Coherence is the operative word: the CPU and GPU share one address space with hardware-maintained cache coherence, so there is no explicit copy step and no pinned-memory dance.',
    see: ['nvlink'],
  },
  {
    id: 'moe',
    term: 'MoE',
    short: 'Mixture of Experts — a model where each token is routed to a small subset of many parallel sub-networks.',
    long: 'MoE buys capacity without proportional compute, but routing means every token must be shipped to whichever expert it selected and the result shipped back. That is an all-to-all exchange on every layer, which is exactly the traffic pattern NVLink is good at and Ethernet is bad at.',
    see: ['expert-parallelism', 'nvlink'],
  },
  {
    id: 'expert-parallelism',
    term: 'expert parallelism',
    short: 'Spreading an MoE model’s experts across many GPUs so each holds only a few.',
    long: 'Wide expert parallelism reduces the weight memory each GPU must hold, which lets you raise batch size and thus decode throughput. It is only affordable when the all-to-all between GPUs is nearly free — the 130 TB/s domain is what makes it so.',
    see: ['moe', 'decode'],
  },
  {
    id: 'prefill',
    term: 'prefill',
    short: 'The first phase of inference: processing the whole prompt at once. Compute-bound.',
    long: 'Prefill runs one big matrix multiply per layer over every prompt token in parallel, so it saturates the tensor cores. It sets time-to-first-token.',
    see: ['decode', 'disaggregation'],
  },
  {
    id: 'decode',
    term: 'decode',
    short: 'The token-by-token generation phase. Memory-bandwidth-bound, not compute-bound.',
    long: 'Decode generates one token at a time, so each step reads the entire weight set (and the KV cache) to do very little arithmetic. Throughput is set by memory bandwidth, which is why batching many requests together matters so much here and not in prefill.',
    see: ['prefill', 'roofline'],
  },
  {
    id: 'disaggregation',
    term: 'disaggregated serving',
    short: 'Running prefill and decode on different GPUs, each tuned for its own bottleneck.',
    long: 'NVIDIA Dynamo splits the two phases across separate GPU pools and streams the KV cache between them. Because they have opposite bottlenecks, co-locating them forces a compromise; separating them let GB200 NVL72 reach roughly 1.5× the throughput of aggregated serving on MLPerf Inference v5.1.',
    see: ['prefill', 'decode'],
  },
  {
    id: 'kv-cache',
    term: 'KV cache',
    short: 'The stored keys and values from every previous token, re-read on each decode step.',
    long: 'It grows linearly with context length and with batch size, and it is read in full for every generated token — which makes it a first-order consumer of both HBM capacity and HBM bandwidth in long-context serving.',
    see: ['decode'],
  },
  {
    id: 'fp4',
    term: 'FP4 / NVFP4',
    short: 'A 4-bit floating-point number format. Blackwell’s tensor cores execute it natively.',
    long: 'Halving the bits roughly doubles both arithmetic throughput and the number of weights that fit in memory and on the wire. NVFP4 is NVIDIA’s block-scaled variant, which keeps accuracy usable by attaching a shared scale factor to small groups of values.',
    see: ['sparsity'],
  },
  {
    id: 'sparsity',
    term: 'structured sparsity',
    short: 'Skipping half the weights in a fixed 2-of-4 pattern, doubling the quoted throughput.',
    long: 'The headline 1.44 EF FP4 figure is a sparse number. Dense FP4 is about half that. Always check which one a benchmark is quoting.',
    see: ['fp4'],
  },
  {
    id: 'roofline',
    term: 'roofline',
    short: 'A model that says performance is capped by either compute or memory bandwidth, whichever binds first.',
    long: 'Plot achievable FLOPS against arithmetic intensity (FLOPs per byte moved) and you get a slanted memory-bound ramp meeting a flat compute-bound ceiling. The corner — the "ridge point" — is the intensity a workload needs to be worth its FLOPS. On modern accelerators that ridge sits high, which is why so many real workloads live on the ramp.',
    see: ['decode', 'hbm3e'],
  },
  {
    id: 'scale-up',
    term: 'scale-up vs scale-out',
    short: 'Scale-up makes one machine bigger (NVLink); scale-out adds more machines (InfiniBand/Ethernet).',
    long: 'NVL72’s whole thesis is that scale-up now extends to a whole rack. Inside the rack, bandwidth per GPU is roughly 18× what the scale-out network provides — so the partitioning of a model across the two tiers is the central performance decision.',
    see: ['nvlink', 'superpod'],
  },
  {
    id: 'superpod',
    term: 'SuperPOD',
    short: 'A reference cluster design: 8 NVL72 racks, 576 GPUs, joined by InfiniBand or Spectrum-X Ethernet.',
    see: ['scale-up'],
  },
  {
    id: 'mig',
    term: 'MIG',
    short: 'Multi-Instance GPU — hardware partitioning of one physical GPU into isolated slices.',
  },
  {
    id: 'mnnvl',
    term: 'MNNVL',
    short: 'Multi-Node NVLink — exporting GPU memory across separate operating-system domains within the NVLink fabric.',
    long: 'The IMEX service brokers the export/import handshake; Kubernetes models it with a ComputeDomain custom resource via the GPU Operator and the DRA driver.',
  },
  {
    id: 'busbar',
    term: 'busbar',
    short: 'A shared conductor running the height of the rack that feeds every tray, replacing per-server power supplies.',
    long: 'Rack-level power shelves rectify facility input once, and trays draw from the busbar. Consolidating conversion is more efficient and reclaims the volume that 18 pairs of redundant PSUs would occupy.',
  },
  {
    id: 'cdu',
    term: 'CDU',
    short: 'Coolant Distribution Unit — the pump-and-heat-exchanger that isolates the rack’s coolant loop from the facility’s.',
    long: 'It can sit in-rack (typically at the bottom) or in a sidecar. It gives the rack a controlled, filtered loop at a known pressure and temperature independent of whatever the building water is doing.',
    see: ['uqd'],
  },
  {
    id: 'uqd',
    term: 'UQD',
    short: 'Universal Quick Disconnect — a dripless blind-mate coupling that connects a tray to the coolant manifold as it is inserted.',
    long: 'Blind-mate matters operationally: a technician slides a tray in from the front and it makes both its data and its liquid connections without anyone touching a hose.',
  },
  {
    id: 'pue',
    term: 'PUE',
    short: 'Power Usage Effectiveness — total facility power divided by IT power. 1.0 is the unreachable ideal.',
    long: 'Warm-water direct-to-chip cooling can push PUE toward 1.05–1.1 because a 45 °C inlet can often be met with dry coolers and no compressor at all.',
  },
  {
    id: 'ocp',
    term: 'OCP / ORv3',
    short: 'The Open Compute Project and its Open Rack v3 standard — openly licensed mechanical and power specifications.',
    long: 'NVL72 is ORv3-inspired, and NVIDIA contributed elements of the design back to OCP. Those openly licensed documents are the legitimate source for dimensions.',
  },
  {
    id: 'ras',
    term: 'RAS engine',
    short: 'Reliability, Availability, Serviceability — on-die logic that runs self-tests and predicts failures.',
  },
  {
    id: 'nccl',
    term: 'NCCL',
    short: 'NVIDIA’s collective communications library — the thing that actually executes an all-reduce, and it is topology-aware.',
  },
];

export const glossary = new Map(list.map((e) => [e.id, e]));
export const allTerms = [...list].sort((a, b) => a.term.localeCompare(b.term, 'en'));

export function term(id: string): Entry {
  const e = glossary.get(id);
  if (!e) throw new Error(`Unknown glossary id: ${id}`);
  return e;
}
