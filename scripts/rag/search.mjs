#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { scoreBM25, excerpt, tokenize } from './util.mjs';

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, 'docs', 'rag', '.index', 'rag_index.json');

function loadIndex() {
  if (!fs.existsSync(OUT_FILE)) {
    console.error('Index not found. Run: pnpm rag:index');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  // Rehydrate bm25 maps
  const idf = new Map(Object.entries(data.bm25.idf));
  const tfs = data.bm25.tfs.map((o) => new Map(Object.entries(o)));
  return {
    ...data,
    bm25: { N: data.bm25.N, avgdl: data.bm25.avgdl, docLens: data.bm25.docLens, idf, tfs },
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { topK: 8, json: false, query: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--top' || a === '-k') opts.topK = Number(args[++i]);
    else if (a === '--json') opts.json = true;
    else if (a === '--') {
      opts.query = args.slice(i + 1).join(' ');
      break;
    } else if (!a.startsWith('-')) {
      opts.query = args.slice(i).join(' ');
      break;
    }
  }
  if (!opts.query) {
    console.error('Usage: pnpm rag:search -- "your query here"');
    process.exit(1);
  }
  return opts;
}

function main() {
  const opts = parseArgs();
  const index = loadIndex();
  const scores = scoreBM25(opts.query, index.bm25);
  const order = scores
    .map((s, i) => [s, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, opts.topK)
    .filter(([s]) => s > 0);

  const qTerms = Array.from(new Set(tokenize(opts.query)));

  const results = order.map(([score, i]) => {
    const c = index.chunks[i];
    return {
      score: Number(score.toFixed(4)),
      file: c.file,
      title: c.title,
      section: c.section,
      anchor: c.anchor,
      path: c.file + (c.anchor ? c.anchor : ''),
      excerpt: excerpt(c.content, 360),
      highlights: qTerms.filter((t) => c.content.toLowerCase().includes(t)).slice(0, 6),
    };
  });

  if (opts.json) {
    console.log(JSON.stringify({ query: opts.query, results }, null, 2));
  } else {
    console.log(`Query: ${opts.query}`);
    for (const r of results) {
      console.log(`\n• ${r.title} — ${r.path}  (score=${r.score})`);
      if (r.section) console.log(`  Section: ${r.section}`);
      console.log(`  ${r.excerpt}`);
    }
    if (results.length === 0) console.log('\n(no results)');
  }
}

main();

