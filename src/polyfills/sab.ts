// src/polyfills/sab.ts
// Chỉ polyfill SharedArrayBuffer, không đụng gì tới React/hook
if (typeof (global as any).SharedArrayBuffer === 'undefined') {
  (global as any).SharedArrayBuffer = ArrayBuffer as any;
}
