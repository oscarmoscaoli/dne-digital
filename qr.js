/* QR byte-mode version 3, error correction L, mask 0.
 * Payloads contain only a demonstration identifier, never personal data.
 * No libraries, remote services or official validation.
 */
'use strict';
window.DneQR = (() => {
  function matrix(text) {
    const bytes = new TextEncoder().encode(text);
    if (bytes.length > 53) throw new Error('QR payload exceeds 53 bytes');
    const bits = [];
    const push = (n, count) => { for (let i = count - 1; i >= 0; i--) bits.push((n >>> i) & 1); };
    push(4, 4); push(bytes.length, 8); bytes.forEach(b => push(b, 8));
    push(0, Math.min(4, 440 - bits.length));
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => a * 2 + b, 0));
    for (let i = 0; data.length < 55; i++) data.push(i % 2 ? 0x11 : 0xec);
    function multiply(a, b) {
      let r = 0;
      for (let i = 0; i < 8; i++) { if (b & 1) r ^= a; b >>>= 1; a <<= 1; if (a & 256) a ^= 0x11d; }
      return r;
    }
    const divisor = Array(15).fill(0); divisor[14] = 1;
    let root = 1;
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) { divisor[j] = multiply(divisor[j], root); if (j + 1 < 15) divisor[j] ^= divisor[j + 1]; }
      root = multiply(root, 2);
    }
    const ecc = Array(15).fill(0);
    for (const b of data) {
      const factor = b ^ ecc.shift(); ecc.push(0);
      for (let j = 0; j < 15; j++) ecc[j] ^= multiply(divisor[j], factor);
    }
    const stream = [];
    [...data, ...ecc].forEach(b => { for (let i = 7; i >= 0; i--) stream.push((b >>> i) & 1); });
    const n = 29, m = Array.from({length:n}, () => Array(n).fill(false));
    const reserved = Array.from({length:n}, () => Array(n).fill(false));
    function set(x,y,value) { if (x < 0 || y < 0 || x >= n || y >= n) return; m[y][x] = !!value; reserved[y][x] = true; }
    for (let i = 0; i < n; i++) { set(6,i,i % 2 === 0); set(i,6,i % 2 === 0); }
    for (const [cx,cy] of [[3,3],[n-4,3],[3,n-4]]) {
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
        const d = Math.max(Math.abs(x),Math.abs(y)); set(cx+x,cy+y,d !== 2 && d !== 4);
      }
    }
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) set(22+x,22+y,Math.max(Math.abs(x),Math.abs(y)) !== 1);
    const format = 0x77c4; // L, mask 0, BCH encoded and XOR 0x5412.
    const fb = i => (format >>> i) & 1;
    for (let i = 0; i <= 5; i++) set(8,i,fb(i));
    set(8,7,fb(6)); set(8,8,fb(7)); set(7,8,fb(8));
    for (let i = 9; i < 15; i++) set(14-i,8,fb(i));
    for (let i = 0; i < 8; i++) set(n-1-i,8,fb(i));
    for (let i = 8; i < 15; i++) set(8,n-15+i,fb(i));
    set(8,n-8,true);
    let index = 0;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let v = 0; v < n; v++) {
        const upward = ((right + 1) & 2) === 0, y = upward ? n - 1 - v : v;
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          if (!reserved[y][x]) { const bit = index < stream.length ? stream[index++] : 0; m[y][x] = !!(bit ^ ((x+y) % 2 === 0)); }
        }
      }
    }
    return m;
  }
  function svg(text) {
    const m = matrix(text), ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns,'svg'); el.setAttribute('viewBox','0 0 37 37'); el.setAttribute('aria-hidden','true');
    const bg = document.createElementNS(ns,'rect'); bg.setAttribute('width','37'); bg.setAttribute('height','37'); bg.setAttribute('fill','#fff'); el.append(bg);
    const path = document.createElementNS(ns,'path'); let d = '';
    for (let y=0;y<29;y++) for (let x=0;x<29;x++) if (m[y][x]) d += `M${x+4},${y+4}h1v1h-1z`;
    path.setAttribute('d',d); path.setAttribute('fill','#111'); el.append(path); return el;
  }
  return { matrix, svg };
})();
