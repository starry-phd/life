// Curated Workers AI models; reviewed against Cloudflare's catalog on 2026-11-12.
export const AI_MODELS = [
 {id:'@cf/meta/llama-3.3-70b-instruct-fp8-fast',name:'Llama 3.3 70B',description:'目前預設，完整敘事與優勢分析'},
 {id:'@cf/zai-org/glm-4.7-flash',name:'GLM 4.7 Flash',description:'多語長文整理，較低用量成本'},
 {id:'@cf/google/gemma-4-26b-a4b-it',name:'Gemma 4 26B',description:'長篇資料摘要與多面向整理'},
 {id:'@cf/mistralai/mistral-small-3.1-24b-instruct',name:'Mistral Small 3.1 24B',description:'指令遵循、條理化建議與摘要'},
 {id:'@cf/meta/llama-4-scout-17b-16e-instruct',name:'Llama 4 Scout',description:'長文脈絡、跨段落資訊整合'},
] as const;
export const DEFAULT_NOTES='請依序輸出六段純文字：摘要、命盤依據、優勢與肯定、可以調整的三件事、合作方向、總結。建議具體、溫和、可執行。最多1000中文字。';
export const AI_BILLING_NOTE='五個模型共用此 Cloudflare 帳戶每天 10,000 Neurons 免費額度，超出後依實際用量計費；切換模型不會重置額度。採 Workers AI 帳戶計費，非 AI Gateway 預付點數。';
export interface AiSettings {model:string;notes:string}
export const DEFAULT_AI_SETTINGS:AiSettings={model:AI_MODELS[0].id,notes:DEFAULT_NOTES};
export function validAiSettings(value:unknown):value is AiSettings {
 if(!value||typeof value!=='object')return false;
 const v=value as AiSettings;
 return AI_MODELS.some(m=>m.id===v.model)&&typeof v.notes==='string'&&v.notes.length<=8000;
}
export function cleanArticle(text:string){return text.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/[\[［【]\s*原文段落[^\]］】\r\n]*[\]］】]/g,'').replace(/原文段落\s*\d+/g,'').replace(/[ \t]+([，。；：！？])/g,'$1').trim();}
export interface AiOutput {response?:string;choices?:{message?:{content?:string|null};finish_reason?:string}[]}
export function articleFromOutput(result:AiOutput){return result.response??result.choices?.[0]?.message?.content??'';}
