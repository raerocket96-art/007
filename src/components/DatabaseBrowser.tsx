import React, { useState, useMemo } from "react";
import { MI6DatabaseStore } from "../data";
import { DatabaseRecord } from "../types";
import { 
  Shield, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Lock, 
  ExternalLink, 
  ChevronRight,
  UserCheck,
  Target,
  Wrench,
  Car,
  MapPin,
  Building2,
  Users
} from "lucide-react";
import { soundManager } from "../utils/sound";

interface DatabaseBrowserProps {
  store: MI6DatabaseStore;
  onSelectRecord: (record: DatabaseRecord) => void;
  clearanceLevel: number;
}

type CategoryType = "all" | "personnel" | "operations" | "equipment" | "vehicles" | "locations" | "organizations" | "assets";

export const DatabaseBrowser: React.FC<DatabaseBrowserProps> = ({
  store,
  onSelectRecord,
  clearanceLevel
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("personnel");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");

  const categories = [
    { id: "personnel", label: "PERSONNEL", count: store.personnel.length, icon: UserCheck },
    { id: "operations", label: "OPERATIONS", count: store.operations.length, icon: Target },
    { id: "equipment", label: "EQUIPMENT", count: store.equipment.length, icon: Wrench },
    { id: "vehicles", label: "VEHICLES", count: store.vehicles.length, icon: Car },
    { id: "locations", label: "LOCATIONS", count: store.locations.length, icon: MapPin },
    { id: "organizations", label: "ORGANIZATIONS", count: store.organizations.length, icon: Building2 },
    { id: "assets", label: "ASSETS & INFORMANTS", count: store.assets.length, icon: Users },
  ];

  const currentRecords: DatabaseRecord[] = useMemo(() => {
    let records: DatabaseRecord[] = [];
    switch (activeCategory) {
      case "personnel": records = store.personnel; break;
      case "operations": records = store.operations; break;
      case "equipment": records = store.equipment; break;
      case "vehicles": records = store.vehicles; break;
      case "locations": records = store.locations; break;
      case "organizations": records = store.organizations; break;
      case "assets": records = store.assets; break;
      default:
        records = [
          ...store.personnel,
          ...store.operations,
          ...store.equipment,
          ...store.vehicles,
          ...store.locations,
          ...store.organizations,
          ...store.assets
        ];
    }

    return records.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ("alias" in item && item.alias?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ("codename" in item && item.codename?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = 
        selectedClassification === "ALL" || item.classification === selectedClassification;

      return matchesSearch && matchesClass;
    });
  }, [store, activeCategory, searchQuery, selectedClassification]);

  return (
    <div className="space-y-6">
      {/* Category Navigation Ribbon */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-white/8">
        {categories.map(cat => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playTeletype();
                setActiveCategory(cat.id as CategoryType);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-stone-100 text-stone-900 border-black shadow"
                  : "bg-[#24272c] text-stone-400 border-white/8 hover:text-stone-200 hover:border-white/10"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-600" : "text-stone-500"}`} />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isActive ? "bg-black text-white" : "bg-stone-800 text-stone-400"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="mi6-swap-panel rounded-[24px] p-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory} dossiers...`}
              className="w-full bg-white/[0.025] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="bg-white/[0.025] border border-white/10 text-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL CLASSIFICATIONS</option>
            <option value="TOP SECRET">TOP SECRET</option>
            <option value="SECRET">SECRET</option>
            <option value="CONFIDENTIAL">CONFIDENTIAL</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-stone-400 text-[11px] hidden sm:inline">
            SHOWING {currentRecords.length} DOSSIERS
          </span>
          <div className="flex bg-white/[0.025] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-stone-700 text-stone-100" : "text-stone-500"}`}
              title="Card Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${viewMode === "table" ? "bg-stone-700 text-stone-100" : "text-stone-500"}`}
              title="High-Density Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Listings: Grid Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRecords.map((item) => {
            const isRestricted = clearanceLevel < item.clearanceRequired;
            return (
              <div
                key={item.id}
                onClick={() => {
                  soundManager.playPaperRustle();
                  onSelectRecord(item);
                }}
                className="bg-[#24272c] hover:bg-white/[0.04] border border-white/8 hover:border-amber-500/30 rounded-[22px] p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between relative shadow-sm"
              >
                <div>
                  {/* Card Header Stamp */}
                  <div className="flex items-center justify-between border-b border-white/10/60 pb-2 mb-3 font-mono text-[10px]">
                    <span className="font-bold text-amber-500 tracking-wider">
                      {item.referenceNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-black tracking-widest ${
                      item.classification === "TOP SECRET" ? "bg-red-950/80 text-red-400 border border-red-800/40" :
                      item.classification === "SECRET" ? "bg-red-900/40 text-red-300" : "bg-stone-800 text-stone-300"
                    }`}>
                      {item.classification}
                    </span>
                  </div>

                  {/* Visual Inset / Photo */}
                  <div className="relative mb-3 h-36 rounded-lg overflow-hidden bg-black/25 border border-white/10 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-stone-600 font-mono text-xs flex flex-col items-center">
                        <Shield className="w-8 h-8 opacity-30 mb-1" />
                        <span>CLASSIFIED FILE</span>
                      </div>
                    )}

                    {isRestricted && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest rotate-[-10deg]">
                          RESTRICTED (LVL {item.clearanceRequired})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Title & Subtitle */}
                  <div className="space-y-1 font-mono">
                    <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {"alias" in item && item.alias && (
                      <div className="text-[11px] text-stone-400 font-medium">
                        "{item.alias}"
                      </div>
                    )}

                    {"codename" in item && item.codename && (
                      <div className="text-[11px] text-amber-500 font-bold">
                        CODENAME: [{item.codename}]
                      </div>
                    )}

                    {"role" in item && item.role && (
                      <div className="text-[11px] text-stone-400 line-clamp-1">
                        {item.role}
                      </div>
                    )}

                    {"category" in item && (
                      <div className="text-[11px] text-stone-400">
                        CLASS: {item.category}
                      </div>
                    )}

                    {"strategicImportance" in item && (
                      <div className="text-[11px] text-stone-400 line-clamp-2 font-sans">
                        {item.strategicImportance}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Status and Action */}
                <div className="pt-3 mt-3 border-t border-white/8 flex items-center justify-between text-[11px] font-mono text-stone-400">
                  <span className="text-[10px]">
                    REQ: LVL {item.clearanceRequired}
                  </span>
                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-semibold">
                    <span>VIEW DOSSIER</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Archival Table Mode */
        <div className="mi6-swap-panel rounded-[24px] overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/8 text-stone-400 text-[10px] tracking-wider uppercase">
                <th className="p-3">REF NUMBER</th>
                <th className="p-3">DESIGNATION / NAME</th>
                <th className="p-3">TYPE / ROLE</th>
                <th className="p-3">CLASSIFICATION</th>
                <th className="p-3">CLEARANCE</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {currentRecords.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    soundManager.playPaperRustle();
                    onSelectRecord(item);
                  }}
                  className="hover:bg-white/[0.035] cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-amber-500 text-[11px]">
                    {item.referenceNumber}
                  </td>
                  <td className="p-3 font-bold text-stone-100">
                    {item.name}
                  </td>
                  <td className="p-3 text-stone-400 text-[11px]">
                    {("role" in item && item.role) || ("category" in item && item.category) || item.type.toUpperCase()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      item.classification === "TOP SECRET" ? "bg-red-900/60 text-red-300" : "bg-stone-800 text-stone-400"
                    }`}>
                      {item.classification}
                    </span>
                  </td>
                  <td className="p-3 text-[11px]">
                    LVL {item.clearanceRequired}
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-amber-400 font-bold hover:underline">
                      OPEN →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
