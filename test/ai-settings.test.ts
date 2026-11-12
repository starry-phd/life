import {afterEach,describe,it,expect,vi} from 'vitest';
vi.mock('jose',()=>({createRemoteJWKSet:vi.fn(),jwtVerify:vi.fn().mockResolvedValue({payload:{app_id:'life'}})}));
import {jwtVerify} from 'jose';
import worker,{type Env} from '../src/worker';
import {Starry} from '../vendor/starry-sdk';
import {AI_MODELS,DEFAULT_AI_SETTINGS,cleanArticle} from '../src/ai-settings';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
function setup(role:string){vi.mocked(jwtVerify).mockResolvedValue({payload:{app_id:'life'}} as never);vi.stubGlobal('fetch',vi.fn(async()=>Response.json({status:'active'})));vi.spyOn(Starry.prototype,'me').mockResolvedValue({status:'active',staff_role:role,consent:{required:false}} as never);const saved=new Map<string,string>();const env:Env={ASSETS:{fetch:vi.fn()},SETTINGS:{get:vi.fn(async k=>saved.get(k)??null),put:vi.fn(async(k,v)=>{saved.set(k,v);})}};const call=(body?:unknown)=>worker.fetch(new Request('https://life.starry.phd/api/admin/ai',{headers:{Authorization:'Bearer test'},method:body===undefined?'GET':'POST',body:body===undefined?undefined:JSON.stringify(body)}),env);return{env,call};}
describe('owner AI settings',()=>{
 it('denies non-owner reads and writes server-side',async()=>{const {call,env}=setup('member');expect((await call()).status).toBe(403);expect((await call(DEFAULT_AI_SETTINGS)).status).toBe(403);expect(env.SETTINGS!.put).not.toHaveBeenCalled();});
 it('persists all five choices and long Chinese notes',async()=>{const {call}=setup('owner');expect((await (await call()).json()).models).toHaveLength(5);for(const m of AI_MODELS){const settings={model:m.id,notes:'合作建議'.repeat(1500)};expect((await call(settings)).status).toBe(200);expect(await (await call()).json()).toMatchObject(settings);}});
 it('rejects unapproved models, non-string and oversized notes without writes',async()=>{const {call,env}=setup('owner');for(const v of [{...DEFAULT_AI_SETTINGS,model:'third-party/unapproved'},{...DEFAULT_AI_SETTINGS,notes:1},{...DEFAULT_AI_SETTINGS,notes:'字'.repeat(8001)},null])expect((await call(v)).status).toBe(400);expect(env.SETTINGS!.put).not.toHaveBeenCalled();});
 it('removes all reference labels while retaining the actual article',()=>{expect(cleanArticle('優勢[原文段落47]、合作［原文段落 48］。建議【原文段落 49、50】！')).toBe('優勢、合作。建議！');expect(cleanArticle('<think>private</think>合作[原文段落xxx]')).toBe('合作');});
});
