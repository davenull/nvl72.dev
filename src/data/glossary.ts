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
    short: 'High Bandwidth Memory - DRAM stacked vertically next to the GPU die, trading capacity for enormous bandwidth.',
    long: 'Each Blackwell package carries 192 GB of HBM3e delivering 8 TB/s. Stacking the DRAM on an interposer millimetres from the die is what makes that bandwidth physically possible; it is also why capacity is small compared to a CPU’s DDR and why the memory is soldered rather than socketed.',
    see: ['nvlink', 'roofline'],
  },
  {
    id: 'nvlink',
    term: 'NVLink',
    short: 'NVIDIA’s GPU-to-GPU interconnect - on NVL72 it carries 1.8 TB/s per GPU, about 14× PCIe Gen5.',
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
    short: 'Every port can run at full rate simultaneously - no traffic pattern can starve another.',
    long: 'Because each of a GPU’s 18 NVLink ports lands on a different switch ASIC, and each ASIC has enough ports for all 72 GPUs, any permutation of senders and receivers is served at line rate. There is no oversubscription ratio to reason about.',
  },
  {
    id: 'sharp',
    term: 'SHARP',
    short: 'Scalable Hierarchical Aggregation and Reduction Protocol - the switch does the arithmetic of a collective in-network.',
    long: 'For an all-reduce, partial sums are combined inside the NVSwitch ASICs as data passes through, rather than being shuttled back and forth between GPUs. This halves the bytes on the wire and is why the NVSwitch is 28.8 Tb/s rather than a raw 51.2 Tb/s - silicon that could have been ports went to reduction engines instead.',
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
    short: 'Mixture of Experts - a model where each token is routed to a small subset of many parallel sub-networks.',
    long: 'MoE buys capacity without proportional compute, but routing means every token must be shipped to whichever expert it selected and the result shipped back. That is an all-to-all exchange on every layer, which is exactly the traffic pattern NVLink is good at and Ethernet is bad at.',
    see: ['expert-parallelism', 'nvlink'],
  },
  {
    id: 'expert-parallelism',
    term: 'expert parallelism',
    short: 'Spreading an MoE model’s experts across many GPUs so each holds only a few.',
    long: 'Wide expert parallelism reduces the weight memory each GPU must hold, which lets you raise batch size and thus decode throughput. It is only affordable when the all-to-all between GPUs is nearly free - the 130 TB/s domain is what makes it so.',
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
    long: 'It grows linearly with context length and with batch size, and it is read in full for every generated token - which makes it a first-order consumer of both HBM capacity and HBM bandwidth in long-context serving.',
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
    long: 'Plot achievable FLOPS against arithmetic intensity (FLOPs per byte moved) and you get a slanted memory-bound ramp meeting a flat compute-bound ceiling. The corner - the "ridge point" - is the intensity a workload needs to be worth its FLOPS. On modern accelerators that ridge sits high, which is why so many real workloads live on the ramp.',
    see: ['decode', 'hbm3e'],
  },
  {
    id: 'scale-up',
    term: 'scale-up vs scale-out',
    short: 'Scale-up makes one machine bigger (NVLink); scale-out adds more machines (InfiniBand/Ethernet).',
    long: 'NVL72’s whole thesis is that scale-up now extends to a whole rack. Inside the rack a GPU has 900 GB/s of egress; outside it has 100 GB/s on ConnectX-8 or 50 GB/s on ConnectX-7 - a factor of 9 or 18 depending on the generation. Partitioning a model across those two tiers is the central performance decision.',
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
    short: 'Multi-Instance GPU - hardware partitioning of one physical GPU into isolated slices.',
  },
  {
    id: 'mnnvl',
    term: 'MNNVL',
    short: 'Multi-Node NVLink - exporting GPU memory across separate operating-system domains within the NVLink fabric.',
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
    short: 'Coolant Distribution Unit - the pump-and-heat-exchanger that isolates the rack’s coolant loop from the facility’s.',
    long: 'It can sit in-rack (typically at the bottom) or in a sidecar. It gives the rack a controlled, filtered loop at a known pressure and temperature independent of whatever the building water is doing.',
    see: ['uqd'],
  },
  {
    id: 'uqd',
    term: 'UQD',
    short: 'Universal Quick Disconnect - a dripless blind-mate coupling that connects a tray to the coolant manifold as it is inserted.',
    long: 'Blind-mate matters operationally: a technician slides a tray in from the front and it makes both its data and its liquid connections without anyone touching a hose.',
  },
  {
    id: 'pue',
    term: 'PUE',
    short: 'Power Usage Effectiveness - total facility power divided by IT power. 1.0 is the unreachable ideal.',
    long: 'Warm-water direct-to-chip cooling can push PUE toward 1.05–1.1 because a 45 °C inlet can often be met with dry coolers and no compressor at all.',
  },
  {
    id: 'ocp',
    term: 'OCP / ORv3',
    short: 'The Open Compute Project and its Open Rack v3 standard - openly licensed mechanical and power specifications.',
    long: 'NVL72 is ORv3-inspired, and NVIDIA contributed elements of the design back to OCP. Those openly licensed documents are the legitimate source for dimensions.',
  },
  {
    id: 'ras',
    term: 'RAS engine',
    short: 'Reliability, Availability, Serviceability - on-die logic that runs self-tests and predicts failures.',
  },
  // ── The fabric ──────────────────────────────────────────────────────
  {
    id: 'lossless',
    term: 'lossless fabric',
    short: 'A network that never drops a packet for lack of buffer space, because a sender is not allowed to send until space exists.',
    long: 'Ethernet was designed to drop under congestion and let a higher layer notice and retransmit. That is a reasonable trade when the traffic is independent flows, and a terrible one when it is a collective: an all-reduce finishes when its slowest participant finishes, so one retransmission timeout stalls every GPU in the job. InfiniBand removes the possibility rather than the recovery path.',
    see: ['credit-flow-control', 'head-of-line', 'roce'],
  },
  {
    id: 'credit-flow-control',
    term: 'credit-based flow control',
    short: 'The receiver tells the sender how much buffer it has; the sender may not exceed it. Congestion becomes a stall, never a drop.',
    long: 'Credits are carried in-band rather than as separate pause frames, and they are absolute - a running total of what has been allowed since the link came up - rather than incremental, so a lost credit update self-corrects on the next one instead of desynchronising the link forever. That resiliency is the hard part of the design, not the accounting.',
    see: ['lossless', 'virtual-lane', 'pfc'],
  },
  {
    id: 'virtual-lane',
    term: 'virtual lane',
    short: 'One of several independently buffered and independently credited channels sharing a physical link.',
    long: 'Credits are issued per virtual lane, so a lane whose receive buffers are full stops while the others keep moving. This is what stops one saturated traffic class from freezing the whole link, and it is the mechanism underneath InfiniBand quality of service.',
    see: ['credit-flow-control', 'head-of-line'],
  },
  {
    id: 'head-of-line',
    term: 'head-of-line blocking',
    short: 'A packet that cannot move prevents the packets queued behind it from moving either, even where those could proceed.',
    long: 'This is the bill for never dropping. A lossy network resolves congestion by discarding the blocked packet; a lossless one holds it, and the hold propagates backwards through the fabric as credits stop being returned. Virtual lanes and adaptive routing exist to keep that backpressure from spreading further than it must.',
    see: ['lossless', 'virtual-lane', 'adaptive-routing'],
  },
  {
    id: 'rdma',
    term: 'RDMA',
    short: 'Remote Direct Memory Access - one machine’s network adapter writes directly into another machine’s memory, with neither CPU involved in the transfer.',
    long: 'The point is not only speed but who does the work. A conventional send copies through kernel buffers and wakes the receiving process; RDMA hands the adapter a pre-registered region and a descriptor, and the adapter does the rest. At 400 or 800 Gb/s per port there is no CPU budget for anything else.',
    see: ['queue-pair', 'verbs', 'gpudirect'],
  },
  {
    id: 'queue-pair',
    term: 'queue pair',
    short: 'A send queue and a receive queue, together forming one RDMA connection endpoint.',
    long: 'Work is posted as descriptors onto a queue rather than passed through a system call, and completions are reaped from a separate completion queue. The application talks to the adapter through memory it shares with it, which is what makes kernel bypass possible.',
    see: ['rdma', 'verbs'],
  },
  {
    id: 'verbs',
    term: 'verbs',
    short: 'The de-facto RDMA programming interface: post a work request, poll a completion, never enter the kernel on the data path.',
    long: 'Verbs give three things at once - OS bypass, zero copy, and offload of packet processing to the adapter. Everything above it, including NCCL and MPI, is ultimately posting work requests to queue pairs.',
    see: ['rdma', 'queue-pair', 'memory-registration'],
  },
  {
    id: 'memory-registration',
    term: 'memory registration',
    short: 'Pinning a memory region and handing the adapter the keys to it, so it can be read or written without the OS in the loop.',
    long: 'This is where the real cost of RDMA sits. Registration is expensive and the region must stay resident, so high-performance stacks register large buffers once and reuse them rather than registering per message. A benchmark that registers inside its timing loop measures the wrong thing.',
    see: ['rdma', 'verbs', 'gpudirect'],
  },
  {
    id: 'gpudirect',
    term: 'GPUDirect RDMA',
    short: 'The adapter reads and writes GPU memory directly, so a transfer never bounces through host memory at all.',
    long: 'Without it, a GPU-to-GPU transfer across the fabric stages through system RAM twice - once on each side - and the host memory bandwidth becomes the ceiling. The `nvidia-peermem` module registers GPU memory with the InfiniBand subsystem to make this possible, and it works over RoCE as well as InfiniBand.',
    see: ['rdma', 'memory-registration', 'roce'],
  },
  {
    id: 'subnet-manager',
    term: 'subnet manager',
    short: 'One centralised service that discovers every device in an InfiniBand fabric, assigns addresses and computes every forwarding table.',
    long: 'This is the sharpest architectural difference from Ethernet, which distributes its control plane and lets switches learn. An InfiniBand subnet has a single authority that knows the whole topology, which is what makes deterministic routing and topology-aware collectives possible - and what makes the SM a component whose availability you have to think about.',
    see: ['lid', 'adaptive-routing', 'shield'],
  },
  {
    id: 'lid',
    term: 'LID',
    short: 'Local Identifier - the address a subnet manager assigns to a port, and what switches actually forward on.',
    long: 'A LID is subnet-local and assigned, not burned in; the permanent per-device identifier is the GUID. Switch forwarding tables are indexed by destination LID, so a route is a table entry rather than a computed next hop.',
    see: ['subnet-manager'],
  },
  {
    id: 'adaptive-routing',
    term: 'adaptive routing',
    short: 'Letting a switch send a packet down a different equal-cost port than the routing table prescribes, when the prescribed one is congested.',
    long: 'Static routing in a fat tree is deterministic and therefore predictably bad: several flows hashed onto the same uplink collide while a parallel uplink sits idle. Adaptive routing spreads them at the cost of reordering, which RDMA transports must then tolerate. On NVIDIA fabrics it is part of the core subnet manager rather than an add-on.',
    see: ['subnet-manager', 'fat-tree', 'head-of-line'],
  },
  {
    id: 'shield',
    term: 'SHIELD',
    short: 'Self-healing: switches recognise a failed link and route around it without waiting for the subnet manager to recompute.',
    long: 'Recomputing a fabric-wide routing table takes time proportional to the fabric. SHIELD lets neighbouring switches agree on a local detour immediately, so a cable failure degrades a job instead of killing it.',
    see: ['subnet-manager', 'adaptive-routing'],
  },
  {
    id: 'fat-tree',
    term: 'fat tree',
    short: 'A tree whose upward capacity does not narrow: every tier has as much bandwidth leaving it as arriving.',
    long: 'Built from identical fixed-radix switches, a fat tree gives full bisection bandwidth and a uniform hop count between any two endpoints - which is exactly what a collective wants, since its completion time is set by its worst pair. Two tiers of a radix-144 switch reach past 10,000 endpoints; a third tier is what takes you to the tens of thousands.',
    see: ['oversubscription', 'bisection', 'rail-optimised'],
  },
  {
    id: 'oversubscription',
    term: 'oversubscription',
    short: 'Deliberately fitting less upward bandwidth than downward, on the bet that not everyone talks upward at once.',
    long: 'A 2:1 upper tier halves the switches and optics you buy and is invisible on traffic that stays local. It is not invisible to an all-reduce, which is precisely the pattern that does make everyone talk at once - which is why AI fabrics are usually built non-blocking where general-purpose data-centre fabrics are not.',
    see: ['fat-tree', 'bisection'],
  },
  {
    id: 'bisection',
    term: 'bisection bandwidth',
    short: 'The bandwidth crossing the worst-case cut that splits the fabric in half - the honest measure of an all-to-all.',
    long: 'Aggregate bandwidth counts every link and flatters a badly shaped network. Bisection counts only what crosses the narrowest division, which is what an all-to-all or an expert exchange actually has to push through.',
    see: ['fat-tree', 'oversubscription'],
  },
  {
    id: 'rail-optimised',
    term: 'rail-optimised',
    short: 'Wiring the same-numbered GPU in every rack to the same leaf switch, so a collective along that rail crosses one switch instead of climbing the tree.',
    long: 'Each compute tray has one NIC per GPU, and those NICs are assigned to separate rails. Because a ring or all-reduce is naturally organised by GPU index, aligning rails to indices means the dominant traffic pattern never leaves the leaf tier. It is the scale-out counterpart of matching NVLink port n to switch n inside the rack - same reasoning, one tier out.',
    see: ['fat-tree', 'supernic'],
  },
  {
    id: 'supernic',
    term: 'SuperNIC',
    short: 'NVIDIA’s term for a network adapter built for GPU traffic rather than general server traffic - ConnectX-7 at 400 Gb/s, ConnectX-8 at 800.',
    long: 'One per GPU rather than one per server, which is what makes rail alignment possible and what makes per-GPU egress the meaningful unit of scale-out bandwidth.',
    see: ['rail-optimised', 'dpu'],
  },
  {
    id: 'dpu',
    term: 'DPU',
    short: 'A data processing unit - BlueField-3 here - carrying storage, management and isolation on its own network, away from the compute fabric.',
    long: 'Worth separating from the SuperNIC in your head: the two BlueField-3 adapters in a compute tray are not part of the GPU fabric at all. They serve in-band management and storage, so the compute fabric can be dedicated entirely to collectives.',
    see: ['supernic'],
  },
  {
    id: 'roce',
    term: 'RoCE',
    short: 'RDMA over Converged Ethernet - the same verbs and queue pairs, carried by Ethernet instead of InfiniBand.',
    long: 'RoCE keeps the programming model and changes the wire, which means it inherits Ethernet’s willingness to drop and has to be talked out of it with PFC and ECN. That is the whole difficulty: RDMA assumes a lossless link, and Ethernet does not natively provide one.',
    see: ['rdma', 'pfc', 'ecn', 'spectrum-x'],
  },
  {
    id: 'pfc',
    term: 'PFC',
    short: 'Priority Flow Control - Ethernet’s pause frame, per traffic class: "stop sending" rather than "here is how much you may send".',
    long: 'Pause is reactive where credits are proactive: it acts only once buffers are already filling, and it travels backwards hop by hop, so congestion spreads to flows that never touched the busy link. Three failure modes are documented from production RoCEv2 deployments - deadlock from cyclic buffer dependencies, transport livelock, and pause-frame storms from a single misbehaving adapter. PFC is what makes lossless Ethernet possible, and what makes it an engineering project.',
    see: ['credit-flow-control', 'roce', 'ecn'],
  },
  {
    id: 'ecn',
    term: 'ECN',
    short: 'Explicit Congestion Notification - marking packets rather than dropping them, so the sender slows before anything is lost.',
    long: 'ECN works end to end where PFC works hop by hop, so the two are usually deployed together: PFC to protect the buffer in the moment, ECN to reduce the offered load so PFC stops being needed.',
    see: ['pfc', 'roce'],
  },
  {
    id: 'spectrum-x',
    term: 'Spectrum-X',
    short: 'NVIDIA’s Ethernet platform for AI fabrics: switch and SuperNIC co-designed to give Ethernet the properties InfiniBand has by construction.',
    long: 'Adaptive routing decided jointly by the switch and the adapter, telemetry-based congestion control, and lossless operation - the InfiniBand feature list, reached by a different route. Its published performance advantages over standard Ethernet are vendor claims without a stated measured configuration, so this site quotes them as claims.',
    see: ['roce', 'pfc', 'adaptive-routing'],
  },
  {
    id: 'nccl',
    term: 'NCCL',
    short: 'NVIDIA’s collective communications library - the thing that actually executes an all-reduce, and it is topology-aware.',
    long: 'NCCL discovers the topology it is running on and picks an algorithm to match: ring or tree inside a coherent domain, and in-network reduction where the switch offers it. Almost nothing above it - a training framework, an inference server - chooses a collective algorithm directly, which is why fabric decisions show up as throughput rather than as code changes.',
    see: ['sharp', 'rail-optimised', 'verbs'],
  },
];

export const glossary = new Map(list.map((e) => [e.id, e]));
export const allTerms = [...list].sort((a, b) => a.term.localeCompare(b.term, 'en'));

export function term(id: string): Entry {
  const e = glossary.get(id);
  if (!e) throw new Error(`Unknown glossary id: ${id}`);
  return e;
}
