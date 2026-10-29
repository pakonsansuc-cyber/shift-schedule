# ตั้งค่า Google Login (ต้องทำครั้งเดียว)

เว็บเชื่อม Supabase เรียบร้อยแล้ว เหลือเปิดใช้ **Google OAuth** ซึ่งต้องใช้บัญชี Google
ของคุณเอง (Claude ทำแทนไม่ได้) ทำตามนี้ประมาณ 5–10 นาที

## ข้อมูลโปรเจกต์ Supabase (บัญชีบริษัท)
- Org: **pakonsansuc-cyber's Org**
- Project: **shift-schedule**
- Project ref: `ehifpqvnphsuflwbgdxn`
- Dashboard: https://supabase.com/dashboard/project/ehifpqvnphsuflwbgdxn
- **Callback URL** (ใช้ตอนตั้งค่า Google):
  `https://ehifpqvnphsuflwbgdxn.supabase.co/auth/v1/callback`

---

## 1) สร้าง Google OAuth Client
1. เปิด https://console.cloud.google.com/apis/credentials (เลือก/สร้างโปรเจกต์)
2. ถ้ายังไม่เคยตั้ง **OAuth consent screen**: ตั้งเป็น **External**, ใส่ชื่อแอป +
   อีเมล, เพิ่มตัวเองใน **Test users** (ขณะยังไม่ publish)
3. **Create Credentials → OAuth client ID → Web application**
4. ช่อง **Authorized redirect URIs** ใส่:
   ```
   https://ehifpqvnphsuflwbgdxn.supabase.co/auth/v1/callback
   ```
5. กด Create แล้วก็อป **Client ID** และ **Client Secret** ไว้

## 2) เปิด Google provider ใน Supabase
1. ไปที่ **Authentication → Sign In / Providers → Google**
   (https://supabase.com/dashboard/project/ehifpqvnphsuflwbgdxn/auth/providers)
2. เปิด (Enable) แล้ววาง **Client ID** + **Client Secret** จากขั้นที่ 1 → Save

## 3) ตั้ง Redirect URLs ของแอป
ไปที่ **Authentication → URL Configuration**
(https://supabase.com/dashboard/project/ehifpqvnphsuflwbgdxn/auth/url-configuration)
- **Site URL**: `http://localhost:3000`
- **Redirect URLs** เพิ่ม: `http://localhost:3000/**`
  (ภายหลัง deploy แล้วค่อยเพิ่มโดเมนจริง เช่น `https://your-app.netlify.app/**`)

## 4) ทดสอบ
1. รัน `npm run dev` ในโฟลเดอร์ `shift-schedule`
2. เปิด http://localhost:3000 → กด **เข้าสู่ระบบด้วย Google**
3. ล็อกอินด้วย **เมลบริษัทของคุณ** → จะกลายเป็นแอดมิน "นาย" อัตโนมัติ
   (ต้องตั้งอีเมลนี้ในสมาชิก "นาย" ก่อน — บอก Claude แล้วจะตั้งให้ หรือทำใน
   Table Editor → members เองก็ได้)

> อยากให้คนอื่นในทีมใช้ด้วย: ให้แอดมินเพิ่มอีเมล Google ของเขาในช่อง email ของ
> สมาชิก (นาย/อาร์ม/ชมพู่) แล้วพอเขาล็อกอินครั้งแรกระบบจะผูกให้อัตโนมัติ

---

## รันในเครื่องหลังเน็ตบริษัท (Zscaler)
เน็ตบริษัทใช้ **Zscaler** ดักเซ็น HTTPS ด้วย root CA ของตัวเอง — Node จะต่อ Supabase
ไม่ได้ (error `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` / "fetch failed" ตอนล็อกอิน)
แก้ครั้งเดียวต่อเครื่อง:

```bash
npm run setup:ca   # ดึง Zscaler root CA จาก keychain มาไว้ที่ certs/local-ca.pem
npm run dev        # dev script ตั้ง NODE_EXTRA_CA_CERTS ให้เอง
```

ไฟล์ `certs/local-ca.pem` ถูก gitignore ไว้ (เฉพาะเครื่อง) — เครื่องที่ไม่ได้อยู่หลัง
proxy ไม่ต้องรัน setup นี้ก็ได้
