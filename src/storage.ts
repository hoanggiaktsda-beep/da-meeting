export type Meeting={id:string;title:string;department:string;created_at:string};
const DB_NAME='da-meeting-v03';const STORE='meetings';
export function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function transact<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore,resolve:(value:T)=>void,reject:(error:unknown)=>void)=>void):Promise<T>{const db=await openDB();return new Promise<T>((resolve,reject)=>{const tx=db.transaction(STORE,mode);let value:T;let done=false;tx.oncomplete=()=>{db.close();if(done)resolve(value)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error)};action(tx.objectStore(STORE),v=>{value=v;done=true},reject)})}
export const listMeetings=()=>transact<Meeting[]>('readonly',(store,resolve,reject)=>{const req=store.getAll();req.onsuccess=()=>resolve((req.result as Meeting[]).sort((a,b)=>b.created_at.localeCompare(a.created_at)));req.onerror=()=>reject(req.error)});
export const saveMeeting=(m:Meeting)=>transact<void>('readwrite',(store,resolve,reject)=>{const req=store.put(m);req.onsuccess=()=>resolve(undefined);req.onerror=()=>reject(req.error)});
export const deleteMeeting=(id:string)=>transact<void>('readwrite',(store,resolve,reject)=>{const req=store.delete(id);req.onsuccess=()=>resolve(undefined);req.onerror=()=>reject(req.error)});

export async function importMeetingsAtomic(meetings:Meeting[]):Promise<void>{
 const db=await openDB();
 try{await new Promise<void>((resolve,reject)=>{
  let tx:IDBTransaction;
  try{tx=db.transaction(STORE,'readwrite');for(const m of meetings)tx.objectStore(STORE).put(m)}
  catch(e){try{tx!.abort()}catch{}reject(e);return}
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>reject(tx.error||new Error('Import transaction failed'));
  tx.onabort=()=>reject(tx.error||new Error('Import aborted'));
 })}finally{db.close()}
}
