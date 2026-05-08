import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const localeDir = path.join(root, "public", "locales");
const locales = ["en", "es"];

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const idPatterns = [
  /formatMessage\(\s*\{\s*id:\s*["']([^"']+)["']/g,
  /<FormattedMessage\s+[^>]*id=["']([^"']+)["']/g,
  /\bt\(\s*["']([a-zA-Z0-9_.-]+)["']/g,
];

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    if (!sourceExtensions.has(path.extname(entry.name))) return [];
    return [entryPath];
  });
};

const flatten = (value, prefix = "", output = {}) => {
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (
      nestedValue &&
      typeof nestedValue === "object" &&
      !Array.isArray(nestedValue)
    ) {
      flatten(nestedValue, nextKey, output);
    } else {
      output[nextKey] = nestedValue;
    }
  }
  return output;
};

const ids = new Set();

for (const file of walk(sourceRoot)) {
  const source = fs.readFileSync(file, "utf8");
  for (const pattern of idPatterns) {
    for (const match of source.matchAll(pattern)) {
      ids.add(match[1]);
    }
  }
}

let hasErrors = false;

for (const locale of locales) {
  const localePath = path.join(localeDir, `${locale}.json`);
  const messages = flatten(JSON.parse(fs.readFileSync(localePath, "utf8")));
  const missing = [...ids].filter((id) => !(id in messages)).sort();

  if (missing.length > 0) {
    hasErrors = true;
    console.error(`\n${locale}.json is missing ${missing.length} key(s):`);
    for (const id of missing) console.error(`  - ${id}`);
  }
}

const [baseLocale, ...otherLocales] = locales;
const baseMessages = flatten(
  JSON.parse(
    fs.readFileSync(path.join(localeDir, `${baseLocale}.json`), "utf8"),
  ),
);

for (const locale of otherLocales) {
  const messages = flatten(
    JSON.parse(fs.readFileSync(path.join(localeDir, `${locale}.json`), "utf8")),
  );
  const missingFromLocale = Object.keys(baseMessages)
    .filter((key) => !(key in messages))
    .sort();

  if (missingFromLocale.length > 0) {
    hasErrors = true;
    console.error(
      `\n${locale}.json is missing ${missingFromLocale.length} key(s) from ${baseLocale}.json:`,
    );
    for (const id of missingFromLocale) console.error(`  - ${id}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`i18n OK: ${ids.size} source keys covered in ${locales.join(", ")}.`);
