import {describe,it,expect,vi} from 'vitest';
import {calculate,validBirthday,lineReadings} from '../src/numerology';
import {lifeChartOf} from '../src/profile/astro';
import {chartHtml} from '../src/web/chart';
import {buildPrompt,knowledge} from '../src/knowledge';
import {runAnalysis,readBody,type Env} from '../src/worker';
import {Starry} from '../vendor/starry-sdk';
const input={birthday:'1992-02-03',mode:'original',blood:'unknown'} as const;
describe('original calculation parity and validation',()=>{
 it('preserves source chart data for 1000 dates',()=>{for(let y=1900;y<2000;y++)for(let m=1;m<=10;m++){const birthday=`${y}-${String(m).padStart(2,'0')}-15`;expect(calculate({...input,birthday})).toEqual(lifeChartOf(birthday));}});
 it('rejects impossible and future birthdays',()=>{for(const date of ['2023-02-29','2000-13-01','0000-00-00','2999-01-01','2020-04-31'])expect(validBirthday(date)).toBe(false);expect(validBirthday('2000-02-29')).toBe(true);});
 it('keeps zero extension, repeated talent triangles and life square',()=>{const c=calculate({...input,birthday:'1985-07-03'});expect(c.lines).toContainEqual([3,6,9,0]);expect(c.rings[3]!.talent).toBe(2);expect(chartHtml(c)).toContain('width="28" height="28"');});
 it('implements full article zodiac expansion and optional blood type separately',()=>{const c=calculate({...input,mode:'article',blood:'O'});expect(c.rings[1]!.black).toBe(3);expect(c.rings[2]!.black).toBe(3);expect(c.rings[6]!.black).toBe(1);expect(Object.values(c.rings).every(r=>!r.birthday&&!r.zodiac)).toBe(true);expect(lineReadings(c).find(r=>r.id==='26')!.present).toBe(true);});
 it('all article text blocks and original figures remain available',()=>{expect(knowledge.blocks.length).toBe(305);expect(knowledge.blocks.filter(b=>b.type==='image').length).toBe(19);const prompt=buildPrompt(calculate(input),'健康','original','unknown');for(const b of knowledge.blocks)if(b.text)expect(prompt[0]!.content).toContain(b.text);expect(prompt[1]!.content).not.toContain(input.birthday);});
});
describe('AI billing boundaries',()=>{
 const assets={fetch:vi.fn()};
 function setup(){const starry=new Starry({baseUrl:'https://example.invalid'});vi.spyOn(starry,'reserve').mockResolvedValue({reservation_id:'r'} as never);vi.spyOn(starry,'commit').mockResolvedValue({} as never);vi.spyOn(starry,'release').mockResolvedValue({} as never);const env:Env={ASSETS:assets,KNOWLEDGE:{prepare:()=>({bind(){return this;},async all<T>(){return {results:knowledge.blocks.map(b=>({id:b.id,text:b.text??''})) as T[]};}})},AI_ENABLED:'true',STARRY_BATTERY_KEY:'test-only-placeholder',AI:{run:vi.fn().mockResolvedValue({response:'摘要：練習合作，理解自己的數字優勢。[原文段落 47]'})}};return{starry,env};}
 it('never invokes AI if reserve fails',async()=>{const {starry,env}=setup();vi.mocked(starry.reserve).mockRejectedValue(new Error('BATTERY_APP_CAP'));await expect(runAnalysis(starry,'token',env,input,'事業',1)).rejects.toThrow();expect(env.AI!.run).not.toHaveBeenCalled();});
 it('commits only after grounded response',async()=>{const {starry,env}=setup();const result=await runAnalysis(starry,'token',env,input,'事業',1);expect(result.references).toEqual([47]);expect(starry.commit).toHaveBeenCalledWith('r');expect(starry.release).not.toHaveBeenCalled();});
 it('releases when AI fails',async()=>{const {starry,env}=setup();vi.mocked(env.AI!.run).mockRejectedValue(new Error('unavailable'));await expect(runAnalysis(starry,'token',env,input,'事業',1)).rejects.toThrow();expect(starry.release).toHaveBeenCalledWith('r');expect(starry.commit).not.toHaveBeenCalled();});
 it('does not return uncharged results on commit failure',async()=>{const {starry,env}=setup();vi.mocked(starry.commit).mockRejectedValue(new Error('unavailable'));await expect(runAnalysis(starry,'token',env,input,'事業',1)).rejects.toThrow();expect(starry.release).toHaveBeenCalled();});
 it('fails closed when not configured',async()=>{const {starry,env}=setup();delete env.STARRY_BATTERY_KEY;await expect(runAnalysis(starry,'token',env,input,'事業',1)).rejects.toThrow('尚未啟用');expect(starry.reserve).not.toHaveBeenCalled();});
 it('rejects oversized bodies even without content-length',async()=>{await expect(readBody(new Request('https://example.invalid',{method:'POST',body:'x'.repeat(3000)}))).rejects.toThrow('資料過長');});
});

import {searchIndex,searchKnowledge} from '../src/search';
it('indexes every source block without editing any text',()=>{expect(searchIndex.entries.length).toBe(knowledge.blocks.length);for(const b of knowledge.blocks)expect(searchIndex.entries.find(e=>e.id===b.id)!.text).toBe(b.text??'');expect(searchKnowledge('安全感','家庭').length).toBeGreaterThan(0);expect(searchKnowledge('','桃花').every(e=>e.categories.includes('桃花'))).toBe(true);});
import worker from '../src/worker';
describe('HTTP security boundary',()=>{
 it('rejects missing bearer before any AI work',async()=>{
 const original=globalThis.fetch;globalThis.fetch=vi.fn().mockResolvedValue(Response.json({status:'active'}));
 try{const result=await worker.fetch(new Request('https://life.starry.phd/api/admin/config'),{ASSETS:{fetch:vi.fn()}});expect(result.status).toBe(401);}finally{globalThis.fetch=original;}
 });
 it('rejects cross-origin authenticated mutations',async()=>{const result=await worker.fetch(new Request('https://life.starry.phd/api/admin/config',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'}),{ASSETS:{fetch:vi.fn()}});expect(result.status).toBe(403);});
 it('does not start tasks during central maintenance',async()=>{const original=globalThis.fetch;globalThis.fetch=vi.fn().mockResolvedValue(Response.json({status:'paused'}));try{const result=await worker.fetch(new Request('https://life.starry.phd/api/analyze',{method:'POST'}),{ASSETS:{fetch:vi.fn()}});expect(result.status).toBe(503);}finally{globalThis.fetch=original;}});
});
