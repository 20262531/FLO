import assert from 'node:assert/strict';
const url='http://127.0.0.1:5173/api/operations',headers={cookie:'__sites_local_auth=1','Content-Type':'application/json'};let checks=0;
async function req(b,code=200){const r=await fetch(url,{method:b?'POST':'GET',headers,body:b?JSON.stringify(b):undefined});const j=await r.json();assert.equal(r.status,code,JSON.stringify(j));checks++;return j;}
const stamp=Date.now().toString(36);const rooms=Array.from({length:320},(_,i)=>({id:(i<120?'1':i<220?'2':'3')+'T'+stamp+i,zone:'โซนทดสอบ '+(Math.floor(i/40)+1)}));
const result=await req({action:'rooms-import',rooms});assert.equal(result.added,320);checks++;const again=await req({action:'rooms-import',rooms});assert.equal(again.added,0);checks++;
await req({action:'rooms-import',rooms:[{id:'999'}]},400);await req({action:'rooms-import',rooms:[rooms[0],rooms[0]]},400);
let d=await req();const first=d.rooms.find(r=>r.id===rooms[0].id);assert.equal(first.cleaning,'unknown');assert.equal(first.service,'unknown');checks+=2;
await req({action:'room',...first,cleaning:'inspected',service:'out',zone:'ตรวจสอบการเก็บโซน'});await req({action:'rooms-import',rooms:[rooms[0]]});d=await req();const updated=d.rooms.find(r=>r.id===first.id);assert.equal(updated.cleaning,'inspected');assert.equal(updated.service,'out');assert.equal(updated.zone,'ตรวจสอบการเก็บโซน');checks+=3;
console.log(JSON.stringify({passed:true,checks,imported:320,scope:'local only; duplicates, invalid IDs, unknown defaults, preserved existing room state and zones'}));
