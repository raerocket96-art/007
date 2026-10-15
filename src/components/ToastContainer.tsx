import React, { useState, useEffect } from "react";
import { ToastItem, ToastType } from "../types/toast";
import { toastManager } from "../utils/toast";
import {
  CheckCircle2,
  Radar,
  Radio,
  AlertTriangle,
  AlertOctagon,
  X,
  ChevronRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { soundManager } from "../utils/sound";

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((items) => {
      setToasts(items);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-24 right-4 sm:right-6 z-[100] max-w-sm sm:max-w-md w-full pointer-events-none space-y-2.5 font-mono select-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => toastManager.dismiss(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const styleConfig = getToastStyles(toast.type);
  const Icon = styleConfig.icon;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${styleConfig.borderClass} ${styleConfig.bgClass} backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-4 transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
    >
      {/* Top Telegraph Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2 mb-2.5">
        <div className="flex items-center space-x-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg ${styleConfig.iconBgClass} flex items-center justify-center ${styleConfig.iconTextClass} shrink-0`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest truncate ${styleConfig.headerTextClass}`}>
            {toast.code || "SIS NOTIFICATION"}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[8px] text-stone-400 font-mono">{toast.timestamp}</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onDismiss();
            }}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-white/10 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h4 className="text-xs font-black text-stone-100 tracking-tight leading-snug">
          {toast.title}
        </h4>
        <p className="text-[11px] text-stone-300 leading-relaxed font-sans font-normal">
          {toast.message}
        </p>
      </div>

      {/* Action Button (if applicable) */}
      {toast.actionLabel && toast.onAction && (
        <div className="mt-3 pt-2 border-t border-white/[0.06] flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              toast.onAction?.();
              onDismiss();
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-black flex items-center space-x-1 transition-colors ${styleConfig.buttonClass}`}
          >
            <span>{toast.actionLabel}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Bottom Progress Countdown Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
        <div
          className={`h-full transition-all ease-linear ${styleConfig.progressClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

function getToastStyles(type: ToastType) {
  switch (type) {
    case "mission":
      return {
        icon: Radar,
        borderClass: "border-amber-500/40",
        bgClass: "bg-[#120f08]/95",
        iconBgClass: "bg-amber-500/20 border border-amber-500/40",
        iconTextClass: "text-amber-400",
        headerTextClass: "text-amber-400",
        progressClass: "bg-amber-400",
        buttonClass: "bg-amber-500 text-black hover:bg-amber-400",
      };
    case "success":
      return {
        icon: CheckCircle2,
        borderClass: "border-emerald-500/40",
        bgClass: "bg-[#071612]/95",
        iconBgClass: "bg-emerald-500/20 border border-emerald-500/40",
        iconTextClass: "text-emerald-400",
        headerTextClass: "text-emerald-400",
        progressClass: "bg-emerald-400",
        buttonClass: "bg-emerald-500 text-black hover:bg-emerald-400",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        borderClass: "border-orange-500/40",
        bgClass: "bg-[#181008]/95",
        iconBgClass: "bg-orange-500/20 border border-orange-500/40",
        iconTextClass: "text-orange-400",
        headerTextClass: "text-orange-400",
        progressClass: "bg-orange-400",
        buttonClass: "bg-orange-500 text-black hover:bg-orange-400",
      };
    case "error":
      return {
        icon: AlertOctagon,
        borderClass: "border-red-500/50",
        bgClass: "bg-[#1a0a0c]/95",
        iconBgClass: "bg-red-500/20 border border-red-500/40",
        iconTextClass: "text-red-400",
        headerTextClass: "text-red-400",
        progressClass: "bg-red-400",
        buttonClass: "bg-red-500 text-white hover:bg-red-400",
      };
    case "info":
    default:
      return {
        icon: Radio,
        borderClass: "border-sky-500/35",
        bgClass: "bg-[#0a121a]/95",
        iconBgClass: "bg-sky-500/20 border border-sky-500/40",
        iconTextClass: "text-sky-400",
        headerTextClass: "text-sky-400",
        progressClass: "bg-sky-400",
        buttonClass: "bg-sky-500 text-black hover:bg-sky-400",
      };
  }
}
