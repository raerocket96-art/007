import React, { useEffect, useMemo } from "react";
import { CausalTreeNode } from "../types";
import { GitBranch, X, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  nodes: CausalTreeNode[];
  activeNodeId?: string;
}

export const CausalTreeModal: React.FC<Props> = ({ open, onClose, nodes, activeNodeId }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const depthOf = (node: CausalTreeNode) => {
      let depth = 0;
      let parent = node.parentId;
      const seen = new Set<string>();
      while (parent && !seen.has(parent)) {
        seen.add(parent);
        const p = nodes.find(n => n.id === parent);
        if (!p) break;
        depth += 1;
        parent = p.parentId;
      }
      return depth;
    };
    const map = new Map<number, CausalTreeNode[]>();
    nodes.forEach(node => {
      const d = depthOf(node);
      map.set(d, [...(map.get(d) || []), node]);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [nodes]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/88 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center" onMouseDown={onClose}>
      <section className="w-full max-w-6xl max-h-[90vh] mi6-swap-panel rounded-[28px] shadow-2xl overflow-hidden flex flex-col" onMouseDown={e => e.stopPropagation()}>
        <header className="p-4 border-b border-white/8 flex items-center justify-between bg-[#111318] font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center"><GitBranch className="w-5 h-5 text-violet-400" /></div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-violet-400 font-bold">MI6 Causal Analysis</div>
              <h3 className="text-sm font-bold text-stone-100">Decision Branch Tree // {nodes.length} recorded nodes</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
        </header>

        <div className="overflow-auto p-5 flex-1">
          <div className="min-w-[760px] space-y-6">
            {grouped.map(([depth, level]) => (
              <div key={depth}>
                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-600 mb-2">Layer {depth + 1}</div>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, level.length))}, minmax(180px,1fr))` }}>
                  {level.map(node => {
                    const active = node.id === activeNodeId;
                    return (
                      <article key={node.id} className={`rounded-xl border p-3 font-mono ${active ? "border-amber-500 bg-amber-500/10" : "border-white/8 bg-[#202329]"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-amber-400">TURN {node.turnNumber ?? node.sceneNumber ?? 0}</span>
                          {node.status === "FAILED" ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : node.status === "COMPLETED" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <RotateCcw className="w-3.5 h-3.5 text-stone-500" />}
                        </div>
                        <div className="mt-2 text-[11px] font-bold text-stone-100 leading-relaxed">{node.description || node.label || "Recorded operational node"}</div>
                        {node.outcome && <div className="mt-2 text-[9px] text-sky-300">{node.outcome}</div>}
                        {node.consequence && <div className="mt-2 text-[9px] leading-relaxed text-stone-500">{node.consequence}</div>}
                        {node.delayedRisk && <div className="mt-2 rounded border border-amber-900/50 bg-amber-950/20 p-1.5 text-[8px] text-amber-300">DELAYED: {node.delayedRisk}</div>}
                        {node.parentId && <div className="mt-2 text-[8px] text-stone-600">PARENT: {node.parentId}</div>}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
