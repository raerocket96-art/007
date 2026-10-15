import { ToastItem, ToastOptions, ToastType } from "../types/toast";
import { soundManager } from "./sound";

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private maxToasts = 5;

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public show(options: ToastOptions): string {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const now = new Date();
    const timeStr = now.toISOString().slice(11, 19) + " Z";

    const newToast: ToastItem = {
      id,
      type: options.type || "info",
      title: options.title || "MI6 NOTIFICATION",
      message: options.message,
      code: options.code || "SIS-DISPATCH",
      timestamp: timeStr,
      duration: options.duration ?? 4500,
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    };

    // Keep array bounded
    this.toasts = [newToast, ...this.toasts].slice(0, this.maxToasts);
    this.notify();

    if (options.playSound !== false) {
      if (options.type === "mission" || options.type === "success") {
        soundManager.playAccessGranted();
      } else if (options.type === "warning" || options.type === "error") {
        soundManager.playAlarm();
      } else {
        soundManager.playTeletype();
      }
    }

    return id;
  }

  public success(title: string, message: string, code?: string) {
    return this.show({
      type: "success",
      title,
      message,
      code: code || "ACTION-CONFIRMED",
    });
  }

  public mission(title: string, message: string, code?: string) {
    return this.show({
      type: "mission",
      title,
      message,
      code: code || "OPERATION-DEPLOYED",
    });
  }

  public info(title: string, message: string, code?: string) {
    return this.show({
      type: "info",
      title,
      message,
      code: code || "SIS-NOTICE",
    });
  }

  public warning(title: string, message: string, code?: string) {
    return this.show({
      type: "warning",
      title,
      message,
      code: code || "SECURITY-ALERT",
    });
  }

  public error(title: string, message: string, code?: string) {
    return this.show({
      type: "error",
      title,
      message,
      code: code || "RESTRICTED-DENIED",
    });
  }

  // Domain-specific helpers
  public missionStarted(missionTitle: string, doctrineOrOperative?: string) {
    return this.show({
      type: "mission",
      title: "TACTICAL DEPLOYMENT INITIATED",
      message: `${missionTitle.toUpperCase()} — Operative ${doctrineOrOperative || "007"} deployed into active field simulation.`,
      code: "00-DISPATCH-ACTIVE",
      duration: 5000,
    });
  }

  public recordSaved(recordName: string, refNumber?: string) {
    return this.show({
      type: "success",
      title: "CENTRAL REGISTRY AMENDMENT SAVED",
      message: `${recordName} ${refNumber ? `[${refNumber}]` : ""} was successfully encrypted and committed to the MI6 archive.`,
      code: "REGISTRY-COMMIT-200",
      duration: 4000,
    });
  }

  public cableAcknowledged(cableSubject: string, cableId?: string) {
    return this.show({
      type: "success",
      title: "DISPATCH CABLE ACKNOWLEDGED",
      message: `Direct communication "${cableSubject}" confirmed and logged at Vauxhall Cross.`,
      code: cableId ? `CABLE-${cableId.toUpperCase()}` : "CABLE-ACK-200",
      duration: 3500,
    });
  }
}

export const toastManager = new ToastManager();
