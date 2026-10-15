import React, { useState } from "react";
import { UserRound } from "lucide-react";

interface ActorPortraitProps {
  src?: string;
  name: string;
  className?: string;
  imgClassName?: string;
}

export const ActorPortrait: React.FC<ActorPortraitProps> = ({ src, name, className = "", imgClassName = "" }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={`actor-portrait relative overflow-hidden bg-[var(--bg-elevated)] ${className}`} aria-label={`${name} portrait`}>
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} className={`h-full w-full object-cover object-top ${imgClassName}`} />
      ) : (
        <div className="actor-fallback absolute inset-0 flex flex-col items-center justify-center">
          <UserRound className="w-8 h-8 opacity-55" />
          <span className="mt-2 text-[10px] font-black tracking-[0.18em]">{initials}</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    </div>
  );
};
