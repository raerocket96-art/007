import React, { useState, useEffect, useMemo } from "react";
import { MI6DatabaseStore, getAllRecords } from "../data";
import { DatabaseRecord } from "../types";
import { Search, X, Shield, FileText, ChevronRight } from "lucide-react";
import { soundManager } from "../utils/sound";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: MI6DatabaseStore;
  onSelectRecord: (record: DatabaseRecord) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  store,
  onSelectRecord
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        soundManager.playClick();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const allRecords = useMemo(() => getAllRecords(store), [store]);

  const filteredRecords = useMemo(() => {
    if (!query.trim()) return allRecords.slice(0, 8);
    const q = query.toLowerCase();
    return allRecords.filter(item => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        ("alias" in item && item.alias?.toLowerCase().includes(q)) ||
        ("codename" in item && item.codename?.toLowerCase().includes(q)) ||
        ("role" in item && item.role?.toLowerCase().includes(q))
      );
    }).slice(0, 12);
  }, [allRecords, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4" onMouseDown={onClose}>
      <div className="bg-[#24272c] border-2 border-white/8 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-mono text-xs" onMouseDown={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/8 flex items-center space-x-3 bg-[#1c1e23]">
          <Search className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 77 classified files by name, ref, codename, alias..."
            className="w-full bg-transparent text-stone-100 placeholder-stone-500 focus:outline-none text-sm font-mono"
          />
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-stone-800/60">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  soundManager.playPaperRustle();
                  onSelectRecord(item);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-[#2c3038] cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-black/25 border border-white/10 flex items-center justify-center text-stone-400 shrink-0">
                    <FileText className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </span>
                      {"alias" in item && item.alias && (
                        <span className="text-stone-400 text-[10px]">"{item.alias}"</span>
                      )}
                      {"codename" in item && item.codename && (
                        <span className="text-amber-500 text-[10px] font-bold">[{item.codename}]</span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center space-x-2 mt-0.5">
                      <span className="text-amber-600 font-bold">{item.referenceNumber}</span>
                      <span>•</span>
                      <span className="uppercase">{item.type}</span>
                      <span>•</span>
                      <span className={item.classification === "TOP SECRET" ? "text-red-400 font-bold" : "text-stone-400"}>
                        {item.classification}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition-colors" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-stone-500">
              NO CLASSIFIED ARCHIVAL RECORDS MATCHING "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#1a1c20] border-t border-white/8 flex justify-between items-center text-[10px] text-stone-500">
          <span>PRESS ESC TO CLOSE</span>
          <span>SEARCHING CENTRAL REGISTRY VAUXHALL CROSS</span>
        </div>
      </div>
    </div>
  );
};
