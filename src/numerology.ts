import {lifeChartOf, type LifeChart} from './profile/astro';
export const categories = ['事業','財運','人際','桃花','感情','小人','健康','家庭'] as const;
export type Category = typeof categories[number];
export type ChartMode = 'original' | 'article';
export interface ChartInput {birthday:string; mode:ChartMode; blood:'unknown'|'A'|'B'|'AB'|'O'}
export function validBirthday(value:string):boolean {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const d=new Date(value+'T00:00:00Z');
 return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value && value>='1900-01-01' && value<=new Date().toISOString().slice(0,10);
}
export function calculate(input:ChartInput):LifeChart {
 if (!validBirthday(input.birthday)) throw new Error('請輸入有效的西元生日');
 const c=lifeChartOf(input.birthday)!;
 if(input.mode==='original')return c;
 if(input.mode!=='article')throw new Error('不支援的命盤規則');
 // The article includes all digits of the zodiac expansion, and blood type instead of birthday number.
 for(const r of Object.values(c.rings)){r.birthday=false;r.zodiac=false;}
 const zodiacDigits:Record<string,number[]>={'摩羯座':[1,0,1],'水瓶座':[1,1,2],'雙魚座':[1,2,3]};
 for(const d of zodiacDigits[c.zodiac_name]??[c.zodiac_number])c.rings[d]!.black++;
 const blood={A:1,B:2,AB:3,O:6,unknown:-1}[input.blood];
 if(blood===undefined)throw new Error('血型格式錯誤');
 if(blood>=0)c.rings[blood]!.black++;
 const has=(n:number)=>{const r=c.rings[n]!;return r.black>0||r.talent>0||r.life;};
 c.lines=[[1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]].filter(l=>l.every(has)).map(l=>l[0]===3&&l[2]===9&&has(0)?[3,6,9,0]:l);
 c.sub_lines=([[2,4],[4,8],[8,6],[6,2]] as [number,number][]).filter(l=>l.every(has));
 return c;
}
export const lineDefinitions=[
 ['123','藝術與獨立',46,60],['456','組織與秩序',61,82],['789','權力與貴人',83,101],['159','事業與執行',102,118],['357','溝通與人緣',119,137],['147','物質與安全',138,158],['258','情感與表達',159,178],['369','智慧與創造',179,197],['1590','業力與課題',198,217],['24','靈巧與變通',219,231],['26','和平與公平',232,244],['68','誠懇與坦率',245,257],['48','穩定與責任',258,269],['257','貴人',271,275],['247','邏輯思考',276,278],['246','安全感',279,281],['269','慈善',282,284],['235','吸引力',285,287],
] as const;
export function lineReadings(c:LifeChart){return lineDefinitions.map(([id,name,start,end])=>{
 const digits=[...id].map(Number);const marked=digits.filter(n=>{const r=c.rings[n]!;return r.black||r.birthday||r.zodiac||r.talent||r.life;});
 return {id,name,start,end,present:marked.length===digits.length,missing:digits.filter(n=>!marked.includes(n)),marked};
});}
