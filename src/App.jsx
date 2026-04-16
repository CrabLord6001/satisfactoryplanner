import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const F = 28; // 1 foundation = 28px

const MACHINE_FP = {
  Smelter: { w: 2, l: 2 }, Constructor: { w: 2, l: 2 },
  Foundry: { w: 2, l: 3 }, Assembler: { w: 2, l: 3 },
  Manufacturer: { w: 3, l: 4 }, Refinery: { w: 3, l: 4 },
  Blender: { w: 3, l: 4 }, "Particle Accelerator": { w: 5, l: 5 },
};

const ALL_RECIPES = {
  "Iron Ore": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Copper Ore": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Limestone": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Coal": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Caterium Ore": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Raw Quartz": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Sulfur": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Bauxite": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Crude Oil": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Water": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Nitrogen Gas": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Uranium": { default: { machine: null, raw: true, rate: 0, time: 0, inputs: [], output: 1, power: 0 } },
  "Iron Ingot": {
    default: { machine: "Smelter", raw: false, time: 2, inputs: [["Iron Ore",1]], output: 1, rate: 30, power: 4 },
    "Pure Iron": { machine: "Refinery", raw: false, time: 12, inputs: [["Iron Ore",7],["Water",4]], output: 13, rate: 65, power: 30, tier: "S" },
    "Alloy Iron": { machine: "Foundry", raw: false, time: 6, inputs: [["Iron Ore",2],["Copper Ore",2]], output: 5, rate: 50, power: 16, tier: "A" },
  },
  "Copper Ingot": {
    default: { machine: "Smelter", raw: false, time: 2, inputs: [["Copper Ore",1]], output: 1, rate: 30, power: 4 },
    "Pure Copper": { machine: "Refinery", raw: false, time: 24, inputs: [["Copper Ore",6],["Water",4]], output: 15, rate: 37.5, power: 30, tier: "S" },
    "Alloy Copper": { machine: "Foundry", raw: false, time: 6, inputs: [["Iron Ore",5],["Copper Ore",5]], output: 10, rate: 100, power: 16, tier: "A" },
  },
  "Iron Plate": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Ingot",3]], output: 2, rate: 20, power: 4 } },
  "Iron Rod": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Iron Ingot",1]], output: 1, rate: 15, power: 4 },
    "Steel Rod": { machine: "Constructor", raw: false, time: 5, inputs: [["Steel Ingot",1]], output: 4, rate: 48, power: 4, tier: "A" },
  },
  "Wire": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Copper Ingot",1]], output: 2, rate: 30, power: 4 },
    "Caterium Wire": { machine: "Constructor", raw: false, time: 4, inputs: [["Caterium Ingot",1]], output: 8, rate: 120, power: 4, tier: "A" },
  },
  "Cable": { default: { machine: "Constructor", raw: false, time: 2, inputs: [["Wire",2]], output: 1, rate: 30, power: 4 } },
  "Concrete": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Limestone",3]], output: 1, rate: 15, power: 4 },
    "Wet Concrete": { machine: "Refinery", raw: false, time: 3, inputs: [["Limestone",6],["Water",5]], output: 4, rate: 80, power: 30, tier: "A" },
  },
  "Screw": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Rod",1]], output: 4, rate: 40, power: 4 },
    "Cast Screw": { machine: "Constructor", raw: false, time: 24, inputs: [["Iron Ingot",5]], output: 20, rate: 50, power: 4, tier: "A" },
    "Steel Screw": { machine: "Constructor", raw: false, time: 12, inputs: [["Steel Beam",1]], output: 52, rate: 260, power: 4, tier: "S" },
  },
  "Copper Sheet": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Copper Ingot",2]], output: 1, rate: 10, power: 4 } },
  "Reinforced Iron Plate": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Iron Plate",6],["Screw",12]], output: 1, rate: 5, power: 15 } },
  "Rotor": {
    default: { machine: "Assembler", raw: false, time: 15, inputs: [["Iron Rod",5],["Screw",25]], output: 1, rate: 4, power: 15 },
    "Steel Rotor": { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",2],["Wire",6]], output: 1, rate: 5, power: 15, tier: "S" },
  },
  "Modular Frame": {
    default: { machine: "Assembler", raw: false, time: 60, inputs: [["Reinforced Iron Plate",3],["Iron Rod",12]], output: 2, rate: 2, power: 15 },
    "Steeled Frame": { machine: "Assembler", raw: false, time: 60, inputs: [["Reinforced Iron Plate",2],["Steel Pipe",10]], output: 2, rate: 2, power: 15, tier: "A" },
  },
  "Smart Plating": { default: { machine: "Assembler", raw: false, time: 30, inputs: [["Reinforced Iron Plate",1],["Rotor",1]], output: 1, rate: 2, power: 15 } },
  "Steel Ingot": {
    default: { machine: "Foundry", raw: false, time: 4, inputs: [["Iron Ore",3],["Coal",3]], output: 3, rate: 45, power: 16 },
    "Solid Steel": { machine: "Foundry", raw: false, time: 3, inputs: [["Iron Ingot",2],["Coal",2]], output: 3, rate: 60, power: 16, tier: "S" },
  },
  "Steel Beam": { default: { machine: "Constructor", raw: false, time: 4, inputs: [["Steel Ingot",4]], output: 1, rate: 15, power: 4 } },
  "Steel Pipe": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Steel Ingot",3]], output: 2, rate: 20, power: 4 },
    "Molded Pipe": { machine: "Constructor", raw: false, time: 6, inputs: [["Steel Ingot",3],["Concrete",3]], output: 5, rate: 50, power: 4, tier: "S" },
  },
  "Encased Industrial Beam": { default: { machine: "Assembler", raw: false, time: 10, inputs: [["Steel Beam",3],["Concrete",5]], output: 1, rate: 6, power: 15 } },
  "Stator": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",3],["Wire",8]], output: 1, rate: 5, power: 15 } },
  "Motor": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Rotor",2],["Stator",2]], output: 1, rate: 5, power: 15 },
    "Electric Motor": { machine: "Assembler", raw: false, time: 16, inputs: [["Electromagnetic Control Rod",1],["Rotor",2]], output: 2, rate: 7.5, power: 15, tier: "A" },
  },
  "Versatile Framework": { default: { machine: "Assembler", raw: false, time: 24, inputs: [["Modular Frame",1],["Steel Beam",12]], output: 2, rate: 5, power: 15 } },
  "Automated Wiring": { default: { machine: "Assembler", raw: false, time: 24, inputs: [["Stator",1],["Cable",20]], output: 1, rate: 2.5, power: 15 } },
  "Caterium Ingot": { default: { machine: "Smelter", raw: false, time: 4, inputs: [["Caterium Ore",3]], output: 1, rate: 15, power: 4 } },
  "Quickwire": { default: { machine: "Constructor", raw: false, time: 5, inputs: [["Caterium Ingot",1]], output: 5, rate: 60, power: 4 } },
  "Plastic": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",3]], output: 2, rate: 20, power: 30 } },
  "Rubber": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",3]], output: 2, rate: 20, power: 30 } },
  "Fuel": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",6]], output: 4, rate: 40, power: 30 } },
  "Quartz Crystal": { default: { machine: "Constructor", raw: false, time: 8, inputs: [["Raw Quartz",5]], output: 3, rate: 22.5, power: 4 } },
  "Silica": { default: { machine: "Constructor", raw: false, time: 8, inputs: [["Raw Quartz",3]], output: 5, rate: 37.5, power: 4 } },
  "Circuit Board": { default: { machine: "Assembler", raw: false, time: 8, inputs: [["Copper Sheet",2],["Plastic",4]], output: 1, rate: 7.5, power: 15 } },
  "AI Limiter": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Circuit Board",5],["Quickwire",24]], output: 1, rate: 5, power: 15 },
    "Plastic AI Limiter": { machine: "Assembler", raw: false, time: 15, inputs: [["Quickwire",6],["Plastic",7]], output: 2, rate: 8, power: 15, tier: "S" },
  },
  "Computer": { default: { machine: "Manufacturer", raw: false, time: 24, inputs: [["Circuit Board",10],["Cable",9],["Plastic",18],["Screw",52]], output: 1, rate: 2.5, power: 55 } },
  "Heavy Modular Frame": {
    default: { machine: "Manufacturer", raw: false, time: 30, inputs: [["Modular Frame",5],["Steel Pipe",15],["Encased Industrial Beam",5],["Screw",100]], output: 1, rate: 2, power: 55 },
    "Heavy Encased": { machine: "Manufacturer", raw: false, time: 64, inputs: [["Modular Frame",8],["Encased Industrial Beam",10],["Steel Pipe",36],["Concrete",22]], output: 3, rate: 2.8125, power: 55, tier: "S" },
  },
  "Crystal Oscillator": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Quartz Crystal",36],["Cable",28],["Reinforced Iron Plate",5]], output: 2, rate: 1, power: 55 } },
  "Electromagnetic Control Rod": { default: { machine: "Assembler", raw: false, time: 30, inputs: [["Stator",3],["AI Limiter",2]], output: 2, rate: 4, power: 15 } },
  "Supercomputer": { default: { machine: "Manufacturer", raw: false, time: 32, inputs: [["Computer",2],["AI Limiter",2],["High-Speed Connector",3],["Plastic",28]], output: 1, rate: 1.875, power: 55 } },
  "High-Speed Connector": { default: { machine: "Manufacturer", raw: false, time: 16, inputs: [["Quickwire",56],["Cable",10],["Circuit Board",1]], output: 1, rate: 3.75, power: 55 } },
  "Radio Control Unit": { default: { machine: "Manufacturer", raw: false, time: 48, inputs: [["Aluminum Casing",32],["Crystal Oscillator",1],["Computer",1]], output: 2, rate: 2.5, power: 55 } },
  "Alumina Solution": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Bauxite",12],["Water",18]], output: 12, rate: 120, power: 30 } },
  "Aluminum Scrap": { default: { machine: "Refinery", raw: false, time: 1, inputs: [["Alumina Solution",4],["Coal",2]], output: 6, rate: 360, power: 30 } },
  "Aluminum Ingot": { default: { machine: "Smelter", raw: false, time: 4, inputs: [["Aluminum Scrap",6]], output: 4, rate: 60, power: 4 } },
  "Aluminum Casing": { default: { machine: "Constructor", raw: false, time: 2, inputs: [["Aluminum Ingot",3]], output: 2, rate: 60, power: 4 } },
  "Alclad Aluminum Sheet": { default: { machine: "Assembler", raw: false, time: 6, inputs: [["Aluminum Ingot",3],["Copper Ingot",1]], output: 3, rate: 30, power: 15 } },
  "Sulfuric Acid": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Sulfur",5],["Water",5]], output: 5, rate: 50, power: 30 } },
  "Heat Sink": {
    default: { machine: "Assembler", raw: false, time: 8, inputs: [["Alclad Aluminum Sheet",5],["Copper Sheet",3]], output: 1, rate: 7.5, power: 15 },
    "Heat Exchanger": { machine: "Assembler", raw: false, time: 6, inputs: [["Aluminum Casing",3],["Rubber",3]], output: 1, rate: 10, power: 15, tier: "S" },
  },
  "Cooling System": { default: { machine: "Blender", raw: false, time: 10, inputs: [["Heat Sink",2],["Rubber",2],["Water",5],["Nitrogen Gas",25]], output: 1, rate: 6, power: 75 } },
  "Fused Modular Frame": { default: { machine: "Blender", raw: false, time: 40, inputs: [["Heavy Modular Frame",1],["Aluminum Casing",50],["Nitrogen Gas",25]], output: 1, rate: 1.5, power: 75 } },
  "Turbo Motor": { default: { machine: "Manufacturer", raw: false, time: 32, inputs: [["Cooling System",4],["Radio Control Unit",2],["Motor",4],["Rubber",24]], output: 1, rate: 1.875, power: 55 } },
  "Thermal Propulsion Rocket": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Modular Engine",5],["Turbo Motor",2],["Cooling System",6],["Fused Modular Frame",2]], output: 2, rate: 1, power: 55 } },
  "Modular Engine": { default: { machine: "Manufacturer", raw: false, time: 60, inputs: [["Motor",2],["Rubber",15],["Smart Plating",2]], output: 1, rate: 1, power: 55 } },
  "Adaptive Control Unit": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Automated Wiring",15],["Circuit Board",10],["Heavy Modular Frame",2],["Computer",2]], output: 2, rate: 1, power: 55 } },
  "Copper Powder": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Copper Ingot",30]], output: 5, rate: 50, power: 4 } },
  "Pressure Conversion Cube": { default: { machine: "Assembler", raw: false, time: 60, inputs: [["Fused Modular Frame",1],["Radio Control Unit",2]], output: 1, rate: 1, power: 15 } },
  "Nuclear Pasta": { default: { machine: "Particle Accelerator", raw: false, time: 120, inputs: [["Copper Powder",200],["Pressure Conversion Cube",1]], output: 1, rate: 0.5, power: 750 } },
};

const getR = (it, ch) => ALL_RECIPES[it]?.[ch[it] || "default"] || ALL_RECIPES[it]?.default;
const getAlts = (it) => ALL_RECIPES[it] ? Object.keys(ALL_RECIPES[it]).filter(k => k !== "default") : [];

const MC = {
  Smelter: { fill: "#1a3a2a", stroke: "#2d7a50", text: "#5ec49a" },
  Constructor: { fill: "#162e42", stroke: "#2d6599", text: "#5aaddf" },
  Foundry: { fill: "#3d2e10", stroke: "#9a6520", text: "#daa040" },
  Assembler: { fill: "#2d1a50", stroke: "#6a40a0", text: "#a080d8" },
  Manufacturer: { fill: "#501a38", stroke: "#a04070", text: "#d880a8" },
  Refinery: { fill: "#133838", stroke: "#2d7878", text: "#50c8c8" },
  Blender: { fill: "#243812", stroke: "#608830", text: "#98d858" },
  "Particle Accelerator": { fill: "#401818", stroke: "#983838", text: "#d87070" },
  raw: { fill: "#141e28", stroke: "#3a5878", text: "#78b8d8" },
};
const TIER_COL = { S: "#fbbf24", A: "#68d391", B: "#63b3ed" };

let uid = 0;
function buildTree(item, rate, ch, sloop = new Set(), vis = new Set()) {
  const r = getR(item, ch);
  if (!r) return null;
  const id = item + "_" + (uid++);
  if (vis.has(item)) return { id, item, rate, machine: r.machine, mc: 0, pw: 0, ch: [], raw: r.raw };
  vis.add(item);
  if (r.raw) return { id, item, rate, machine: null, mc: 0, pw: 0, ch: [], raw: true };
  const sl = sloop.has(item);
  const eRate = sl ? r.rate * 2 : r.rate;
  const mc = rate / eRate;
  const pw = mc * r.power * (sl ? 2 : 1);
  const kids = r.inputs.map(([inp, qty]) => buildTree(inp, (qty / r.output) * (60 / r.time) * mc, ch, sloop, new Set(vis))).filter(Boolean);
  return { id, item, rate, machine: r.machine, mc, pw, ch: kids, raw: false, alt: ch[item] && ch[item] !== "default" ? ch[item] : null, hasAlts: getAlts(item).length > 0, sl };
}

function layout(root) {
  const flat = []; const walk = (n, d) => { flat.push({ ...n, d }); n.ch.forEach(c => walk(c, d + 1)); }; walk(root, 0);
  const byD = {};
  flat.forEach(n => { (byD[n.d] = byD[n.d] || []).push(n); });
  const maxD = Math.max(...Object.keys(byD).map(Number));
  const gapX = 16, gapY = 36;
  const pos = {};

  // Node dimensions based on foundation footprint (machines are visually separate)
  const MGAP = 8; // pixel gap between individual machines
  const nodeSize = (n) => {
    if (n.raw) return { w: 80, h: 40 };
    const fp = MACHINE_FP[n.machine];
    if (!fp) return { w: 100, h: 60 };
    const mc = Math.ceil(n.mc);
    const perRow = Math.min(mc, 4);
    const rows = Math.ceil(mc / perRow);
    const w = perRow * fp.w * F + (perRow - 1) * MGAP + 20;
    const h = rows * fp.l * F + (rows - 1) * MGAP + 32;
    return { w: Math.max(w, 100), h: Math.max(h, 60) };
  };

  for (let d = maxD; d >= 0; d--) {
    const nodes = byD[d] || [];
    nodes.forEach((n, i) => {
      const sz = nodeSize(n);
      const cp = n.ch.map(c => pos[c.id]).filter(Boolean);
      let x = cp.length > 0 ? (Math.min(...cp.map(p => p.x)) + Math.max(...cp.map(p => p.x + p.w))) / 2 - sz.w / 2 : i * (sz.w + gapX);
      pos[n.id] = { ...n, x, y: d * 200, ...sz };
    });
    const sorted = nodes.map(n => pos[n.id]).sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].x < sorted[i - 1].x + sorted[i - 1].w + gapX) {
        sorted[i].x = sorted[i - 1].x + sorted[i - 1].w + gapX;
        pos[sorted[i].id] = sorted[i];
      }
    }
  }
  const all = Object.values(pos);
  const minX = Math.min(...all.map(p => p.x));
  all.forEach(p => p.x -= minX);
  const edges = [];
  flat.forEach(n => {
    const from = pos[n.id];
    n.ch.forEach(c => { const to = pos[c.id]; if (from && to) edges.push({ from, to, rate: c.rate }); });
  });
  return { nodes: all, edges, W: Math.max(...all.map(p => p.x + p.w)) + 20, H: Math.max(...all.map(p => p.y + p.h)) + 20 };
}

// Foundation grid node: machine footprint drawn as actual grid squares
function MachineNode({ n, sel, onSel }) {
  const c = n.raw ? MC.raw : (MC[n.machine] || MC.raw);
  const isSel = sel === n.id;
  const mc = Math.ceil(n.mc);
  const fp = MACHINE_FP[n.machine];

  // Draw foundation grid cells — each machine drawn separately with a gap
  const MGAP = 8;
  const cells = [];
  if (fp && !n.raw) {
    const perRow = Math.min(mc, 4);
    const rows = Math.ceil(mc / perRow);
    const machineW = fp.w * F;
    const machineH = fp.l * F;
    const gridW = perRow * machineW + (perRow - 1) * MGAP;
    const ox = (n.w - gridW) / 2;
    const oy = 26;
    for (let r = 0; r < rows; r++) {
      const inRow = r < rows - 1 ? perRow : mc - r * perRow;
      for (let m = 0; m < inRow; m++) {
        // Each machine's top-left corner (includes gap)
        const mx0 = ox + m * (machineW + MGAP);
        const my0 = oy + r * (machineH + MGAP);
        // Draw foundation cells within this machine
        for (let fy = 0; fy < fp.l; fy++) {
          for (let fx = 0; fx < fp.w; fx++) {
            cells.push(
              <rect key={`${r}-${m}-${fx}-${fy}`}
                x={mx0 + fx * F} y={my0 + fy * F}
                width={F - 2} height={F - 2} rx={3}
                fill={c.fill} stroke={c.stroke} strokeWidth={0.7} />
            );
          }
        }
        // Outline the whole machine so each is distinct
        cells.push(
          <rect key={`m-${r}-${m}`} x={mx0 - 1} y={my0 - 1}
            width={machineW} height={machineH} rx={3}
            fill="none" stroke={c.stroke} strokeWidth={1.2} opacity={0.9} />
        );
        // Machine label inside
        const lx = mx0 + machineW / 2;
        const ly = my0 + machineH / 2;
        cells.push(
          <text key={`lbl-${r}-${m}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
            fill={c.text} fontSize={9} fontFamily="monospace" fontWeight={600} opacity={0.55}>
            {n.machine?.charAt(0)}
          </text>
        );
      }
    }
  }

  return (
    <g transform={`translate(${n.x},${n.y})`} onClick={(e) => { e.stopPropagation(); onSel(n); }} style={{ cursor: "pointer" }}>
      {/* Outer card */}
      <rect width={n.w} height={n.h} rx={6} fill="#0d1117"
        stroke={isSel ? "#fbbf24" : n.sl ? "#e879f9" : n.alt ? "#fbbf24" : c.stroke}
        strokeWidth={isSel ? 2 : 1} strokeDasharray={n.alt ? "4 2" : "none"} opacity={0.95} />
      {/* Foundation grid cells */}
      {cells}
      {/* Title bar */}
      <text x={n.w / 2} y={12} textAnchor="middle" fill={c.text} fontSize={10} fontWeight={600} fontFamily="system-ui, sans-serif">
        {n.item.length > 20 ? n.item.slice(0, 18) + ".." : n.item}
      </text>
      {n.alt && <text x={n.w / 2} y={22} textAnchor="middle" fill="#fbbf24" fontSize={7} fontFamily="system-ui">{n.alt}</text>}
      {n.hasAlts && <circle cx={n.w - 8} cy={8} r={3.5} fill="#fbbf24" opacity={0.85} />}
      {n.sl && <text x={6} y={10} fill="#e879f9" fontSize={8} fontWeight={700}>S</text>}
      {/* Bottom stats */}
      {n.raw ? (
        <text x={n.w / 2} y={n.h - 6} textAnchor="middle" fill="#68d391" fontSize={9} fontFamily="monospace">{n.rate.toFixed(1)}/min</text>
      ) : (
        <text x={n.w / 2} y={n.h - 6} textAnchor="middle" fill="#a0aec0" fontSize={8} fontFamily="monospace">
          <tspan fill={c.text}>{n.rate.toFixed(1)}/m</tspan>
          <tspan fill="#4a5568"> · </tspan>
          <tspan fill="#fbbf24">x{mc}</tspan>
          <tspan fill="#4a5568"> · </tspan>
          <tspan fill="#fc8181">{n.pw.toFixed(0)}MW</tspan>
          {fp && <><tspan fill="#4a5568"> · </tspan><tspan fill="#b794f4">{mc * fp.w * fp.l}f</tspan></>}
        </text>
      )}
    </g>
  );
}

function Edge({ e }) {
  // Simple single vertical line from child top to parent bottom center
  const px = e.from.x + e.from.w / 2, py = e.from.y + e.from.h;
  const cx = e.to.x + e.to.w / 2, cy = e.to.y;
  const c = e.to.raw ? MC.raw : (MC[e.to.machine] || MC.raw);
  // Single clean L-bend
  const midY = py + (cy - py) * 0.5;
  const straight = Math.abs(px - cx) < 3;
  return (
    <g>
      <path d={straight ? `M${cx},${cy} L${px},${py}` : `M${cx},${cy} L${cx},${midY} L${px},${midY} L${px},${py}`}
        fill="none" stroke={c.stroke} strokeWidth={1.5} opacity={0.5}
        markerEnd="url(#a)" />
      <text x={(px + cx) / 2 + (straight ? 8 : 0)} y={midY - 3} textAnchor="middle" fill={c.stroke} fontSize={7} fontFamily="monospace" opacity={0.7}>
        {e.rate.toFixed(1)}
      </text>
    </g>
  );
}

function totals(tree) {
  const raws = {}, mach = {};
  const w = (n) => {
    if (n.raw) raws[n.item] = (raws[n.item] || 0) + n.rate;
    else { if (!mach[n.item]) mach[n.item] = { m: 0, p: 0, machine: n.machine }; mach[n.item].m += n.mc; mach[n.item].p += n.pw; }
    n.ch.forEach(w);
  }; w(tree);
  let fnd = 0;
  Object.values(mach).forEach(d => { const fp = MACHINE_FP[d.machine]; if (fp) fnd += Math.ceil(d.m) * fp.w * fp.l; });
  return { raws, mach, totalM: Object.values(mach).reduce((a, m) => a + Math.ceil(m.m), 0), totalP: Object.values(mach).reduce((a, m) => a + m.p, 0), fnd, fndWalk: Math.ceil(fnd * 1.35) };
}

export default function App() {
  const [item, setItem] = useState("Motor");
  const [rate, setRate] = useState(5);
  const [ch, setCh] = useState({});
  const [sloop, setSloop] = useState(new Set());
  const [search, setSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [sel, setSel] = useState(null);
  const [detail, setDetail] = useState(null);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(false);
  const [ds, setDs] = useState(null);
  const [showAlts, setShowAlts] = useState(false);
  const dRef = useRef(null);

  const craftable = useMemo(() => Object.entries(ALL_RECIPES).filter(([, r]) => !r.default.raw).map(([n]) => n).sort(), []);
  const filt = useMemo(() => craftable.filter(i => i.toLowerCase().includes(search.toLowerCase())), [search, craftable]);
  const tree = useMemo(() => { uid = 0; return buildTree(item, rate, ch, sloop); }, [item, rate, ch, sloop]);
  const lo = useMemo(() => tree ? layout(tree) : null, [tree]);
  const S = useMemo(() => tree ? totals(tree) : null, [tree]);

  const treeAlts = useMemo(() => {
    if (!tree) return [];
    const s = new Set(); const w = n => { if (getAlts(n.item).length > 0 && !n.raw) s.add(n.item); n.ch.forEach(w); }; w(tree);
    return [...s].sort();
  }, [tree]);
  const treeItems = useMemo(() => {
    if (!tree) return [];
    const s = new Set(); const w = n => { if (!n.raw) s.add(n.item); n.ch.forEach(w); }; w(tree);
    return [...s].sort();
  }, [tree]);

  useEffect(() => { const h = e => { if (dRef.current && !dRef.current.contains(e.target)) setShowDrop(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  const pick = i => { setItem(i); setSearch(""); setShowDrop(false); setSel(null); setDetail(null); setRate(ALL_RECIPES[i]?.default?.rate || 1); setPan({ x: 20, y: 20 }); setZoom(1); };
  const onWheel = useCallback(e => { e.preventDefault(); setZoom(z => Math.max(0.08, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1)))); }, []);
  const md = e => { setDrag(true); setDs({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const mm = e => { if (drag && ds) setPan({ x: e.clientX - ds.x, y: e.clientY - ds.y }); };
  const mu = () => { setDrag(false); setDs(null); };
  const ts = e => { if (e.touches.length === 1) { setDrag(true); setDs({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }); } };
  const tm = e => { if (drag && ds && e.touches.length === 1) setPan({ x: e.touches[0].clientX - ds.x, y: e.touches[0].clientY - ds.y }); };
  const selNode = n => { setSel(n.id); setDetail(n); };
  useEffect(() => { if (lo) setZoom(Math.min(1, 680 / (lo.W + 40))); }, [lo]);
  const toggleR = (it, rn) => setCh(p => ({ ...p, [it]: (p[it] || "default") === rn ? "default" : rn }));
  const toggleS = it => setSloop(p => { const n = new Set(p); n.has(it) ? n.delete(it) : n.add(it); return n; });

  return (
    <div style={{ background: "#0b0f19", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ padding: "14px 16px 0", maxWidth: 940, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px", background: "linear-gradient(135deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Satisfactory production planner</h1>
        <p style={{ color: "#64748b", fontSize: 10, margin: "0 0 10px" }}>1.0/1.1 · Each machine = its actual foundation footprint · 1 grid square = 1 foundation (8m)</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px", position: "relative" }} ref={dRef}>
            <label style={{ color: "#94a3b8", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>Target item</label>
            <input value={showDrop ? search : item} onChange={e => { setSearch(e.target.value); setShowDrop(true); }} onFocus={() => { setShowDrop(true); setSearch(""); }}
              style={{ width: "100%", padding: "7px 10px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            {showDrop && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, maxHeight: 200, overflowY: "auto", marginTop: 2 }}>
              {filt.map(i => <div key={i} onClick={() => pick(i)} style={{ padding: "5px 10px", cursor: "pointer", fontSize: 12, color: i === item ? "#fbbf24" : "#cbd5e1" }}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.target.style.background = "transparent"}>
                {i} {getAlts(i).length > 0 && <span style={{ color: "#fbbf24", fontSize: 9 }}>+{getAlts(i).length}</span>}
              </div>)}
            </div>}
          </div>
          <div style={{ flex: "0 0 80px" }}>
            <label style={{ color: "#94a3b8", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>/min</label>
            <input type="number" value={rate} min={0.1} step={0.5} onChange={e => setRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              style={{ width: "100%", padding: "7px 10px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#fbbf24", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => { setPan({ x: 20, y: 20 }); if (lo) setZoom(Math.min(1, 680 / (lo.W + 40))); }} style={{ padding: "7px 10px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 10, cursor: "pointer" }}>Fit</button>
          <button onClick={() => { setCh({}); setSloop(new Set()); }} style={{ padding: "7px 10px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 10, cursor: "pointer" }}>Reset</button>
        </div>

        {/* Summary */}
        {S && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 6, marginBottom: 8 }}>
          {[{ l: "Machines", v: S.totalM, c: "#fbbf24" }, { l: "Power", v: S.totalP.toFixed(0) + " MW", c: "#fc8181" }, { l: "Foundations", v: S.fndWalk, c: "#b794f4" }, { l: "Slooped", v: sloop.size, c: "#e879f9" }, { l: "Raw", v: Object.keys(S.raws).length, c: "#68d391" }].map(s =>
            <div key={s.l} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ color: "#64748b", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div>
              <div style={{ color: s.c, fontSize: 17, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
            </div>
          )}
        </div>}

        {/* Raw pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
          {S && Object.entries(S.raws).sort((a, b) => b[1] - a[1]).map(([r, v]) =>
            <span key={r} style={{ background: "#0f2a1a", border: "1px solid #22543d", borderRadius: 4, padding: "2px 7px", fontSize: 9, color: "#68d391", fontFamily: "'JetBrains Mono', monospace" }}>{r}: {v.toFixed(1)}/m</span>
          )}
        </div>

        {/* Alt recipes + Somersloop toggles */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {treeAlts.length > 0 && <div style={{ flex: "1 1 280px" }}>
            <button onClick={() => setShowAlts(!showAlts)} style={{ width: "100%", padding: "6px 10px", background: "#111827", border: "1px solid #1e293b", borderRadius: showAlts ? "6px 6px 0 0" : 6, color: "#fbbf24", fontSize: 10, fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
              <span>Alt recipes ({treeAlts.length})</span><span style={{ transform: showAlts ? "rotate(180deg)" : "", transition: "transform 0.2s" }}>▼</span>
            </button>
            {showAlts && <div style={{ background: "#111827", border: "1px solid #1e293b", borderTop: "none", borderRadius: "0 0 6px 6px", padding: "6px 10px", maxHeight: 140, overflowY: "auto" }}>
              {treeAlts.map(it => <div key={it} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ color: "#94a3b8", fontSize: 9, minWidth: 100 }}>{it}:</span>
                {getAlts(it).map(alt => {
                  const active = ch[it] === alt; const tier = ALL_RECIPES[it][alt]?.tier;
                  return <button key={alt} onClick={() => toggleR(it, alt)} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 8, cursor: "pointer", background: active ? "rgba(251,191,36,0.15)" : "#1a1f2e", border: `1px solid ${active ? "#fbbf24" : "#2d3748"}`, color: active ? "#fbbf24" : "#64748b" }}>
                    {tier && <span style={{ color: TIER_COL[tier], fontWeight: 700, marginRight: 2 }}>{tier}</span>}{alt}
                  </button>;
                })}
              </div>)}
            </div>}
          </div>}
          <div style={{ flex: "1 1 280px" }}>
            <details style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 6 }}>
              <summary style={{ padding: "6px 10px", color: "#e879f9", fontSize: 10, fontWeight: 600, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                <span>Somersloop ({sloop.size})</span><span>▼</span>
              </summary>
              <div style={{ padding: "4px 10px 8px", display: "flex", flexWrap: "wrap", gap: 3 }}>
                {treeItems.map(it => <button key={it} onClick={() => toggleS(it)} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 8, cursor: "pointer", background: sloop.has(it) ? "rgba(232,121,249,0.15)" : "#1a1f2e", border: `1px solid ${sloop.has(it) ? "#e879f9" : "#2d3748"}`, color: sloop.has(it) ? "#e879f9" : "#64748b" }}>{it}</button>)}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Flowchart */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden", height: 520, position: "relative", cursor: drag ? "grabbing" : "grab" }}
          onWheel={onWheel} onMouseDown={md} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu} onTouchStart={ts} onTouchMove={tm} onTouchEnd={mu}>
          {/* Foundation grid background */}
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            <defs>
              <pattern id="fg" width={F} height={F} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % (F * zoom)},${pan.y % (F * zoom)}) scale(${zoom})`}>
                <rect width={F} height={F} fill="none" stroke="#161e2c" strokeWidth="0.5" />
              </pattern>
              <pattern id="fgM" width={F * 4} height={F * 4} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % (F * 4 * zoom)},${pan.y % (F * 4 * zoom)}) scale(${zoom})`}>
                <rect width={F * 4} height={F * 4} fill="none" stroke="#1e2840" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fg)" />
            <rect width="100%" height="100%" fill="url(#fgM)" />
          </svg>
          <div style={{ position: "absolute", top: 6, left: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: Math.max(6, F * zoom), height: Math.max(6, F * zoom), border: "1px solid #3a5570", borderRadius: 2, background: "rgba(22,30,44,0.7)" }} />
            <span style={{ color: "#3a5570", fontSize: 9, fontFamily: "monospace" }}>= 1 foundation (8m)</span>
          </div>
          {lo && <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
            <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M1 2L8 5L1 8" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" /></marker></defs>
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {lo.edges.map((e, i) => <Edge key={i} e={e} />)}
              {lo.nodes.map((n, i) => <MachineNode key={n.id + i} n={n} sel={sel} onSel={selNode} />)}
            </g>
          </svg>}
          <div style={{ position: "absolute", bottom: 6, right: 8, color: "#3a5570", fontSize: 9, fontFamily: "monospace" }}>{(zoom * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Detail panel */}
      {detail && !detail.raw && <div style={{ maxWidth: 940, margin: "8px auto 0", padding: "0 16px" }}>
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <div>
              <span style={{ color: (MC[detail.machine] || MC.raw).text, fontSize: 13, fontWeight: 600 }}>{detail.item}</span>
              {detail.alt && <span style={{ color: "#fbbf24", fontSize: 9, marginLeft: 6 }}>{detail.alt}</span>}
              {detail.sl && <span style={{ color: "#e879f9", fontSize: 9, marginLeft: 6 }}>SLOOPED</span>}
              <div style={{ color: "#64748b", fontSize: 10 }}>{detail.machine} · {detail.rate.toFixed(2)}/min · x{Math.ceil(detail.mc)} · {detail.pw.toFixed(0)}MW</div>
            </div>
          </div>
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {getR(detail.item, ch)?.inputs.map(([inp, qty]) => {
              const r = getR(detail.item, ch);
              return <div key={inp} style={{ background: "#1a2332", border: "1px solid #2d3748", borderRadius: 4, padding: "3px 8px" }}>
                <span style={{ color: "#78b8d8", fontSize: 10, fontWeight: 600 }}>{inp} </span>
                <span style={{ color: "#a0aec0", fontSize: 9, fontFamily: "monospace" }}>{((qty / r.output) * (60 / r.time) * detail.mc).toFixed(1)}/m</span>
              </div>;
            })}
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {getAlts(detail.item).map(alt => {
              const active = ch[detail.item] === alt; const tier = ALL_RECIPES[detail.item][alt]?.tier;
              return <button key={alt} onClick={() => toggleR(detail.item, alt)} style={{ padding: "2px 7px", borderRadius: 3, fontSize: 9, cursor: "pointer", background: active ? "rgba(251,191,36,0.15)" : "#1a1f2e", border: `1px solid ${active ? "#fbbf24" : "#2d3748"}`, color: active ? "#fbbf24" : "#64748b" }}>
                {tier && <span style={{ color: TIER_COL[tier], fontWeight: 700, marginRight: 2 }}>{tier}</span>}{alt}
              </button>;
            })}
            <button onClick={() => toggleS(detail.item)} style={{ padding: "2px 7px", borderRadius: 3, fontSize: 9, cursor: "pointer", background: sloop.has(detail.item) ? "rgba(232,121,249,0.15)" : "#1a1f2e", border: `1px solid ${sloop.has(detail.item) ? "#e879f9" : "#2d3748"}`, color: sloop.has(detail.item) ? "#e879f9" : "#64748b" }}>
              {sloop.has(detail.item) ? "Remove Sloop" : "Somersloop"}
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
}
