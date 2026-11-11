import index from '../content/search-index.json';
export const searchIndex=index;
export function searchKnowledge(query='',category='',line=''){
 const terms=query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean).slice(0,8);
 return index.entries.filter(e=>(!category||e.categories.includes(category))&&(!line||e.line===line)&&terms.every(t=>`${e.text} ${e.alt} ${e.heading} ${e.topic} ${e.line??''}`.normalize('NFKC').toLocaleLowerCase().includes(t)));
}
