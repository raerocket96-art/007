import React, { useState, useMemo } from "react";
import { MI6DatabaseStore, getAllRecords } from "../data";
import { DatabaseRecord } from "../types";
import { Radio, ZoomIn, ZoomOut, Filter, ChevronRight, ExternalLink, Shield } from "lucide-react";
import { soundManager } from "../utils/sound";

interface GraphNode {
  id: string;
  name: string;
  type: string;
  classification: string;
  x: number;
  y: number;
  color: string;
  radius: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

interface IntelligenceGraphProps {
  store: MI6DatabaseStore;
  onOpenRecord: (recordId: string) => void;
}

export const IntelligenceGraph: React.FC<IntelligenceGraphProps> = ({
  store,
  onOpenRecord
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("pers-007");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [zoom, setZoom] = useState(1);

  // Define graph nodes with deliberate clustered coordinates
  const nodes: GraphNode[] = useMemo(() => [
    // MI6 Core Center
    { id: "pers-007", name: "007 (James Bond)", type: "personnel", classification: "TOP SECRET", x: 450, y: 300, color: "#f59e0b", radius: 28 },
    { id: "pers-m", name: "M (Chief SIS)", type: "personnel", classification: "TOP SECRET", x: 320, y: 220, color: "#3b82f6", radius: 22 },
    { id: "pers-q", name: "Q (Quartermaster)", type: "personnel", classification: "TOP SECRET", x: 300, y: 380, color: "#10b981", radius: 22 },
    { id: "pers-moneypenny", name: "Moneypenny", type: "personnel", classification: "SECRET", x: 340, y: 460, color: "#6366f1", radius: 18 },
    { id: "org-mi6", name: "MI6 (SIS HQ)", type: "organizations", classification: "TOP SECRET", x: 200, y: 300, color: "#2563eb", radius: 26 },

    // Q-Branch Equipment & Vehicles
    { id: "veh-db5", name: "Aston Martin DB5", type: "vehicles", classification: "TOP SECRET", x: 230, y: 440, color: "#64748b", radius: 20 },
    { id: "eq-ppk", name: "Walther PPK/S", type: "equipment", classification: "SECRET", x: 420, y: 460, color: "#64748b", radius: 16 },
    { id: "eq-omega", name: "Omega Laser Watch", type: "equipment", classification: "TOP SECRET", x: 500, y: 440, color: "#64748b", radius: 16 },

    // Operations
    { id: "op-goldeneye", name: "Op GoldenEye", type: "operations", classification: "TOP SECRET", x: 620, y: 200, color: "#ef4444", radius: 22 },
    { id: "op-skyfall", name: "Op Skyfall", type: "operations", classification: "TOP SECRET", x: 600, y: 360, color: "#ef4444", radius: 22 },
    { id: "op-casinoroyale", name: "Op Casino Royale", type: "operations", classification: "TOP SECRET", x: 480, y: 160, color: "#ef4444", radius: 22 },
    { id: "op-spectre", name: "Op Spectre", type: "operations", classification: "TOP SECRET", x: 650, y: 280, color: "#ef4444", radius: 22 },

    // Antagonists & Criminal Syndicates
    { id: "org-spectre", name: "SPECTRE", type: "organizations", classification: "TOP SECRET", x: 820, y: 280, color: "#dc2626", radius: 26 },
    { id: "pers-blofeld", name: "Blofeld (#1)", type: "personnel", classification: "TOP SECRET", x: 880, y: 200, color: "#b91c1c", radius: 22 },
    { id: "pers-silva", name: "Raoul Silva", type: "personnel", classification: "TOP SECRET", x: 740, y: 420, color: "#b91c1c", radius: 20 },
    { id: "pers-006", name: "006 (Janus)", type: "personnel", classification: "TOP SECRET", x: 760, y: 140, color: "#b91c1c", radius: 20 },
    { id: "org-janus", name: "Janus Syndicate", type: "organizations", classification: "TOP SECRET", x: 860, y: 110, color: "#dc2626", radius: 22 },
    { id: "pers-lechiffre", name: "Le Chiffre", type: "personnel", classification: "TOP SECRET", x: 600, y: 80, color: "#b91c1c", radius: 18 },

    // Allies & Foreign Agencies
    { id: "pers-leiter", name: "Felix Leiter (CIA)", type: "personnel", classification: "SECRET", x: 450, y: 50, color: "#0284c7", radius: 20 },
    { id: "org-cia", name: "CIA Special Ops", type: "organizations", classification: "SECRET", x: 320, y: 70, color: "#0284c7", radius: 22 },
    { id: "pers-wailin", name: "Colonel Wai Lin", type: "personnel", classification: "SECRET", x: 580, y: 500, color: "#0284c7", radius: 18 }
  ], []);

  const links: GraphLink[] = useMemo(() => [
    { source: "pers-007", target: "pers-m", label: "COMMANDED BY" },
    { source: "pers-007", target: "pers-q", label: "EQUIPPED BY" },
    { source: "pers-007", target: "pers-moneypenny", label: "LIAISON" },
    { source: "pers-007", target: "veh-db5", label: "OPERATES" },
    { source: "pers-007", target: "eq-ppk", label: "ISSUED" },
    { source: "pers-007", target: "eq-omega", label: "ISSUED" },
    { source: "pers-m", target: "org-mi6", label: "DIRECTS" },
    { source: "pers-q", target: "veh-db5", label: "MODIFIES" },
    
    { source: "pers-007", target: "op-goldeneye", label: "PRIMARY AGENT" },
    { source: "pers-007", target: "op-skyfall", label: "PRIMARY AGENT" },
    { source: "pers-007", target: "op-casinoroyale", label: "PRIMARY AGENT" },
    { source: "pers-007", target: "op-spectre", label: "PRIMARY AGENT" },

    { source: "op-goldeneye", target: "pers-006", label: "TARGET" },
    { source: "pers-006", target: "org-janus", label: "LEADS" },

    { source: "op-skyfall", target: "pers-silva", label: "TARGET" },
    { source: "pers-silva", target: "pers-m", label: "VENDETTA" },

    { source: "op-casinoroyale", target: "pers-lechiffre", label: "TARGET" },
    { source: "op-casinoroyale", target: "pers-leiter", label: "ALLIED" },

    { source: "op-spectre", target: "org-spectre", label: "TARGET" },
    { source: "org-spectre", target: "pers-blofeld", label: "CHAIRMAN" },
    { source: "org-spectre", target: "pers-lechiffre", label: "FINANCES" },

    { source: "pers-leiter", target: "org-cia", label: "REPRESENTS" },
    { source: "pers-007", target: "pers-leiter", label: "ALLIANCE" },
    { source: "pers-007", target: "pers-wailin", label: "JOINT MISSION" }
  ], []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const allRecords = getAllRecords(store);
  const selectedRecord = allRecords.find(r => r.id === selectedNodeId);

  const connectedLinkNodes = links
    .filter(l => l.source === selectedNodeId || l.target === selectedNodeId)
    .map(l => ({
      otherId: l.source === selectedNodeId ? l.target : l.source,
      label: l.label
    }));

  return (
    <div className="space-y-4 mi6-swap-grid rounded-[30px] p-1">
      {/* Top Banner Toolbar */}
      <div className="mi6-swap-panel rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <h2 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
            CROSS-REGISTRY THREAT & RELATIONSHIP TOPOLOGY
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
            className="p-1.5 bg-white/[0.025] border border-white/10 rounded text-stone-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.7))}
            className="p-1.5 bg-white/[0.025] border border-white/10 rounded text-stone-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 bg-white/[0.025] border border-white/10 rounded text-[11px] text-stone-400 hover:text-white"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area and Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Graph Viewport */}
        <div className="lg:col-span-8 mi6-swap-panel rounded-[28px] h-[580px] relative overflow-hidden flex items-center justify-center shadow-inner">
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="100 0 850 560"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Links */}
            {links.map((link, idx) => {
              const src = nodes.find(n => n.id === link.source);
              const tgt = nodes.find(n => n.id === link.target);
              if (!src || !tgt) return null;
              const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;
              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlighted ? "#f59e0b" : "#374151"}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeDasharray={isHighlighted ? "none" : "3,3"}
                    opacity={isHighlighted ? 0.9 : 0.4}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected = links.some(
                l => (l.source === selectedNodeId && l.target === node.id) ||
                     (l.target === selectedNodeId && l.source === node.id)
              );
              const isDimmed = selectedNodeId && !isSelected && !isConnected;

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedNodeId(node.id);
                  }}
                  className="cursor-pointer transition-opacity"
                  opacity={isDimmed ? 0.35 : 1}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.color}
                    stroke={isSelected ? "#ffffff" : "#000000"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all"
                  />
                  <text
                    x={node.x}
                    y={node.y + node.radius + 14}
                    textAnchor="middle"
                    fill={isSelected ? "#f59e0b" : "#e5e7eb"}
                    fontSize={isSelected ? "11px" : "10px"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-white/8 rounded px-2.5 py-1 text-[10px] font-mono text-stone-400">
            CLICK NODE TO INSPECT RELATIONSHIPS // 22 CORE ENTITIES MAPPED
          </div>
        </div>

        {/* Selected Entity Inspector Panel */}
        <div className="lg:col-span-4 mi6-swap-panel rounded-[24px] p-5 flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4">
              <span className="text-[10px] text-amber-500 font-bold uppercase">
                ENTITY RECONNAISSANCE
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-900/40 text-red-400 border border-red-800/40">
                {selectedNode.classification}
              </span>
            </div>

            <h3 className="text-base font-bold text-stone-100">
              {selectedNode.name}
            </h3>
            <div className="text-[11px] text-stone-400 mt-0.5 uppercase">
              CLASS: {selectedNode.type}
            </div>

            {selectedRecord && (
              <div className="mt-4 p-3 mi6-swap-panel-soft rounded-xl space-y-2 text-[11px]">
                <div className="text-stone-400 text-[10px]">
                  REF: <span className="font-bold text-stone-200">{selectedRecord.referenceNumber}</span>
                </div>
                <div className="text-stone-300 font-sans line-clamp-3">
                  {("biography" in selectedRecord && selectedRecord.biography) ||
                   ("briefing" in selectedRecord && selectedRecord.briefing) ||
                   ("operationalPurpose" in selectedRecord && selectedRecord.operationalPurpose) ||
                   ("ideology" in selectedRecord && selectedRecord.ideology) ||
                   "Classified intelligence dossier on file."}
                </div>
              </div>
            )}

            {/* Direct Link Connections */}
            <div className="mt-4">
              <span className="text-[10px] text-stone-400 uppercase font-bold block mb-2">
                ACTIVE INTEL VECTORS ({connectedLinkNodes.length}):
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {connectedLinkNodes.map((item, idx) => {
                  const otherNode = nodes.find(n => n.id === item.otherId);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedNodeId(item.otherId);
                      }}
                      className="flex items-center justify-between p-2 rounded bg-[#1c1e23] hover:bg-[#282c34] border border-white/8 cursor-pointer transition-colors"
                    >
                      <span className="font-bold text-stone-200 truncate">{otherNode?.name || item.otherId}</span>
                      <span className="text-[9px] text-amber-500 shrink-0 font-semibold">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/8 mt-4">
            <button
              onClick={() => {
                soundManager.playPaperRustle();
                onOpenRecord(selectedNode.id);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <span>OPEN FULL ARCHIVAL DOSSIER</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
