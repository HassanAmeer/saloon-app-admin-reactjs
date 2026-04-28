


You are an expert React + Firebase developer. please add or resture existing project featurres according to requremnets.

There are EXACTLY TWO admin panels / dashboards:

1. Super Admin Panel (platform owner — highest level)
route should be /super
2. Salon Manager Panel (each salon owner/manager — created only by Super Admin)
route should be /manager

No separate stylist admin panel exists on web — stylists log in and work ONLY via the Flutter mobile app.

### User Roles & Creation Flow (Strict Hierarchy – No Self-Signup Anywhere)

- Super Admin (pre-created or first user — single or very few)
  - Creates Salon Managers (only email + password at creation time)
- Salon Manager
  - Creates Stylists (email + password + basic info) → credentials given to stylist for Flutter app login
- Stylist (mobile-only)
  - Creates and manages Clients via Flutter app
  - Performs scans, sales, recommendations, etc. in app
- Client (end user — mobile app only)

All data is strictly owned by the Salon (tenant): every Firestore document MUST include or be nested under a salonId (the Firestore doc ID of the Salon Manager).

### Super Admin Panel Features

- Dashboard listing all Salon Managers (table or cards)
- Create new Salon Manager: only email + password required
- Click any Salon Manager → "impersonate/view as" mode: Super Admin sees and can edit **everything** inside that salon exactly like the Salon Manager would (full read/write access)
- Global overview if needed (total salons, total stylists across all, etc.)

**Automatic defaults when Super Admin creates a new Salon Manager:**

- Auto-set profile defaults:
  - supportEmail: "salon@manager.com"
  - supportPhone: "+0123456789"
- Auto-add 2 default products to the salon's product catalog:
  1. Argan Oil Elixir
  2. Silver Bright Shampoo
- Copy default shared/global data into the new salon (as subcollections or documents):
  - Full Questionnaire JSON/structure for Flutter app
  - Hair Types list
  - Hair Conditions list
  - Hair Scan Metrics list
  - Visual Hair Colors list

### Salon Manager Panel Features

Sidebar navigation with:
- Dashboard (overview cards: total stylists, total clients, total sales, total revenue, top stylist, etc.)
- My Profile (update name, bio, skills, email, phone, password, logo/photo)
- Support Settings (update support email & phone — overrides defaults)
- Privacy Policy & Terms & Conditions (rich text editor to set custom per salon)
- Stylists
  - Create new stylist (name, email, phone, password, bio, skills, photo, active status)
  - List all stylists (table): name, email, phone, active/inactive, stylist ID, stats (# clients, # products sold, # scans)
  - Click stylist → detail view:
    - Edit profile
    - List of their clients (fetched from Firestore — read-only or limited edit by manager)
    - Sales/products sold by this stylist (table + charts)
    - AI recommendations history for this stylist
    - Analytics charts (clients growth, sales over time…)
- Products
  - CRUD own salon-specific products (name, desc, price, image, stock…)
- Sales & Analytics (main dashboard section)
  - Summary cards: total revenue, total products sold, total clients, avg per stylist…
  - Transactions table: date/time, stylist, client name, products/quantity, amount, session ID
  - Click stylist in table → drill-down to that stylist's full analytics
- AI Recommendations: view per-stylist recommendations (generated in app, shown here)

### Firestore Data Modeling (Recommended Multi-Tenant Structure)

Use subcollections for strong isolation + easy security rules:

just hint salon manager example structer like : 
salons/{salonId}           ← salonId = doc ID of salon manager
├── profile                ← {name, email, phone, supportEmail, supportPhone,logo, bio, skills…}
├── stylists/{stylistId}
│   ├── profile           ← {name, email, phone, bio, skills, photo, active, no passwordHash }
│   ├── clients/{clientId}       ← basic client info (read-only or limited edit from web)
│   └── Ai recommendations/{recId}  ← AI recs done by stylist to clients in app
└── sales/{saleId}               ← {date, stylistId, clientId, products[], amount, sessionId…}
└── app configue
└── settings
└── products
└── and others 







- Super Admin can list all salons via a top-level collection like `salons` (with owner uid or similar)
- Use custom claims or a users collection to store role + salonId for quick auth checks
- Security Rules must enforce: request.auth.uid == salon owner OR super admin → full access; stylist uid → only their own data via app

### Important Rules

- No signup/login pages for anyone except perhaps initial Super Admin setup
- All creation is top-down (Super Admin → Salon Manager → Stylist)
- Stylist/client creation & most actions happen in Flutter → dashboard mainly shows/analyzes/edits
- When Salon Manager views/creates data, always scope queries to their own salonId
- Super Admin can override/scoped to any salonId when viewing a specific salon
- Add seed/mock data migration script (data-migration.mockData.js) for defaults + sample stylists/products/sales

