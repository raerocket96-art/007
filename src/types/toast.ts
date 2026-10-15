export type ToastType = "success" | "mission" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  code?: string;
  timestamp: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  code?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  playSound?: boolean;
}
