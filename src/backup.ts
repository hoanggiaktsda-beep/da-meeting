import {openDB,type Meeting} from './storage';

/** Import all rows atomically. A failed put must not leave a partially imported backup. */
export async function saveMeetingsBatch(items:Meeting[]):Promise<void>{
 const db=await openDB();
 return new Promise<void>((resolve,reject)=>{
  let tx:IDBTransaction;
  try{
   tx=db.transaction('meetings','readwrite');
   tx.oncomplete=()=>{db.close();resolve()};
   tx.onerror=()=>{db.close();reject(tx.error||new Error('Lỗi ghi dữ liệu'))};
   tx.onabort=()=>{db.close();reject(tx.error||new Error('Đã hủy nhập dữ liệu'))};
   const store=tx.objectStore('meetings');
   for(const item of items)store.put(item);
  }catch(error){
   try{tx!.abort()}catch{/* transaction may not exist or already be inactive */}
   db.close();
   reject(error);
  }
 });
}
