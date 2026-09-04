# Building an Explorable NVL72 Website on Cloudflare Workers: Research Report

## TL;DR
- **The NVL72 fact base is solid and well-sourced from NVIDIA, Supermicro, SemiAnalysis, ServeTheHome and others: a GB200 NVL72 is a ~120 kW liquid-cooled rack with 18 compute trays (2 Grace + 4 Blackwell each = 36 Grace CPUs + 72 B200 GPUs), 9 NVSwitch trays, ~13.5 TB HBM3e, 130 TB/s all-to-all NVLink, and ~1.44 EF FP4 (sparse). Build the site around this and clearly flag GB300 (288 GB HBM3e, ~1,400 W/GPU) and the Vera Rubin NVL144 roadmap as successors.**
- **Cloudflare Workers with Static Assets is the right host and it will effectively be free: static-asset requests are unlimited and unmetered on both Free and Paid plans, R2 has zero egress, and a content site with a heavy 3D model realistically costs $0–$5/month even at 1M visitors. Build with Astro — Cloudflare now explicitly recommends starting with Workers over Pages for new projects.**
- **For the 3D rack use Three.js (or React Three Fiber if you want React) with a Draco/meshopt-compressed glTF authored from scratch in Blender — NVIDIA does not publish a CAD model and its trademark rules require prior written approval to use its logo, so model your own and avoid the branding. Provide a full non-3D content path for accessibility and mobile.**

## Key Findings

1. **NVL72 is a "one giant GPU" rack, not a cluster.** The defining fact — and the pedagogical spine of the whole site — is that all 72 GPUs sit in a single NVLink domain delivering 130 TB/s all-to-all bandwidth, so the rack behaves as one accelerator with ~13.5 TB of pooled HBM3e. NVIDIA's product page states the rack "acts as a single, massive GPU and delivers 30x faster real-time trillion-parameter large language model (LLM) inference, with 10x greater performance for mixture-of-experts (MoE) architectures" (measured config: TTL=50 ms, FTL=5 s, 32,768 input/1,024 output tokens, comparing 64 Hopper GPUs over InfiniBand vs. 32 Blackwell GPUs in the NVL72 on GPT-MoE-1.8T).
2. **The generational story is clean and teachable:** GB200 NVL72 (Blackwell, 192 GB HBM3e/GPU, ~120 kW) → GB300 NVL72 (Blackwell Ultra, 288 GB HBM3e/GPU, ~1,400 W/GPU, 1.5× FP4) → Vera Rubin NVL144 (Rubin, HBM4, 2H 2026, ~3.6 EF FP4, where "144" now counts dies). Each step is a natural "next chapter."
3. **Cloudflare economics are dominated by one fact: static assets and R2 egress are free.** The cost model collapses to "basically free" for this use case. The only ways to accidentally incur cost are Worker invocations (SSR), Durable Objects wall-clock duration, and KV/D1 write-heavy patterns — none of which a content site needs.
4. **The 3D model must be built from scratch.** NVIDIA publishes no downloadable CAD/glTF of the rack, and its trademark guidelines require prior written approval to use its logo/branding. Model it in Blender from public photos and OCP mechanical references, label it "not affiliated with NVIDIA," and use the word marks nominatively.
5. **The best explorable explainers (Ciechanowski, Distill) succeed through first-principles progressive build-up and live, manipulable diagrams — not just spinning models.** Emulate the pedagogy, not just the 3D.

## Details

### PART A — NVL72 Technical Fact Sheet

#### A1. Physical / mechanical
- **Form factor & footprint:** GB200 NVL72 occupies roughly a standard 42U-class rack footprint (about 2.2 m tall, ~0.6 m wide, ~1.2 m deep). It is an ORv3-inspired / NVIDIA MGX reference rack. It weighs approximately 1.36 metric tons (about 3,000 lb).
- **Tray layout:** 18 compute trays + 9 NVSwitch trays. Each compute tray is 1U and holds **2 GB200 "Bianca" boards**; each board = 1 Grace CPU + 2 Blackwell GPUs. So each compute tray = 2 Grace CPUs + 4 Blackwell GPUs, yielding 36 Grace + 72 Blackwell across the rack. Each NVSwitch tray holds **2 NVLink Switch (NVSwitch5) ASICs** (28.8 Tb/s each).
- **Power & busbar:** Rack-level power shelves convert facility input and feed trays over a common busbar rather than per-server PSUs. STH's teardown flagged the ~120 kW draw and raised the (then-open) question of busbar voltage; industry sources describe a 48 V DC-style busbar approach and note ~600 A at 208 V equivalence.
- **Cabling / NVLink spine:** A copper NVLink spine ("cable cartridge," four cartridges) on the rear connects compute trays to switch trays. Jensen Huang described it as "5,000 cables, 5,000 NVLink cables. In total, 2 miles"; NVIDIA's OCP contribution specifies "four NVLink cartridges with over 5,000 copper cables delivering 260 TB/s AllReduce bandwidth" (other sources cite 5,184 cables). This is why the NVSwitch trays sit in the middle of the rack — to minimize cable length.
- **Cooling connections:** Blind-mate UQD (e.g., UQD04) liquid quick-disconnects let trays insert from the front and hook to the rear manifold, disconnecting on removal. CDU can be in-rack (bottom) or sidecar.

#### A2. Compute
- **Blackwell B200 GPU:** Dual reticle-limited dies on TSMC 4NP, connected by a 10 TB/s NV-HBI chip-to-chip link so the two dies present as one cache-coherent GPU. 208 billion transistors total (104 B per die). 192 GB HBM3e (180 GB usable after ECC), 8 TB/s memory bandwidth, 126 MB L2. Peak ~20 PFLOPS FP4 (sparse) per GPU.
- **Grace CPU:** 72 Arm Neoverse V2 cores, NVIDIA Scalable Coherency Fabric (3.2 TB/s bisection), up to 480 GB LPDDR5X per CPU with up to ~500 GB/s bandwidth (NVIDIA quotes 512 GB, 546 GB/s in the standalone Grace superchip datasheet). Note the GB200 Grace uses a reduced 1 MB L2/core.
- **GB200 Superchip:** 1 Grace + 2 B200, linked by NVLink-C2C at 900 GB/s (coherent, ~7× PCIe Gen5), ~2,700 W. 36 superchips per rack.
- **Memory totals:** ~13.5 TB HBM3e across 72 GPUs (NVIDIA/Pantheon say ~13.4–13.8 TB depending on rounding); plus ~17 TB LPDDR5X → ~30 TB unified.
- **Compute totals (GB200 NVL72):** 1,440 PFLOPS (1.44 EF) FP4 with sparsity; 720 PFLOPS FP8; dense FP4 ~720 PFLOPS.
- **Coherence:** NVLink-C2C gives CPU-GPU memory coherence; NVLink 5 + NVSwitch extends a shared, coherent GPU memory space across all 72 GPUs.

#### A3. Interconnect
- **NVLink 5:** 1.8 TB/s bidirectional per GPU = 18 links × 100 GB/s. That's ~14× PCIe Gen5.
- **NVSwitch5:** Each NVSwitch tray = 2 ASICs; each ASIC 28.8 Tb/s (7.2 TB/s, 36+36 ports). 9 trays = 18 ASICs. Because each GPU has 18 NVLink ports and there are 18 switch ASICs, each GPU connects once to each switch → single-layer, non-blocking fabric.
- **Aggregate:** 130 TB/s all-to-all NVLink bandwidth in-rack.
- **SHARP:** NVSwitch includes SHARP engines for in-network reductions/multicast (all-reduce acceleration), which is why the 28.8 Tb/s figure is "less" than a raw 51.2 Tb/s switch — silicon budget goes to compute.
- **Copper vs optical:** Copper chosen for the in-rack spine because it's low-power and reliable at short reach. NVIDIA's rationale, per SemiAnalysis: optical "transceivers and retimers alone would have cost 20,000 watts, 20 kilowatts...to drive the NVLink spine" (SemiAnalysis independently computed ~19.4 kW/rack from 648 1.6T transceivers × ~30 W). Cross-rack traffic goes optical (InfiniBand/Ethernet).
- **Scale-out:** ConnectX-8 SuperNICs (800 Gb/s, PCIe Gen6) on GB300; ConnectX-7 (400 Gb/s) on GB200 variants; BlueField-3 DPUs; Quantum-X800 InfiniBand (Q3400, 144×800 Gb/s ports) or Spectrum-X Ethernet. Rail-optimized topology; a SuperPOD = 8 NVL72 racks = 576 GPUs, ~1 PB/s, ~240 TB fast memory; scales to 9,216 GPUs with 128 leaf switches.

#### A4. Power & cooling
- **Density:** ~120 kW nominal (130–132 kW observed at full load — Schneider Electric's Steven Carlini: "When fully loaded into a rack, the latest NVIDIA-based GPU servers require 132 kW of power...The next generation, expected in under a year, will require 240 kW per rack"). Roughly 1,200 W/GPU. Context: conventional racks are single-digit-to-tens of kW; the Uptime Institute's 2025 Global Data Center Survey puts the worldwide mean rack density at just 7.6 kW (up from 6.8 kW the prior year; 8.4 kW after excluding >30 kW outliers).
- **Liquid cooling mandatory:** Direct-to-chip cold plates. NVIDIA ACS reference design: inlet 32–45 °C; per QCT spec, max inlet 45 °C / max return 65 °C. Flow rate figures vary by whether they're stated per-module or per-rack: ~2–3 L/min per module; ~30–40 L/min per rack (ACS ref); up to ~130 L/min per rack (QCT). Warm-water operation enables free cooling and good PUE; heat reuse (district heating) is discussed by operators.
- **Retrofit challenges:** Floor loading (1.36 t), 480 V distribution, CDU plumbing; air-cooled halls generally can't host it. Retrofit costs cited at $5–10M per MW.
- **Power smoothing:** Synchronized training load swings are a known problem addressed with capacitance/energy storage at rack or facility level (this is the thinnest-sourced sub-topic; flag as such and cite a dedicated NVIDIA/OCP power paper before writing it up).

#### A5. Software & operations
- **Topology awareness:** CUDA/NCCL are NVLink-topology aware; MNNVL (Multi-Node NVLink) via the IMEX service enables GPU memory export/import across OS domains; Kubernetes support via GPU Operator + DRA driver and a ComputeDomain CRD.
- **Partitioning:** MIG partitions a single GPU into isolated instances.
- **Inference (the key teaching payoff):** NVIDIA Dynamo does disaggregated serving — splitting compute-bound **prefill** from memory-bound **decode** onto different GPUs, letting decode run wide **expert parallelism (EP)** for MoE models. The 72-GPU coherent domain matters because MoE all-to-all expert routing needs the 130 TB/s NVLink rather than slower InfiniBand. Result: on MLPerf Inference v5.1, disaggregated serving on GB200 NVL72 achieved ~1.5× throughput over aggregated serving for Llama 3.1 405B interactive workloads.
- **MLPerf results (real, citable):** Per NVIDIA's Technical Blog, "NVIDIA Blackwell architecture with NVFP4 precision delivered up to 3.2x faster Llama 3.1 405B training on GB200 NVL72 compared to Hopper FP8 at the same GPU count in MLPerf Training v5.1," and "NVIDIA Blackwell Ultra GPU in GB300 NVL72 achieved a cumulative 4.2x training speedup over Hopper and 1.9x over GB200 NVL72 at 512-GPU scale." Per the CoreWeave/NVIDIA/IBM press release (MLPerf Training v5.0, June 2025), 2,496 Blackwell GPUs completed the Llama 3.1 405B run "in just 27.3 minutes" — the largest GB200 NVL72 cluster ever benchmarked, using 39 racks (vs. ~156 for an H100-equivalent); a later round used 5,120 GB200 GPUs for ~10 min.
- **Reliability:** Blackwell RAS engine runs built-in self-tests; failed GPU boards can be swapped. Failure-domain teaching: a tray or GPU failure degrades the domain but the design targets board-level replacement.

#### A6. Comparative framing
- **vs. HGX 8-GPU node:** HGX B200 = 8 GPUs on a baseboard with x86 CPU over PCIe, NVLink within the 8-GPU node; NVL72 replaces PCIe/x86 with Grace + NVLink-C2C and extends NVLink to 72 GPUs. Scale-up (NVLink, ~18× the bandwidth of scale-out) vs. scale-out (InfiniBand/Ethernet between racks).
- **Roofline intuition:** Explain arithmetic intensity — why memory/interconnect bandwidth, not just FLOPS, sets real throughput; MoE and long-context inference are bandwidth-bound, which is the whole reason for a coherent 72-GPU domain.
- **Common misconceptions:** "72 GPUs on a slow link" (no — every GPU has full 1.8 TB/s simultaneously via non-blocking NVSwitch); "you can rent one GPU" (no — sold at rack/superchip granularity); "it's just a bigger DGX" (it's a rack-scale integration shift).

#### A7. Best primary/technical sources
- **Primary:** NVIDIA GB200 NVL72 & GB300 NVL72 product pages and datasheets; NVIDIA Developer blogs ("GB200 NVL72 Delivers Trillion-Parameter…", "Inside NVIDIA Blackwell Ultra", the Dynamo/MoE posts, the MLPerf posts); NVIDIA Grace performance tuning guide & docs.nvidia.com Multi-Node NVLink; Supermicro/QCT datasheets; MLCommons MLPerf; NVIDIA's OCP contribution blog.
- **Independent analysis:** SemiAnalysis (GB200 hardware architecture/BOM; "Nvidia's Optical Boogeyman"), ServeTheHome (teardown, NVLink spine), Tom's Hardware & The Register (roadmap), NADDOD/FiberMall (interconnect deep-dives), glennklockwood.com (NVLink/Grace reference), Introl (deployment).
- **Flag disputes:** HBM total (13.4 vs 13.5 vs 13.8 TB — rounding/usable-vs-physical); coolant flow (2–3 L/min per module vs 30–40 vs 130 L/min per rack); "279 vs 288 GB" per Blackwell Ultra GPU (SKU/ECC accounting); "NVL144" naming (144 dies, 72 packages).

### PART B — Cloudflare Workers Stack & Cost

**Recommended architecture:** Build the site as a static/SSG Astro project and deploy to **Cloudflare Workers with Static Assets**. Cloudflare's own blog is explicit: "Now that Workers supports both serving static assets and server-side rendering, you should start with Workers," and "all of our investment, optimizations, and feature work will be dedicated to improving Workers." (Native static-asset support shipped in beta September 2024 and went GA April 2025; Pages remains supported but is no longer the recommended starting point.) Serve the heavy 3D model from **R2** (zero egress) or bundle it as a static asset if under the per-file limit.

**Platform limits & pricing (2026):**
- Workers Free: 100,000 requests/day, 10 ms CPU/invocation. Paid: $5/month, 10M requests + 30M CPU-ms included, then $0.30/M requests and $0.02/M CPU-ms; up to 5 min CPU/invocation. 128 MB memory/isolate.
- **Static asset requests are free and unlimited on both plans** — this is the crux. A request only "counts" (and consumes CPU) if it invokes Worker code.
- **Static Assets limits:** 25 MiB per file (both plans); 20,000 files Free / 100,000 files Paid; Worker script size 3 MB Free / 10 MB Paid (gzipped).
- **R2:** $0.015/GB-mo storage, Class A (writes) $4.50/M, Class B (reads) $0.36/M, **egress always $0**. Free tier: 10 GB storage + 1M Class A + 10M Class B monthly.
- **KV:** reads $0.50/M (10M included), writes/deletes/lists $5.00/M (1M included) — read-optimized; writes are 10× dearer.
- **D1:** rows read $0.001/M (25B included), rows written $1.00/M (50M included), storage $0.75/GB-mo. Gotcha: "rows read" measures rows *scanned*, not returned — index your queries (a full-table `SELECT *` on 5,000 rows counts as 5,000 reads).
- **Durable Objects:** requests $0.15/M; duration $12.50/M GB-s billed on **wall-clock** time while active or idle-in-memory (use the WebSocket Hibernation API to avoid idle charges; incoming WebSocket messages bill at a 20:1 ratio). Not needed for this site.

**Serving the heavy 3D asset cheaply:** R2 + Cache API. R2 has no egress fees; put the .glb behind the Workers Cache API on a **custom domain** (the Cache API is fully functional on custom domains and Pages functions, not on workers.dev) and set long-lived `Cache-Control: public, max-age=31536000, immutable` with a hashed filename. Compress meshes with Draco/meshopt and gzip/brotli. Because static-asset serving is free anyway, bundling the model as a static asset is also fine as long as it's under 25 MiB/file; for a larger model or multiple LODs, R2 is cleaner.

**WebGL/3D-specific constraints (confirmed against developers.cloudflare.com):**
- Both Workers Static Assets and Pages support a `_headers` file to set arbitrary response headers, including `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` needed for SharedArrayBuffer. Docs: "The default response headers served on static asset responses can be overridden, removed, or added to, by creating a plain text file called `_headers`… its rules will be applied to static asset responses." Up to 100 rules; 2,000 chars/line. **Caveat:** `_headers` does NOT apply to responses generated by Worker/Pages Functions code — for SSR responses set headers in the Worker itself.
- **WASM is fully supported** — Draco/Basis decoders run fine. NVIDIA-scale caveat is only bundle size: the Worker script gzip limit is 3 MB Free / 10 MB Paid; use `wasm-opt`. WASI is experimental. A Draco decoder (a few hundred KB) fits trivially.
- **Cache API and streaming Response bodies are supported;** "Cloudflare does not enforce response body size limits," and the docs recommend streaming (`TransformStream`) for large payloads — well suited to large 3D assets.

**Concrete monthly cost estimate (static Astro on Workers + model on R2):**
- **10k visitors/mo:** $0 (well within Free; static requests unmetered; R2 under free tier).
- **100k visitors/mo:** $0 (still no Worker invocations if fully static).
- **1M visitors/mo:** ~$0–$5. If you stay purely static with no Worker code path, $0; add the $5 Paid plan only for headroom/observability. R2 storage for a few hundred MB of models ≈ $0.01–0.05/mo; Class B reads for the model stay within/near the 10M free ops.
- The only realistic way this site exceeds $5/mo is adding always-on Durable Objects or a write-heavy KV/D1 pattern — avoid both.

### PART C — 3D Implementation

**Library choice:** Use **Three.js** for smallest bundle and maximum control (vanilla ~460 KB in one benchmark), or **React Three Fiber + drei** if the site is React (R3F adds meaningful weight — one benchmark showed ~1.0 MB vs 462 KB vanilla — but drei's `<Html>` annotations, `useGLTF`, and helpers speed development). `model-viewer` is the lowest-effort option for a single rotatable/AR model but is less flexible for custom exploded animations and hotspots. Babylon.js is heavier but full-featured. For a bandwidth-conscious Cloudflare site, Three.js + hand-rolled controls is the recommended default.

**Exploded view & hotspots:** The standard technique (well documented in R3F/Three.js tutorials): load the glTF, traverse the scene, and translate each named part along a vector from an explosion center scaled by a factor (lerp on a 0–1 "explode" slider). Name parts in Blender (compute tray, NVSwitch tray, Grace, Blackwell, busbar, spine, CDU, manifold) so they can be individually offset, highlighted, and annotated. Use drei `<Html>` or projected DOM labels for clickable hotspots/annotations. Implement LOD and progressive loading.

**Asset pipeline:** Author in Blender from public photos/diagrams and OCP mechanical specs. Optimize with `gltf-transform optimize --compress draco --texture-compress ktx2` (Draco cuts geometry ~90–95%; KTX2/Basis keeps textures compressed on the GPU, ~10× less VRAM). Meshopt is the alternative to Draco when you need morph/animation data. Serve a low-poly LOD first, stream detail on demand. Draco decode runs in a Web Worker so it doesn't block the main thread.

**Model sourcing & licensing (important):** NVIDIA does **not** publish a downloadable CAD/glTF of the NVL72; you must model it yourself. NVIDIA's trademark/logo guidelines state that "prior to using the NVIDIA logo or any branded element, you must receive written approval," and explicitly prohibit using NVIDIA branding/imagery from third-party sites or mimicking NVIDIA's visual style. Practical guidance: (1) build an original model — do not copy NVIDIA CAD; (2) do not place the NVIDIA logo on the model or site; (3) use word marks ("NVIDIA GB200 NVL72") nominatively and factually with a clear "not affiliated with / not endorsed by NVIDIA" disclaimer; (4) rely on OCP/Open Compute mechanical documentation for dimensions, which is openly licensed. This is legal-risk guidance, not legal advice — have counsel review before launch.

**Performance & accessibility:** Provide a full **non-3D content path** — every fact in the exploded view must also exist as text/diagrams/tables reachable without WebGL. Honor `prefers-reduced-motion` (disable auto-spin/auto-explode). Mobile fallback: detect low power / small viewport and serve a lighter LOD or static renders. Progressive enhancement: render the article first, hydrate the 3D canvas after. Lazy-load Three.js so the 3D bundle doesn't block first paint.

### PART D — Pedagogy & Site Design

**Multi-level teaching:** Use progressive disclosure and layered explanations. Offer an expertise toggle — "New grad / Senior systems engineer / Datacenter architect" — that swaps depth of copy on the same page (e.g., new grad: "72 GPUs act like one"; architect: NVSwitch port math, SHARP, busbar voltage, coolant flow). Provide expandable "go deeper" panels, an inline glossary (hover definitions for HBM3e, NVLink, MoE, prefill/decode, PUE), and both a guided tour (scripted camera + narration through the exploded view) and free exploration.

**Exemplars to emulate:** Bartosz Ciechanowski (ciechanow.ski — Gears, Cameras and Lenses, Internal Combustion Engine): first-principles build-up with live, draggable WebGL diagrams; Distill.pub for interactive ML explainers; Bret Victor's "Explorable Explanations" essay (which distinguishes true explorables from isolated widgets by the fact that prose "deliberately guide[s] the attention of their audience toward particular phenomena"); the community "awesome-explanations" list. What makes them work: every concept is introduced with a manipulable widget, prose guides attention to phenomena, and complexity accretes gradually. Emulate the pedagogy (interaction-per-concept), not just a spinning model.

**Proposed sitemap (mapped to interaction types):**
1. **Home / "One Giant GPU"** — hero exploded rack, expertise toggle. (3D hero + scroll)
2. **Anatomy of the Rack** — the exploded-view centerpiece: rotate, explode, click trays/spine/CDU. (Interactive 3D + hotspots)
3. **Inside a Compute Tray** — Grace + 2 Blackwell, NVLink-C2C. (Zoomed 3D + diagram)
4. **The Blackwell GPU** — dual-die, HBM3e, FP4. (Annotated diagram + slider for precision/FLOPS)
5. **NVLink & NVSwitch** — the 72-GPU domain, non-blocking fabric, SHARP. (Animated topology graph, bandwidth calculator)
6. **Power & Cooling** — 120 kW, busbar, direct-to-chip loop, CDU. (Flow animation, PUE/heat-reuse slider)
7. **Scale-out: SuperPODs** — 576 GPUs, rails, InfiniBand. (Zoom-out topology)
8. **Software & Inference** — Dynamo prefill/decode, MoE expert parallelism, MLPerf numbers. (Interactive disaggregation diagram)
9. **NVL72 vs HGX vs DGX** — scale-up vs scale-out, roofline intuition. (Comparison toggles, roofline plot)
10. **Roadmap** — GB300, Vera Rubin NVL144, beyond. (Timeline)
11. **Glossary & Sources.**

## Recommendations

**Stage 1 — Content & sourcing (weeks 1–2):** Lock the fact sheet from Part A against primary NVIDIA datasheets and the NVIDIA Developer blog; footnote every disputed number (HBM total, coolant flow, FLOPS precision) with the range and source. Draft all prose in the layered/expertise-toggle structure now, before touching 3D — the non-3D path is your accessibility floor and your SEO content.

**Stage 2 — Platform (week 2):** Scaffold `npm create cloudflare@latest -- --framework=astro`, deploy static output to Workers Static Assets. Add a `_headers` file with COOP/COEP **only if** you use SharedArrayBuffer (needed for multithreaded WASM/Draco; single-threaded decode does not require it — skip COOP/COEP unless you measure a need, since it complicates embedding third-party content). Stay on the Free plan until traffic or observability needs justify the $5 Paid tier.

**Stage 3 — 3D (weeks 3–6):** Model the rack in Blender with cleanly named parts; export glTF; run `gltf-transform optimize` with Draco + KTX2; target a first-load LOD under ~2–3 MB and detail LODs streamed from R2. Build the exploded-view slider and hotspots in Three.js. Add `prefers-reduced-motion` and a static-image fallback first, then enhance.

**Stage 4 — Polish & launch:** Add the guided tour, glossary hovers, and expertise toggle. Add the "not affiliated with NVIDIA" disclaimer and remove any NVIDIA logo art. Have counsel review trademark usage.

**Thresholds that change the plan:**
- If any single 3D asset exceeds **25 MiB**, serve it from R2 (not static assets).
- If the Worker script bundle approaches **3 MB gzip (Free) / 10 MB (Paid)**, split code or move WASM decoders to fetched assets.
- If you exceed **~100,000 Worker (not static) invocations/day**, move to Paid ($5).
- If you add real-time/multiplayer features (live tours, presence), only then consider Durable Objects — and use hibernation.
- If you need SharedArrayBuffer-backed multithreading, add COOP/COEP and verify no third-party embeds break.

## Caveats
- **Roadmap items are forward-looking.** Vera Rubin NVL144 (2H 2026), Rubin Ultra NVL576 (2027), and Feynman are announced/roadmap, not shipping products; several figures come from keynote slides and supply-chain reporting (TechPowerUp/Foxconn, Tom's Hardware) and should be presented as "announced," not measured.
- **Some NVL72 numbers vary by configuration and source.** HBM total (13.4–13.8 TB), per-rack coolant flow (2–3 L/min per module vs 30–40 vs 130 L/min per rack), and Blackwell Ultra memory (279 vs 288 GB) differ across sources; the site should show ranges and cite primary datasheets.
- **Several strong data points come from vendor/integrator blogs** (Supermicro, QCT, Introl, Spheron, Pantheon) and independent analysts (SemiAnalysis, ServeTheHome) rather than NVIDIA directly; corroborate the load-bearing specs against NVIDIA's own datasheet before publishing.
- **Cloudflare pricing and limits change.** All figures are as of 2026 per developers.cloudflare.com; re-verify the limits and pricing pages before launch. One unofficial "64 MB pre-compression" Worker ceiling figure could not be confirmed on the official limits page — the authoritative gzip limits are 3 MB Free / 10 MB Paid.
- **Trademark guidance here is not legal advice.** NVIDIA actively enforces its marks; get counsel sign-off on nominative use and the disclaimer.
- **Power-smoothing/capacitance for synchronized training loads is the thinnest-sourced technical sub-topic** in this report; treat it as needing a dedicated primary source (NVIDIA/OCP power papers) before writing it up authoritatively.