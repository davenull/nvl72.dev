/**
 * Procedural GB200 NVL72 rack.
 *
 * Deliberately *not* a downloaded or authored glTF. NVIDIA publishes no CAD for
 * this rack, so the geometry had to be original anyway — and a rack is an
 * assembly of rectangular trays on a regular pitch, which generates cleanly
 * from parameters. That buys us:
 *   · zero asset bytes over the wire (no Draco decoder, no KTX2, no R2 fetch),
 *   · every part named and individually addressable for explode + hotspots,
 *   · dimensions that live in code next to the sourced figures they come from.
 *
 * The model is schematic, not mechanical. Tray pitch, group ordering and
 * overall proportions follow public teardown photography and OCP/ORv3
 * documentation; it is an explanatory diagram in three dimensions, not a
 * fabrication drawing.
 */
import * as THREE from 'three';

export interface RackPart {
  id: string;
  index?: number;
  object: THREE.Object3D;
  /** Unit vector the part travels along when the view is exploded. */
  dir: THREE.Vector3;
  /** Multiplier on the explode factor, in metres. */
  dist: number;
  home: THREE.Vector3;
  /**
   * Offset from the group's origin to the visual centre of its geometry.
   * Parts like the busbar and the spine are groups sitting at the origin whose
   * children carry absolute positions, so the group origin is at the rack's
   * base — using it as the focus target aimed the camera at the floor.
   */
  anchorOffset: THREE.Vector3;
}

export interface RackHandle {
  setExplode(v: number): void;
  setHighlight(id: string | null): void;
  focus(id: string | null, opts?: { explode?: number }): void;
  resetView(): void;
  dispose(): void;
}

interface Options {
  onSelect?: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  /** Slow idle rotation, suppressed under prefers-reduced-motion. */
  autoRotate?: boolean;
}

/* ── Dimensions (metres) ─────────────────────────────────────────────── */
// Supermicro's GB200 NVL72 datasheet: 2236 x 600 x 1068 mm.
const W = 0.6;          // rack width
const D = 1.068;        // rack depth
const TRAY_W = 0.54;
const TRAY_D = 0.92;
const U = 0.0445;       // 1U
const PITCH = 0.052;    // 1U plus service gap
const SHELF_H = 0.048;  // power shelves are 1U too
const CDU_H = 0.16;
const BASE_H = 0.08;
const TOP_H = 0.2;      // management switches and cable management

// Eight power shelves in two banks of four, per the Supermicro datasheet
// ("shared power through 4+4 rack power shelves", 8 x 1U 33 kW = 132 kW).
const N_SHELF_BANK = 4;
// Compute trays split 8 below the switch band and 10 above it, matching the
// ordering in Supermicro's rack diagram.
const N_COMPUTE_LOWER = 8;
const N_COMPUTE_UPPER = 10;
const N_SWITCH = 9;

function cssColor(name: string, fallback: string): THREE.Color {
  if (typeof window === 'undefined') return new THREE.Color(fallback);
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  try { return new THREE.Color(v || fallback); } catch { return new THREE.Color(fallback); }
}

export function mountRack(canvas: HTMLCanvasElement, opts: Options = {}): RackHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // caller falls back to the static content path
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const maxDpr = coarse ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

  /* ── Materials ─────────────────────────────────────────────────────── */
  const isDark = () => getComputedStyle(document.documentElement).colorScheme === 'dark';

  const mat = {
    frame: new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0.55 }),
    tray: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.45 }),
    trayFace: new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.3 }),
    gpu: new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.2 }),
    cpu: new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.2 }),
    sw: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }),
    copper: new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.85 }),
    power: new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.6 }),
    coolant: new THREE.MeshStandardMaterial({ roughness: 0.28, metalness: 0.7 }),
    // Dark plane behind the trays so the gaps between them read as shadow
    // instead of disappearing into the frame at small sizes.
    shadowGap: new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0.0 }),
  };

  function applyTheme() {
    const dark = isDark();
    mat.frame.color = new THREE.Color(dark ? '#46443f' : '#8e887e');
    mat.tray.color = new THREE.Color(dark ? '#3d3b37' : '#a9a49b');
    mat.trayFace.color = new THREE.Color(dark ? '#232220' : '#efece6');
    mat.shadowGap.color = new THREE.Color(dark ? '#0b0b0a' : '#5d574e');
    mat.gpu.color = cssColor('--gpu', '#6b3fa0');
    mat.cpu.color = cssColor('--cpu', '#0d7490');
    mat.sw.color = cssColor('--switch', '#b4541f');
    mat.copper.color = cssColor('--copper', '#b4541f');
    mat.power.color = cssColor('--power', '#a86a00');
    mat.coolant.color = cssColor('--coolant', '#1d5fa8');
    scene.background = null;
    hemi.intensity = dark ? 0.55 : 0.9;
    key.intensity = dark ? 1.5 : 2.1;
    rim.intensity = dark ? 0.9 : 0.6;
    // Push the new palette into every part's own copies.
    for (const { m, base } of owned) {
      m.color.copy(base.color);
      m.roughness = base.roughness;
      m.metalness = base.metalness;
    }
  }

  const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 0.8);
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(2.4, 3.2, 3);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-3, 1.2, 1.5);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8);
  rim.position.set(-1, 2, -3.5);
  scene.add(hemi, key, fill, rim);

  /* ── Build ─────────────────────────────────────────────────────────── */
  const root = new THREE.Group();
  scene.add(root);
  const parts: RackPart[] = [];
  const byId = new Map<string, RackPart[]>();

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  /**
   * Every part gets its own copies of the materials it uses.
   *
   * The palette above is shared — compute trays and switch trays both draw
   * from `mat.tray`, the spine and the switch faces both draw from
   * `mat.copper`. Highlighting by mutating those shared instances meant the
   * last mesh traversed decided the opacity for everything using that
   * material, so selecting a part could dim the part itself and leave its
   * neighbours lit. Cloning per part makes the dim strictly per-part.
   */
  const owned: { m: THREE.MeshStandardMaterial; base: THREE.MeshStandardMaterial }[] = [];
  function ownMaterials(object: THREE.Object3D) {
    const seen = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const base = mesh.material as THREE.MeshStandardMaterial;
      let copy = seen.get(base);
      if (!copy) {
        copy = base.clone();
        // Compiled as transparent from the start, and left that way.
        //
        // three.js bakes an OPAQUE define into the fragment shader for
        // materials that are not transparent, and that define forces alpha to
        // 1 no matter what the opacity uniform says. Flipping `transparent`
        // later therefore does nothing until `needsUpdate` forces a recompile —
        // which, across the ~330 materials in this rack, would stutter on every
        // hover. Declaring transparency once means highlighting only ever
        // animates `opacity`, which is a plain uniform.
        copy.transparent = true;
        copy.opacity = 1;
        copy.depthWrite = true;
        seen.set(base, copy);
        owned.push({ m: copy, base });
      }
      mesh.material = copy;
    });
  }

  function register(id: string, object: THREE.Object3D, dir: THREE.Vector3, dist: number, index?: number) {
    object.userData.partId = id;
    object.traverse((o) => { o.userData.partId = id; });
    ownMaterials(object);
    const p: RackPart = {
      id, index, object, dir: dir.clone().normalize(), dist,
      home: object.position.clone(), anchorOffset: new THREE.Vector3(),
    };
    parts.push(p);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id)!.push(p);
    return p;
  }

  // Vertical layout, built bottom-up. Heights come from the U pitch above.
  let y = BASE_H;
  const slots: { kind: string; y: number; i?: number }[] = [];
  slots.push({ kind: 'cdu', y: y + CDU_H / 2 }); y += CDU_H;
  for (let i = 0; i < N_SHELF_BANK; i++) { slots.push({ kind: 'psu', y: y + SHELF_H / 2, i }); y += SHELF_H; }
  const trayBandBottom = y;
  for (let i = 0; i < N_COMPUTE_LOWER; i++) { slots.push({ kind: 'compute', y: y + U / 2, i }); y += PITCH; }
  for (let i = 0; i < N_SWITCH; i++) { slots.push({ kind: 'switch', y: y + U / 2, i }); y += PITCH; }
  for (let i = 0; i < N_COMPUTE_UPPER; i++) { slots.push({ kind: 'compute', y: y + U / 2, i: N_COMPUTE_LOWER + i }); y += PITCH; }
  const trayBandTop = y;
  for (let i = 0; i < N_SHELF_BANK; i++) { slots.push({ kind: 'psu', y: y + SHELF_H / 2, i: N_SHELF_BANK + i }); y += SHELF_H; }
  y += TOP_H;
  const H = y;
  const midY = H / 2;

  /** Accordion explode: parts move away from the vertical centre. */
  const accordion = (yPos: number, forward: number) =>
    new THREE.Vector3(0, (yPos - midY) * 2.4, forward);

  /* Frame ------------------------------------------------------------- */
  const frame = new THREE.Group();
  const postGeo = box(0.035, H, 0.035);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const post = new THREE.Mesh(postGeo, mat.frame);
    post.position.set((sx * (W / 2 - 0.02)), H / 2, sz * (D / 2 - 0.02));
    frame.add(post);
  }
  const plinth = new THREE.Mesh(box(W, BASE_H, D), mat.frame);
  plinth.position.set(0, BASE_H / 2, 0);
  const crown = new THREE.Mesh(box(W, 0.05, D), mat.frame);
  crown.position.set(0, H - 0.025, 0);
  frame.add(plinth, crown);
  // No side panels: they would occlude the tray stack from every useful
  // viewing angle. A dark backplane behind the trays does the job of reading
  // as an enclosure while leaving the stack legible.
  {
    const back = new THREE.Mesh(box(W - 0.06, H - BASE_H - 0.06, 0.008), mat.shadowGap);
    back.position.set(0, BASE_H + (H - BASE_H - 0.06) / 2, -D / 2 + 0.22);
    frame.add(back);
  }
  root.add(frame);
  register('frame', frame, new THREE.Vector3(0, 0, -1), 0.0);
  // The frame is the first part registered, so everything owned so far is its.
  const frameMaterials = owned.map((o) => o.m);

  /* Trays ------------------------------------------------------------- */
  /** Thin coloured bar on a tray's front face, identifying its class. */
  function strip(w: number, material: THREE.Material, z: number, y = 0) {
    const m = new THREE.Mesh(box(w, U * 0.22, 0.014), material);
    m.position.set(0, y, z);
    return m;
  }

  function computeTray(i: number) {
    const g = new THREE.Group();
    const chassis = new THREE.Mesh(box(TRAY_W, U * 0.86, TRAY_D), mat.tray);
    g.add(chassis);
    const face = new THREE.Mesh(box(TRAY_W + 0.006, U * 0.86, 0.012), mat.trayFace);
    face.position.z = TRAY_D / 2;
    g.add(face);
    g.add(strip(TRAY_W * 0.62, mat.gpu, TRAY_D / 2 + 0.008, -U * 0.24));

    // Two GB200 boards per tray: each = 1 Grace + 2 Blackwell.
    for (let b = 0; b < 2; b++) {
      const bx = (b === 0 ? -1 : 1) * 0.13;
      const cpu = new THREE.Mesh(box(0.052, U * 0.5, 0.052), mat.cpu);
      cpu.position.set(bx, 0.002, 0.16);
      g.add(cpu);
      for (let gpu = 0; gpu < 2; gpu++) {
        const m = new THREE.Mesh(box(0.075, U * 0.54, 0.075), mat.gpu);
        m.position.set(bx, 0.002, -0.03 - gpu * 0.115);
        g.add(m);
      }
    }
    // Rear coolant couplings.
    for (const sx of [-1, 1]) {
      const uqd = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8), mat.coolant);
      uqd.rotation.x = Math.PI / 2;
      uqd.position.set(sx * 0.19, 0, -TRAY_D / 2 - 0.02);
      g.add(uqd);
    }
    return g;
  }

  function switchTray() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(box(TRAY_W, U * 0.86, TRAY_D * 0.8), mat.tray));
    const face = new THREE.Mesh(box(TRAY_W + 0.006, U * 0.86, 0.012), mat.copper);
    face.position.z = (TRAY_D * 0.8) / 2;
    g.add(face);
    // Two NVSwitch5 ASICs.
    for (const sx of [-1, 1]) {
      const asic = new THREE.Mesh(box(0.1, U * 0.58, 0.1), mat.sw);
      asic.position.set(sx * 0.12, 0.002, -0.02);
      g.add(asic);
    }
    return g;
  }

  for (const s of slots) {
    if (s.kind === 'compute') {
      const g = computeTray(s.i!);
      g.position.set(0, s.y, 0.01);
      root.add(g);
      register('compute', g, accordion(s.y, 0.55), 0.34, s.i);
    } else if (s.kind === 'switch') {
      const g = switchTray();
      g.position.set(0, s.y, -0.05);
      root.add(g);
      register('switch', g, accordion(s.y, 1.6), 0.3, s.i);
    } else if (s.kind === 'psu') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(box(TRAY_W, SHELF_H * 0.8, TRAY_D * 0.7), mat.shadowGap));
      for (let k = 0; k < 6; k++) {
        const cell = new THREE.Mesh(box(0.072, SHELF_H * 0.6, 0.012), mat.power);
        cell.position.set(-0.222 + k * 0.0888, 0, (TRAY_D * 0.7) / 2);
        g.add(cell);
      }
      g.position.set(0, s.y, 0.02);
      root.add(g);
      register('psu', g, accordion(s.y, 0.5), 0.3, s.i);
    } else if (s.kind === 'cdu') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(box(TRAY_W, CDU_H * 0.85, TRAY_D * 0.85), mat.coolant));
      const grille = new THREE.Mesh(box(TRAY_W * 0.8, CDU_H * 0.5, 0.012), mat.trayFace);
      grille.position.z = (TRAY_D * 0.85) / 2;
      g.add(grille);
      g.position.set(0, s.y, 0.02);
      root.add(g);
      register('cdu', g, new THREE.Vector3(0, -0.6, 1), 0.42);
    }
  }

  /* NVLink spine ------------------------------------------------------- */
  const spine = new THREE.Group();
  {
    // Four cable cartridges spanning the switch band, drawn as dense copper
    // ribbons rather than 5,000 individual cables — the count is stated in text.
    const bandBottom = trayBandBottom;
    const h = trayBandTop - trayBandBottom;
    for (let c = 0; c < 4; c++) {
      const cart = new THREE.Mesh(box(0.11, h * 0.94, 0.05), mat.copper);
      cart.position.set(-0.18 + c * 0.12, bandBottom + h / 2, -D / 2 + 0.09);
      spine.add(cart);
    }
    for (let i = 0; i < 26; i++) {
      const strand = new THREE.Mesh(box(0.5, 0.004, 0.008), mat.copper);
      strand.position.set(0, bandBottom + 0.02 + (i / 26) * h * 0.94, -D / 2 + 0.05);
      spine.add(strand);
    }
  }
  root.add(spine);
  register('spine', spine, new THREE.Vector3(0, 0, -1), 0.5);

  /* Busbar ------------------------------------------------------------- */
  const busbar = new THREE.Group();
  {
    const bar = new THREE.Mesh(box(0.055, H - BASE_H - 0.1, 0.022), mat.power);
    bar.position.set(0.235, BASE_H + (H - BASE_H - 0.1) / 2, -D / 2 + 0.17);
    busbar.add(bar);
  }
  root.add(busbar);
  register('busbar', busbar, new THREE.Vector3(1, 0, -0.5), 0.4);

  /* Coolant manifold ---------------------------------------------------- */
  const manifold = new THREE.Group();
  for (const [i, sx] of [-1, 1].entries()) {
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.019, H - BASE_H - 0.14, 12), mat.coolant);
    pipe.position.set(sx * 0.2, BASE_H + (H - BASE_H - 0.14) / 2, -D / 2 + 0.03);
    manifold.add(pipe);
    void i;
  }
  root.add(manifold);
  register('manifold', manifold, new THREE.Vector3(-1, 0, -0.7), 0.42);

  // Measure each part's visual centre once, while everything is still at home.
  {
    const box = new THREE.Box3();
    const centre = new THREE.Vector3();
    for (const p of parts) {
      box.setFromObject(p.object);
      if (box.isEmpty()) continue;
      box.getCenter(centre);
      p.anchorOffset.copy(centre).sub(p.object.position);
    }
  }

  // Centre the rack on the origin so orbiting feels natural.
  root.position.y = -H / 2;

  applyTheme();

  /* ── Camera / controls (hand-rolled: no OrbitControls import) ───────── */
  const target = new THREE.Vector3(0, 0, 0);
  /** Distance at which the whole rack fits the viewport with a little padding. */
  function fitRadius() {
    const vFov = (camera.fov * Math.PI) / 180;
    const byHeight = (H * 0.62) / Math.tan(vFov / 2);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.4));
    const byWidth = (Math.hypot(W, D) * 0.75) / Math.tan(hFov / 2);
    return Math.max(byHeight, byWidth);
  }

  const view = { theta: 0.66, phi: 1.24, radius: 4 };
  const goal = { ...view };
  let explode = 0;
  let explodeGoal = 0;
  /** What is dimmed right now: the hovered part if any, else the selected one. */
  let highlight: string | null = null;
  let hovered: string | null = null;
  let selected: string | null = null;

  function place() {
    const { theta, phi, radius } = view;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    camera.lookAt(target);
  }

  let dragging = false;
  let lastX = 0, lastY = 0, moved = 0;
  let pointers = new Map<number, { x: number; y: number }>();
  let pinchStart = 0;

  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); }
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchStart = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart > 0) { userZoomed = true; goal.radius = clamp(goal.radius * (pinchStart / d), 1.1, 12); }
      pinchStart = d;
      return;
    }
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      goal.theta -= dx * 0.006;
      goal.phi = clamp(goal.phi - dy * 0.006, 0.22, Math.PI - 0.22);
      lastX = e.clientX; lastY = e.clientY;
    } else {
      hoverTest(e);
    }
  });
  const endPointer = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = 0;
    if (pointers.size === 0) {
      if (dragging && moved < 6) clickTest(e);
      dragging = false;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('pointerleave', () => { if (!dragging) setHover(null); });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    userZoomed = true;
    goal.radius = clamp(goal.radius * (1 + Math.sign(e.deltaY) * 0.12), 1.1, 12);
  }, { passive: false });

  // Keyboard control, so the view is operable without a pointer.
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-label',
    'Interactive 3D model of a GB200 NVL72 rack. Arrow keys rotate, plus and minus zoom. Every part is also described in the list below.');
  canvas.addEventListener('keydown', (e) => {
    const step = 0.12;
    if (e.key === 'ArrowLeft') goal.theta += step;
    else if (e.key === 'ArrowRight') goal.theta -= step;
    else if (e.key === 'ArrowUp') goal.phi = clamp(goal.phi - step, 0.22, Math.PI - 0.22);
    else if (e.key === 'ArrowDown') goal.phi = clamp(goal.phi + step, 0.22, Math.PI - 0.22);
    else if (e.key === '+' || e.key === '=') { userZoomed = true; goal.radius = clamp(goal.radius * 0.88, 1.1, 12); }
    else if (e.key === '-') { userZoomed = true; goal.radius = clamp(goal.radius * 1.12, 1.1, 12); }
    else return;
    e.preventDefault();
  });

  /* ── Picking ───────────────────────────────────────────────────────── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function pick(e: PointerEvent): string | null {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(root.children, true);
    for (const h of hits) {
      const id = h.object.userData.partId as string | undefined;
      if (id && id !== 'frame') return id;
    }
    return hits.length ? (hits[0].object.userData.partId ?? null) : null;
  }
  function hoverTest(e: PointerEvent) { setHover(pick(e)); }
  function clickTest(e: PointerEvent) {
    const id = pick(e);
    selected = id === selected ? null : id;
    opts.onSelect?.(selected);
    applyDim();
  }
  function setHover(id: string | null) {
    canvas.style.cursor = id && id !== 'frame' ? 'pointer' : 'grab';
    if (id === hovered) return;
    hovered = id;
    opts.onHover?.(id);
    applyDim();
  }
  /** Hover previews the dim; the selection is what persists underneath it. */
  function applyDim() { setHighlight(hovered ?? selected); }

  function setHighlight(id: string | null) {
    highlight = id;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pid = m.userData.partId as string;
      const material = m.material as THREE.MeshStandardMaterial;
      // Nothing selected: everything at full strength. Something selected:
      // that part alone stays lit, every other part mutes back.
      const lit = !id || pid === id;
      material.opacity = lit ? 1 : 0.1;
      // Muted parts stop writing depth so they never punch holes in the part
      // that is meant to be readable through them.
      material.depthWrite = lit;
      material.emissiveIntensity = id && lit ? 0.14 : 0;
      material.emissive.set(id && lit ? 0x8a5f33 : 0x000000);
    });
  }

  /**
   * The representative part used as a focus target for a whole group — the
   * middle tray of the eighteen, the single busbar, and so on.
   */
  const focusAnchor = new Map<string, RackPart>();
  for (const [id, list] of byId) focusAnchor.set(id, list[Math.floor(list.length / 2)]);

  /** World-space centre of a part, accounting for the current explode offset. */
  function anchorOf(p: RackPart) {
    return p.object.position.clone().add(p.anchorOffset).add(new THREE.Vector3(0, -H / 2, 0));
  }

  /* ── Loop ──────────────────────────────────────────────────────────── */
  function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  let userZoomed = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width === 0) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
    if (!userZoomed) { goal.radius = fitRadius(); view.radius = goal.radius; }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const autoRotate = opts.autoRotate && !reduced;

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) return;

    if (autoRotate && !dragging) goal.theta += 0.0012;
    view.theta += (goal.theta - view.theta) * 0.14;
    view.phi += (goal.phi - view.phi) * 0.14;
    view.radius += (goal.radius - view.radius) * 0.12;
    explode += (explodeGoal - explode) * 0.16;
    place();

    for (const p of parts) {
      p.object.position.copy(p.home).addScaledVector(p.dir, explode * p.dist);
    }
    // The frame fades as the rack comes apart, so it never occludes the guts.
    // Only the frame's own materials — while a part is highlighted, setHighlight
    // owns every material and this must keep its hands off.
    if (!highlight) {
      const frameOpacity = Math.max(0.12, 1 - explode * 0.85);
      for (const m of frameMaterials) {
        m.opacity = frameOpacity;
        m.depthWrite = frameOpacity > 0.99;
      }
    }
    renderer.render(scene, camera);
  }
  tick();

  const onThemeChange = () => applyTheme();
  window.addEventListener('nvl72:theme', onThemeChange);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onThemeChange);

  return {
    setExplode(v) { explodeGoal = clamp(v, 0, 1); },
    setHighlight(id) { selected = id; applyDim(); },
    focus(id, o) {
      selected = id;
      setHighlight(id);
      if (o?.explode !== undefined) explodeGoal = o.explode;
      const p = id ? focusAnchor.get(id) : null;
      if (p) {
        const c = anchorOf(p);
        target.set(0, c.y, 0);
        goal.radius = fitRadius() * 0.6;
        goal.theta = 0.75;
        goal.phi = 1.35;
      } else {
        target.set(0, 0, 0);
        goal.radius = fitRadius();
      }
    },
    resetView() {
      userZoomed = false;
      target.set(0, 0, 0);
      goal.theta = 0.66; goal.phi = 1.24; goal.radius = fitRadius();
      explodeGoal = 0; selected = null; hovered = null; applyDim();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener('nvl72:theme', onThemeChange);
      mq.removeEventListener('change', onThemeChange);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) { m.geometry.dispose(); }
      });
    },
  };
}
