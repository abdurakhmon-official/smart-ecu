# Smart ECU — Backend API

Avtomobil ECU diagnostika, proshivka va servis-marketplace platformasi uchun REST API.

Node.js + TypeScript, [Ts.ED](https://tsed.io) (Express ustida), PostgreSQL va Prisma ORM.
Validation uchun Zod, autentifikatsiya uchun JWT.

> Loyiha bosqichma-bosqich quriladi — hozirgi holat quyida tasvirlangan poydevor
> (auth, foydalanuvchilar, fayl yuklash, i18n, admin panel skeletoni). Avtomobil
> katalogi, servis marketplace, buyurtmalar, AI Assistant va h.k. keyingi
> bosqichlarda qo'shiladi.

---

## Mundarija

- [Texnologiyalar](#texnologiyalar)
- [Talablar](#talablar)
- [Ishga tushirish](#ishga-tushirish)
- [Environment o'zgaruvchilari](#environment-ozgaruvchilari)
- [Papka strukturasi](#papka-strukturasi)
- [Autentifikatsiya va rollar](#autentifikatsiya-va-rollar)
- [API hujjatlari](#api-hujjatlari)
- [Javob formati va xatoliklar](#javob-formati-va-xatoliklar)
- [Arxitektura qarorlari](#arxitektura-qarorlari)

---

## Texnologiyalar

| Qatlam     | Texnologiya                    |
| ---------- | ------------------------------ |
| Runtime    | Node.js 20+, TypeScript 5      |
| Framework  | Ts.ED 8 (Express 5 adapter)    |
| Database   | PostgreSQL 14+                 |
| ORM        | Prisma 6                       |
| Validation | Zod 3 (`@repo/contracts`)      |
| Auth       | JWT (`jsonwebtoken`) + argon2/bcrypt |
| Fayl       | S3-compatible storage (presigned URL) |
| Docs       | Swagger UI (OpenAPI 3.0.3)     |
| Security   | helmet, cors, hpp, compression, rate-limit |

---

## Talablar

- Node.js **20 yoki undan yuqori**
- PostgreSQL **14 yoki undan yuqori**
- pnpm

---

## Ishga tushirish

Repo — Turborepo monorepo (`apps/api`, `apps/web`, `packages/contracts`), shuning uchun
o'rnatish va migratsiya root'dan yoki `apps/api` ichidan ishga tushiriladi.

```bash
# 1. Repository'ni klonlash
git clone <repository-url>
cd "smart ecu"

# 2. Paketlarni o'rnatish (postinstall avtomatik `prisma generate` ishlatadi)
pnpm install

# 3. Environment faylini tayyorlash
cp apps/api/.env.sample apps/api/.env
#    .env ichida DATABASE_URL va JWT_SECRET ni to'ldiring

# 4. Postgres + Redis (docker-compose orqali, yoki o'zingiznikini ulang)
docker compose up -d postgres redis

# 5. Bazani yaratish va migration'larni qo'llash
pnpm --filter api db:migrate

# 6. Boshlang'ich admin hisobi
pnpm --filter api db:seed

# 7. Dev serverni ishga tushirish (yoki repo ildizidan `pnpm dev` — api+web birga)
pnpm --filter api dev
```

Server: **http://localhost:9100**
Swagger: **http://localhost:9100/docs**

### Foydali skriptlar

| Skript                    | Vazifasi                                        |
| -------------------------- | ----------------------------------------------- |
| `pnpm --filter api dev`        | Dev server (nodemon + ts-node)                  |
| `pnpm --filter api build`      | TypeScript'ni `dist/` ga kompilyatsiya qilish   |
| `pnpm --filter api typecheck`  | Type xatolarini tekshirish (kod yozmaydi)       |
| `pnpm --filter api db:migrate` | Yangi migration yaratish va qo'llash            |
| `pnpm --filter api db:seed`    | Boshlang'ich ma'lumotlarni yuklash (admin)      |
| `pnpm --filter api db:studio`  | Prisma Studio (baza uchun GUI)                  |
| `pnpm --filter api test`       | Jest testlari                                   |

---

## Environment o'zgaruvchilari

Barchasi `.env.sample` da namuna sifatida keltirilgan.

| O'zgaruvchi          | Majburiy | Default        | Izoh                                              |
| --------------------- | -------- | -------------- | ------------------------------------------------- |
| `DATABASE_URL`         | ✅       | —              | PostgreSQL ulanish satri                          |
| `JWT_SECRET`           | ✅       | —              | Token imzolash kaliti (uzun, tasodifiy)           |
| `JWT_EXPIRES_IN`       | —        | `1d`           | Token amal qilish muddati (`15m`, `12h`, `7d`)    |
| `PORT`                 | —        | `9100` (local) | Server porti                                      |
| `STAGE`                | —        | `local`        | `local` \| `testing` \| `production`              |
| `REDIS_URL`            | —        | —              | Rate-limit, login-guard, token denylist uchun     |
| `AWS_*`                | —        | —              | S3 fayl saqlash (logo, ECU fayllar, hisobotlar)   |
| `SWAGGER_ENABLED`      | —        | `true`         | `false` bo'lsa `/docs` o'chiriladi                |
| `ANTHROPIC_API_KEY`    | —        | —              | AI Assistant (Bosqich 4 dan boshlab kerak)        |
| `YANDEX_MAPS_API_KEY`  | —        | —              | Servis xaritasi (Bosqich 2 dan boshlab kerak)     |

`DATABASE_URL` yoki `JWT_SECRET` bo'lmasa, ilova **ishga tushmaydi va aniq xato beradi**.

---

## Papka strukturasi

```
apps/api/
├── config/              # Stage bo'yicha konfiguratsiya (local / testing / prod)
├── controllers/         # HTTP qatlami — route, decorator, biznes-logika yo'q
│   ├── auth.controller.ts
│   ├── user.controller.ts     # admin: foydalanuvchilar ro'yxati/rol/holat
│   ├── aws.controller.ts      # S3 presigned upload/download
│   └── health.controller.ts
├── services/             # Biznes-logika, validation chaqiruvi, baza bilan ishlash
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── token.service.ts       # logout uchun token denylist
│   └── s3.service.ts
├── inputs/               # Zod sxemalari — barcha kiruvchi ma'lumot shu yerda tekshiriladi
├── middlewares/
│   ├── auth.middleware.ts     # JWT tekshirish + rol nazorati (AdminOnly, ServiceOnly, ...)
│   ├── error.middleware.ts    # Global error handling (yagona nuqta)
│   ├── rate-limit.middleware.ts
│   └── logging.middleware.ts
├── modules/              # Barcha qatlamlar tayanadigan quyi qatlam
│   ├── auth.ts                 # JWT, parol xesh (argon2/bcrypt)
│   ├── db.ts                   # prisma client
│   ├── storage.ts              # S3-compatible fayl saqlash (presigned)
│   └── redis.ts
├── i18n/                 # xabar kataloglari (uz/ru/en) — API javob/xato tarjimasi
├── utils/                # Yordamchi funksiyalar va konstantalar
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── generated/            # Prisma client + Zod tiplari (git'da yo'q, generatsiya qilinadi)
├── index.ts              # Kirish nuqtasi
└── server.ts             # Platforma konfiguratsiyasi, middleware'lar, Swagger
```

**Qatlamlar ajratilgan:** controller faqat so'rovni qabul qiladi va service'ga uzatadi;
service biznes-qoidalarni bajaradi; input sxemalari (`packages/contracts` orqali) validation'ni
ushlab turadi; xatoliklar bitta global filter orqali javobga aylanadi.

---

## Autentifikatsiya va rollar

JWT **Bearer token** orqali:

```http
Authorization: Bearer <accessToken>
```

Login **faqat token** qaytaradi — foydalanuvchi ma'lumoti alohida endpointdan olinadi:

```http
POST /api/v1/auth/signin
{ "email": "user@example.com", "password": "..." }

→ { "success": true,
    "data": { "accessToken": "eyJhbGci...", "tokenType": "Bearer", "expiresIn": 86400 } }
```

### Rollar

| Rol           | Huquqi                                                              |
| -------------- | --------------------------------------------------------------------- |
| **CUSTOMER**   | Avtomobil egasi — ro'yxatdan o'tgan har bir yangi foydalanuvchi shu rol bilan boshlaydi |
| **SERVICE**    | Avtoservis/ECU usta — o'z profili va buyurtmalar kabinetiga ega (Bosqich 2) |
| **TUNER**      | Professional ECU tuner — fayl boshqaruvi va dashboard (Bosqich 6)     |
| **ADMIN**      | Platforma administratori — barcha resurslarni boshqaradi              |
| **SUPER_ADMIN**| To'liq boshqaruv, shu jumladan boshqa adminlarni boshqarish            |

**Muhim tafsilotlar:**

- Har bir so'rovda foydalanuvchi **bazadan qayta o'qiladi** — token ichidagi ma'lumotga
  ishonilmaydi. Hisob bloklansa, bu **darhol** kuchga kiradi.
- `ADMIN` va `SUPER_ADMIN` barcha rol-cheklangan endpointlarni ko'radi (`AuthMiddleware` bypass).
- `POST /api/v1/auth/logout` tokenni bekor qiladi (`jti` denylist orqali, Redis).
- Parollar `argon2` bilan saqlanadi (eski `bcrypt` xeshlar keyingi loginda avtomatik qayta xeshlanadi).

---

## API hujjatlari

**Swagger UI** — server ishlab turganda: <http://localhost:9100/docs>

---

## Javob formati va xatoliklar

**Muvaffaqiyat:**

```json
{ "success": true, "data": {}, "_message": "saqlandi" }
```

**Xato:**

```json
{
  "success": false,
  "_message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

### Status kodlar

| Kod   | Qachon                                                    |
| ----- | ----------------------------------------------------------- |
| `400` | Validation xatosi, biznes-qoida buzilishi                    |
| `401` | Token yo'q, yaroqsiz, muddati o'tgan yoki bekor qilingan      |
| `403` | Autentifikatsiyadan o'tgan, lekin ruxsat yo'q                |
| `404` | Resurs topilmadi                                              |
| `409` | Unique cheklov buzildi (masalan, email band)                  |
| `500` | Kutilmagan xato (`stack` faqat development'da)                |

Xatolarni javobga aylantirish **faqat bitta joyda** — `middlewares/error.middleware.ts`
ichidagi global filterda bajariladi. Zod, Prisma (`P2002`, `P2003`, `P2025`) va Ts.ED
exception'larini tanib, mos status va tushunarli (i18n'lashtirilgan) xabar qaytaradi.

---

## Arxitektura qarorlari

**Nega Ts.ED?**
Decorator'ga asoslangan controller/service tuzilishi, DI konteyner qutidan chiqadi, ostida
oddiy Express turadi.

**Validation qayerda?**
Zod sxemalari `packages/contracts` (frontend bilan bir xil manba) da, `parse()` esa
**service ichida** chaqiriladi. Shu sababli biznes-logika hech qachon tekshirilmagan
ma'lumot ko'rmaydi.

**Nega bitta `LocalizedTextSchema`?**
Har qanday ko'p tilli domen maydoni (masalan, xizmat turi nomi, avtomobil katalogi
tavsifi) `{ uz, ru, en }` shaklidagi shu umumiy sxemani qayta ishlatadi — yangi til
qo'shish bitta joyda o'zgartiriladi.

**Nega logout uchun denylist?**
Imzolangan JWT muddati tugagunga qadar yaroqli. `TokenService` token `jti` sini Redis'da
saqlaydi (`SETEX jti <ttl> 1`), Redis mavjud bo'lmasa xotiradagi Map'ga tushadi.

**Xavfsizlik choralari**

- `helmet` — xavfsizlik header'lari
- `hpp` — HTTP Parameter Pollution himoyasi
- `cors` — `.env` orqali origin allow-list
- Redis-asoslangan rate-limit (auth, admin endpointlar uchun qattiqroq)
- Prisma parametrlangan so'rovlar — SQL injection yo'q
- Xato xabarlari email mavjudligini oshkor qilmaydi (account enumeration himoyasi)
- Fayllar (logo, hujjat, kelajakda ECU fayllar) faqat presigned URL orqali — ochiq public URL yo'q
- Production'da `stack` javobga qo'shilmaydi
