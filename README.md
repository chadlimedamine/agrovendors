<!-- ═══════════════════════════════  HEADER  ═══════════════════════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1B5E20,50:2E7D32,100:81C784&height=220&section=header&text=AgroVendors%20API&fontSize=56&fontColor=ffffff&fontAlignY=38&desc=A%20secure%20REST%20backend%20for%20an%20agricultural%20marketplace&descSize=18&descAlignY=58&animation=fadeIn" alt="AgroVendors API banner" width="100%"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1200&color=2E7D32&center=true&vCenter=true&width=680&lines=%F0%9F%8C%BE+Connecting+farmers+with+buyers;%F0%9F%94%90+JWT+%2B+refresh-token+rotation;%F0%9F%9B%A1%EF%B8%8F+Permission-based+RBAC;%F0%9F%93%B8+Content-sniffing+image+uploads;%E2%8F%B1%EF%B8%8F+Per-request+profiling+%26+structured+logs" alt="Typing animation"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-13-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <br/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Passport-Strategies-34E27A?style=for-the-badge&logo=passport&logoColor=white" alt="Passport"/>
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger"/>
  <img src="https://img.shields.io/badge/Winston-Logging-7B1FA2?style=for-the-badge&logo=databricks&logoColor=white" alt="Winston"/>
  <img src="https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/REST_endpoints-18-2E7D32?style=flat-square" alt="18 endpoints"/>
  <img src="https://img.shields.io/badge/feature_modules-7-E0234E?style=flat-square" alt="7 modules"/>
  <img src="https://img.shields.io/badge/DB_models-6-1565C0?style=flat-square" alt="6 models"/>
  <img src="https://img.shields.io/badge/migrations-16-6A1B9A?style=flat-square" alt="16 migrations"/>
  <img src="https://img.shields.io/badge/merged_PRs-11-FB8C00?style=flat-square" alt="11 merged PRs"/>
  <img src="https://img.shields.io/badge/seeded_real_offers-295-00897B?style=flat-square" alt="295 seeded offers"/>
</p>

<p align="center">
  <a href="#-for-recruiters--tldr">🎯 TL;DR</a> •
  <a href="#%EF%B8%8F-architecture">🏗️ Architecture</a> •
  <a href="#-engineering-highlights">💎 Highlights</a> •
  <a href="#%EF%B8%8F-data-model">🗄️ Data model</a> •
  <a href="#-api-reference">📚 API</a> •
  <a href="#-getting-started">🚀 Run it</a> •
  <a href="#-development-timeline">📈 Timeline</a>
</p>

---

## 🌱 The problem

In Algeria, farmers often sell produce in **Facebook groups**. The posts are unstructured Arabic text, they are hard to search, and the only way to reach the seller is a phone number somewhere in the text. One example from the dataset says *"Peeled garlic available at good prices, delivery to all 58 wilayas, contact us at 06…"*.

**AgroVendors** is the backend for a marketplace that turns these posts into structured, searchable offers. Sellers get real accounts, and the platform has the security, access control and observability that a production API needs.

> [!TIP]
> **Short on time?** Read the [TL;DR](#-for-recruiters--tldr), look at the [architecture diagram](#%EF%B8%8F-architecture), then open [`auth.service.ts`](src/modules/auth/auth.service.ts) and [`permissions.guard.ts`](src/modules/authorization/permissions/permissions.guard.ts).

---

## 🎯 For recruiters — TL;DR

| 🧠 Skill | 💡 How the project shows it | 📍 Where to look |
|---|---|---|
| **Backend architecture** | A modular NestJS app with 7 feature modules, dependency injection, and global filters and interceptors registered through DI tokens | [`app.module.ts`](src/app.module.ts) |
| **Authentication** | Access and refresh JWTs signed with separate secrets. The refresh token is **rotated** on every use, stored **bcrypt-hashed**, and revoked on logout | [`auth.service.ts`](src/modules/auth/auth.service.ts) |
| **Authorization** | **Permission-based RBAC** with a custom `@Permissions()` decorator and a `PermissionsGuard`. Claims travel inside the JWT, so a permission check needs no database query | [`authorization/`](src/modules/authorization) |
| **Data modeling** | Prisma schema with 6 models, 16 versioned migrations, cascade deletes, two relations between users and offers (owner and creator), and an audit trail of who granted each permission | [`schema.prisma`](prisma/schema.prisma) |
| **Secure file handling** | Uploads are checked by their **magic bytes**, not by the extension or the `Content-Type` header. Size limits, UUID file names, and images are streamed back to the client | [`custom-file-type.validator.ts`](src/validators/custom-file-type.validator.ts) |
| **Observability** | Winston with 3 separate log streams. A global interceptor times **every request** | [`profiling.interceptor.ts`](src/interceptors/profiling/profiling.interceptor.ts) |
| **Error handling** | Two layers of global exception filters return one consistent error format and never leak internals | [`filters/`](src/filters) |
| **Data engineering** | Imports **295 real-world scraped posts** (Arabic, UTF-8) with a streaming CSV parser and removes duplicate sellers by phone number | [`seed.ts`](prisma/seed.ts) |
| **API design & docs** | DTO validation with a strict whitelist, filtering, sorting and pagination, and Swagger/OpenAPI docs that list the error responses of each endpoint | [`main.ts`](src/main.ts) |
| **Workflow** | Feature branches, 11 merged PRs, and conventional commits (`feat(...)`, `fix(...)`, `refactor:`) | Git history |

---

## 🏗️ Architecture

Each request passes through guards, an interceptor and a validation pipe before it reaches business logic. Every failure is caught, logged and returned in the same format.

```mermaid
flowchart TB
    CLIENT(["📱 Client / Swagger UI"])

    subgraph NEST["⚙️ NestJS request pipeline"]
        direction TB
        G1["🔑 JwtGuard<br/>Passport access-token strategy"]
        G2["🛡️ PermissionsGuard<br/>@Permissions metadata vs JWT claims"]
        INT["⏱️ ProfilingInterceptor<br/>starts a Winston timer"]
        VAL["✅ ValidationPipe<br/>whitelist + forbid unknown fields"]
        CTRL["🎮 Controller"]
        SVC["🧠 Service"]
        G1 --> G2 --> INT --> VAL --> CTRL --> SVC
    end

    CLIENT -->|"HTTP + Bearer JWT"| G1
    SVC --> PRISMA["🔷 PrismaService"] --> DB[("🐘 PostgreSQL 13<br/>in Docker")]
    SVC -.->|"throws"| FIL["🚨 Global exception filters<br/>safe, uniform JSON error"]
    FIL -.->|"stack traces"| LOGS[("📝 Winston log files")]
    INT -.->|"durationMs, user, route"| LOGS

    classDef client fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,color:#E65100
    classDef guard fill:#FCE4EC,stroke:#E0234E,stroke-width:2px,color:#880E4F
    classDef core fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef data fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef err fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#B71C1C
    classDef log fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#4A148C

    class CLIENT client
    class G1,G2 guard
    class INT,VAL,CTRL,SVC core
    class PRISMA,DB data
    class FIL err
    class LOGS log
```

### 🧩 Modules

| Module | Responsibility |
|---|---|
| 🔐 `auth` | Sign up, sign in, logout and token refresh. Two Passport JWT strategies, guards, and the `@GetUser()` decorator |
| 🛡️ `authorization` | The `@Permissions(...)` decorator and the `PermissionsGuard`, which reads the decorator through `Reflector` |
| 👥 `user` | User administration (permission-protected), with filtering, sorting and pagination |
| 🌾 `offer` | Offer CRUD, uploading several images per offer, listing image URLs, and streaming image files |
| 📞 `phone-numbers` | Lets a user manage several phone numbers, with uniqueness enforced |
| 📝 `logging` | A central Winston service with error, info and profiling loggers |
| 🔷 `prisma` | One shared `PrismaService` database client |

---

## 💎 Engineering highlights

<details open>
<summary><b>🔐 Refresh-token rotation with server-side revocation</b></summary>
<br/>

JWTs alone cannot be revoked. To fix this, the API stores a **bcrypt hash of the current refresh token** for each user:

- Each call to `/auth/refresh-tokens` creates a new token pair and **overwrites** the stored hash, so an old refresh token stops working as soon as it has been used once.
- `/auth/logout` sets the hash to `null`, so the session cannot be refreshed again.
- Access and refresh tokens are signed **in parallel** (`Promise.all`) with **separate secrets**.

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Seller
    participant API as 🔐 AuthController
    participant SVC as 🧠 AuthService
    participant DB as 🐘 PostgreSQL

    rect rgba(46, 125, 50, 0.12)
    Note over U,DB: Sign in
    U->>API: POST /auth/signin (phoneNumber, password)
    API->>SVC: signin()
    SVC->>DB: find the user by phone number
    SVC->>SVC: bcrypt.compare(password, hash)
    SVC->>DB: load role and permissions
    SVC->>SVC: sign access JWT and refresh JWT in parallel
    SVC->>DB: store bcrypt(refresh_token)
    SVC-->>U: access_token + refresh_token
    end

    rect rgba(21, 101, 192, 0.12)
    Note over U,DB: Rotate tokens
    U->>API: POST /auth/refresh-tokens (Bearer refresh_token)
    API->>SVC: refreshTheTokens()
    SVC->>DB: compare with the stored hash
    alt hash matches
        SVC->>DB: overwrite the stored hash (old token is now useless)
        SVC-->>U: new token pair
    else logged out, or old token used again
        SVC-->>U: 403 Forbidden
    end
    end

    rect rgba(198, 40, 40, 0.12)
    Note over U,DB: Log out
    U->>API: POST /auth/logout (Bearer access_token)
    API->>SVC: logout()
    SVC->>DB: hashedRefreshToken = null
    SVC-->>U: 204 No Content
    end
```

Sensitive fields never leave the server. The access-token strategy removes them before the user object reaches any controller:

```diff
  GET /users/me
  {
    "id": 1,
    "fullName": "…",
-   "hash": "$2b$10$…",                 ← removed in AccessTokenJwtStrategy
-   "hashedRefreshToken": "$2b$10$…",   ← removed in AccessTokenJwtStrategy
+   "phoneNumber": "06…",
+   "role": "admin",
+   "permissions": ["ReadUsers", "ReadUserById", "DeleteUserByid"]
  }
```
</details>

<details>
<summary><b>🛡️ Declarative, permission-based RBAC</b></summary>
<br/>

Roles are sets of **permissions** (a Postgres `enum`). The table that links roles to permissions also records **who granted each permission and when**. At sign-in, the user's permissions are written into the JWT. A route then declares what it needs:

```ts
@UseGuards(JwtGuard, PermissionsGuard)
@Permissions(Permission.DeleteUserByid)
@Delete(':id')
async deleteUserByid(@Param('id', ParseIntPipe) id: number) { … }
```

`PermissionsGuard` reads that metadata with `Reflector` and checks that the user has **every** required permission. If one is missing, it returns `403 Insufficient permissions`.

> [!NOTE]
> **Trade-off:** because permissions are in the token, a permission check needs no database query. In return, a change to a user's permissions only takes effect at their next token refresh.

</details>

<details>
<summary><b>📸 Image uploads checked by content, not by name</b></summary>
<br/>

A client can rename `malware.exe` to `cat.jpg` and set any `Content-Type` header. The custom `CustomFileTypeValidator` instead **reads the file's magic bytes** to detect its real type. It works with both Multer storage modes:

- **memory storage**: it inspects `file.buffer`
- **disk storage**: it reads the saved file from disk and then inspects it

```ts
new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 100000 }),
    new CustomFileTypeValidator({ fileType: ['image/jpeg', 'image/png'] }),
  ],
})
```

Other protections: at most **12 files per request**, file names made from a timestamp and a UUID (no path injection), and images served back as a `StreamableFile`, so a whole file is never loaded into memory.
</details>

<details>
<summary><b>🚨 Error handling that fails safely</b></summary>
<br/>

Two **global** filters are registered through `APP_FILTER`:

| Filter | Catches | Returns | Logs |
|---|---|---|---|
| `HttpExceptionFilter` | Expected `HttpException`s (400, 403, 404, 409, 422…) | `{ message, error, statusCode }` | 500s, with stack |
| `AllExceptionsFilter` | Everything else (Prisma errors, `TypeError`s…) | `{ message: "Internal server error", statusCode: 500 }` | Always, with full stack |

The client never sees a stack trace or a database error, and every unexpected failure is saved with full context.
</details>

<details>
<summary><b>⏱️ Per-request performance profiling</b></summary>
<br/>

`ProfilingInterceptor` is an RxJS-based global interceptor. It starts a Winston timer when a request arrives and records how long the request took, **including requests that throw**. A handled `HttpException` counts as a success. Only an unexpected failure is marked `RequestSuccess: false`.

| Stream | File | What it contains |
|---|---|---|
| 🔴 Errors | `logs/Global_Caught_Exceptions.log` | Unhandled exceptions and 500s, with stack traces |
| 🔵 Info | `logs/Info.log` | Info events tagged with the service name |
| 🟣 Profiling | `logs/Profiling.log` | One entry per request: `durationMs`, `userId`, `verb`, `url`, `RequestSuccess` |

```jsonc
// logs/Profiling.log (example entry)
{ "userId": 1, "url": "/offers?pageSize=5", "verb": "GET",
  "RequestSuccess": true, "level": "info", "durationMs": 18,
  "timestamp": "2024-07-15T10:21:43.512Z" }
```
</details>

<details>
<summary><b>🌾 Turning scraped posts into seller accounts</b></summary>
<br/>

The database is seeded with **295 real offers** from an Algerian agricultural Facebook group, posted between April 2022 and August 2023. The seed script **streams** the CSV, removes duplicate sellers by phone number, and creates a **seller account with no password** for each new phone number.

```mermaid
flowchart LR
    FB["📘 Facebook group<br/>Arabic posts"] --> SCR["🕷️ Scrape and clean<br/>(done outside this repo)"]
    SCR --> CSV[("📄 CSV<br/>295 posts")]
    CSV --> SEED["🌱 prisma/seed.ts<br/>streamed with csv-parser"]
    SEED --> Q{"📞 Phone number<br/>already known?"}
    Q -- "yes" --> A1["➕ Add the offer to<br/>the existing seller"]
    Q -- "no" --> A2["👤 Create a seller with no password<br/>+ phone + offer"]
    A2 -.-> CLAIM["🔓 When that seller signs up:<br/>422, set a password for your account"]

    classDef src fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1
    classDef proc fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20
    classDef dec fill:#FFF8E1,stroke:#F9A825,stroke-width:2px,color:#E65100
    classDef out fill:#FCE4EC,stroke:#E0234E,stroke-width:2px,color:#880E4F
    class FB,CSV src
    class SCR,SEED,A1,A2 proc
    class Q dec
    class CLAIM out
```

The sign-up flow knows about these accounts. If someone signs up with a phone number that already belongs to a seller with no password, the API removes the user record it had just started to create and returns **`422 Unprocessable Entity`**, which asks the seller to set a password for their existing account. If the account already has a password, the API returns `409 Conflict`.
</details>

---

## 🗄️ Data model

```mermaid
erDiagram
    USER ||--o{ PHONE : "reachable at"
    USER ||--o{ OFFER : "owns"
    USER ||--o{ OFFER : "created"
    OFFER ||--o{ IMAGE : "has"
    ROLE |o--o{ USER : "assigned to"
    ROLE ||--o{ ROLE_PERMISSIONS : "grants"
    USER ||--o{ ROLE_PERMISSIONS : "granted by"

    USER {
        int id PK
        string fullName
        string hash "bcrypt, null for an unclaimed seller"
        string hashedRefreshToken "bcrypt, null when logged out"
        string facebookProfileUrl
        int roleId FK
    }
    PHONE {
        int id PK
        string phoneNumber UK
        int userId FK "ON DELETE CASCADE"
    }
    OFFER {
        int id PK
        string name
        string description
        int ownerId FK
        int createdById FK
    }
    IMAGE {
        int id PK
        string path
        int belognsToId FK
    }
    ROLE {
        int id PK
        string name
    }
    ROLE_PERMISSIONS {
        int id PK
        int roleId FK
        Permission permission "ReadUsers, ReadUserById, DeleteUserByid"
        int assignedById FK
        datetime assignedAt
    }
```

**Design notes**
- 📞 **A user can have several phone numbers.** Sellers often use more than one number. Each number is unique across the platform, and a user's numbers are deleted with the user (cascade).
- 👥 **An offer has an owner and a creator.** This allows an admin or an import job to create an offer for a seller.
- 🧾 **Permission grants are audited.** Each `RolePermissions` row records `assignedBy` and `assignedAt`.

---

## 📚 API reference

Interactive Swagger docs are served at **`http://localhost:3001/api`**. Endpoints are grouped by module, and the docs list the error responses of each endpoint.

**Legend:** 🟢 `GET` · 🟡 `POST` · 🔴 `DELETE` | 🌍 public · 🔑 access token · 🔄 refresh token · 🛡️ access token + permission

<table>
<tr><th>Module</th><th>Method</th><th>Route</th><th>Access</th><th>Description</th></tr>
<tr><td rowspan="4">🔐 <b>Auth</b></td><td>🟡 POST</td><td><code>/auth/signup</code></td><td>🌍</td><td>Create an account and get a token pair (422 if the seller account already exists without a password)</td></tr>
<tr><td>🟡 POST</td><td><code>/auth/signin</code></td><td>🌍</td><td>Sign in with phone number and password</td></tr>
<tr><td>🟡 POST</td><td><code>/auth/refresh-tokens</code></td><td>🔄</td><td>Get a new token pair (the refresh token is rotated)</td></tr>
<tr><td>🟡 POST</td><td><code>/auth/logout</code></td><td>🔑</td><td>Revoke the refresh token</td></tr>
<tr><td rowspan="4">👥 <b>Users</b></td><td>🟢 GET</td><td><code>/users/me</code></td><td>🔑</td><td>Current user, with role and permissions</td></tr>
<tr><td>🟢 GET</td><td><code>/users</code></td><td>🛡️ <code>ReadUsers</code></td><td>List users (filter, sort, paginate)</td></tr>
<tr><td>🟢 GET</td><td><code>/users/:id</code></td><td>🛡️ <code>ReadUserById</code></td><td>One user, with phones, offers and granted permissions</td></tr>
<tr><td>🔴 DELETE</td><td><code>/users/:id</code></td><td>🛡️ <code>DeleteUserByid</code></td><td>Delete a user (their phone numbers are also deleted)</td></tr>
<tr><td rowspan="7">🌾 <b>Offers</b></td><td>🟢 GET</td><td><code>/offers</code></td><td>🌍</td><td>Browse the marketplace (filter, sort, paginate)</td></tr>
<tr><td>🟡 POST</td><td><code>/offers</code></td><td>🔑</td><td>Create an offer</td></tr>
<tr><td>🟢 GET</td><td><code>/offers/me</code></td><td>🔑</td><td>My offers (filter, sort, paginate)</td></tr>
<tr><td>🟢 GET</td><td><code>/offers/:id</code></td><td>🔑</td><td>One offer, with its images</td></tr>
<tr><td>🟡 POST</td><td><code>/offers/:id/images</code></td><td>🔑</td><td>Upload up to 12 JPEG/PNG images (multipart)</td></tr>
<tr><td>🟢 GET</td><td><code>/offers/:offerId/images</code></td><td>🔑</td><td>Get the URLs of an offer's images</td></tr>
<tr><td>🟢 GET</td><td><code>/offers/:offerId/images/:id</code></td><td>🔑</td><td>Stream one image file</td></tr>
<tr><td rowspan="3">📞 <b>Phone numbers</b></td><td>🟡 POST</td><td><code>/phone-numbers/me</code></td><td>🔑</td><td>Add a phone number to my account</td></tr>
<tr><td>🟢 GET</td><td><code>/phone-numbers/me</code></td><td>🔑</td><td>List my phone numbers</td></tr>
<tr><td>🔴 DELETE</td><td><code>/phone-numbers/me/:phoneId</code></td><td>🔑</td><td>Remove one of my phone numbers</td></tr>
</table>

**List query parameters** (on `/users`, `/offers` and `/offers/me`):

```http
GET /offers?filterOn=description&filterQuery=tomato&sortOn=description&isAscending=false&pageNumber=2&pageSize=10
```

```mermaid
%%{init: {"theme": "base", "themeVariables": {"pie1": "#2E7D32", "pie2": "#E0234E", "pie3": "#1565C0", "pie4": "#FB8C00", "pieTitleTextSize": "18px", "pieSectionTextColor": "#ffffff", "pieStrokeColor": "#ffffff"}}}%%
pie showData
    title 18 REST endpoints by module
    "🌾 Offers" : 7
    "🔐 Auth" : 4
    "👥 Users" : 4
    "📞 Phone numbers" : 3
```

---

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| 🟩 **Runtime and language** | Node.js · TypeScript 5 |
| 🟥 **Framework** | NestJS 10 (Express platform) |
| 🟦 **Database** | PostgreSQL 13 · Prisma ORM 5 (schema, migrations, seeding) |
| 🔐 **Auth** | Passport · passport-jwt · @nestjs/jwt · bcrypt |
| ✅ **Validation** | class-validator · class-transformer · file-type-mime |
| 📤 **Uploads** | Multer (disk storage) · uuid |
| 📝 **Observability** | Winston (3 loggers, built-in profiler) |
| 📚 **Docs** | Swagger / OpenAPI via @nestjs/swagger |
| 🐳 **Tooling** | Docker Compose · ESLint · Prettier · Yarn · VS Code debugger config |

---

## 🚀 Getting started

### ✅ Prerequisites
- Node.js 18 or later and Yarn
- Docker (for PostgreSQL)

### 1️⃣ Install

```bash
git clone https://github.com/chadlimedamine/agrovendors.git
cd agrovendors
yarn install
```

### 2️⃣ Configure

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5434/agrovendors?schema=public"
ACCESS_TOKEN_JWT_SECRET="replace-with-a-long-random-string"
REFRESH_TOKEN_JWT_SECRET="replace-with-a-different-long-random-string"
APP_URL="http://localhost:3001"
```

> [!IMPORTANT]
> Use **two different secrets** for access and refresh tokens. Then a leaked access-token secret cannot be used to create refresh tokens.

### 3️⃣ Start the database, migrate and seed

```bash
yarn db:dev:up            # 🐳 start PostgreSQL in Docker (port 5434)
yarn prisma:dev:deploy    # 🗄️ apply the 16 migrations
yarn db:dev:seed          # 🌱 create roles and admin, import the 295 scraped offers
```

> [!TIP]
> `yarn db:dev:restart` deletes the database container and runs all three steps again in one command.

### 4️⃣ Run

```bash
yarn start:dev            # 🔥 watch mode
yarn start:debug          # 🐞 attach the VS Code debugger
yarn build && yarn start:prod
```

Open **http://localhost:3001/api** 🎉

---

## 📁 Project structure

```text
agrovendors/
├── 📂 prisma/
│   ├── schema.prisma               # 6 models + Permission enum
│   ├── migrations/                 # 16 versioned SQL migrations
│   └── seed.ts                     # roles, admin, streaming CSV import
├── 📂 src/
│   ├── main.ts                     # bootstrap: ValidationPipe + Swagger
│   ├── app.module.ts               # registers global filters and the interceptor
│   ├── filters/                    # AllExceptionsFilter, HttpExceptionFilter
│   ├── interceptors/profiling/     # times every request
│   ├── validators/                 # file type check by magic bytes
│   └── modules/
│       ├── auth/                   # controller, service, DTOs, strategies, guards, @GetUser
│       ├── authorization/          # @Permissions decorator + PermissionsGuard
│       ├── user/                   # admin user management
│       ├── offer/                  # offers + image upload and streaming
│       ├── phone-numbers/          # several phone numbers per user
│       ├── logging/                # Winston configs + LoggingService
│       └── prisma/                 # shared PrismaService
├── 🐳 docker-compose.yml
└── 📄 cleaned_Agriculture_people_data.csv
```

---

## 📈 Development timeline

The project was built in feature branches merged through pull requests. Later commits follow the conventional-commit format.

```mermaid
timeline
    title 64 commits and 11 merged pull requests
    March 2024 : Project setup, JWT auth, Prisma models
               : Filtering, sorting and pagination
               : Permission-based RBAC (PR 1)
               : Offer and image models (PR 2)
    April 2024 : Image upload for offers (PR 3)
               : Global exception handling, Winston logging, profiling (PR 4)
    July 2024  : Hardening and refactors, sensitive fields hidden (PRs 5 to 8)
               : Phone numbers module (PR 9)
               : Import of scraped marketplace data (PR 10)
               : Swagger and OpenAPI docs (PR 11)
```

---

## 🗺️ Roadmap

- [x] 🔐 JWT authentication with refresh-token rotation and revocation
- [x] 🛡️ Permission-based RBAC with audited permission grants
- [x] 📸 Image uploads checked by content
- [x] 🚨 Global error handling, logging and request profiling
- [x] 🌾 Import of scraped real-world marketplace data
- [x] 📚 Swagger / OpenAPI documentation
- [ ] 🧪 Unit and e2e test suite (Jest and Supertest are already set up)
- [ ] ⚡ Move filtering, sorting and pagination into the SQL query (`where` / `orderBy` / `skip` / `take`)
- [ ] 🔓 An endpoint for sellers to claim their account and set a password
- [ ] ☁️ Store images in object storage (S3-compatible) instead of on the local disk
- [ ] 🐳 Docker image for the API and a GitHub Actions CI pipeline

---

## 👤 Author

<p align="center">
  <b>Mohamed Amine Chadli</b><br/>
  <i>Backend developer: Node.js · NestJS · TypeScript · PostgreSQL</i><br/><br/>
  <a href="https://github.com/chadlimedamine"><img src="https://img.shields.io/badge/GitHub-chadlimedamine-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
  <!-- Add your LinkedIn / email / portfolio badges here, e.g.:
  <a href="https://www.linkedin.com/in/YOUR-HANDLE"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
  -->
</p>

<p align="center">
  <i>⭐ If this project interests you, a star is appreciated and I'm happy to talk about it.</i>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:81C784,50:2E7D32,100:1B5E20&height=120&section=footer" alt="footer" width="100%"/>
</p>
