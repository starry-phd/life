import {describe,it,expect} from 'vitest';
import {assertDeploymentAccount} from '../scripts/deployment-account.mjs';
describe('Cloudflare account policy',()=>{
 it('allows only the owner-designated paid account',()=>{expect(()=>assertDeploymentAccount({name:'starry.phd@gmail.com'})).not.toThrow();});
 it.each([{name:'yukidu@gmail.com'},{name:'another-account'},null,{}])('rejects a wrong or unverifiable account: %j',account=>{expect(()=>assertDeploymentAccount(account)).toThrow('部署已阻擋');});
});
