import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

function loadTypeScript(path, dependencies={},context={}){
 const js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 runInNewContext(js,{exports,require:(name)=>dependencies[name],...context});
 return exports;
}
test('local storage is safe when browser denies access',()=>{
 const local=loadTypeScript('src/local.ts',{}, {window:{localStorage:{getItem(){throw new Error('denied')},setItem(){throw new Error('denied')}}}});
 assert.equal(local.readLocal('key'),'');
 assert.equal(local.writeLocal('key','value'),false);
});
test('local storage reads and writes values when permitted',()=>{
 const entries=new Map();
 const local=loadTypeScript('src/local.ts',{}, {window:{localStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)}}});
 assert.equal(local.writeLocal('notes','hello'),true);
 assert.equal(local.readLocal('notes'),'hello');
});
test('backup import uses one transaction and commits on completion',async()=>{
 const rows=[];let closed=false;
 const tx={objectStore:()=>({put:item=>rows.push(item)})};
 const db={transaction:(name,mode)=>{assert.equal(name,'meetings');assert.equal(mode,'readwrite');return tx},close:()=>{closed=true}};
 const backup=loadTypeScript('src/backup.ts',{'./storage':{openDB:async()=>db}});
 const data=[{id:'a',title:'A',department:'Chung',created_at:'2026-10-12T00:00:00Z'}];
 const result=backup.saveMeetingsBatch(data);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(rows.length,1);
 tx.oncomplete();
 await result;
 assert.equal(closed,true);
});
test('backup import rejects on transaction error',async()=>{
 let closed=false;
 const tx={objectStore:()=>({put:()=>{}})};
 const db={transaction:()=>tx,close:()=>{closed=true}};
 const backup=loadTypeScript('src/backup.ts',{'./storage':{openDB:async()=>db}});
 const result=backup.saveMeetingsBatch([{id:'b'}]);
 await new Promise(resolve=>setImmediate(resolve));
 tx.error=new Error('quota');tx.onerror();
 await assert.rejects(result,/quota/);
 assert.equal(closed,true);
});
test('JSON backup includes Meet notes and validates optional Meet fields',()=>{
 const ui=readFileSync('src/main.tsx','utf8');
 assert.match(ui,/meet:\{link:meetLink,notes:liveNotes\}/);
 assert.match(ui,/saveMeetingsBatch\(parsed.meetings\)/);
 assert.match(ui,/parsed.meet!==undefined/);
 assert.match(ui,/KHÔNG chứa âm thanh/);
});
