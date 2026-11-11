import {bindings,defineConfig} from 'cf/config';
export default defineConfig(({mode})=>({worker:{
 name:mode==='staging'?'life-api-staging':'life-api',
 entrypoint:'./src/worker.ts',compatibilityDate:'2026-11-12',
 env:{ASSETS:bindings.assets(),AI:bindings.ai(),SETTINGS:bindings.kv(),KNOWLEDGE:bindings.d1(),AI_ENABLED:bindings.text('false')},
 assets:{notFoundHandling:'single-page-application',runWorkerFirst:['/api/*']},
 observability:{enabled:true,headSamplingRate:0.1,traces:{enabled:true,headSamplingRate:0.1}},
 workersDev:true,
}}));
