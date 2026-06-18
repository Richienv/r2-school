#!/usr/bin/env node
// LESSON #2: a /api/* route importing a lib/* module marked "use client"
// passes tsc + next build silently, then fails at request time with
// "X is on the client. It's not possible to invoke a client function from
// the server." This guard catches it at build second 0.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
const ROOT = resolve(process.cwd());
const APP_API_DIR = join(ROOT, "app", "api");
const LIB_DIR = join(ROOT, "lib");
function walk(d){ const o=[]; let e; try{e=readdirSync(d)}catch{return o};
  for(const n of e){const f=join(d,n); let s; try{s=statSync(f)}catch{continue};
  if(s.isDirectory())o.push(...walk(f)); else if(/\.tsx?$/.test(n))o.push(f)} return o; }
function firstDirective(p){ let t; try{t=readFileSync(p,"utf8")}catch{return null};
  for(const r of t.split("\n")){ const L=r.trim(); if(!L||L.startsWith("//")||L.startsWith("/*")||L.startsWith("*"))continue;
  return L; } return null; }
function imports(p){ const t=readFileSync(p,"utf8"); const s=new Set();
  const re=/^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/gm;
  let m; while((m=re.exec(t))!==null) s.add(m[1]);
  const re2=/^\s*import\s+["']([^"']+)["']/gm;
  while((m=re2.exec(t))!==null) s.add(m[1]); return s; }
function resolveLib(from, spec){ let a;
  if(spec.startsWith("@/")) a=join(ROOT,spec.slice(2));
  else if(spec.startsWith(".")) a=resolve(dirname(from),spec);
  else return null;
  if(!a.startsWith(LIB_DIR+"/")&&!a.startsWith(LIB_DIR+"\\")) return null;
  for(const ext of [".ts",".tsx","/index.ts","/index.tsx"]){
    const c=a+ext; try{ if(statSync(c).isFile()) return c; }catch{} }
  return null; }
const offenders=[];
for(const f of walk(APP_API_DIR)) for(const spec of imports(f)){
  const lib=resolveLib(f,spec); if(!lib) continue;
  const d=firstDirective(lib);
  if(d==='"use client";'||d==="'use client';") offenders.push({route:relative(ROOT,f),lib:relative(ROOT,lib),spec});
}
if(offenders.length===0){console.log(`✓ server-import guard: clean`);process.exit(0);}
console.error("\n✗ server-import guard FAILED:\n");
for(const o of offenders) console.error(`  ${o.route}\n    imports ${o.spec}\n    resolves ${o.lib} (has 'use client')\n`);
console.error("Fix: pure-data/pure-function lib modules must NOT carry 'use client'.\n");
process.exit(1);
