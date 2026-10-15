/**
 * Bond radio player styled as an MI6 timepiece.
 * Audio files are served from /public/assets/audio by Vite.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

type Track = {
  title: string;
  artist: string;
  film: string;
  src: string;
};

const tracks: Track[] = [
  {
    title: 'For Your Eyes Only',
    artist: 'Sheena Easton',
    film: 'For Your Eyes Only (1981)',
    src: '/assets/audio/for-your-eyes-only.mp3',
  },
  {
    title: 'All Time High',
    artist: 'Rita Coolidge',
    film: 'Octopussy (1983)',
    src: '/assets/audio/all-time-high.mp3',
  },
];

export const BondRadio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setAudioError('PLAYBACK BLOCKED');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  return (
    <div className="bg-stone-900 border-4 border-stone-700 rounded-full w-56 h-56 p-5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 pointer-events-none" />
      <div className="text-amber-500 font-mono text-[10px] font-bold tracking-wider mb-2">
        MI6 // TIMEPIECE RADIO
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
        onEnded={nextTrack}
        onError={() => {
          setIsPlaying(false);
          setAudioError('AUDIO FILE UNAVAILABLE');
        }}
      />

      <div className="w-full px-3 text-center min-h-[52px] flex flex-col justify-center">
        <div className="text-stone-100 text-xs font-semibold leading-tight truncate" title={currentTrack.title}>
          {currentTrack.title}
        </div>
        <div className="text-stone-400 text-[10px] mt-1 truncate" title={currentTrack.artist}>
          {currentTrack.artist}
        </div>
        <div className="text-stone-600 font-mono text-[8px] mt-0.5 truncate" title={currentTrack.film}>
          {currentTrack.film}
        </div>
      </div>

      <div className="flex gap-5 items-center mt-3">
        <button onClick={prevTrack} className="text-stone-300 hover:text-white" aria-label="Previous track">
          <SkipBack size={20} />
        </button>
        <button onClick={togglePlay} className="text-amber-500 hover:text-amber-300" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={34} /> : <Play size={34} />}
        </button>
        <button onClick={nextTrack} className="text-stone-300 hover:text-white" aria-label="Next track">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="mt-3 text-stone-500 font-mono text-[9px]">
        TRACK {currentTrackIndex + 1}/{tracks.length}
      </div>

      {audioError && (
        <div className="absolute bottom-3 flex items-center gap-1 text-red-400 font-mono text-[8px]">
          <AlertTriangle size={10} />
          {audioError}
        </div>
      )}
    </div>
  );
};
