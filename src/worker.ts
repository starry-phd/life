import {AI_MODELS,DEFAULT_AI_SETTINGS,AI_BILLING_NOTE,validAiSettings,cleanArticle,articleFromOutput,type AiOutput} from './ai-settings';
import {createRemoteJWKSet,jwtVerify} from 'jose';
import {Starry,StarryError} from '../vendor/starry-sdk';
import {calculate,categories,type ChartInput,type Category} from './numerology';
import {buildPrompt,knowledge} from './knowledge';
import type {Me} from '../vendor/starry-client';
interface KnowledgeRow {id:number;text:string;heading:string;topic:string;line:string|null}
interface Statement {bind(...values:unknown[]):Statement;all<T>():Promise<{results:T[]}>}
export interface Env {
 KNOWLEDGE?:{prepare(sql:string):Statement};
 AI?:{run(model:string,input:{messages:{role:string;content:string}[];max_tokens:number;chat_template_kwargs?:{enable_thinking:boolean}}):Promise<AiOutput>};
 SETTINGS?:{get(key:string):Promise<string|null>;put(key:string,value:string):Promise<void>};
 ASSETS:{fetch(request:Request):Promise<Response>};
 STARRY_BATTERY_KEY?:string;
 AI_ENABLED?:string;
}
const BASE='https://id.starry.phd';
const jwks=createRemoteJWKSet(new URL(BASE+'/.well-known/jwks.json'),{cacheMaxAge:600000,cooldownDuration:0,timeoutDuration:5000});
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class HttpError extends Error{constructor(public status:number,public code:string,message:string){super(message);}}
const centralFetch:typeof fetch=(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(12000)});
async function identity(request:Request,starry:Starry){const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)throw new HttpError(401,'UNAUTHORIZED','請先登入繁星會員');
 try{const {payload}=await jwtVerify(token,jwks,{issuer:'starry-id:production',audience:'starry',algorithms:['ES256'],requiredClaims:['exp','sub','app_id']});if(payload.app_id!=='life')throw new Error('app');}catch{throw new HttpError(401,'UNAUTHORIZED','登入已到期，請重新登入');}
 const me=await starry.me(token) as Me;if(me.status!=='active')throw new HttpError(403,'INACTIVE','會員目前無法使用此功能');if(me.consent.required)throw new HttpError(403,'CONSENT_REQUIRED','請先同意最新條款');return {token,me};}
export async function readBody(request:Request,limit=2048){if(Number(request.headers.get('content-length')??0)>limit)throw new HttpError(413,'TOO_LARGE','資料過長');const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'BAD_REQUEST','缺少資料');let text='';let bytes=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>limit){await reader.cancel();throw new HttpError(413,'TOO_LARGE','資料過長');}text+=decoder.decode(value,{stream:true});}try{return JSON.parse(text+decoder.decode()) as Record<string,unknown>;}catch{throw new HttpError(400,'BAD_REQUEST','資料格式錯誤');}}
async function units(env:Env){const value=Number(await env.SETTINGS?.get('units')??1);if(!Number.isInteger(value)||value<1||value>100)throw new HttpError(503,'CONFIG_ERROR','服務設定暫時無法使用');return value;}
export async function aiSettings(env:Env){const raw=await env.SETTINGS?.get('ai-settings');if(!raw)return {...DEFAULT_AI_SETTINGS};let value:unknown;try{value=JSON.parse(raw);}catch{throw new HttpError(503,'CONFIG_ERROR','AI 設定暫時無法使用');}if(!validAiSettings(value))throw new HttpError(503,'CONFIG_ERROR','AI 設定暫時無法使用');return value;}
export async function runAnalysis(starry:Starry,token:string,env:Env,input:ChartInput,category:Category,cost:number){
 if(!env.AI||env.AI_ENABLED!=='true'||!env.STARRY_BATTERY_KEY)throw new HttpError(503,'AI_NOT_READY','AI 解讀尚未啟用，命盤與全文知識庫可正常使用。');
 const chart=calculate(input);
 if(!env.KNOWLEDGE)throw new HttpError(503,'KNOWLEDGE_NOT_READY','原文索引暫時無法使用');
 const corpus=await env.KNOWLEDGE.prepare('SELECT id,text,heading,topic,line FROM source_blocks ORDER BY id').all<KnowledgeRow>();
 if(corpus.results.length!==knowledge.blocks.length)throw new HttpError(503,'KNOWLEDGE_INCOMPLETE','原文索引尚未完整同步');
 const relevant=await env.KNOWLEDGE.prepare('SELECT block_id FROM block_categories WHERE category = ? ORDER BY block_id').bind(category).all<{block_id:number}>();
 const settings=await aiSettings(env);
 const messages=buildPrompt(chart,category,input.mode,input.blood,corpus.results,settings.notes);messages[1]!.content+='\n優先參考的方向索引段落：'+relevant.results.map(r=>r.block_id).join(',');
 const reservation=await starry.reserve(token,{taskType:'life.analysis',taskLabel:`生命靈數・${category}`,units:cost});
 let committed=false;
 try{const result=await env.AI.run(settings.model,{messages,max_tokens:2400,...(settings.model.includes('glm-4.7')||settings.model.includes('gemma-4')?{chat_template_kwargs:{enable_thinking:false}}:{})});const article=articleFromOutput(result).replace(/<think>[\s\S]*?<\/think>/gi,'');if(article.trim().length<20)throw new HttpError(502,'EMPTY_RESPONSE','AI 未產生完整解讀，請稍後再試');
 const refs=[...new Set([...article.matchAll(/原文段落\s*(\d+)/g)].map(x=>Number(x[1])))];if(!refs.length||refs.some(n=>!knowledge.blocks.some(b=>b.id===n)))throw new HttpError(502,'INVALID_REFERENCE','解讀依據未通過檢查，請稍後再試');
 const text=cleanArticle(article);if(text.length<20)throw new HttpError(502,'EMPTY_RESPONSE','AI 未產生完整解讀，請稍後再試');await starry.commit(reservation.reservation_id);committed=true;return {text,references:refs};
 }finally{if(!committed)await starry.release(reservation.reservation_id).catch(()=>{/* Central reservations expire; never expose a result before confirmed billing. */});}
}
export default {async fetch(request:Request,env:Env):Promise<Response>{try{const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(url.pathname==='/api/health')return json({app:'life',version:'0.1.0',handoff:'2026-11-09.6',ai_ready:!!env.STARRY_BATTERY_KEY&&env.AI_ENABLED==='true'});
 if(request.method==='OPTIONS')return new Response(null,{status:204});
 const origin=request.headers.get('origin');if(origin&&origin!==url.origin&&origin!=='https://life.starry.phd')throw new HttpError(403,'ORIGIN','來源不允許');
 const configResponse=await centralFetch(BASE+'/v1/apps/life/config');if(!configResponse.ok)throw new HttpError(503,'SERVICE_UNAVAILABLE','中央服務暫時無法連線');const config=await configResponse.json() as {status:string};if(config.status!=='active')throw new HttpError(503,'SERVICE_UNAVAILABLE','目前維護中，請稍後再試');
 const starry=new Starry({baseUrl:BASE,serviceKey:env.STARRY_BATTERY_KEY,fetch:centralFetch});const {token,me}=await identity(request,starry);
 if(url.pathname==='/api/quote'&&request.method==='GET')return json({units:await units(env)});
 if(url.pathname==='/api/admin/ai'){if(me.staff_role!=='owner')throw new HttpError(403,'FORBIDDEN','僅限超級管理員');if(request.method==='POST'){const data=await readBody(request,40000);if(!validAiSettings(data))throw new HttpError(400,'INVALID_AI_SETTINGS','請選擇支援的模型，備註最多 8000 字');if(!env.SETTINGS)throw new HttpError(503,'CONFIG_UNAVAILABLE','設定儲存尚未配置');await env.SETTINGS.put('ai-settings',JSON.stringify({model:data.model,notes:data.notes}));return json({model:data.model,notes:data.notes});}if(request.method!=='GET')throw new HttpError(405,'METHOD','不支援此操作');return json({...await aiSettings(env),models:AI_MODELS,billingNote:AI_BILLING_NOTE,defaults:DEFAULT_AI_SETTINGS});}
 if(url.pathname==='/api/admin/config'){if(me.staff_role!=='owner')throw new HttpError(403,'FORBIDDEN','僅限超級管理員');if(request.method==='POST'){const data=await readBody(request);if(!Number.isInteger(data.units)||Number(data.units)<1||Number(data.units)>100)throw new HttpError(400,'INVALID_UNITS','顆數須為 1–100 的整數');if(!env.SETTINGS)throw new HttpError(503,'CONFIG_UNAVAILABLE','設定儲存尚未配置');await env.SETTINGS.put('units',String(data.units));}else if(request.method!=='GET')throw new HttpError(405,'METHOD','不支援此操作');return json({units:await units(env),ready:!!env.STARRY_BATTERY_KEY&&env.AI_ENABLED==='true'});}
 if(url.pathname==='/api/analyze'&&request.method==='POST'){const data=await readBody(request);if(typeof data.birthday!=='string'||!['original','article'].includes(String(data.mode))||!['unknown','A','B','AB','O'].includes(String(data.blood))||!categories.includes(data.category as Category))throw new HttpError(400,'INVALID_INPUT','請確認生日、規則與解讀方向');let input:ChartInput;try{input={birthday:data.birthday,mode:data.mode as ChartInput['mode'],blood:data.blood as ChartInput['blood']};calculate(input);}catch{throw new HttpError(400,'INVALID_BIRTHDAY','請輸入有效的西元生日');}return json(await runAnalysis(starry,token,env,input,data.category as Category,await units(env)));}
 throw new HttpError(404,'NOT_FOUND','找不到此功能');}catch(e){if(e instanceof HttpError)return json({error:{code:e.code,message:e.message}},e.status);if(e instanceof StarryError)return json({error:{code:e.code,message:e.code==='BATTERY_INSUFFICIENT'?'🔋 免費額度與 ⚛️ 量子電池不足':e.code==='BATTERY_APP_CAP'?'本月使用量已達上限，請稍後再試':'中央服務暫時無法使用，請稍後再試'}},e.status>=400&&e.status<600?e.status:503);return json({error:{code:'SERVICE_UNAVAILABLE',message:'服務暫時無法使用，請稍後再試'}},503);}}};
