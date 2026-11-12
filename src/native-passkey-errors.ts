export function nativePasskeyError(value:unknown):Error {
 const code=typeof value==='object'&&value!==null&&'error'in value?String(value.error):'';
 const error=new Error('Passkey could not be completed');
 error.name=code==='UserCancelled'?'UserCancelled':code==='CredentialAlreadyExists'?'InvalidStateError':code==='NotSupported'?'NotSupportedError':'PasskeyFailed';
 return error;
}
