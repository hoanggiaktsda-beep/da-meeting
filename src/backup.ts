import {openDB,type Meeting} from './storage';
export async function saveMeetingsBatch(items:Meeting[]):Promise<void>{
 const db=await openDB();
 return new Promise<void>((resolve,reject)=>{
  const tx=db.transaction('meetings','readwrite');
  tx.oncomplete=()=>{db.close();resolve()};
  tx.onerror=()=>{db.close();reject(tx.error)};
  tx.onabort=()=>{db.close();reject(tx.error)};
  for(const item of items)tx.objectStore('meetings').put(item);
 });
}
