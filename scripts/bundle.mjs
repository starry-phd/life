import {build} from 'esbuild';
await build({entryPoints:['src/worker.ts'],outfile:'.worker/worker.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
