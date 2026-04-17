import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ─── ROUTING ───
function useHash() {
  const [hash, setHash] = useState(window.location.hash.slice(1) || "");
  useEffect(() => {
    const h = () => setHash(window.location.hash.slice(1) || "");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return hash;
}
const go = (path) => { window.location.hash = path; window.scrollTo(0, 0); };

// ─── DESIGN TOKENS ───
const T = {
  bg: "#08090d",
  card: "#0e1117",
  cardHover: "#141820",
  border: "#1a1f2e",
  text: "#c9d1d9",
  dim: "#6b7280",
  accent: "#f97316",
  accentGlow: "rgba(249,115,22,0.15)",
  font: "'Chakra Petch', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// ─── GAME DATA ───
const GAMES = {
  satisfactory: {
    title: "Satisfactory",
    tagline: "Automate. Optimize. Expand.",
    genre: "Factory Builder / Open World",
    desc: "Factory builder on an alien planet. I mostly play this for the production chain optimization — figuring out the perfect ratios and building clean factory floors.",
    color: "#f97316",
    colorDim: "rgba(249,115,22,0.12)",
    hours: "500+",
    tools: [
      { name: "Production Planner", desc: "Visual flowchart with foundation footprints, alt recipes, and Somersloop support", route: "satisfactory/planner", icon: "⚙️", ready: true },
      { name: "Achievement Tracker", desc: "Keeping track of what I still need to unlock", route: "satisfactory/achievements", icon: "🏆", ready: true },
      { name: "Recipe Database", desc: "All recipes with alt recipe tier ratings", route: "satisfactory/recipes", icon: "📖", ready: false },
    ],
    tips: [
      "Always build on foundations — it saves headaches later",
      "Manifold setups are simpler than load balancers for most builds",
      "Somersloop your bottleneck machines, not your cheapest ones",
      "Steel Screw alt recipe is S-tier — eliminates the Iron Rod → Screw chain entirely",
    ],
  },
  noita: {
    title: "Noita",
    tagline: "Every pixel is simulated. Every death is a lesson.",
    genre: "Action Roguelite / Physics Sandbox",
    desc: "Action roguelite where every pixel is physically simulated. 513 hours in and I'm still finding secrets. The wand building system is endlessly deep and the community puzzles are insane.",
    color: "#a855f7",
    colorDim: "rgba(168,85,247,0.12)",
    hours: "513",
    tools: [
      { name: "Wand Builder Guide", desc: "Spell combos and wand mechanics notes", route: "noita/wands", icon: "🪄", ready: false },
      { name: "Achievement Guide", desc: "All 14 achievements — the last 4 are rough", route: "noita/achievements", icon: "🏆", ready: false },
      { name: "Biome Map", desc: "Map of biomes, secrets, and orb locations", route: "noita/map", icon: "🗺️", ready: false },
    ],
    tips: [
      "Never kick barrels of unknown liquid — they're probably polymorphine or chaotic polymorphine",
      "Always-cast wands are incredibly powerful — look for Chainsaw as an always-cast for infinite mana",
      "Water is your best friend early game — it puts out fires AND dilutes dangerous liquids",
      "The game has WAY more content than the main path. Explore east, west, and up",
    ],
  },
  rimworld: {
    title: "RimWorld",
    tagline: "Stories emerge from chaos.",
    genre: "Colony Sim / Story Generator",
    desc: "Colony sim where every playthrough tells a different story. I keep coming back for the base building and the chaos of managing colonists who insist on having mental breaks at the worst possible time.",
    color: "#22d3ee",
    colorDim: "rgba(34,211,238,0.12)",
    hours: "300+",
    tools: [
      { name: "Colony Planner", desc: "Base layout ideas and room efficiency notes", route: "rimworld/planner", icon: "🏗️", ready: false },
      { name: "Mod Guide", desc: "Mods I use for different playstyles", route: "rimworld/mods", icon: "🔧", ready: false },
      { name: "Defense Calculator", desc: "Killbox layouts and raid threat reference", route: "rimworld/defense", icon: "🛡️", ready: false },
    ],
    tips: [
      "Grow rice early game for fast food, switch to corn once you're stable",
      "Killboxes work but feel cheap — try mountain bases for natural chokepoints",
      "Psychic drones stack with colonist mood debuffs — always have beer and rec rooms ready",
      "Pawns with 'Too Smart' or 'Industrious' traits are worth recruiting even with bad skills",
    ],
  },
};

// ─── COMPONENTS ───

function Nav({ current }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8,9,13,0.85)", backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${T.border}`, padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", height: 48, gap: 24 }}>
        <a onClick={() => go("")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 20 }}>🎮</span>
          <span style={{
            fontFamily: T.font, fontWeight: 700, fontSize: 16,
            background: `linear-gradient(135deg, ${T.accent}, #fbbf24)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>CrowGamer</span>
        </a>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.entries(GAMES).map(([key, g]) => (
            <a key={key} onClick={() => go(key)} style={{
              cursor: "pointer", padding: "6px 12px", borderRadius: 6, fontSize: 12,
              fontFamily: T.font, fontWeight: 600, textDecoration: "none",
              color: current === key ? g.color : T.dim,
              background: current === key ? g.colorDim : "transparent",
              transition: "all 0.2s",
            }}>{g.title}</a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${T.border}`, padding: "24px 20px",
      textAlign: "center", color: T.dim, fontSize: 11, fontFamily: T.font,
    }}>
      <span style={{ opacity: 0.6 }}>CrowGamer © 2026 · Built by Jonathan Crow</span>
    </footer>
  );
}

function ToolCard({ tool, gameColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => tool.ready ? go(tool.route) : null}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov && tool.ready ? T.cardHover : T.card,
        border: `1px solid ${hov && tool.ready ? gameColor : T.border}`,
        borderRadius: 10, padding: 16, cursor: tool.ready ? "pointer" : "default",
        transition: "all 0.25s", position: "relative", overflow: "hidden",
      }}>
      {!tool.ready && (
        <span style={{
          position: "absolute", top: 8, right: 8, fontSize: 8, fontFamily: T.mono,
          color: T.dim, background: T.bg, padding: "2px 6px", borderRadius: 4, border: `1px solid ${T.border}`,
        }}>COMING SOON</span>
      )}
      <div style={{ fontSize: 24, marginBottom: 8 }}>{tool.icon}</div>
      <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, fontFamily: T.font, color: tool.ready ? gameColor : T.dim }}>{tool.name}</h3>
      <p style={{ margin: 0, fontSize: 11, color: T.dim, lineHeight: 1.5 }}>{tool.desc}</p>
    </div>
  );
}

function GameCard({ gameKey, game }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => go(gameKey)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.card, border: `1px solid ${hov ? game.color : T.border}`,
        borderRadius: 14, padding: "28px 24px", cursor: "pointer",
        transition: "all 0.3s ease", position: "relative", overflow: "hidden",
        boxShadow: hov ? `0 0 40px ${game.colorDim}` : "none",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
      }}>
      {/* Accent glow bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
        opacity: hov ? 1 : 0.3, transition: "opacity 0.3s",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, fontFamily: T.font, color: game.color }}>{game.title}</h2>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.dim, letterSpacing: "0.05em" }}>{game.genre}</span>
        </div>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 12, color: T.dim, lineHeight: 1.6 }}>{game.tagline}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {game.tools.filter(t => t.ready).map(t => (
          <span key={t.name} style={{
            fontSize: 9, fontFamily: T.mono, color: game.color,
            background: game.colorDim, padding: "3px 8px", borderRadius: 4,
          }}>{t.icon} {t.name}</span>
        ))}
        {game.tools.filter(t => !t.ready).length > 0 && (
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.dim, padding: "3px 8px" }}>
            +{game.tools.filter(t => !t.ready).length} coming
          </span>
        )}
      </div>
    </div>
  );
}

// ─── PAGES ───

function HomePage() {
  return (
    <div>
      <Nav current="" />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
          <h1 style={{
            fontSize: 42, fontWeight: 900, fontFamily: T.font, margin: "0 0 8px",
            background: `linear-gradient(135deg, ${T.accent}, #fbbf24, #f97316)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>CrowGamer</h1>
          <p style={{ color: T.dim, fontSize: 14, fontFamily: T.font, margin: "0 0 6px", maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
            Personal tools and notes for the games I play.
          </p>
          <p style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, opacity: 0.5 }}>by Jonathan Crow</p>
        </div>

        {/* Game grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, paddingBottom: 40 }}>
          {Object.entries(GAMES).map(([key, game]) => (
            <GameCard key={key} gameKey={key} game={game} />
          ))}
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, padding: "20px 0 48px",
          flexWrap: "wrap",
        }}>
          {[
            { label: "Games covered", val: "3", col: T.accent },
            { label: "Tools built", val: "1", col: "#22d3ee" },
            { label: "Coming soon", val: "8", col: "#a855f7" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, fontFamily: T.mono, color: s.col }}>{s.val}</div>
              <div style={{ fontSize: 10, fontFamily: T.font, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function GameLander({ gameKey }) {
  const game = GAMES[gameKey];
  if (!game) return <HomePage />;

  return (
    <div>
      <Nav current={gameKey} />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        {/* Hero */}
        <div style={{ padding: "48px 0 32px" }}>
          <a onClick={() => go("")} style={{ cursor: "pointer", color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            ← All games
          </a>
          <h1 style={{ fontSize: 38, fontWeight: 900, fontFamily: T.font, margin: "8px 0 6px", color: game.color }}>{game.title}</h1>
          <p style={{ fontSize: 16, fontFamily: T.font, color: T.text, margin: "0 0 6px", fontWeight: 500 }}>{game.tagline}</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.dim, background: game.colorDim, padding: "3px 10px", borderRadius: 4 }}>{game.genre}</span>
          </div>
          <p style={{ fontSize: 13, color: T.dim, lineHeight: 1.7, maxWidth: 700, margin: 0 }}>{game.desc}</p>
        </div>

        {/* Tools section */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: T.font, color: T.text, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <span style={{ color: game.color }}>◆</span> Tools & Guides
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {game.tools.map(tool => (
              <ToolCard key={tool.name} tool={tool} gameColor={game.color} />
            ))}
          </div>
        </div>

        {/* Tips section */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: T.font, color: T.text, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <span style={{ color: game.color }}>◆</span> Quick Tips
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
            {game.tips.map((tip, i) => (
              <div key={i} style={{
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ color: game.color, fontFamily: T.mono, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <span style={{ color: T.dim, fontSize: 12, lineHeight: 1.6, fontFamily: T.font }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ComingSoon({ title, gameKey }) {
  const game = GAMES[gameKey];
  return (
    <div>
      <Nav current={gameKey} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: T.font, color: game?.color || T.accent, margin: "0 0 8px" }}>{title}</h1>
        <p style={{ color: T.dim, fontSize: 13, fontFamily: T.font, margin: "0 0 24px" }}>This tool is currently under construction. Check back soon!</p>
        <a onClick={() => go(gameKey)} style={{
          cursor: "pointer", textDecoration: "none", display: "inline-block",
          padding: "8px 20px", borderRadius: 6, fontSize: 12, fontFamily: T.font, fontWeight: 600,
          color: game?.color || T.accent, border: `1px solid ${game?.color || T.accent}`,
          background: game?.colorDim || T.accentGlow,
        }}>← Back to {game?.title || "home"}</a>
      </div>
      <Footer />
    </div>
  );
}

// ─── SATISFACTORY PLANNER (embedded from v5) ───
// Importing the full planner inline to keep it as a single-file app

const F = 28;
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
  },
  "Copper Ingot": {
    default: { machine: "Smelter", raw: false, time: 2, inputs: [["Copper Ore",1]], output: 1, rate: 30, power: 4 },
    "Pure Copper": { machine: "Refinery", raw: false, time: 24, inputs: [["Copper Ore",6],["Water",4]], output: 15, rate: 37.5, power: 30, tier: "S" },
  },
  "Iron Plate": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Ingot",3]], output: 2, rate: 20, power: 4 } },
  "Iron Rod": {
    default: { machine: "Constructor", raw: false, time: 4, inputs: [["Iron Ingot",1]], output: 1, rate: 15, power: 4 },
    "Steel Rod": { machine: "Constructor", raw: false, time: 5, inputs: [["Steel Ingot",1]], output: 4, rate: 48, power: 4, tier: "A" },
  },
  "Wire": { default: { machine: "Constructor", raw: false, time: 4, inputs: [["Copper Ingot",1]], output: 2, rate: 30, power: 4 } },
  "Cable": { default: { machine: "Constructor", raw: false, time: 2, inputs: [["Wire",2]], output: 1, rate: 30, power: 4 } },
  "Concrete": { default: { machine: "Constructor", raw: false, time: 4, inputs: [["Limestone",3]], output: 1, rate: 15, power: 4 } },
  "Screw": {
    default: { machine: "Constructor", raw: false, time: 6, inputs: [["Iron Rod",1]], output: 4, rate: 40, power: 4 },
    "Steel Screw": { machine: "Constructor", raw: false, time: 12, inputs: [["Steel Beam",1]], output: 52, rate: 260, power: 4, tier: "S" },
  },
  "Copper Sheet": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Copper Ingot",2]], output: 1, rate: 10, power: 4 } },
  "Reinforced Iron Plate": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Iron Plate",6],["Screw",12]], output: 1, rate: 5, power: 15 } },
  "Rotor": {
    default: { machine: "Assembler", raw: false, time: 15, inputs: [["Iron Rod",5],["Screw",25]], output: 1, rate: 4, power: 15 },
    "Steel Rotor": { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",2],["Wire",6]], output: 1, rate: 5, power: 15, tier: "S" },
  },
  "Modular Frame": { default: { machine: "Assembler", raw: false, time: 60, inputs: [["Reinforced Iron Plate",3],["Iron Rod",12]], output: 2, rate: 2, power: 15 } },
  "Smart Plating": { default: { machine: "Assembler", raw: false, time: 30, inputs: [["Reinforced Iron Plate",1],["Rotor",1]], output: 1, rate: 2, power: 15 } },
  "Steel Ingot": {
    default: { machine: "Foundry", raw: false, time: 4, inputs: [["Iron Ore",3],["Coal",3]], output: 3, rate: 45, power: 16 },
    "Solid Steel": { machine: "Foundry", raw: false, time: 3, inputs: [["Iron Ingot",2],["Coal",2]], output: 3, rate: 60, power: 16, tier: "S" },
  },
  "Steel Beam": { default: { machine: "Constructor", raw: false, time: 4, inputs: [["Steel Ingot",4]], output: 1, rate: 15, power: 4 } },
  "Steel Pipe": { default: { machine: "Constructor", raw: false, time: 6, inputs: [["Steel Ingot",3]], output: 2, rate: 20, power: 4 } },
  "Encased Industrial Beam": { default: { machine: "Assembler", raw: false, time: 10, inputs: [["Steel Beam",3],["Concrete",5]], output: 1, rate: 6, power: 15 } },
  "Stator": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Steel Pipe",3],["Wire",8]], output: 1, rate: 5, power: 15 } },
  "Motor": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Rotor",2],["Stator",2]], output: 1, rate: 5, power: 15 } },
  "Caterium Ingot": { default: { machine: "Smelter", raw: false, time: 4, inputs: [["Caterium Ore",3]], output: 1, rate: 15, power: 4 } },
  "Quickwire": { default: { machine: "Constructor", raw: false, time: 5, inputs: [["Caterium Ingot",1]], output: 5, rate: 60, power: 4 } },
  "Plastic": { default: { machine: "Refinery", raw: false, time: 6, inputs: [["Crude Oil",3]], output: 2, rate: 20, power: 30 } },
  "Circuit Board": { default: { machine: "Assembler", raw: false, time: 8, inputs: [["Copper Sheet",2],["Plastic",4]], output: 1, rate: 7.5, power: 15 } },
  "AI Limiter": { default: { machine: "Assembler", raw: false, time: 12, inputs: [["Circuit Board",5],["Quickwire",24]], output: 1, rate: 5, power: 15 } },
  "Computer": { default: { machine: "Manufacturer", raw: false, time: 24, inputs: [["Circuit Board",10],["Cable",9],["Plastic",18],["Screw",52]], output: 1, rate: 2.5, power: 55 } },
  "Heavy Modular Frame": { default: { machine: "Manufacturer", raw: false, time: 30, inputs: [["Modular Frame",5],["Steel Pipe",15],["Encased Industrial Beam",5],["Screw",100]], output: 1, rate: 2, power: 55 } },
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
  const r = getR(item, ch); if (!r) return null;
  const id = item + "_" + (uid++);
  if (vis.has(item)) return { id, item, rate, machine: r.machine, mc: 0, pw: 0, ch: [], raw: r.raw };
  vis.add(item);
  if (r.raw) return { id, item, rate, machine: null, mc: 0, pw: 0, ch: [], raw: true };
  const sl = sloop.has(item), eRate = sl ? r.rate * 2 : r.rate;
  const mc = rate / eRate, pw = mc * r.power * (sl ? 2 : 1);
  const kids = r.inputs.map(([inp, qty]) => buildTree(inp, (qty / r.output) * (60 / r.time) * mc, ch, sloop, new Set(vis))).filter(Boolean);
  return { id, item, rate, machine: r.machine, mc, pw, ch: kids, raw: false, alt: ch[item] && ch[item] !== "default" ? ch[item] : null, hasAlts: getAlts(item).length > 0, sl };
}

function plannerLayout(root) {
  const flat = []; const walk = (n, d) => { flat.push({ ...n, d }); n.ch.forEach(c => walk(c, d + 1)); }; walk(root, 0);
  const byD = {}, MGAP = 8;
  flat.forEach(n => { (byD[n.d] = byD[n.d] || []).push(n); });
  const maxD = Math.max(...Object.keys(byD).map(Number)), gapX = 16;
  const pos = {};
  const nodeSize = (n) => {
    if (n.raw) return { w: 80, h: 40 };
    const fp = MACHINE_FP[n.machine]; if (!fp) return { w: 100, h: 60 };
    const mc = Math.ceil(n.mc), perRow = Math.min(mc, 4), rows = Math.ceil(mc / perRow);
    return { w: Math.max(perRow * fp.w * F + (perRow - 1) * MGAP + 20, 100), h: Math.max(rows * fp.l * F + (rows - 1) * MGAP + 32, 60) };
  };
  for (let d = maxD; d >= 0; d--) {
    const nodes = byD[d] || [];
    nodes.forEach((n, i) => { const sz = nodeSize(n); const cp = n.ch.map(c => pos[c.id]).filter(Boolean);
      let x = cp.length > 0 ? (Math.min(...cp.map(p => p.x)) + Math.max(...cp.map(p => p.x + p.w))) / 2 - sz.w / 2 : i * (sz.w + gapX);
      pos[n.id] = { ...n, x, y: d * 200, ...sz }; });
    const sorted = nodes.map(n => pos[n.id]).sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++) { if (sorted[i].x < sorted[i - 1].x + sorted[i - 1].w + gapX) { sorted[i].x = sorted[i - 1].x + sorted[i - 1].w + gapX; pos[sorted[i].id] = sorted[i]; } }
  }
  const all = Object.values(pos); const minX = Math.min(...all.map(p => p.x)); all.forEach(p => p.x -= minX);
  const edges = []; flat.forEach(n => { const from = pos[n.id]; n.ch.forEach(c => { const to = pos[c.id]; if (from && to) edges.push({ from, to, rate: c.rate }); }); });
  return { nodes: all, edges, W: Math.max(...all.map(p => p.x + p.w)) + 20, H: Math.max(...all.map(p => p.y + p.h)) + 20 };
}

function MNode({ n, sel, onSel }) {
  const c = n.raw ? MC.raw : (MC[n.machine] || MC.raw);
  const mc = Math.ceil(n.mc), fp = MACHINE_FP[n.machine], MGAP = 8;
  const cells = [];
  if (fp && !n.raw) {
    const perRow = Math.min(mc, 4), rows = Math.ceil(mc / perRow);
    const mW = fp.w * F, mH = fp.l * F, gridW = perRow * mW + (perRow - 1) * MGAP, ox = (n.w - gridW) / 2, oy = 26;
    for (let r = 0; r < rows; r++) { const inRow = r < rows - 1 ? perRow : mc - r * perRow;
      for (let m = 0; m < inRow; m++) { const mx0 = ox + m * (mW + MGAP), my0 = oy + r * (mH + MGAP);
        for (let fy = 0; fy < fp.l; fy++) for (let fx = 0; fx < fp.w; fx++)
          cells.push(<rect key={`${r}-${m}-${fx}-${fy}`} x={mx0+fx*F} y={my0+fy*F} width={F-2} height={F-2} rx={3} fill={c.fill} stroke={c.stroke} strokeWidth={0.7} />);
        cells.push(<rect key={`m-${r}-${m}`} x={mx0-1} y={my0-1} width={mW} height={mH} rx={3} fill="none" stroke={c.stroke} strokeWidth={1.2} opacity={0.9} />);
        cells.push(<text key={`l-${r}-${m}`} x={mx0+mW/2} y={my0+mH/2} textAnchor="middle" dominantBaseline="central" fill={c.text} fontSize={9} fontFamily="monospace" fontWeight={600} opacity={0.55}>{n.machine?.charAt(0)}</text>);
      }
    }
  }
  return (
    <g transform={`translate(${n.x},${n.y})`} onClick={e => { e.stopPropagation(); onSel(n); }} style={{ cursor: "pointer" }}>
      <rect width={n.w} height={n.h} rx={6} fill="#0d1117" stroke={sel === n.id ? "#fbbf24" : c.stroke} strokeWidth={sel === n.id ? 2 : 1} opacity={0.95} />
      {cells}
      <text x={n.w/2} y={12} textAnchor="middle" fill={c.text} fontSize={10} fontWeight={600} fontFamily="system-ui">{n.item.length > 20 ? n.item.slice(0,18)+".." : n.item}</text>
      {n.raw ? <text x={n.w/2} y={n.h-6} textAnchor="middle" fill="#68d391" fontSize={9} fontFamily="monospace">{n.rate.toFixed(1)}/min</text>
        : <text x={n.w/2} y={n.h-6} textAnchor="middle" fill="#a0aec0" fontSize={8} fontFamily="monospace">
            <tspan fill={c.text}>{n.rate.toFixed(1)}/m</tspan><tspan fill="#4a5568"> · </tspan><tspan fill="#fbbf24">x{mc}</tspan><tspan fill="#4a5568"> · </tspan><tspan fill="#fc8181">{n.pw.toFixed(0)}MW</tspan>
          </text>}
    </g>
  );
}

function PEdge({ e }) {
  const px = e.from.x + e.from.w / 2, py = e.from.y + e.from.h, cx = e.to.x + e.to.w / 2, cy = e.to.y;
  const c = e.to.raw ? MC.raw : (MC[e.to.machine] || MC.raw), midY = py + (cy - py) * 0.5;
  return <g><path d={Math.abs(px-cx)<3 ? `M${cx},${cy} L${px},${py}` : `M${cx},${cy} L${cx},${midY} L${px},${midY} L${px},${py}`}
    fill="none" stroke={c.stroke} strokeWidth={1.5} opacity={0.5} markerEnd="url(#a)" />
    <text x={(px+cx)/2} y={midY-3} textAnchor="middle" fill={c.stroke} fontSize={7} fontFamily="monospace" opacity={0.7}>{e.rate.toFixed(1)}</text></g>;
}

function PlannerPage() {
  const [item, setItem] = useState("Motor");
  const [rate, setRate] = useState(5);
  const [ch, setCh] = useState({});
  const [search, setSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [sel, setSel] = useState(null);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(false);
  const [ds, setDs] = useState(null);
  const dRef = useRef(null);

  const craftable = useMemo(() => Object.entries(ALL_RECIPES).filter(([, r]) => !r.default.raw).map(([n]) => n).sort(), []);
  const filt = useMemo(() => craftable.filter(i => i.toLowerCase().includes(search.toLowerCase())), [search, craftable]);
  const tree = useMemo(() => { uid = 0; return buildTree(item, rate, ch); }, [item, rate, ch]);
  const lo = useMemo(() => tree ? plannerLayout(tree) : null, [tree]);

  const totals = useMemo(() => {
    if (!tree) return null;
    const raws = {}, mach = {};
    const w = n => { if (n.raw) raws[n.item] = (raws[n.item]||0)+n.rate; else { if (!mach[n.item]) mach[n.item]={m:0,p:0,machine:n.machine}; mach[n.item].m+=n.mc; mach[n.item].p+=n.pw; } n.ch.forEach(w); }; w(tree);
    let fnd=0; Object.values(mach).forEach(d => { const fp=MACHINE_FP[d.machine]; if(fp) fnd+=Math.ceil(d.m)*fp.w*fp.l; });
    return { raws, totalM: Object.values(mach).reduce((a,m)=>a+Math.ceil(m.m),0), totalP: Object.values(mach).reduce((a,m)=>a+m.p,0), fnd: Math.ceil(fnd*1.35) };
  }, [tree]);

  useEffect(() => { const h = e => { if (dRef.current && !dRef.current.contains(e.target)) setShowDrop(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const pick = i => { setItem(i); setSearch(""); setShowDrop(false); setSel(null); setRate(ALL_RECIPES[i]?.default?.rate||1); setPan({x:20,y:20}); setZoom(1); };
  const onWheel = useCallback(e => { e.preventDefault(); setZoom(z => Math.max(0.08, Math.min(3, z * (e.deltaY>0?0.9:1.1)))); }, []);
  const md = e => { setDrag(true); setDs({x:e.clientX-pan.x,y:e.clientY-pan.y}); };
  const mm = e => { if(drag&&ds) setPan({x:e.clientX-ds.x,y:e.clientY-ds.y}); };
  const mu = () => { setDrag(false); setDs(null); };
  useEffect(() => { if(lo) setZoom(Math.min(1, 680/(lo.W+40))); }, [lo]);
  const toggleR = (it,rn) => setCh(p => ({...p,[it]:(p[it]||"default")===rn?"default":rn}));

  return (
    <div>
      <Nav current="satisfactory" />
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "12px 16px 0" }}>
        <a onClick={() => go("satisfactory")} style={{ cursor: "pointer", color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: "none" }}>← Satisfactory</a>
        <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: T.font, margin: "8px 0 2px", color: "#f97316" }}>Production Planner</h1>
        <p style={{ color: T.dim, fontSize: 10, margin: "0 0 10px" }}>1.0/1.1 · Foundation footprints · Alt recipes · Pan: drag · Zoom: scroll</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px", position: "relative" }} ref={dRef}>
            <label style={{ color: "#94a3b8", fontSize: 9, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Target item</label>
            <input value={showDrop ? search : item} onChange={e => { setSearch(e.target.value); setShowDrop(true); }} onFocus={() => { setShowDrop(true); setSearch(""); }}
              style={{ width: "100%", padding: "7px 10px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            {showDrop && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, maxHeight: 200, overflowY: "auto", marginTop: 2 }}>
              {filt.map(i => <div key={i} onClick={() => pick(i)} style={{ padding: "5px 10px", cursor: "pointer", fontSize: 12, color: i === item ? "#fbbf24" : "#cbd5e1" }}
                onMouseEnter={e => e.target.style.background="rgba(255,255,255,0.04)"} onMouseLeave={e => e.target.style.background="transparent"}>
                {i} {getAlts(i).length > 0 && <span style={{ color: "#fbbf24", fontSize: 9 }}>+{getAlts(i).length}</span>}
              </div>)}
            </div>}
          </div>
          <div style={{ flex: "0 0 80px" }}>
            <label style={{ color: "#94a3b8", fontSize: 9, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 2 }}>/min</label>
            <input type="number" value={rate} min={0.1} step={0.5} onChange={e => setRate(Math.max(0.1, parseFloat(e.target.value)||0.1))}
              style={{ width: "100%", padding: "7px 10px", background: "#151b2b", border: "1px solid #2d3748", borderRadius: 6, color: "#fbbf24", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => { setCh({}); }} style={{ padding: "7px 10px", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", fontSize: 10, cursor: "pointer" }}>Reset</button>
        </div>

        {totals && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 6, marginBottom: 8 }}>
          {[{l:"Machines",v:totals.totalM,c:"#fbbf24"},{l:"Power",v:totals.totalP.toFixed(0)+" MW",c:"#fc8181"},{l:"Foundations",v:totals.fnd,c:"#b794f4"},{l:"Raw",v:Object.keys(totals.raws).length,c:"#68d391"}].map(s =>
            <div key={s.l} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ color: "#64748b", fontSize: 8, textTransform: "uppercase" }}>{s.l}</div>
              <div style={{ color: s.c, fontSize: 17, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
            </div>)}
        </div>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {totals && Object.entries(totals.raws).sort((a,b)=>b[1]-a[1]).map(([r,v]) =>
            <span key={r} style={{ background: "#0f2a1a", border: "1px solid #22543d", borderRadius: 4, padding: "2px 7px", fontSize: 9, color: "#68d391", fontFamily: "'JetBrains Mono',monospace" }}>{r}: {v.toFixed(1)}/m</span>)}
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden", height: 480, position: "relative", cursor: drag?"grabbing":"grab" }}
          onWheel={onWheel} onMouseDown={md} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu}>
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            <defs><pattern id="fg" width={F} height={F} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x%(F*zoom)},${pan.y%(F*zoom)}) scale(${zoom})`}>
              <rect width={F} height={F} fill="none" stroke="#161e2c" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#fg)" />
          </svg>
          {lo && <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
            <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M1 2L8 5L1 8" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" /></marker></defs>
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {lo.edges.map((e,i) => <PEdge key={i} e={e} />)}
              {lo.nodes.map((n,i) => <MNode key={n.id+i} n={n} sel={sel} onSel={n => setSel(n.id)} />)}
            </g>
          </svg>}
          <div style={{ position: "absolute", bottom: 6, right: 8, color: "#3a5570", fontSize: 9, fontFamily: "monospace" }}>{(zoom*100).toFixed(0)}%</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── ACHIEVEMENT DATA (Satisfactory) ───
const ACH_CATS = [
  { key: "progression", label: "Progression", icon: "🚀" },
  { key: "building",    label: "Building",    icon: "🏗️" },
  { key: "exploration", label: "Exploration", icon: "🗺️" },
  { key: "creatures",   label: "Creatures",   icon: "🦎" },
  { key: "resources",   label: "Resources",   icon: "⛏️" },
  { key: "research",    label: "Research",    icon: "🔬" },
  { key: "misc",        label: "Misc & Fun",  icon: "🎯" },
];

const ACH_DIFF = {
  easy:    { label: "Easy",   color: "#68d391", bg: "rgba(104,211,145,0.1)" },
  medium:  { label: "Medium", color: "#63b3ed", bg: "rgba(99,179,237,0.1)"  },
  hard:    { label: "Hard",   color: "#fc8181", bg: "rgba(252,129,129,0.1)" },
  unknown: { label: "???",    color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
};

const ACH_CAT_ICON = { progression:"🚀", building:"🏗️", exploration:"🗺️", creatures:"🦎", resources:"⛏️", research:"🔬", misc:"🎯" };

const SATIS_ACHIEVEMENTS = [
  // Progression
  { id:1,  cat:"progression", name:"Commencing Project Assembly",          desc:"Build the Space Elevator.",                                    unlocked:true,  diff:"easy"   },
  { id:2,  cat:"progression", name:"Mediocre pioneering",                  desc:"Complete Phase 1 of the Space Elevator.",                     unlocked:true,  diff:"easy"   },
  { id:3,  cat:"progression", name:"Adequate pioneering",                  desc:"Complete Phase 2 of the Space Elevator.",                     unlocked:true,  diff:"easy"   },
  { id:4,  cat:"progression", name:"Pretty good pioneering",               desc:"Complete Phase 3 of the Space Elevator.",                     unlocked:false, diff:"medium", prog:[0,1]    },
  { id:5,  cat:"progression", name:"Efficient pioneering",                 desc:"Complete Phase 4 of the Space Elevator.",                     unlocked:false, diff:"hard",   prog:[0,1]    },
  { id:6,  cat:"progression", name:"Saved the Day, probably",              desc:"Complete Phase 5 of the Space Elevator and finish the game.", unlocked:false, diff:"hard",   prog:[0,1]    },
  { id:7,  cat:"progression", name:"Bigger. Better. FICSIT.",              desc:"Build your first Manufacturer.",                              unlocked:true,  diff:"medium" },
  { id:8,  cat:"progression", name:"Efficiency first",                     desc:"Unlock all Milestones.",                                      unlocked:false, diff:"hard",   prog:[27,42]  },
  // Building
  { id:9,  cat:"building",    name:"A Concrete Example",                   desc:"Build 5000 Foundations.",                                     unlocked:true,  diff:"medium" },
  { id:10, cat:"building",    name:"Spaghetti master",                     desc:"Build 5 km of Conveyor Belts.",                               unlocked:true,  diff:"easy"   },
  { id:11, cat:"building",    name:"Pipe dream",                           desc:"Build 5 km of Pipelines.",                                    unlocked:true,  diff:"medium" },
  { id:12, cat:"building",    name:"Railroad tycoon",                      desc:"Build 5 km of Railway.",                                      unlocked:true,  diff:"medium" },
  { id:13, cat:"building",    name:"All aboard!",                          desc:"Set up a train schedule.",                                    unlocked:true,  diff:"medium" },
  // Exploration
  { id:14, cat:"exploration", name:"Let's see what's out there",           desc:"Visit each starting area biome once.",                        unlocked:true,  diff:"easy"   },
  { id:15, cat:"exploration", name:"New fear unlocked",                    desc:"Fix blown fuse.",                                             unlocked:true,  diff:"easy"   },
  { id:16, cat:"exploration", name:"Peak gameplay",                        desc:"Reach the highest cliff in the world.",                       unlocked:false, diff:"medium", prog:[0,1]    },
  { id:17, cat:"exploration", name:"What a thrill",                        desc:"Reach the maximum world height.",                             unlocked:false, diff:"hard",   prog:[0,1]    },
  // Creatures
  { id:18, cat:"creatures",   name:"Wheeeee!",                             desc:"Bounce on a Space Giraffe Tick Penguin Thing.",               unlocked:true,  diff:"easy"   },
  { id:19, cat:"creatures",   name:"Establish dominance",                  desc:"Hit a creature with a vehicle.",                              unlocked:true,  diff:"easy"   },
  { id:20, cat:"creatures",   name:"Wait, you can pet it?",                desc:"Pet the flying Manta.",                                       unlocked:true,  diff:"medium" },
  { id:21, cat:"creatures",   name:"Pioneer's best friend",                desc:"Tame a Lizard Doggo.",                                        unlocked:true,  diff:"easy"   },
  { id:22, cat:"creatures",   name:"Varied diet",                          desc:"Gather all three types of edible flora.",                     unlocked:true,  diff:"easy"   },
  { id:23, cat:"creatures",   name:"Look both ways next time",             desc:"Get knocked over by a vehicle.",                              unlocked:false, diff:"easy",   prog:[0,1]    },
  // Resources
  { id:24, cat:"resources",   name:"Yoink!",                               desc:"Gather a Power Slug.",                                        unlocked:true,  diff:"easy"   },
  { id:25, cat:"resources",   name:"Caught them all",                      desc:"Gather all three Power Slug types.",                          unlocked:true,  diff:"easy"   },
  { id:26, cat:"resources",   name:"I'm sure these play a Critical Role",  desc:"Gather a Mercer Sphere.",                                     unlocked:true,  diff:"easy"   },
  { id:27, cat:"resources",   name:"Oddly familiar",                       desc:"Gather a Somersloop.",                                        unlocked:true,  diff:"easy"   },
  { id:28, cat:"resources",   name:"Rock and stone!",                      desc:"Place down a Portable Miner.",                                unlocked:true,  diff:"easy"   },
  { id:29, cat:"resources",   name:"Thank you for the music",              desc:"Find and gather a Boombox tape in the world.",                unlocked:true,  diff:"easy"   },
  { id:30, cat:"resources",   name:"Data driven",                          desc:"Gather 100 Hard Drives from Crash Sites.",                    unlocked:false, diff:"medium", prog:[25,100] },
  { id:31, cat:"resources",   name:"Consume",                              desc:"Gather 150 Mercer Spheres.",                                  unlocked:false, diff:"hard",   prog:[101,150]},
  { id:32, cat:"resources",   name:"My skin feels itchy all of a sudden...", desc:"Gather 50 Somersloops.",                                   unlocked:false, diff:"hard",   prog:[30,50]  },
  // Research
  { id:33, cat:"research",    name:"Curiosity killed the cat...",          desc:"Complete a MAM research tree.",                               unlocked:true,  diff:"easy"   },
  { id:34, cat:"research",    name:"Master Chef",                          desc:"Unlock your first alternate recipe.",                         unlocked:true,  diff:"easy"   },
  { id:35, cat:"research",    name:"...Satisfactory brought it back",      desc:"Complete all MAM research trees.",                            unlocked:false, diff:"hard",   prog:[0,1]    },
  // Misc
  { id:36, cat:"misc",        name:"Do you want a medal?",                 desc:"Complete the Onboarding process.",                            unlocked:true,  diff:"easy"   },
  { id:37, cat:"misc",        name:"Are you sure that's coffee?",          desc:"Drink Coffee.",                                               unlocked:true,  diff:"easy"   },
  { id:38, cat:"misc",        name:"Now where to spend it...",             desc:"Print out your first Coupon.",                                unlocked:true,  diff:"easy"   },
  { id:39, cat:"misc",        name:"That was a close one",                 desc:"Survive a fall on 1 health point.",                           unlocked:true,  diff:"easy"   },
  { id:40, cat:"misc",        name:"Too fast, Too factory",                desc:"Move faster than 140 km/h.",                                  unlocked:true,  diff:"easy"   },
  { id:41, cat:"misc",        name:"Heal this, nature!",                   desc:"Destroy 1000 foliage.",                                       unlocked:true,  diff:"easy"   },
  { id:42, cat:"misc",        name:"The floor is lava",                    desc:"Avoid touching the ground for 30 minutes.",                   unlocked:false, diff:"medium", prog:[28,30]  },
  { id:43, cat:"misc",        name:"Do you need that?",                    desc:"Buy the Golden Nut Statue from the AWESOME Shop.",            unlocked:false, diff:"medium", prog:[0,1]    },
  // Hidden
  { id:44, cat:"hidden",      name:"???",                                  desc:"Details will be revealed once unlocked.",                     unlocked:false, diff:"unknown", hidden:true  },
];

function AchievementPage() {
  const game = GAMES.satisfactory;
  const [unlocked, setUnlocked] = useState(() => new Set(SATIS_ACHIEVEMENTS.filter(a => a.unlocked).map(a => a.id)));
  const [filter, setFilter]       = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [hov, setHov]             = useState(null);
  const [steamStatus, setSteamStatus] = useState("loading"); // "loading" | "synced" | "error"

  useEffect(() => {
    fetch("/api/achievements")
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setSteamStatus("error"); return; }
        const unlockedNames = new Set(data.filter(a => a.achieved === 1).map(a => a.name));
        setUnlocked(new Set(SATIS_ACHIEVEMENTS.filter(a => unlockedNames.has(a.name)).map(a => a.id)));
        setSteamStatus("synced");
      })
      .catch(() => setSteamStatus("error"));
  }, []);

  const toggle = id => setUnlocked(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const visible = useMemo(() => SATIS_ACHIEVEMENTS.filter(a => {
    if (catFilter !== "all" && a.cat !== catFilter) return false;
    if (filter === "unlocked") return unlocked.has(a.id);
    if (filter === "locked")   return !unlocked.has(a.id);
    return true;
  }), [filter, catFilter, unlocked]);

  const total = SATIS_ACHIEVEMENTS.length;
  const done  = unlocked.size;
  const pct   = Math.round((done / total) * 100);

  return (
    <div>
      <Nav current="satisfactory" />
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ padding: "32px 0 20px" }}>
          <a onClick={() => go("satisfactory")} style={{ cursor: "pointer", color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>← Satisfactory</a>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", color: game.color }}>Achievement Tracker</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                {steamStatus === "loading" && <span style={{ fontSize: 10, fontFamily: T.mono, color: T.dim }}>⏳ Syncing with Steam...</span>}
                {steamStatus === "synced"  && <span style={{ fontSize: 10, fontFamily: T.mono, color: "#68d391" }}>✔ Live from Steam</span>}
                {steamStatus === "error"   && <span style={{ fontSize: 10, fontFamily: T.mono, color: "#fc8181" }}>⚠ Steam sync failed — showing saved data</span>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: T.mono, color: game.color, lineHeight: 1 }}>
                {done}<span style={{ fontSize: 18, color: T.dim }}>/{total}</span>
              </div>
              <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>Unlocked</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.dim, fontFamily: T.mono }}>Completion</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: T.mono, color: game.color }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${game.color}, #fbbf24)`, borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(ACH_DIFF).filter(([k]) => k !== "unknown").map(([key, d]) => {
              const t  = SATIS_ACHIEVEMENTS.filter(a => a.diff === key).length;
              const dn = SATIS_ACHIEVEMENTS.filter(a => a.diff === key && unlocked.has(a.id)).length;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 10, color: T.dim, fontFamily: T.mono }}>{d.label}: <span style={{ color: d.color }}>{dn}/{t}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          {[{ key: "all", label: "All", icon: "🏆" }, ...ACH_CATS].map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11, fontFamily: T.font, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${catFilter === c.key ? game.color : T.border}`,
              background: catFilter === c.key ? game.colorDim : T.card,
              color: catFilter === c.key ? game.color : T.dim, transition: "all 0.15s",
            }}>{c.icon} {c.label}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[["all","All"],["unlocked","✅ Done"],["locked","🔒 Locked"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 10, fontFamily: T.mono, fontWeight: 600,
                cursor: "pointer", border: `1px solid ${filter === val ? game.color : T.border}`,
                background: filter === val ? game.colorDim : "transparent",
                color: filter === val ? game.color : T.dim, transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: T.dim, fontFamily: T.mono, marginBottom: 12 }}>
          Showing {visible.length} achievement{visible.length !== 1 ? "s" : ""}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8, paddingBottom: 48 }}>
          {visible.map(a => {
            const isUnlocked = unlocked.has(a.id);
            const d = ACH_DIFF[a.diff];
            const isHov = hov === a.id;
            const progPct = a.prog ? Math.round((a.prog[0] / a.prog[1]) * 100) : null;
            return (
              <div key={a.id}
                onClick={() => !a.hidden && toggle(a.id)}
                onMouseEnter={() => setHov(a.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: isUnlocked ? "rgba(249,115,22,0.06)" : T.card,
                  border: `1px solid ${isUnlocked ? "rgba(249,115,22,0.3)" : isHov && !a.hidden ? T.dim : T.border}`,
                  borderRadius: 10, padding: "12px 14px", cursor: a.hidden ? "default" : "pointer",
                  transition: "all 0.18s", display: "flex", gap: 12, alignItems: "flex-start",
                  opacity: isUnlocked ? 1 : a.hidden ? 0.4 : 0.72,
                  transform: isHov && !a.hidden ? "translateY(-1px)" : "none",
                }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isUnlocked ? game.colorDim : T.border,
                    border: `1px solid ${isUnlocked ? "rgba(249,115,22,0.3)" : T.border}`,
                    filter: isUnlocked || a.hidden ? "none" : "grayscale(1) brightness(0.4)",
                  }}>{a.hidden ? "🔒" : ACH_CAT_ICON[a.cat]}</div>
                  {isUnlocked && (
                    <div style={{
                      position: "absolute", bottom: -4, right: -4, width: 16, height: 16,
                      borderRadius: "50%", background: game.color, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#000",
                    }}>✓</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: isUnlocked ? game.color : a.hidden ? T.dim : T.text }}>{a.name}</div>
                  <p style={{ margin: "0 0 6px", fontSize: 10, color: T.dim, lineHeight: 1.5 }}>{a.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {!a.hidden && <span style={{ fontSize: 9, fontFamily: T.mono, color: d.color, background: d.bg, padding: "2px 7px", borderRadius: 4 }}>{d.label}</span>}
                    {a.prog && !isUnlocked && (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}>
                        <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progPct}%`, background: game.color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.dim, whiteSpace: "nowrap" }}>{a.prog[0]}/{a.prog[1]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.dim }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: T.font, fontSize: 14 }}>No achievements match this filter</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── ROUTER ───
export default function App() {
  const hash = useHash();
  let page;
  if (hash === "") page = <HomePage />;
  else if (hash === "satisfactory/planner") page = <PlannerPage />;
  else if (hash === "satisfactory/achievements") page = <AchievementPage />;
  else if (hash.includes("/") && !GAMES[hash.split("/")[0]]) page = <HomePage />;
  else if (hash.includes("/")) {
    const [gameKey, tool] = hash.split("/");
    const game = GAMES[gameKey];
    if (!game) page = <HomePage />;
    else { const t = game.tools.find(t => t.route === hash); page = <ComingSoon title={t?.name || tool} gameKey={gameKey} />; }
  }
  else if (GAMES[hash]) page = <GameLander gameKey={hash} />;
  else page = <HomePage />;

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: T.font, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; margin: 0; } body { background: ${T.bg}; margin: 0; } a { text-decoration: none; }`}</style>
      {page}
    </div>
  );
}
