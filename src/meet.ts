export function validMeetLink(input:string){try{const u=new URL(input.trim());return u.protocol==='https:'&&u.hostname==='meet.google.com'&&/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/.test(u.pathname)}catch{return false}}
export function supportsTabAudio(){return !!navigator.mediaDevices?.getDisplayMedia&&typeof MediaRecorder!=='undefined'}
export async function captureMeetTab(onChunk:(blob:Blob)=>void,onEnd:()=>void){
 if(!supportsTabAudio())throw Error('Trình duyệt không hỗ trợ chia sẻ tab');
 const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
 if(!stream.getAudioTracks().length){stream.getTracks().forEach(t=>t.stop());throw Error('Không có âm thanh. Chọn tab Meet và bật chia sẻ âm thanh tab.')}
 const types=['audio/webm;codecs=opus','audio/mp4','audio/webm'];
 const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
 let recorder:MediaRecorder;
 try{recorder=new MediaRecorder(new MediaStream(stream.getAudioTracks()),mime?{mimeType:mime}:undefined)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 let ended=false;const finish=()=>{if(ended)return;ended=true;stream.getTracks().forEach(t=>t.stop());onEnd()};
 recorder.ondataavailable=e=>{if(e.data.size)onChunk(e.data)};
 recorder.onstop=finish;
 stream.getTracks().forEach(t=>t.addEventListener('ended',()=>{if(recorder.state!=='inactive')recorder.stop();else finish()}));
 try{recorder.start(10000)}catch(e){stream.getTracks().forEach(t=>t.stop());throw e}
 return {stop:()=>{if(recorder.state!=='inactive')recorder.stop();else finish()},recorder};
}
export function summarizeNotes(text:string){const lines=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);const matching=(words:string[])=>lines.filter(x=>words.some(w=>x.toLocaleLowerCase('vi').includes(w)));return {decisions:matching(['quyết định','thống nhất','chốt','duyệt']),tasks:matching(['cần làm','phụ trách','deadline','hạn chót','giao cho']),notes:lines.slice(-12)}}
