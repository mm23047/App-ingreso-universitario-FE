// Genera el artefacto de despliegue: copia los archivos productivos de src/
// (sin test/ ni demos/) a dist/. Sin bundler: el proyecto usa ES Modules
// nativos, así que "build" aquí significa empaquetar, no transpilar.
import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

const EXCLUDED_TOP_LEVEL = new Set(['test', 'demos']);

if (existsSync(distDir)) {
    await rm(distDir, { recursive: true, force: true });
}

await cp(srcDir, distDir, {
    recursive: true,
    filter: (source) => {
        const rel = path.relative(srcDir, source);
        if (rel === '') return true;
        const topLevel = rel.split(path.sep)[0];
        return !EXCLUDED_TOP_LEVEL.has(topLevel);
    }
});

console.log(`Build OK -> ${path.relative(root, distDir)}/`);
