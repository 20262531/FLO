export const statuses=['new','assigned','accepted','progress','waiting','review','closed','cancelled'];
export const labels:Record<string,string>={new:'งานใหม่',assigned:'มอบหมายแล้ว',accepted:'รับงานแล้ว',progress:'กำลังทำ',waiting:'รอดำเนินการ',review:'รอตรวจ',closed:'ปิดงาน',cancelled:'ยกเลิก'};
export const templates=[{title:'ขอผ้าเช็ดตัวเพิ่ม',dept:'HK',minutes:15},{title:'ทำความสะอาดห้อง',dept:'HK',minutes:45},{title:'แอร์ไม่เย็น',dept:'ENG',minutes:30},{title:'น้ำรั่ว / ระบบประปา',dept:'ENG',minutes:30},{title:'ส่งอาหาร / เครื่องดื่ม',dept:'FB',minutes:30},{title:'คำขอทั่วไป',dept:'FO',minutes:30}];
export function canSee(u:any,t:any){return ['manager','fo'].includes(u.role)||t.department===u.department||t.createdBy===u.email;}
export function canManage(u:any,t:any){return ['manager','fo'].includes(u.role)||u.role==='supervisor'&&u.department===t.department;}
export function validateTransition(u:any,t:any,next:string,reason:string){
 if(!canSee(u,t))throw Error('ไม่มีสิทธิ์เข้าถึงงานนี้');
 const manager=canManage(u,t),own=t.assignee===u.email;
 const edges:Record<string,string[]>={new:['assigned','accepted','cancelled'],assigned:['assigned','accepted','cancelled'],accepted:['progress','assigned','cancelled'],progress:['waiting','review','assigned','cancelled'],waiting:['progress','assigned','cancelled'],review:['closed','progress'],closed:['progress'],cancelled:[]};
 if(!(edges[t.status]||[]).includes(next))throw Error('ไม่สามารถเปลี่ยนสถานะตามลำดับนี้ได้');
 if(['assigned','closed','cancelled'].includes(next)||next==='progress'&&['review','closed'].includes(t.status)){if(!manager)throw Error('ต้องให้ FO หรือหัวหน้าจัดการ');}
 else if(next==='accepted'){if(t.assignee&&!own)throw Error('งานนี้มีผู้รับผิดชอบแล้ว');if(!manager&&u.department!==t.department)throw Error('รับงานได้เฉพาะแผนกตัวเอง');}
 else if(!manager&&!own)throw Error('เฉพาะผู้รับผิดชอบงานเท่านั้น');
 if((['waiting','cancelled'].includes(next)||['review','closed'].includes(t.status)&&next==='progress')&&!reason.trim())throw Error('กรุณาระบุเหตุผล');
}

