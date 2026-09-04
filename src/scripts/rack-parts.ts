/**
 * Part metadata for the 3D rack — kept separate from the Three.js code so the
 * non-3D content path (tables, the parts list on /anatomy) renders the exact
 * same descriptions without pulling in the WebGL bundle.
 */
export interface PartInfo {
  id: string;
  label: string;
  group: 'compute' | 'switch' | 'spine' | 'power' | 'cooling' | 'frame';
  count: string;
  summary: string;
  detail: string;
}

export const partInfo: PartInfo[] = [
  {
    id: 'compute',
    label: 'Compute tray',
    group: 'compute',
    count: '18 × 1U',
    summary: 'Two Grace CPUs and four Blackwell GPUs per tray — 36 CPUs and 72 GPUs across the rack.',
    detail:
      'Each 1U tray carries two GB200 "Bianca" boards. A board is one Grace CPU plus two Blackwell GPUs joined by NVLink-C2C at 900 GB/s. The tray is liquid-cooled through blind-mate quick disconnects at the rear, so it slides in from the front and makes both its data and coolant connections without anyone handling a hose.',
  },
  {
    id: 'switch',
    label: 'NVSwitch tray',
    group: 'switch',
    count: '9 × 1U',
    summary: 'Two NVSwitch5 ASICs each — 18 in total, one per NVLink port on every GPU.',
    detail:
      'Each ASIC moves 28.8 Tb/s across 36 + 36 ports and carries SHARP engines that perform reductions in-network. They sit in the middle of the rack for one reason: every one of the 5,000-plus copper cables in the spine has to reach them, and cable length is the budget being minimised.',
  },
  {
    id: 'spine',
    label: 'NVLink spine',
    group: 'spine',
    count: '4 cartridges',
    summary: 'Over 5,000 copper cables — around two miles of them — carrying 130 TB/s all-to-all.',
    detail:
      'Copper, not optical. Optical transceivers and retimers for this many lanes would have drawn roughly 20 kW on their own, about a sixth of the rack’s entire power budget, to move data a metre and a half. At this reach copper is both cheaper and dramatically more efficient.',
  },
  {
    id: 'busbar',
    label: 'Busbar',
    group: 'power',
    count: '1, full height',
    summary: 'A single shared conductor feeding every tray, replacing 27 pairs of redundant PSUs.',
    detail:
      'Rack-level power shelves rectify facility input once and drive the busbar; trays tap it directly. Converting power once at rack scale is more efficient than converting it 54 times at server scale, and it reclaims the volume those supplies would have occupied.',
  },
  {
    id: 'psu',
    label: 'Power shelf',
    group: 'power',
    count: '3',
    summary: 'Converts facility input for the whole rack — roughly 120 kW nominal.',
    detail:
      'At 120 kW this rack draws what sixteen average data-centre racks draw. The worldwide mean rack density is 7.6 kW; almost no existing hall is built for one of these, let alone a row.',
  },
  {
    id: 'manifold',
    label: 'Coolant manifold',
    group: 'cooling',
    count: '1 pair, rear',
    summary: 'Vertical supply and return pipes that every tray blind-mates into.',
    detail:
      'Supply runs up one side, return down the other. Each tray’s quick disconnects seal on removal, so a tray can be pulled while the rack is running without draining the loop.',
  },
  {
    id: 'cdu',
    label: 'CDU',
    group: 'cooling',
    count: '1 (in-rack or sidecar)',
    summary: 'Isolates the rack’s coolant loop from the building’s water.',
    detail:
      'The pump-and-heat-exchanger unit gives the rack a filtered loop at a controlled temperature and pressure, independent of facility water quality. Inlet is warm by design — 32–45 °C — because warm water can be cooled without a compressor for much of the year.',
  },
  {
    id: 'frame',
    label: 'Rack frame',
    group: 'frame',
    count: '1',
    summary: 'ORv3-inspired, roughly 2.2 m × 0.6 m × 1.2 m, about 1.36 tonnes loaded.',
    detail:
      'The mass is a real constraint: 1.36 tonnes concentrated in half a square metre exceeds the floor loading many raised-floor halls were designed for, which is one of several reasons NVL72 tends to land in purpose-built space.',
  },
];

export const partById = new Map(partInfo.map((p) => [p.id, p]));
