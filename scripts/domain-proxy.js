// The zone stays in its existing account; application code and data stay in the requested account.
export default {async fetch(request){
 const target=new URL(request.url);target.hostname='life-api.yukidu.workers.dev';
 return fetch(new Request(target,request));
}};
