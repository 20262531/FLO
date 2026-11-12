# FLO · Hotel Operations 1.2

ระบบงานโรงแรมและบอร์ดห้อง 320 ห้อง รุ่น Pilot สำหรับพัฒนาต่อ

## อัปโหลดขึ้น GitHub

1. แตก ZIP นี้ก่อน
2. สร้าง repository ใหม่ แนะนำ Private สำหรับโค้ดระบบภายในโรงแรม
3. อัปโหลดไฟล์และโฟลเดอร์ภายในให้ `package.json` และ `README.md` อยู่ระดับบนสุดของ repository
4. ต้องรวม `.github`, `.openai`, `.gitignore` และ `.npmrc` ด้วย หากใช้หน้าต่างเลือกไฟล์ให้เปิดแสดงไฟล์ซ่อน
5. Commit ไฟล์ GitHub Actions จะตรวจ TypeScript และการ build เมื่อเปิดใช้ Actions

ZIP นี้ไม่มี Git history, node_modules, ฐานข้อมูลทดสอบ, รูปทดสอบ, token หรือรหัสเว็บไซต์ส่วนตัว โค้ดฐานข้อมูลและ migration รวมมาครบแล้ว

**GitHub เก็บโค้ด ส่วน GitHub Pages ไม่สามารถรันระบบนี้ครบได้** เพราะ FLO ต้องใช้เซิร์ฟเวอร์ ฐานข้อมูล D1 พื้นที่รูป R2 และระบบตรวจตัวตน

## ความสามารถ

- งาน FO / HK / ENG / FB พร้อมสิทธิ์ตามบทบาท
- รับงาน เริ่มทำ พักพร้อมเวลาติดตาม ส่งตรวจ ปิด และเปิดซ้ำ
- งานย่อย รายการตรวจ ข้อความ รูป และประวัติ
- ส่งต่อกะโดยผู้รับใหม่ต้องยืนยัน
- บอร์ดห้องขนาดกะทัดรัดและตาราง กรองตึก/โซน/สถานะ ค้นหาและแบ่งหน้า
- เลขขึ้นต้น 1 = ตึก A, 2 = ตึก B, 3 = ตึก C
- นำเข้าห้องหลายรายการพร้อมกัน โดยไม่เขียนทับห้องเดิม

[คู่มือใช้งานภาษาไทย](docs/USER-GUIDE-TH.md)

## ทดลองในเครื่องผู้พัฒนา

ต้องมี Node.js 24 และ npm เปิด terminal ที่โฟลเดอร์นี้แล้วรัน:

```sh
npm ci
npm run typecheck
npm run build
```

สร้างตารางในฐานทดลองภายในเครื่อง โดยรัน migration เรียงลำดับครั้งเดียวต่อฐานใหม่:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_uneven_lilandra.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_orange_rage.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_task_guardrails.sql
npm run dev -- --host 127.0.0.1
```

เปิด URL Local ที่ terminal แสดง กดเข้าสู่ระบบเพื่อใช้บัญชีจำลองสำหรับพัฒนาภายในเครื่อง บัญชีจำลองไม่ได้เป็นบัญชีโรงแรมจริง และไม่ใช้ล็อกอิน production

อย่า replay migration บนฐานที่สร้างไว้แล้ว ให้ใช้เฉพาะไฟล์ใหม่ที่ยังไม่เคยรัน

## การเผยแพร่และการเข้าสู่ระบบ — อ่านก่อน deploy

รุ่นนี้ยังใช้โครงสร้างของ Sites และ ChatGPT sign-in โดยอ่านตัวตนจาก header ที่แพลตฟอร์มตรวจสอบแล้ว การสร้างชื่อพนักงานในแอปไม่ใช่การให้สิทธิ์เข้าชมเว็บไซต์โดยอัตโนมัติ

- เผยแพร่ผ่าน Sites: ลงทะเบียนเว็บไซต์ปลายทางเพื่อรับ project ID ใหม่ ตั้งค่า `.openai/hosting.json` สำหรับเว็บไซต์นั้น และใช้ workflow ของ Sites เพื่อสร้าง D1/R2 และใช้ migrations
- ห้ามใช้ชื่อบัญชีจำลองของ local dev ใน production
- ห้ามนำ Worker ไปเปิดสาธารณะบนโฮสต์อื่นโดยเชื่อถือ header `oai-authenticated-user-*` จากผู้เข้าชมโดยตรง เพราะ header จากอินเทอร์เน็ตไม่ได้เป็นหลักฐานการยืนยันตัวตน
- หากเปลี่ยนไปโฮสต์เอง ต้องเปลี่ยนชั้นล็อกอินและการตรวจ session ให้เป็นการตรวจตัวตนที่เชื่อถือได้ก่อน กำหนดผู้จัดการเริ่มต้นอย่างชัดเจน แล้วตรวจสิทธิ์ทุก API ทั้งงานและรูป
- ค่า D1 placeholder ในไฟล์ build สำหรับ local ไม่ใช่ฐาน production ของคุณ
- ชุดนี้ไม่มี workflow deploy อัตโนมัติ และไม่เปลี่ยนเว็บไซต์ FLO ที่ใช้อยู่

## การทดสอบ

```sh
node tests/operations.test.mjs
node tests/pilot11.test.mjs
node tests/rooms320.test.mjs
```

ใช้เฉพาะ server local ที่เปิดอยู่พร้อมฐานทดสอบ บัญชี local ต้องเป็นผู้จัดการ และชุดทดสอบเริ่มต้นควรใช้ฐานทดลองใหม่ แต่ละไฟล์สร้างข้อมูลทดสอบจริงในฐาน local ไม่ใช่ dry-run จึงไม่ควรรันบนฐานที่ต้องเก็บใช้งาน

GitHub Actions ตรวจการ build/typecheck เท่านั้น ไม่ได้รันชุดทดสอบที่ต้องมี server และฐาน local เปิดอยู่

## ยังไม่ใช่ PWA พร้อมใช้เต็มรูปแบบ

รุ่นนี้เป็นเว็บแอปที่รองรับมือถือ ยังต้องพัฒนา install manifest/service worker, การแจ้งเตือนเบื้องหลัง, คิวงานเมื่อออฟไลน์, งานตามตาราง, การจัดเวร และ PMS ก่อนใช้งานตามแผนระยะถัดไป การสำรอง JSON จากหน้ารายงานไม่ใช่สำเนาครบทั้งระบบหรือไฟล์รูป

## โครงสร้าง

- `app/operations.tsx` หน้าจองานและทีม
- `app/room-board.tsx` บอร์ดห้อง
- `app/api/operations/route.ts` งาน ห้อง สิทธิ์ และประวัติ
- `app/api/photos/route.ts` รูปและการตรวจสิทธิ์
- `lib/workflow.ts` กฎสถานะ
- `db/` และ `drizzle/` ฐานข้อมูลและ migrations
- `scripts/`, `worker/`, `vite.config.ts` เครื่องมือ build และ runtime
- `.github/workflows/check.yml` ตรวจโค้ดเมื่อ push

คงไฟล์ประกาศสิทธิ์ของส่วนประกอบ third-party ไว้ในชุดนี้ การใช้โค้ดร่วมกับบริการภายนอกต้องตั้งค่าบริการของผู้ใช้งานเอง
