import fs from 'node:fs/promises';
import path from 'node:path';

const prismaRoot = path.resolve('src/generated/prisma');
const extensionPattern = /\.(js|json|node)$/;

async function patchFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8');
  let updated = original.replace(
    /(from\s+['"])(\.[^'"]+)(['"])/g,
    (match, prefix, specifier, suffix) => {
      if (extensionPattern.test(specifier)) return match;
      return `${prefix}${specifier}.js${suffix}`;
    },
  );

  updated = updated.replace(
    /importName: "\.\/query_compiler_fast_bg(?:\.postgresql)?"/g,
    'importName: "./query_compiler_fast_bg.js"',
  );

  if (updated !== original) {
    await fs.writeFile(filePath, updated, 'utf8');
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && fullPath.endsWith('.ts')) {
        await patchFile(fullPath);
      }
    }),
  );
}

await walk(prismaRoot);
