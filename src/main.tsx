import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

type Meeting={id:string;title:string;department:string;created_at:string};
const API=(import.meta.env.VITE_API_BASE_URL||'http://localhost:8000')+'/api/v1';
const departments=['Chung','Bán hàng','Sản xuất','Marketing','Thiết kế','Vận hành','Tài chính'];
function App(){
 const [name,setName]=React.useState('');
 const [department,setDepartment]=React.useState('Chung');
 const [meetings,setMeetings]=React.useState<Meeting[]>([]);
 const [status,setStatus]=React.useState<'loading'|'connected'|'offline'>('loading');
 const [error,setError]=React.useState('');
 async function refresh(){try{const res=await fetch(API+'/meetings');if(!res.ok)throw Error('Không thể đọc dữ liệu');setMeetings(await res.json());setStatus('connected');setError('')}catch{setStatus('offline')}}
 React.useEffect(()=>{void refresh()},[]);
 async function submit(e:React.FormEvent){e.preventDefault();if(!name.trim())return;setError('');try{const res=await fetch(API+'/meetings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:name,department})});if(!res.ok)throw Error('Không thể tạo cuộc họp');setName('');await refresh()}catch{setError('Không kết nối được máy chủ nội bộ. Dữ liệu chưa được lưu.');setStatus('offline')}}
 return <main><header><strong>D&A <span>Meeting</span></strong><small>POWERED BY HOANGGIA AI</small></header>
 <section className="hero"><p className="eyebrow">AI EXECUTIVE SECRETARY · V0.2 LOCAL FOUNDATION</p><h1>Điều hành cuộc họp.<br/>Rõ từng quyết định.</h1><p>Quản lý cuộc họp showroom trên máy chủ nội bộ. Ghi âm, phiên âm và 17 AI Expert đang được phát triển.</p>
 <div className="status" role="status"><span className={'dot '+status}/>{status==='connected'?'Đã kết nối máy chủ nội bộ':status==='loading'?'Đang kết nối':'Chưa kết nối API nội bộ'}</div>
 <div className="panel"><h2>Tạo cuộc họp</h2><form onSubmit={submit}><label>Tên cuộc họp<input aria-label="Tên cuộc họp" placeholder="Ví dụ: Họp vận hành showroom" value={name} maxLength={200} onChange={e=>setName(e.target.value)}/></label><label>Bộ phận<select value={department} onChange={e=>setDepartment(e.target.value)}>{departments.map(d=><option key={d}>{d}</option>)}</select></label><button disabled={status!=='connected'}>Lưu cuộc họp</button></form>{error&&<p role="alert" className="error">{error}</p>}<p className="hint">Dữ liệu lưu trong SQLite trên máy chạy API, không gửi lên GitHub.</p></div>
 <div className="panel"><div className="panel-head"><h2>Cuộc họp ({meetings.length})</h2><button className="secondary" type="button" onClick={()=>void refresh()}>Làm mới</button></div>{meetings.length?meetings.map(m=><div className="meeting" key={m.id}><strong>{m.title}</strong><span>{m.department} · {m.created_at} UTC</span></div>):<p className="hint">{status==='connected'?'Chưa có cuộc họp.':'Khởi động API nội bộ để xem dữ liệu.'}</p>}</div></section>
 <footer>© 2026 HOANGGIA AI · Local-first preview · Chưa sẵn sàng cho dữ liệu nhạy cảm</footer></main>
}
createRoot(document.getElementById('root')!).render(<App/>);
