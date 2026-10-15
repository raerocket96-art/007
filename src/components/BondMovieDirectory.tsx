import React, { useState, useMemo } from "react";
import { ActorPortrait } from "./ActorPortrait";
import { 
  Film, 
  Play, 
  Search, 
  MapPin, 
  Target, 
  ShieldAlert, 
  Shield, 
  ChevronRight, 
  User, 
  Wrench, 
  Car, 
  Calendar, 
  Sparkles,
  Award,
  Filter
} from "lucide-react";
import { bondFilmMissionTemplates } from "../data/bondFilmMissions";
import { BOND_DOCTRINES } from "../data/bondDoctrines";
import { soundManager } from "../utils/sound";

interface BondMovieDirectoryProps {
  onStartMission: (templateId: string) => void;
  onOpenPersonaProfiler?: () => void;
  onOpenRecord?: (recordId: string) => void;
}

const ERA_GROUPS = [
  { id: "all", label: "ALL 25 FILMS", actor: "All Eras", count: 25 },
  { id: "connery", label: "SEAN CONNERY", actor: "Sean Connery", years: "1962–1971", count: 6 },
  { id: "lazenby", label: "GEORGE LAZENBY", actor: "George Lazenby", years: "1969", count: 1 },
  { id: "moore", label: "ROGER MOORE", actor: "Roger Moore", years: "1973–1985", count: 7 },
  { id: "dalton", label: "TIMOTHY DALTON", actor: "Timothy Dalton", years: "1987–1989", count: 2 },
  { id: "brosnan", label: "PIERCE BROSNAN", actor: "Pierce Brosnan", years: "1995–2002", count: 4 },
  { id: "craig", label: "DANIEL CRAIG", actor: "Daniel Craig", years: "2006–2021", count: 5 },
];

export const BondMovieDirectory: React.FC<BondMovieDirectoryProps> = ({
  onStartMission,
  onOpenPersonaProfiler,
  onOpenRecord
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState("all");
  const [selectedMovieId, setSelectedMovieId] = useState<string>(bondFilmMissionTemplates[0]?.id || "");

  // Map each movie to its corresponding Bond actor
  const getActorForMovie = (year: number, id: string): { name: string; doctrineId: string; portraitUrl: string } => {
    if (id === "film-on-her-majestys-secret-service" || year === 1969) {
      return { name: "George Lazenby", doctrineId: "lazenby", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b9/George_Lazenby_2001.jpg" };
    }
    if (year <= 1971) {
      return { name: "Sean Connery", doctrineId: "connery", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Sean_Connery.jpg" };
    }
    if (year >= 1973 && year <= 1985) {
      return { name: "Roger Moore", doctrineId: "moore", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Roger_Moore_c._1960.jpg" };
    }
    if (year >= 1987 && year <= 1989) {
      return { name: "Timothy Dalton", doctrineId: "dalton", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Timothy_Dalton_1987.jpg" };
    }
    if (year >= 1995 && year <= 2002) {
      return { name: "Pierce Brosnan", doctrineId: "brosnan", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/PierceBrosnan%28CannesPhotoCall%29.jpg" };
    }
    return { name: "Daniel Craig", doctrineId: "craig", portraitUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Daniel_Craig_2007.jpg" };
  };

  const filteredMovies = useMemo(() => {
    return bondFilmMissionTemplates.filter(movie => {
      const actor = getActorForMovie(movie.year, movie.id);
      
      // Era filter
      if (selectedEra !== "all" && actor.doctrineId !== selectedEra) {
        return false;
      }
      
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(query);
        const matchesLocation = movie.location.toLowerCase().includes(query);
        const matchesObjective = movie.objective.toLowerCase().includes(query);
        const matchesActor = actor.name.toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesObjective || matchesActor;
      }
      
      return true;
    });
  }, [searchQuery, selectedEra]);

  const activeMovie = bondFilmMissionTemplates.find(m => m.id === selectedMovieId) || filteredMovies[0] || bondFilmMissionTemplates[0];
  const activeActor = activeMovie ? getActorForMovie(activeMovie.year, activeMovie.id) : null;
  const activeDoctrine = activeActor ? BOND_DOCTRINES.find(d => d.id === activeActor.doctrineId) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12161f] border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                  CANONICAL EON ARCHIVE // 25 OFFICIAL MISSIONS
                </span>
                <span className="bg-stone-800 text-stone-300 font-mono text-[9px] px-2 py-0.5 rounded border border-white/10">
                  1962 — 2021
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight mt-1">
                James Bond Film Operations Directory
              </h1>
              <p className="text-stone-400 text-xs mt-1 max-w-2xl leading-relaxed">
                Explore every official MI6 field operation from the 007 franchise. Select any film to review its canonical objective, initial tactical insertion, and launch directly into the live simulator.
              </p>
            </div>
          </div>

          {onOpenPersonaProfiler && (
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenPersonaProfiler();
              }}
              className="bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center space-x-2 shadow transition-all self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>WHICH BOND ARE YOU? (PROFILER)</span>
            </button>
          )}
        </div>

        {/* Era Filter Buttons */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {ERA_GROUPS.map(era => {
            const isSelected = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedEra(era.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 shadow-md scale-[1.02]"
                    : "bg-black/40 text-stone-400 border-white/10 hover:text-stone-200 hover:bg-black/60"
                }`}
              >
                <span>{era.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? "bg-black/30 text-amber-950 font-black" : "bg-white/10 text-stone-400"
                }`}>
                  {era.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by film, villain, location..."
            className="w-full bg-[#12141a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 font-mono"
          />
        </div>

        <div className="font-mono text-xs text-stone-400 flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span>SHOWING:</span>
          <span className="font-bold text-amber-400">{filteredMovies.length}</span>
          <span>OF 25 OPERATIONS</span>
        </div>
      </div>

      {/* Main Grid: Film List + Selected Film Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Film Cards Grid (Left side - 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredMovies.length === 0 ? (
            <div className="bg-[#12141a] border border-white/10 rounded-2xl p-12 text-center font-mono">
              <Film className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-stone-400 text-xs">No matching Bond film operations located in the archives.</p>
            </div>
          ) : (
            filteredMovies.map(movie => {
              const actor = getActorForMovie(movie.year, movie.id);
              const isSelected = activeMovie?.id === movie.id;
              
              const threatColors: Record<string, string> = {
                CRITICAL: "text-red-400 border-red-500/40 bg-red-950/40",
                EXTREME: "text-amber-400 border-amber-500/40 bg-amber-950/40",
                SEVERE: "text-yellow-400 border-yellow-500/40 bg-yellow-950/40",
                ELEVATED: "text-blue-400 border-blue-500/40 bg-blue-950/40",
              };

              return (
                <div
                  key={movie.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedMovieId(movie.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-[#181c24] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50"
                      : "bg-[#101318] border-white/8 hover:border-white/20 hover:bg-[#141720]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="font-mono font-bold text-stone-300 text-xs">{movie.year}</span>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-sm font-bold text-stone-100 tracking-wide font-mono">
                            {movie.title}
                          </h3>
                          <span className="text-[10px] text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            {actor.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-stone-400 text-xs mt-1">
                          <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                          <span className="truncate max-w-xs">{movie.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${threatColors[movie.threatLevel] || "text-stone-300"}`}>
                        {movie.threatLevel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playTeletype();
                          onStartMission(movie.id);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>DISPATCH</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-stone-400 text-xs mt-2.5 line-clamp-2 leading-relaxed">
                    {movie.objective}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Movie Detailed Dossier (Right side - 5 cols sticky) */}
        {activeMovie && (
          <div className="lg:col-span-5 bg-[#12161e] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-5 sticky top-24">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  <Film className="w-3.5 h-3.5" />
                  <span>SELECTED MISSION PROFILE // {activeMovie.year}</span>
                </div>
                <h2 className="text-xl font-black text-stone-100 mt-1">
                  {activeMovie.title}
                </h2>
                <div className="text-xs text-stone-400 font-mono flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{activeMovie.location}</span>
                </div>
              </div>

              {activeActor && (
                <div className="flex flex-col items-center bg-black/40 border border-white/10 p-2 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-stone-800 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-400 text-xs mb-1">
                    007
                  </div>
                  <span className="text-[9px] font-mono text-stone-300 font-bold">{activeActor.name}</span>
                </div>
              )}
            </div>

            {/* Objective & Initial Insertion */}
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-black/30 border border-white/8 rounded-xl p-3.5">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                  <Target className="w-3 h-3" />
                  <span>STRATEGIC OBJECTIVE</span>
                </div>
                <p className="text-stone-200 text-xs leading-relaxed font-sans">
                  {activeMovie.objective}
                </p>
              </div>

              <div className="bg-black/30 border border-white/8 rounded-xl p-3.5">
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
                  <ShieldAlert className="w-3 h-3" />
                  <span>INITIAL INSERTION POINT (TURN 1 SCENE)</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed font-sans">
                  {activeMovie.initialSituation}
                </p>
              </div>
            </div>

            {/* Operative Doctrine Stats */}
            {activeDoctrine && (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase mb-2">
                  <span>DOCTRINE PROFILE: {activeDoctrine.name}</span>
                  <span>ERA: {activeDoctrine.era}</span>
                </div>
                <p className="text-stone-400 text-[11px] font-sans leading-relaxed mb-3">
                  {activeDoctrine.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-stone-400">TACTICAL INTEL:</span>
                    <span className="font-bold text-amber-300">{activeDoctrine.tacticalIntelligence}%</span>
                  </div>
                  <div className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-stone-400">CHARM / SOCIAL:</span>
                    <span className="font-bold text-amber-300">{activeDoctrine.charm}%</span>
                  </div>
                  <div className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-stone-400">PROFESSIONALISM:</span>
                    <span className="font-bold text-amber-300">{activeDoctrine.professionalism}%</span>
                  </div>
                  <div className="flex justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-stone-400">RUTHLESSNESS:</span>
                    <span className="font-bold text-amber-300">{activeDoctrine.ruthlessness}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  soundManager.playTeletype();
                  onStartMission(activeMovie.id);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH OPERATION IN SIMULATOR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
