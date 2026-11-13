#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const errors = [];

if (manifest.manifest_version !== 3) errors.push("manifest_version must be 3");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) errors.push("version must be semver");
for (const size of ["16", "32", "48", "128"]) {
  const icon = manifest.icons && manifest.icons[size];
  if (!icon || !fs.existsSync(path.join(root, icon))) errors.push(`missing icon ${size}`);
}
for (const script of ["translations.js", "content.js"]) {
  if (!fs.existsSync(path.join(root, script))) errors.push(`missing ${script}`);
}
if (!manifest.content_scripts || !manifest.content_scripts.length) errors.push("no content_scripts");
if (!manifest.homepage_url) errors.push("missing homepage_url");

const content = fs.readFileSync(path.join(root, "content.js"), "utf8");
if (!content.includes("isT3CodePage")) errors.push("content.js missing T3 page detection");
if (!content.includes("t3zhVersion")) errors.push("content.js missing version detection");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "translations.js"), "utf8"), sandbox);
const exact = sandbox.window.__T3ZH_EXACT__ || {};
const templates = sandbox.window.__T3ZH_TEMPLATES__ || [];
let badRegex = 0;
for (const [source] of templates) {
  try { new RegExp(source, "u"); } catch { badRegex++; }
}
if (!Object.keys(exact).length) errors.push("empty exact dictionary");
if (!templates.length) errors.push("empty template dictionary");
if (badRegex) errors.push(`${badRegex} invalid template regexes`);

if (errors.length) {
  console.error("VALIDATION FAILED");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log(`validated: v${manifest.version}, ${Object.keys(exact).length} exact, ${templates.length} templates`);
