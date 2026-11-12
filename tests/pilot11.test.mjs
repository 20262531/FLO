import assert from 'node:assert/strict';
let n=0;const base='http://127.0.0.1:5173/api/operations',headers={cookie:'__sites_local_auth=1','Content-Type':'application/json'};
async function req(b,status=200){const r=await fetch(base,{headers,method:b?'POST':'GET',body:b?JSON.stringify(b):undefined}),j=await r.json();assert.equal(r.status,status,JSON.stringify(j));n++;return j;}
async function task(id){return (await req()).tasks.find(t=>t.id===id)}
async function move(id,status,extra={},expected=200){const t=await task(id);return req({action:'task',id,version:t.version,status,...extra},expected)}
const id=crypto.randomUUID();await req({action:'create',id,title:'QA 1.1',department:'HK',minutes:20,checklist:'ตรวจงาน'});
let t=await task(id);const payload={action:'task',id,version:t.version,status:'accepted'};const concurrent=await Promise.all([fetch(base,{headers,method:'POST',body:JSON.stringify(payload)}),fetch(base,{headers,method:'POST',body:JSON.stringify(payload)})]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);n++;
await move(id,'progress');await move(id,'waiting',{reason:'รอแขก'},400);await move(id,'waiting',{reason:'รอแขก',followUpAt:new Date(Date.now()+600000).toISOString()});await move(id,'progress');
t=await task(id);await req({action:'checklist',id,version:t.version,index:0,done:true});await move(id,'review');t=await task(id);await req({action:'checklist',id,version:t.version,index:0,done:false},400);
const child=crypto.randomUUID();await req({action:'create',id:child,title:'งานย่อย',department:'HK',minutes:20,parentId:id});await move(id,'closed',{},400);await move(child,'cancelled',{reason:'ทดสอบ'});await move(id,'closed');await req({action:'create',id:crypto.randomUUID(),title:'เพิ่มหลังปิด',department:'HK',minutes:20,parentId:id},400);
await move(id,'progress',{reason:'ทดสอบส่งกะ'});
await req({action:'member',email:'handover-test@example.test',name:'กะถัดไป',department:'HK',role:'staff'});
t=await task(id);await req({action:'handover',id,version:t.version,recipient:'handover-test@example.test',note:'ติดตามแขก'});t=await task(id);assert.equal(t.assignee,'seedy@sites.test');assert.equal(t.handover.recipient,'handover-test@example.test');n++;
await req({action:'receive',id,version:t.version},400);
const h=await fetch(base+'?task='+id,{headers});const history=await h.json();assert.ok(history.some(e=>e.message.includes('ส่งต่อกะ')));n++;
await move(id,'assigned',{assignee:'handover-test@example.test'});t=await task(id);await req({action:'handover',id,version:t.version,recipient:'seedy@sites.test',note:'รับช่วงกลับ'});t=await task(id);await req({action:'receive',id,version:t.version});t=await task(id);assert.equal(t.assignee,'seedy@sites.test');assert.equal(t.handover,null);assert.ok(t.lastHandover.receivedAt);n++;
console.log(JSON.stringify({checks:n,passed:true,scope:'local; concurrent requests, checklist lock, parent-child lifecycle, follow-up, pending handover and recipient authorization, task history'}));
