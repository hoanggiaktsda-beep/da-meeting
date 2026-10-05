export type RecordingState='idle'|'recording'|'stopping';
export function supported(){return !!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined'}
export async function startRecording(onStop:(blob:Blob)=>void,onError:(message:string)=>void){
 if(!supported())throw Error('Trình duyệt không hỗ trợ ghi âm');
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const types=['audio/webm;codecs=opus','audio/mp4','audio/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
 let recorder:MediaRecorder;
 try{recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 const chunks:BlobPart[]=[];
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
 recorder.onerror=()=>onError('Ghi âm gặp lỗi. Vui lòng kiểm tra tệp đã tải xuống.');
 recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(chunks.length)onStop(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));else onError('Không thu được dữ liệu ghi âm.')};
 recorder.start(10000);
 return recorder;
}
export function downloadRecording(blob:Blob){const ext=blob.type.includes('mp4')?'m4a':'webm';const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='da-meeting-'+new Date().toISOString().replace(/[:.]/g,'-')+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
