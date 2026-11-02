/** Storage can throw in Safari private mode, disabled cookies, or when quota is exhausted. */
export function readLocal(key:string):string{try{return window.localStorage.getItem(key)||''}catch{return ''}}
export function writeLocal(key:string,value:string):boolean{try{window.localStorage.setItem(key,value);return true}catch{return false}}
