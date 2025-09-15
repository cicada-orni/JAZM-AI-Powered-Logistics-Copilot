import fs from 'node:fs';
import path from 'node:path';

export function walkDir(dir, exts = new Set(['.md', '.mdx', '.txt', '.json'])) {
  const files = [];
  (function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.has(path.extname(entry.name).toLowerCase())) files.push(full);
    }
  })(dir);
  return files;
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const STOPWORDS = new Set(
  'a,an,the,and,or,if,then,else,when,at,by,for,from,in,into,on,onto,of,to,up,with,as,is,are,was,were,be,been,being,that,this,those,these,it,its,they,them,he,she,his,her,not,do,does,did,done,can,could,should,would,may,might,will,just,so,than,too,very,via,per'.split(
    ','
  )
);

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[`*_#>~`"'.,!?;:()\[\]{}<>]|\s+-\s+/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t) && /[a-z0-9]/.test(t));
}

export function splitMarkdownIntoChunks(content, maxTokens = 800, minChunk = 200) {
  const lines = content.split(/\r?\n/);
  const chunks = [];
  let buf = [];
  let section = [];
  let tokens = 0;

  function flush(reason = 'eof') {
    if (buf.length === 0) return;
    const text = buf.join('\n').trim();
    if (!text) return;
    chunks.push({ section: section.join(' > '), content: text });
    buf = [];
    tokens = 0;
  }

  for (const line of lines) {
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (m) {
      // New heading — flush current chunk if sufficiently large
      if (tokens >= minChunk) flush('heading');
      const level = m[1].length;
      section = section.slice(0, level - 1);
      section[level - 1] = m[2].trim();
      buf.push(line);
      tokens += tokenize(line).length;
      continue;
    }
    buf.push(line);
    tokens += tokenize(line).length;
    if (tokens >= maxTokens) flush('max');
  }
  flush('eof');
  return chunks;
}

export function buildBM25(chunks) {
  // Build term statistics
  const N = chunks.length;
  const docLens = new Array(N);
  const avgdl =
    chunks.reduce((sum, c, i) => {
      const len = tokenize(c.content).length;
      docLens[i] = len;
      return sum + len;
    }, 0) / Math.max(1, N);

  const df = new Map();
  const tfs = new Array(N);
  for (let i = 0; i < N; i++) {
    const toks = tokenize(chunks[i].content);
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    tfs[i] = tf;
    for (const t of new Set(toks)) df.set(t, (df.get(t) || 0) + 1);
  }

  const idf = new Map();
  for (const [t, dfi] of df.entries()) {
    // BM25 idf with add-one smoothing
    const val = Math.log((N - dfi + 0.5) / (dfi + 0.5) + 1);
    idf.set(t, val);
  }

  return { N, avgdl, docLens, tfs, idf };
}

export function scoreBM25(query, bm25) {
  const k1 = 1.2;
  const b = 0.75;
  const qTokens = tokenize(query);
  const qSet = Array.from(new Set(qTokens));
  const scores = new Array(bm25.N).fill(0);
  for (let i = 0; i < bm25.N; i++) {
    const tf = bm25.tfs[i];
    const dl = bm25.docLens[i];
    for (const t of qSet) {
      const idf = bm25.idf.get(t);
      if (!idf) continue;
      const f = tf.get(t) || 0;
      const denom = f + k1 * (1 - b + (b * dl) / Math.max(1, bm25.avgdl));
      if (denom === 0) continue;
      const termScore = idf * ((f * (k1 + 1)) / denom);
      scores[i] += termScore;
    }
  }
  return scores;
}

export function excerpt(text, maxChars = 300) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars) + '…';
}

