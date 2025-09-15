#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { ensureDir, readText, splitMarkdownIntoChunks, walkDir, buildBM25, slugify } from './util.mjs';

const ROOT = process.cwd();
const DOC_DIRS = [
  path.join(ROOT, 'docs', 'rag', 'knowledge'),
  path.join(ROOT, 'docs', 'rag', 'plan'),
];
const OUT_DIR = path.join(ROOT, 'docs', 'rag', '.index');
const OUT_FILE = path.join(OUT_DIR, 'rag_index.json');

function collectDocs() {
  const files = [];
  for (const d of DOC_DIRS) {
    if (fs.existsSync(d)) files.push(...walkDir(d));
  }
  return files.filter((p) => /\.(md|mdx|txt|json)$/i.test(p));
}

function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(text);
  if (!m) return { meta: {}, body: text };
  const yaml = m[1];
  const body = m[2];
  const meta = {};
  for (const line of yaml.split(/\r?\n/)) {
    const kv = /^(\w[\w_-]*):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2];
  }
  return { meta, body };
}

function makeAnchor(sectionPath) {
  if (!sectionPath) return '';
  const last = sectionPath.split(' > ').pop();
  return '#' + slugify(last || '');
}

function buildIndex() {
  const files = collectDocs();
  const allChunks = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file).replaceAll('\\', '/');
    const raw = readText(file);
    const { body } = parseFrontMatter(raw);
    const chunks = splitMarkdownIntoChunks(body);
    const titleMatch = /^#\s+(.+)$/m.exec(body);
    const docTitle = titleMatch ? titleMatch[1].trim() : path.basename(file);
    for (const c of chunks) {
      allChunks.push({
        file: rel,
        title: docTitle,
        section: c.section,
        anchor: makeAnchor(c.section),
        content: c.content,
      });
    }
  }

  const bm25 = buildBM25(allChunks);
  const index = {
    version: 1,
    created_at: new Date().toISOString(),
    chunks: allChunks,
    bm25: {
      N: bm25.N,
      avgdl: bm25.avgdl,
      docLens: bm25.docLens,
      // Store tfs and idf in compact form
      idf: Object.fromEntries(bm25.idf.entries()),
      tfs: bm25.tfs.map((m) => Object.fromEntries(m.entries())),
    },
  };

  ensureDir(OUT_DIR);
  fs.writeFileSync(OUT_FILE, JSON.stringify(index));
  console.log(`Indexed ${allChunks.length} chunks from ${files.length} files.`);
  console.log(`-> ${path.relative(ROOT, OUT_FILE).replaceAll('\\', '/')}`);
}

buildIndex();

