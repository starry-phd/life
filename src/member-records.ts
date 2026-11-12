import {validBirthday,type ChartInput} from './numerology';
import type {Me} from '../vendor/starry-client';
export interface NamedInput extends ChartInput {name:string;subject:'self'|'other'}
export interface SavedRecord {id:string;name:string;birthday:string;subject:'self'|'other';category:string;created_at:number;payload?:string}
export const emptyInput:NamedInput={name:'',birthday:'',mode:'original',blood:'unknown',subject:'other'};
export function memberInput(me:Me):NamedInput {const birthday=typeof me.profile.birthday==='string'&&validBirthday(me.profile.birthday)?me.profile.birthday:'';return {...emptyInput,name:String(me.profile.shown_name??me.profile.initials??''),birthday,subject:birthday?'self':'other'};}
export function birthdayQuestion(birthday:string){const [y,m,d]=birthday.split('-');return `是否將 ${y}年${Number(m)}月${Number(d)}日，新增為你本人的資料？確認後會新增至繁星中央會員生日。`;}
