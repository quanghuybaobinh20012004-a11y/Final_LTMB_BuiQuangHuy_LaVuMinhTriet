// src/utils/reportEvents.ts
type Listener = () => void;

const listeners = new Set<Listener>();

export function onReportsChanged(fn: Listener): () => void {
  listeners.add(fn);
  // trả về hàm huỷ đăng ký để dùng trong cleanup của useEffect
  return () => listeners.delete(fn);
}

export function notifyReportsChanged() {
  // gọi tất cả listener
  for (const fn of listeners) fn();
}
