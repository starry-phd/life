import {Platform} from 'react-native';
import {nativePasskeyError} from './passkey-errors';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as Browser from 'expo-web-browser';
import * as Device from 'expo-device';
import * as Keychain from 'react-native-keychain';
import {Passkey,type PasskeyGetRequest,type PasskeyCreateRequest} from 'react-native-passkey';
import {StarryClient,type StarryStorage} from '../vendor/starry-client';
const storage:StarryStorage={get:k=>SecureStore.getItemAsync(k,{keychainService:'phd.starry.life.session'}),set:(k,v)=>SecureStore.setItemAsync(k,v,{keychainService:'phd.starry.life.session'}),remove:k=>SecureStore.deleteItemAsync(k,{keychainService:'phd.starry.life.session'})};
// The shared group is first in keychain-access-groups, so it is the default access group.
// The OS expands AppIdentifierPrefix at signing; no Apple Team ID is copied into App code.
const sharedStorage:StarryStorage={async get(key){const r=await Keychain.getGenericPassword({service:key});return r?r.password:null;},async set(key,value){await Keychain.setGenericPassword(key,value,{service:key,accessible:Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY});},async remove(key){await Keychain.resetGenericPassword({service:key});}};
export const starry=new StarryClient({baseUrl:'https://id.starry.phd',appId:'life',storage,sharedStorage:Platform.OS==='ios'?sharedStorage:undefined,deviceLabel:Device.modelName??Platform.OS,
 sha256Hex:s=>Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,s),randomState:()=>Crypto.randomUUID(),
 openAuthSession:async(url,returnUrl)=>{const r=await Browser.openAuthSessionAsync(url,returnUrl);return r.type==='success'?r.url:null;},
 passkey:{async get(options){const r=await Passkey.get(options as unknown as PasskeyGetRequest).catch(e=>{throw nativePasskeyError(e);});return {id:r.id,...r.response};},async create(options){const r=await Passkey.create(options as unknown as PasskeyCreateRequest).catch(e=>{throw nativePasskeyError(e);});return r.response;}},
});
export const APP_VERSION='0.1.0',HANDOFF_VERSION='2026-11-09.6';
export async function api(path:string,body?:unknown){const token=await starry.getAccessToken();const r=await fetch('https://life.starry.phd'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();if(!r.ok)throw new Error(data.error?.message??'服務暫時無法使用');return data;}
