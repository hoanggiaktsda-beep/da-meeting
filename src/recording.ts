export type RecordingState='idle'|'recording'|'stopping';
export const MAX_RECORDING_MS=10*60*60*1000;
export const CHUNK_MS=10000;
export async function storageEstimate(){return navigator.storage?.estimate?.() ?? {usage:undefined,quota:undefined}}
export async function requestPersistentStorage(){return navigator.storage?.persist?.() ?? false}
export function formatDuration(ms:number){const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(v=>String(v).padStart(2,'0')).join(':')}

const DB='da-meeting-audio-v05',STORE='chunks';
function openAudioDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:['session','index']})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function writeChunk(session:string,index:number,data:Blob):Promise<void>{const db=await openAudioDB();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({session,index,data});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
export async function recoverRecording(session:string):Promise<Blob>{const db=await openAudioDB();try{return await new Promise<Blob>((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).getAll();r.onsuccess=()=>{const parts=(r.result as {session:string;index:number;data:Blob}[]).filter(x=>x.session===session).sort((a,b)=>a.index-b.index);resolve(new Blob(parts.map(x=>x.data),{type:parts[0]?.data.type||'audio/webm'}))};r.onerror=()=>reject(r.error)})}finally{db.close()}}
export async function listSavedSessions():Promise<string[]>{const db=await openAudioDB();try{return await new Promise<string[]>((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAllKeys();r.onsuccess=()=>resolve([...new Set((r.result as [string,number][]).map(k=>k[0]))]);r.onerror=()=>reject(r.error)})}finally{db.close()}}
export async function downloadSavedChunks(session:string){const db=await openAudioDB();try{const records=await new Promise<{session:string;index:number;data:Blob}[]>((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const parts=records.filter(r=>r.session===session).sort((a,b)=>a.index-b.index);if(!parts.length)throw Error('Không tìm thấy dữ liệu');const batch=60;for(let i=0;i<parts.length;i+=batch){const slice=parts.slice(i,i+batch);downloadRecording(new Blob(slice.map(p=>p.data),{type:slice[0].data.type}),session+'-part-'+String(1+Math.floor(i/batch)).padStart(3,'0'))}return Math.ceil(parts.length/batch)}finally{db.close()}}
export function supported(){return !!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined'}
export async function startRecording(onStop:(blob:Blob)=>void,onError:(message:string)=>void){
 if(!supported())throw Error('Trình duyệt không hỗ trợ ghi âm');
 const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1}});
 const types=['audio/webm;codecs=opus','audio/mp4','audio/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
 let recorder:MediaRecorder;
 try{recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 const session=crypto.randomUUID();localStorage.setItem('da-meeting-last-audio-session',session);
 let index=0;let pending=Promise.resolve();let failed=false;
 recorder.ondataavailable=e=>{if(!e.data.size)return;const chunk=e.data;const i=index++;pending=pending.then(()=>writeChunk(session,i,chunk)).catch(()=>{failed=true;onError('Không lưu được đoạn âm thanh. Kiểm tra dung lượng thiết bị và dừng ghi để bảo vệ dữ liệu.')})};
 recorder.onerror=()=>{onError('Ghi âm gặp lỗi. Hãy dừng ghi và kiểm tra các đoạn đã lưu.');stream.getTracks().forEach(t=>t.stop())};
 stream.getAudioTracks().forEach(track=>track.addEventListener('ended',()=>{onError('Microphone bị ngắt. Chỉ các đoạn đã lưu có thể khôi phục.');if(recorder.state!=='inactive')recorder.stop()}));
 recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());void pending.then(async()=>{const blob=await recoverRecording(session);if(blob.size)onStop(blob);else onError('Không có dữ liệu ghi âm đã lưu.');if(failed)onError('Một số đoạn ghi âm có thể đã mất.')}).catch(()=>onError('Không đọc được bản ghi đã lưu.'))};
 try{recorder.start(CHUNK_MS)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 return recorder;
}
export function downloadRecording(blob:Blob,filename?:string){const ext=blob.type.includes('mp4')?'m4a':'webm';const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='da-meeting-'+(filename||new Date().toISOString().replace(/[:.]/g,'-'))+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
