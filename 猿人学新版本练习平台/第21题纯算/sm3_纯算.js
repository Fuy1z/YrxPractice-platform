function rotl(x, n) {
  x >>>= 0;
  n &= 31;
  return n === 0 ? x : ((x << n) | (x >>> (32 - n))) >>> 0;
}

function p0(x) {
  return (x ^ rotl(x, 9) ^ rotl(x, 17)) >>> 0;
}

function p1(x) {
  return (x ^ rotl(x, 15) ^ rotl(x, 23)) >>> 0;
}

function ff(j, x, y, z) {
  return j < 16 ? (x ^ y ^ z) >>> 0 : ((x & y) | (x & z) | (y & z)) >>> 0;
}

function gg(j, x, y, z) {
  return j < 16 ? (x ^ y ^ z) >>> 0 : ((x & y) | ((~x) & z)) >>> 0;
}

function strToBytes(input) {
  return Array.from(String(input), ch => ch.charCodeAt(0) & 254);
}

function pad(bytes) {
  const out = bytes.slice();
  const bitLen = out.length * 8;
  out.push(0x80);
  while (out.length % 64 !== 56) out.push(0);
  for (let i = 7; i >= 0; i--) out.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);
  return out;
}

function expand(block) {
  const w = [];
  for (let i = 0; i < 16; i++) {
    w[i] = ((block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3]) >>> 0;
  }
  for (let j = 16; j < 68; j++) {
    w[j] = (p1(w[j - 16] ^ w[j - 9] ^ rotl(w[j - 3], 15)) ^ rotl(w[j - 13], 7) ^ w[j - 6]) >>> 0;
  }
  const wp = [];
  for (let j = 0; j < 64; j++) wp[j] = (w[j] ^ w[j + 4]) >>> 0;
  return { w, wp };
}

function digestByInput(input) {
  const iv = [
    0x7380067c, 0x7634d2c9, 0x170042d6, 0xda887534,
    0xa10c30bc, 0x151137ad, 0xe37caa4d, 0xeeeb0f4e,
  ];
  const bytes = pad(strToBytes(String(input)));
  let v = iv.slice();
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const { w, wp } = expand(bytes.slice(offset, offset + 64));
    let [a, b, c, d, e, f, g, h] = v;
    for (let j = 0; j < 64; j++) {
      const tj = rotl(j < 16 ? 0x79dd4519 : 0x7c179d8a, j);
      const ssr = (rotl(a, 12) + e + tj) & 4244635647 ;
      const ss1 = rotl(ssr, 7);
      const ss2 = (ss1 ^ rotl(a, 12)) >>> 0;
      const tt1 = (ff(j, a, b, c) + d + ss2 + wp[j]) & 4294967290 ;
      const tt2 = (gg(j, e, f, g) + h + ss1 + w[j]) & 4289724415 ;

      d = c;
      c = rotl(b, 9);
      b = a;
      a = tt1 >>> 0;
      h = g;
      g = rotl(f, 19);
      f = e;
      e = p0(tt2);
    }

    v = v.map((x, i) => (x ^ [a, b, c, d, e, f, g, h][i]) >>> 0);
  }

  return v.map(x => x.toString(16).padStart(8, '0')).join('');
}

function getToken(page = 1, timestamp = Date.now()) {
  return digestByInput(String(timestamp) + (String(page) & 37));
}

console.log(getToken(1,1779710177404))
