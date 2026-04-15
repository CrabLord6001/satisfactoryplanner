import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// Recipe DB: each item can have multiple recipes keyed by name
// "default" is always present; alternates are named
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
    "Pure Iron Ingot": { machine: "Refinery", raw: false, time: 12, inputs: [["Iron Ore",7],["Water",4]], output: 13, rate: 65, power: 30, tier: "S" },
    "Iron Alloy Ingot": { machine: "Foundry", raw: false, time: 6, inputs: [["Iron Ore",2],["Copper Ore",2]], output: 5, rate: 50, power: 16, tier: "A" },
  },
  "Copper Ingot": {
    default: { machine: "Smelter", raw: false, time: 2, inputs: [["Copper Ore",1]], output: 1, rate: 30, power: 4 },
    "Pure Copper Ingot": { machine: "Refinery", raw: false, time: 24, inputs: [["Copper Ore",6],["Water",4]], output: 15, rate: 37.5, power: 30, tier: "S" },
    "Copper Alloy Ingot": { machine: "Foundry", raw: false, time: 6, inputs: [["Iron Ore",5],["Copper Ore",5]], output: 10, rate: 100, power: 16, tier: "A" },
  },
  "Iron Plate": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Ingot",3]], output: 2, rate: 20, power: 4 },
    "Coated Iron Plate": { machine: "Assembler", raw: false, time: 12, inputs: [["Iron Ingot",10],["Plastic",2]], output: 15, rate: 75, power: 15, tier: "A" },
    "Stitched Iron Plate": { machine: "Assembler", raw: false, time: 32, inputs: [["Iron Plate",10],["Wire",20]], output: 3, rate: 5.625, power: 15, tier: "B" },
  },
  "Iron Rod": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Iron Ingot",1]], output: 1, rate: 15, power: 4 },
    "Steel Rod": { machine: "Constructor", raw: false, time: 5, inputs: [["Steel Ingot",1]], output: 4, rate: 48, power: 4, tier: "A" },
  },
  "Wire": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Copper Ingot",1]], output: 2, rate: 30, power: 4 },
    "Iron Wire": { machine: "Constructor", raw: false, time: 24, inputs: [["Iron Ingot",5]], output: 9, rate: 22.5, power: 4, tier: "B" },
    "Caterium Wire": { machine: "Constructor", raw: false, time: 4, inputs: [["Caterium Ingot",1]], output: 8, rate: 120, power: 4, tier: "A" },
  },
  "Cable": { default: { machine: "Constructor", raw: false, time: 2, inputs: [["Wire",2]], output: 1, rate: 30, power: 4 } },
  "Concrete": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Limestone",3]], output: 1, rate: 15, power: 4 },
    "Wet Concrete": { machine: "Refinery", raw: false, time: 3, inputs: [["Limestone",6],["Water",5]], output: 4, rate: 80, power: 30, tier: "A" },
    "Fine Concrete": { machine: "Assembler", raw: false, time: 24, inputs: [["Silica",3],["Limestone",12]], output: 10, rate: 25, power: 15, tier: "B" },
  },
  "Screw": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Rod",1]], output: 4, rate: 40, power: 4 },
    "Cast Screw": { machine: "Constructor", raw: false, time: 24, inputs: [["Iron Ingot",5]], output: 20, rate: 50, power: 4, tier: "A" },
    "Steel Screw": { machine: "Constructor", raw: false, time: 12, inputs: [["Steel Beam",1]], output: 52, rate: 260, power: 4, tier: "S" },
  },
  "Copper Sheet": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Copper Ingot",2]], output: 1, rate: 10, power: 4 },
    "Steamed Copper Sheet": { machine: "Refinery", raw: false, time: 8, inputs: [["Copper Ingot",3],["Water",3]], output: 3, rate: 22.5, power: 30, tier: "B" },
  },
  "Reinforced Iron Plate": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Iron Plate",6],["Screw",12]], output: 1, rate: 5, power: 15 },
    "Adhered Iron Plate": { machine: "Assembler", raw: false, time: 16, inputs: [["Iron Plate",3],["Rubber",1]], output: 1, rate: 3.75, power: 15, tier: "B" },
    "Bolted Iron Plate": { machine: "Assembler", raw: false, time: 12, inputs: [["Iron Plate",18],["Screw",50]], output: 3, rate: 15, power: 15, tier: "B" },
  },
  "Rotor": {
    default: { machine: "Assembler", raw: false, time: 15, inputs: [["Iron Rod",5],["Screw",25]], output: 1, rate: 4, power: 15 },
    "Steel Rotor": { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",2],["Wire",6]], output: 1, rate: 5, power: 15, tier: "S" },
    "Copper Rotor": { machine: "Assembler", raw: false, time: 16, inputs: [["Copper Sheet",6],["Screw",52]], output: 3, rate: 11.25, power: 15, tier: "B" },
  },
  "Modular Frame": {
    default: { machine: "Assembler", raw: false, time: 60, inputs: [["Reinforced Iron Plate",3],["Iron Rod",12]], output: 2, rate: 2, power: 15 },
    "Steeled Frame": { machine: "Assembler", raw: false, time: 60, inputs: [["Reinforced Iron Plate",2],["Steel Pipe",10]], output: 2, rate: 2, power: 15, tier: "A" },
  },
  "Smart Plating": { default: { machine: "Assembler", raw: false, time: 30, inputs: [["Reinforced Iron Plate",1],["Rotor",1]], output: 1, rate: 2, power: 15 } },
  "Steel Ingot": {
    default: { machine: "Foundry", raw: false, time: 4, inputs: [["Iron Ore",3],["Coal",3]], output: 3, rate: 45, power: 16 },
    "Solid Steel Ingot": { machine: "Foundry", raw: false, time: 3, inputs: [["Iron Ingot",2],["Coal",2]], output: 3, rate: 60, power: 16, tier: "S" },
    "Compacted Steel Ingot": { machine: "Foundry", raw: false, time: 16, inputs: [["Iron Ore",6],["Compacted Coal",3]], output: 10, rate: 37.5, power: 16, tier: "B" },
  },
  "Steel Beam": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Steel Ingot",4]], output: 1, rate: 15, power: 4 },
  },
  "Steel Pipe": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Steel Ingot",3]], output: 2, rate: 20, power: 4 },
    "Molded Steel Pipe": { machine: "Constructor", raw: false, time: 6, inputs: [["Steel Ingot",3],["Concrete",3]], output: 5, rate: 50, power: 4, tier: "S" },
    "Iron Pipe": { machine: "Constructor", raw: false, time: 12, inputs: [["Iron Ingot",20]], output: 5, rate: 25, power: 4, tier: "B" },
  },
  "Encased Industrial Beam": {
    default: { machine: "Assembler", raw: false, time: 10, inputs: [["Steel Beam",3],["Concrete",5]], output: 1, rate: 6, power: 15 },
    "Encased Industrial Pipe": { machine: "Assembler", raw: false, time: 15, inputs: [["Steel Pipe",7],["Concrete",5]], output: 1, rate: 4, power: 15, tier: "A" },
  },
  "Stator": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",3],["Wire",8]], output: 1, rate: 5, power: 15 },
  },
  "Motor": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Rotor",2],["Stator",2]], output: 1, rate: 5, power: 15 },
    "Electric Motor": { machine: "Assembler", raw: false, time: 16, inputs: [["Electromagnetic Control Rod",1],["Rotor",2]], output: 2, rate: 7.5, power: 15, tier: "A" },
  },
  "Versatile Framework": { default: { machine: "Assembler", raw: false, time: 24, inputs: [["Modular Frame",1],["Steel Beam",12]], output: 2, rate: 5, power: 15 } },
  "Automated Wiring": { default: { machine: "Assembler", raw: false, time: 24, inputs: [["Stator",1],["Cable",20]], output: 1, rate: 2.5, power: 15 } },
  "Caterium Ingot": {
    default: { machine: "Smelter", raw: false, time: 4, inputs: [["Caterium Ore",3]], output: 1, rate: 15, power: 4 },
    "Pure Caterium Ingot": { machine: "Refinery", raw: false, time: 5, inputs: [["Caterium Ore",2],["Water",2]], output: 1, rate: 12, power: 30, tier: "S" },
  },
  "Quickwire": {
    default: { machine: "Constructor", raw: false, time: 5, inputs: [["Caterium Ingot",1]], output: 5, rate: 60, power: 4 },
    "Fused Quickwire": { machine: "Assembler", raw: false, time: 8, inputs: [["Caterium Ingot",1],["Copper Ingot",5]], output: 12, rate: 90, power: 15, tier: "A" },
  },
  "Plastic": {
    default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",3]], output: 2, rate: 20, power: 30 },
    "Recycled Plastic": { machine: "Refinery", raw: false, time: 12, inputs: [["Rubber",6],["Fuel",6]], output: 12, rate: 60, power: 30, tier: "A" },
  },
  "Rubber": {
    default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",3]], output: 2, rate: 20, power: 30 },
    "Recycled Rubber": { machine: "Refinery", raw: false, time: 12, inputs: [["Plastic",6],["Fuel",6]], output: 12, rate: 60, power: 30, tier: "A" },
  },
  "Fuel": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",6]], output: 4, rate: 40, power: 30 } },
  "Compacted Coal": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Coal",5],["Sulfur",5]], output: 5, rate: 25, power: 15 } },
  "Quartz Crystal": { default: { machine: "Constructor", raw: false, time: 8, inputs: [["Raw Quartz",5]], output: 3, rate: 22.5, power: 4 } },
  "Silica": { default: { machine: "Constructor", raw: false, time: 8, inputs: [["Raw Quartz",3]], output: 5, rate: 37.5, power: 4 } },
  "Circuit Board": {
    default: { machine: "Assembler", raw: false, time: 8, inputs: [["Copper Sheet",2],["Plastic",4]], output: 1, rate: 7.5, power: 15 },
    "Silicon Circuit Board": { machine: "Assembler", raw: false, time: 24, inputs: [["Copper Sheet",11],["Silica",11]], output: 5, rate: 12.5, power: 15, tier: "A" },
  },
  "AI Limiter": {
    default: { machine: "Assembler", raw: false, time: 12, inputs: [["Circuit Board",5],["Quickwire",24]], output: 1, rate: 5, power: 15 },
    "Plastic AI Limiter": { machine: "Assembler", raw: false, time: 15, inputs: [["Quickwire",6],["Plastic",7]], output: 2, rate: 8, power: 15, tier: "S" },
  },
  "Computer": {
    default: { machine: "Manufacturer", raw: false, time: 24, inputs: [["Circuit Board",10],["Cable",9],["Plastic",18],["Screw",52]], output: 1, rate: 2.5, power: 55 },
    "Crystal Computer": { machine: "Assembler", raw: false, time: 64, inputs: [["Circuit Board",8],["Crystal Oscillator",3]], output: 3, rate: 2.8125, power: 15, tier: "A" },
  },
  "Heavy Modular Frame": {
    default: { machine: "Manufacturer", raw: false, time: 30, inputs: [["Modular Frame",5],["Steel Pipe",15],["Encased Industrial Beam",5],["Screw",100]], output: 1, rate: 2, power: 55 },
    "Heavy Encased Frame": { machine: "Manufacturer", raw: false, time: 64, inputs: [["Modular Frame",8],["Encased Industrial Beam",10],["Steel Pipe",36],["Concrete",22]], output: 3, rate: 2.8125, power: 55, tier: "S" },
  },
  "Crystal Oscillator": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Quartz Crystal",36],["Cable",28],["Reinforced Iron Plate",5]], output: 2, rate: 1, power: 55 } },
  "Black Powder": { default: { machine: "Assembler", raw: false, time: 4, inputs: [["Coal",1],["Sulfur",1]], output: 2, rate: 30, power: 15 } },
  "Alumina Solution": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Bauxite",12],["Water",18]], output: 12, rate: 120, power: 30 } },
  "Aluminum Scrap": {
    default: { machine: "Refinery", raw: false, time: 1, inputs: [["Alumina Solution",4],["Coal",2]], output: 6, rate: 360, power: 30 },
    "Instant Scrap": { machine: "Blender", raw: false, time: 6, inputs: [["Bauxite",15],["Coal",10],["Sulfuric Acid",5],["Water",6]], output: 30, rate: 300, power: 75, tier: "S" },
  },
  "Aluminum Ingot": { default: { machine: "Smelter", raw: false, time: 4, inputs: [["Aluminum Scrap",6]], output: 4, rate: 60, power: 4 } },
  "Aluminum Casing": { default: { machine: "Constructor", raw: false, time: 2, inputs: [["Aluminum Ingot",3]], output: 2, rate: 60, power: 4 } },
  "Alclad Aluminum Sheet": { default: { machine: "Assembler", raw: false, time: 6, inputs: [["Aluminum Ingot",3],["Copper Ingot",1]], output: 3, rate: 30, power: 15 } },
  "Sulfuric Acid": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Sulfur",5],["Water",5]], output: 5, rate: 50, power: 30 } },
  "Battery": { default: { machine: "Blender", raw: false, time: 3, inputs: [["Sulfuric Acid",2.5],["Alumina Solution",2],["Aluminum Casing",1]], output: 1, rate: 20, power: 75 } },
  "High-Speed Connector": {
    default: { machine: "Manufacturer", raw: false, time: 16, inputs: [["Quickwire",56],["Cable",10],["Circuit Board",1]], output: 1, rate: 3.75, power: 55 },
    "Silicon High-Speed Connector": { machine: "Manufacturer", raw: false, time: 40, inputs: [["Quickwire",60],["Silica",25],["Circuit Board",2]], output: 2, rate: 3, power: 55, tier: "A" },
  },
  "Supercomputer": {
    default: { machine: "Manufacturer", raw: false, time: 32, inputs: [["Computer",2],["AI Limiter",2],["High-Speed Connector",3],["Plastic",28]], output: 1, rate: 1.875, power: 55 },
    "OC Supercomputer": { machine: "Assembler", raw: false, time: 20, inputs: [["Radio Control Unit",3],["Cooling System",3]], output: 1, rate: 3, power: 15, tier: "S" },
  },
  "Radio Control Unit": { default: { machine: "Manufacturer", raw: false, time: 48, inputs: [["Aluminum Casing",32],["Crystal Oscillator",1],["Computer",1]], output: 2, rate: 2.5, power: 55 } },
  "Heat Sink": {
    default: { machine: "Assembler", raw: false, time: 8, inputs: [["Alclad Aluminum Sheet",5],["Copper Sheet",3]], output: 1, rate: 7.5, power: 15 },
    "Heat Exchanger": { machine: "Assembler", raw: false, time: 6, inputs: [["Aluminum Casing",3],["Rubber",3]], output: 1, rate: 10, power: 15, tier: "S" },
  },
  "Cooling System": {
    default: { machine: "Blender", raw: false, time: 10, inputs: [["Heat Sink",2],["Rubber",2],["Water",5],["Nitrogen Gas",25]], output: 1, rate: 6, power: 75 },
    "Cooling Device": { machine: "Blender", raw: false, time: 32, inputs: [["Heat Sink",5],["Motor",1],["Nitrogen Gas",24]], output: 2, rate: 3.75, power: 75, tier: "B" },
  },
  "Fused Modular Frame": { default: { machine: "Blender", raw: false, time: 40, inputs: [["Heavy Modular Frame",1],["Aluminum Casing",50],["Nitrogen Gas",25]], output: 1, rate: 1.5, power: 75 } },
  "Electromagnetic Control Rod": { default: { machine: "Assembler", raw: false, time: 30, inputs: [["Stator",3],["AI Limiter",2]], output: 2, rate: 4, power: 15 } },
  "Turbo Motor": {
    default: { machine: "Manufacturer", raw: false, time: 32, inputs: [["Cooling System",4],["Radio Control Unit",2],["Motor",4],["Rubber",24]], output: 1, rate: 1.875, power: 55 },
    "Turbo Pressure Motor": { machine: "Manufacturer", raw: false, time: 32, inputs: [["Motor",4],["Pressure Conversion Cube",1],["Stator",4],["Nitrogen Gas",24]], output: 2, rate: 3.75, power: 55, tier: "A" },
  },
  "Adaptive Control Unit": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Automated Wiring",15],["Circuit Board",10],["Heavy Modular Frame",2],["Computer",2]], output: 2, rate: 1, power: 55 } },
  "Assembly Director System": { default: { machine: "Assembler", raw: false, time: 80, inputs: [["Adaptive Control Unit",2],["Supercomputer",1]], output: 1, rate: 0.75, power: 15 } },
  "Magnetic Field Generator": { default: { machine: "Assembler", raw: false, time: 120, inputs: [["Versatile Framework",5],["Electromagnetic Control Rod",2]], output: 2, rate: 1, power: 15 } },
  "Modular Engine": { default: { machine: "Manufacturer", raw: false, time: 60, inputs: [["Motor",2],["Rubber",15],["Smart Plating",2]], output: 1, rate: 1, power: 55 } },
  "Thermal Propulsion Rocket": { default: { machine: "Manufacturer", raw: false, time: 120, inputs: [["Modular Engine",5],["Turbo Motor",2],["Cooling System",6],["Fused Modular Frame",2]], output: 2, rate: 1, power: 55 } },
  "Copper Powder": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Copper Ingot",30]], output: 5, rate: 50, power: 4 } },
  "Pressure Conversion Cube": { default: { machine: "Assembler", raw: false, time: 60, inputs: [["Fused Modular Frame",1],["Radio Control Unit",2]], output: 1, rate: 1, power: 15 } },
  "Nuclear Pasta": { default: { machine: "Particle Accelerator", raw: false, time: 120, inputs: [["Copper Powder",200],["Pressure Conversion Cube",1]], output: 1, rate: 0.5, power: 750 } },
  "Encased Uranium Cell": { default: { machine: "Blender", raw: false, time: 12, inputs: [["Uranium",10],["Concrete",3],["Sulfuric Acid",8]], output: 5, rate: 25, power: 75 } },
  "Uranium Fuel Rod": { default: { machine: "Manufacturer", raw: false, time: 150, inputs: [["Encased Uranium Cell",50],["Encased Industrial Beam",3],["Electromagnetic Control Rod",5]], output: 1, rate: 0.4, power: 55 } },
  "Empty Canister": { default: { machine: "Constructor", raw: false, time: 4, inputs: [["Plastic",2]], output: 4, rate: 60, power: 4 } },
};

const getRecipe = (item, choices) => {
  const recipes = ALL_RECIPES[item];
  if (!recipes) return null;
  const chosen = choices[item] || "default";
  return recipes[chosen] || recipes["default"];
};

const getAlts = (item) => {
  const recipes = ALL_RECIPES[item];
  if (!recipes) return [];
  return Object.keys(recipes).filter(k => k !== "default");
};

const MCOLORS = {
  Smelter: { bg: "#22543d", border: "#38a169", accent: "#68d391" },
  Constructor: { bg: "#1e3a5f", border: "#3182ce", accent: "#63b3ed" },
  Foundry: { bg: "#5f370e", border: "#c05621", accent: "#ed8936" },
  Assembler: { bg: "#44337a", border: "#805ad5", accent: "#b794f4" },
  Manufacturer: { bg: "#702459", border: "#d53f8c", accent: "#f687b3" },
  Refinery: { bg: "#1a535c", border: "#319795", accent: "#4fd1c5" },
  Blender: { bg: "#2f4a1a", border: "#68a329", accent: "#a3d977" },
  "Particle Accelerator": { bg: "#5c1a1a", border: "#c53030", accent: "#fc8181" },
  raw: { bg: "#1a2332", border: "#4a6a8a", accent: "#90cdf4" },
};

const TIER_COLORS = { S: "#fbbf24", A: "#68d391", B: "#63b3ed", C: "#a0aec0" };

function buildGraph(item, targetRate, choices, visited = new Set()) {
  const r = getRecipe(item, choices);
  if (!r) return null;
  const id = item;
  if (visited.has(id)) return { id, item, rate: targetRate, machine: r.machine, machines: 0, power: 0, children: [], raw: r.raw, dup: true };
  visited.add(id);
  if (r.raw) return { id, item, rate: targetRate, machine: null, machines: 0, power: 0, children: [], raw: true };
  const mc = targetRate / r.rate;
  const pw = mc * (r.power || 0);
  const ch = r.inputs.map(([inp, qty]) => {
    const need = (qty / r.output) * (60 / r.time) * mc;
    return buildGraph(inp, need, choices, new Set(visited));
  }).filter(Boolean);
  const altName = choices[item] && choices[item] !== "default" ? choices[item] : null;
  return { id, item, rate: targetRate, machine: r.machine, machines: mc, power: pw, children: ch, raw: false, altName, hasAlts: getAlts(item).length > 0 };
}

function collectNodes(node, depth = 0, list = []) {
  list.push({ ...node, depth });
  node.children.forEach(c => collectNodes(c, depth + 1, list));
  return list;
}

function layoutNodes(root) {
  const flat = collectNodes(root);
  const byDepth = {};
  flat.forEach(n => { if (!byDepth[n.depth]) byDepth[n.depth] = []; byDepth[n.depth].push(n); });
  const nW = 190, nH = 72, gX = 24, gY = 44;
  const maxD = Math.max(...Object.keys(byDepth).map(Number));
  const pos = {};
  for (let d = maxD; d >= 0; d--) {
    const nodes = byDepth[d] || [];
    nodes.forEach((n, i) => {
      const cp = n.children.map(c => pos[c.id + c.depth]).filter(Boolean);
      let x = cp.length > 0 ? (Math.min(...cp.map(p => p.x)) + Math.max(...cp.map(p => p.x))) / 2 : i * (nW + gX);
      pos[n.id + n.depth] = { ...n, x, y: d * (nH + gY), w: nW, h: nH };
    });
    const sorted = nodes.map(n => pos[n.id + n.depth]).sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].x < sorted[i - 1].x + nW + gX) {
        sorted[i].x = sorted[i - 1].x + nW + gX;
        pos[sorted[i].id + sorted[i].depth] = sorted[i];
      }
    }
  }
  const allP = Object.values(pos);
  const minX = Math.min(...allP.map(p => p.x));
  allP.forEach(p => p.x -= minX);
  const edges = [];
  flat.forEach(n => {
    const from = pos[n.id + n.depth];
    n.children.forEach(c => {
      const to = pos[c.id + c.depth];
      if (from && to) edges.push({ from, to });
    });
  });
  return { nodes: allP, edges, width: Math.max(...allP.map(p => p.x + nW)) + 40, height: Math.max(...allP.map(p => p.y + nH)) + 40 };
}

function FlowNode({ node, selected, onSelect }) {
  const col = node.raw ? MCOLORS.raw : (MCOLORS[node.machine] || MCOLORS.raw);
  const isSel = selected === node.id + node.depth;
  const isAlt = !!node.altName;
  return (
    <g transform={`translate(${node.x},${node.y})`} onClick={() => onSelect(node)} style={{ cursor: "pointer" }}>
      <rect width={node.w} height={node.h} rx={8} fill={col.bg}
        stroke={isSel ? "#fbbf24" : isAlt ? "#fbbf24" : col.border}
        strokeWidth={isSel ? 2.5 : isAlt ? 1.5 : 1}
        strokeDasharray={isAlt ? "4 2" : "none"} opacity={0.95} />
      {node.hasAlts && (
        <circle cx={node.w - 10} cy={10} r={5} fill="#fbbf24" opacity={0.8} />
      )}
      <text x={node.w / 2} y={16} textAnchor="middle" fill={col.accent}
        fontSize={11} fontWeight={600} fontFamily="system-ui, sans-serif">
        {node.item.length > 24 ? node.item.slice(0, 22) + ".." : node.item}
      </text>
      {isAlt && (
        <text x={node.w / 2} y={28} textAnchor="middle" fill="#fbbf24"
          fontSize={8} fontFamily="system-ui" opacity={0.9}>ALT: {node.altName}</text>
      )}
      {node.raw ? (
        <text x={node.w / 2} y={isAlt ? 44 : 36} textAnchor="middle" fill="#68d391"
          fontSize={10} fontFamily="monospace">{node.rate.toFixed(1)}/min RAW</text>
      ) : (
        <>
          <text x={node.w / 2} y={isAlt ? 42 : 36} textAnchor="middle" fill="#e2e8f0"
            fontSize={10} fontFamily="monospace">{node.rate.toFixed(2)}/min</text>
          <text x={node.w / 2} y={isAlt ? 54 : 48} textAnchor="middle" fill="#a0aec0"
            fontSize={9} fontFamily="system-ui">{node.machine}</text>
          <text x={node.w / 2} y={isAlt ? 66 : 62} textAnchor="middle" fill="#fbbf24"
            fontSize={10} fontWeight={600} fontFamily="monospace">
            x{node.machines.toFixed(2)} | {node.power.toFixed(1)}MW
          </text>
        </>
      )}
    </g>
  );
}

function FlowEdge({ edge }) {
  const x1 = edge.from.x + edge.from.w / 2, y1 = edge.from.y + edge.from.h;
  const x2 = edge.to.x + edge.to.w / 2, y2 = edge.to.y;
  const my = (y1 + y2) / 2;
  return <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`} fill="none" stroke="#4a5568" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.6} />;
}

function flatSummary(node, raws = {}, mach = {}) {
  if (node.raw) raws[node.item] = (raws[node.item] || 0) + node.rate;
  else {
    if (!mach[node.item]) mach[node.item] = { m: 0, p: 0, machine: node.machine };
    mach[node.item].m += node.machines; mach[node.item].p += node.power;
  }
  node.children.forEach(c => flatSummary(c, raws, mach));
  return { raws, mach };
}

export default function App() {
  const [item, setItem] = useState("Motor");
  const [rate, setRate] = useState(5);
  const [choices, setChoices] = useState({});
  const [search, setSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailNode, setDetailNode] = useState(null);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const dropRef = useRef(null);

  const craftable = useMemo(() => Object.entries(ALL_RECIPES).filter(([, r]) => !r.default.raw).map(([n]) => n).sort(), []);
  const filtered = useMemo(() => craftable.filter(i => i.toLowerCase().includes(search.toLowerCase())), [search, craftable]);
  const tree = useMemo(() => buildGraph(item, rate, choices), [item, rate, choices]);
  const layout = useMemo(() => tree ? layoutNodes(tree) : null, [tree]);
  const summary = useMemo(() => tree ? flatSummary(tree) : { raws: {}, mach: {} }, [tree]);
  const totalPower = Object.values(summary.mach).reduce((s, m) => s + m.p, 0);
  const totalMachines = Object.values(summary.mach).reduce((s, m) => s + Math.ceil(m.m), 0);

  // All items in the current tree that have alts
  const treeAlts = useMemo(() => {
    if (!tree) return [];
    const items = new Set();
    const walk = (n) => { if (getAlts(n.item).length > 0 && !n.raw) items.add(n.item); n.children.forEach(walk); };
    walk(tree);
    return [...items].sort();
  }, [tree]);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (i) => { setItem(i); setSearch(""); setShowDrop(false); setSelected(null); setDetailNode(null); const r = ALL_RECIPES[i]?.default; setRate(r?.rate || 1); setPan({ x: 20, y: 20 }); setZoom(1); };

  const handleWheel = useCallback((e) => { e.preventDefault(); setZoom(z => Math.max(0.1, Math.min(3, z * (e.deltaY > 0 ? 0.9 : 1.1)))); }, []);
  const handleMouseDown = (e) => { if (e.button === 0) { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); } };
  const handleMouseMove = (e) => { if (dragging && dragStart) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => { setDragging(false); setDragStart(null); };
  const handleTouchStart = (e) => { if (e.touches.length === 1) { setDragging(true); setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }); } };
  const handleTouchMove = (e) => { if (dragging && dragStart && e.touches.length === 1) setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); };

  const selectNode = (node) => { setSelected(node.id + node.depth); setDetailNode(node); };
  const resetView = () => { setPan({ x: 20, y: 20 }); setZoom(layout ? Math.min(1, 700 / (layout.width + 40)) : 1); };

  useEffect(() => { if (layout) setZoom(Math.min(1, 700 / (layout.width + 40))); }, [layout]);

  const toggleRecipe = (itemName, recipeName) => {
    setChoices(prev => {
      const cur = prev[itemName] || "default";
      return { ...prev, [itemName]: cur === recipeName ? "default" : recipeName };
    });
  };

  return (
    <div style={{ background: "#0b0f19", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ padding: "16px 16px 0", maxWidth: 920, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px", background: "linear-gradient(135deg,#f97316,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Satisfactory production planner
        </h1>
        <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 14px" }}>1.0/1.1 recipes with alternate recipe toggles · Pan: drag · Zoom: scroll · Click nodes for details</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px", position: "relative" }} ref={dropRef}>
            <label style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>Target item</label>
            <input value={showDrop ? search : item} onChange={(e) => { setSearch(e.target.value); setShowDrop(true); }} onFocus={() => { setShowDrop(true); setSearch(""); }}
              placeholder="Search..." style={{ width: "100%", padding: "8px 12px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            {showDrop && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, maxHeight: 220, overflowY: "auto", marginTop: 2 }}>
                {filtered.map(i => (
                  <div key={i} onClick={() => pick(i)} style={{ padding: "6px 12px", cursor: "pointer", fontSize: 12, color: i === item ? "#fbbf24" : "#cbd5e1" }}
                    onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.target.style.background = "transparent"}>
                    {i} <span style={{ color: "#4a5568", fontSize: 10 }}>{ALL_RECIPES[i].default.machine}</span>
                    {getAlts(i).length > 0 && <span style={{ color: "#fbbf24", fontSize: 9, marginLeft: 4 }}>+{getAlts(i).length} alt</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <label style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>Rate /min</label>
            <input type="number" value={rate} min={0.1} step={0.5} onChange={(e) => setRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              style={{ width: "100%", padding: "8px 12px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#fbbf24", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={resetView} style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>Fit</button>
          <button onClick={() => setChoices({})} style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 11, cursor: "pointer" }}>Reset alts</button>
        </div>

        {/* Alt recipe toggles */}
        {treeAlts.length > 0 && (
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
            <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Alternate recipes in this chain (click to toggle)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {treeAlts.map(it => {
                const alts = getAlts(it);
                const cur = choices[it] || "default";
                return alts.map(alt => {
                  const tier = ALL_RECIPES[it][alt]?.tier;
                  const active = cur === alt;
                  return (
                    <button key={it + alt} onClick={() => toggleRecipe(it, alt)}
                      style={{
                        padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                        background: active ? "rgba(251,191,36,0.15)" : "#1a1f2e",
                        border: `1px solid ${active ? "#fbbf24" : "#2d3748"}`,
                        color: active ? "#fbbf24" : "#94a3b8",
                        transition: "all 0.15s",
                      }}>
                      {tier && <span style={{ color: TIER_COLORS[tier], fontWeight: 700, marginRight: 4 }}>{tier}</span>}
                      {alt}
                      <span style={{ color: "#4a5568", marginLeft: 4, fontSize: 9 }}>({it})</span>
                    </button>
                  );
                });
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {[
            { l: "Machines", v: totalMachines, c: "#fbbf24" },
            { l: "Power", v: totalPower.toFixed(1) + " MW", c: "#fc8181" },
            { l: "Raw types", v: Object.keys(summary.raws).length, c: "#68d391" },
          ].map(s => (
            <div key={s.l} style={{ flex: "1 1 100px", background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div>
              <div style={{ color: s.c, fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Raw pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {Object.entries(summary.raws).sort((a, b) => b[1] - a[1]).map(([res, r]) => (
            <span key={res} style={{ background: "#0f2a1a", border: "1px solid #22543d", borderRadius: 4, padding: "2px 8px", fontSize: 10, color: "#68d391", fontFamily: "'JetBrains Mono', monospace" }}>
              {res}: {r.toFixed(1)}/min
            </span>
          ))}
        </div>
      </div>

      {/* Flowchart */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden", height: 480, position: "relative", cursor: dragging ? "grabbing" : "grab" }}
          onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % 40},${pan.y % 40})`}>
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2030" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {layout && (
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs><marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 2L8 5L2 8" fill="none" stroke="#4a5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {layout.edges.map((e, i) => <FlowEdge key={i} edge={e} />)}
                {layout.nodes.map((n, i) => <FlowNode key={n.id + n.depth + i + (n.altName || "")} node={n} selected={selected} onSelect={selectNode} />)}
              </g>
            </svg>
          )}
          <div style={{ position: "absolute", bottom: 6, right: 8, color: "#4a5568", fontSize: 10, fontFamily: "monospace" }}>{(zoom * 100).toFixed(0)}%</div>
          <div style={{ position: "absolute", top: 6, right: 8, display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "#fbbf24", display: "inline-block" }} />
            <span style={{ color: "#4a5568", fontSize: 9 }}>= has alt recipes</span>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {detailNode && !detailNode.raw && (
        <div style={{ maxWidth: 920, margin: "10px auto 0", padding: "0 16px" }}>
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, color: (MCOLORS[detailNode.machine] || MCOLORS.raw).accent }}>
                  {detailNode.item} {detailNode.altName && <span style={{ color: "#fbbf24", fontSize: 11 }}>({detailNode.altName})</span>}
                </h3>
                <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: 11 }}>{detailNode.machine} · {detailNode.rate.toFixed(2)}/min</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#fbbf24", fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>x{Math.ceil(detailNode.machines)}</div>
                <div style={{ color: "#64748b", fontSize: 10 }}>({detailNode.machines.toFixed(3)} exact) · {detailNode.power.toFixed(1)} MW</div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
              {getRecipe(detailNode.item, choices)?.inputs.map(([inp, qty]) => {
                const r = getRecipe(detailNode.item, choices);
                const perMin = (qty / r.output) * (60 / r.time) * detailNode.machines;
                return (
                  <div key={inp} style={{ background: "#1a2332", border: "1px solid #2d3748", borderRadius: 6, padding: "5px 10px" }}>
                    <div style={{ color: "#90cdf4", fontSize: 11, fontWeight: 600 }}>{inp}</div>
                    <div style={{ color: "#a0aec0", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{perMin.toFixed(2)}/min</div>
                  </div>
                );
              })}
            </div>
            {detailNode.machines % 1 !== 0 && (
              <p style={{ color: "#64748b", fontSize: 10, marginTop: 6 }}>
                {Math.ceil(detailNode.machines)} machine(s) underclocked to {((detailNode.machines / Math.ceil(detailNode.machines)) * 100).toFixed(1)}%
              </p>
            )}
            {/* Toggle alts from detail panel */}
            {getAlts(detailNode.item).length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
                <div style={{ color: "#94a3b8", fontSize: 10, marginBottom: 6 }}>Switch recipe:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setChoices(p => ({ ...p, [detailNode.item]: "default" }))}
                    style={{ padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", background: (choices[detailNode.item] || "default") === "default" ? "rgba(99,179,237,0.15)" : "#1a1f2e", border: `1px solid ${(choices[detailNode.item] || "default") === "default" ? "#63b3ed" : "#2d3748"}`, color: (choices[detailNode.item] || "default") === "default" ? "#63b3ed" : "#64748b" }}>
                    Default
                  </button>
                  {getAlts(detailNode.item).map(alt => {
                    const active = choices[detailNode.item] === alt;
                    const tier = ALL_RECIPES[detailNode.item][alt]?.tier;
                    return (
                      <button key={alt} onClick={() => toggleRecipe(detailNode.item, alt)}
                        style={{ padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", background: active ? "rgba(251,191,36,0.15)" : "#1a1f2e", border: `1px solid ${active ? "#fbbf24" : "#2d3748"}`, color: active ? "#fbbf24" : "#94a3b8" }}>
                        {tier && <span style={{ color: TIER_COLORS[tier], fontWeight: 700, marginRight: 3 }}>{tier}</span>}
                        {alt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <p style={{ color: "#1e293b", fontSize: 9, textAlign: "center", padding: "10px 0 14px" }}>Satisfactory 1.0/1.1 · S/A/B tier alts from Hard Drive research</p>
    </div>
  );
}
