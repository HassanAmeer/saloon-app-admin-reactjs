# Saloon Admin Panel

AI-Powered Product Recommendation Admin Dashboard for Salon Management

## 🎨 Project Overview

This is a comprehensive admin panel for a salon product recommendation system that uses AI to suggest products to clients based on hair analysis. The system is built in three phases:

- **Phase 1 (Current)**: Static UI with mock data
- **Phase 2**: Firebase integration (Firestore, Authentication)
- **Phase 3**: RESTful APIs via Firebase Cloud Functions for Flutter app

## 🚀 Tech Stack

- **Frontend**: React.js 19.x with Vite
- **Styling**: Tailwind CSS 3.x with custom tea-inspired theme
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend (Phase 2)**: Firebase (Firestore, Authentication, Cloud Functions)

## 🎨 Design Theme

The application uses a cohesive **tea-inspired color palette**:

- 🎨 **Tea-Inspired Theme** - Beautiful shades of tea (tan #D2B48C and saddle brown #8B4513) for a warm, professional feel.
- 📱 **Fully Responsive** - Seamless experience on all screen sizes.
- 🧩 **Modular Design** - Reusable components for easy maintenance.
- 📊 **Interactive Data** - Dynamic charts and tables for actionable insights.

## 📁 Project Structure

```
saloon/
├── src/
│   ├── components/
│   │   ├── DashboardLayout.jsx    # Main layout with sidebar
│   │   └── ProtectedRoute.jsx     # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── data/
│   │   └── mockData.js            # Static mock data for Phase 1
│   ├── lib/
│   │   └── utils.js               # Utility functions
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── Dashboard.jsx          # Main dashboard with stats
│   │   ├── Stylists.jsx           # Stylist management
│   │   ├── Products.jsx           # Product catalog management
│   │   ├── Sales.jsx              # Sales tracking
│   │   └── AIRecommendations.jsx  # AI recommendation history
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles & Tailwind
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Install Dependencies
```bash
cd saloon
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🔐 Phase 1: Static Login Credentials

For testing the Phase 1 UI:

- **Email**: `admin@example.com`
- **Password**: `password123`

## 📋 Features Implemented (Phase 1)

### ✅ Authentication
- Static login form with hardcoded credentials
- Protected routes (redirect to login if not authenticated)
- Logout functionality

### ✅ Dashboard
- Period selector (Today/Week/Month)
- Key metrics cards:
  - Total Sales
  - Products Sold
  - AI Scans
  - Conversion Rate
- Top 5 Stylists bar chart
- Top 5 Products pie chart
- Top products table

### ✅ Stylist Management
- List view with search and status filter
- Columns: Name, Email, Phone, Status, Total Sales, Units Sold
- Actions: View Profile, Edit, Activate/Deactivate
- Add/Edit modal with form validation
- View profile modal with sales stats

### ✅ Product Management
- Grid view with product cards
- Search by name, brand, or SKU
- Filter by category and active/inactive status
- Add/Edit modal with:
  - Basic info (name, brand, category, price, SKU)
  - Description and inventory
  - Tags for AI matching (hair type/condition)
  - Toggles: Active, AI Enabled, Pre-selected for AI
- Delete functionality
- Quick activate/deactivate toggle

### ✅ Sales Tracking
- Filter by date range and stylist
- Summary statistics:
  - Total Revenue
  - Products Sold
  - Transactions
  - Average Transaction
- Detailed sales table with:
  - Date & Time
  - Stylist
  - Products with quantities
  - Total amount
  - Session ID reference

### ✅ AI Recommendations
- Filter by date range and stylist
- Summary statistics:
  - Total Scans
  - Suggestions Made
  - Products Sold
  - Conversion Rate
- Card grid showing:
  - Client and stylist info
  - Session ID
  - Hair analysis (type & condition)
  - Suggested products with AI scores
  - Sold/Not Sold indicators
- Detailed modal view with full recommendation breakdown

### ✅ Responsive Design
- Mobile-friendly with hamburger menu
- Tablet and desktop optimized layouts
- Responsive tables and grids

## 🗂️ Mock Data Structure

All mock data is in `src/data/mockData.js`:

- **mockAdmin**: Admin user credentials
- **mockSalon**: Salon information
- **mockStylists**: 5 stylists with sales data
- **mockProducts**: 6 products across categories
- **mockSales**: Sample sales transactions
- **mockAIRecommendations**: AI suggestion sessions
- **mockDashboardStats**: Aggregated statistics

## 🎯 Phase 2 Plan: Firebase Integration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database
3. Enable Firebase Authentication (Email/Password)
4. Install Firebase SDK: `npm install firebase`

### Firestore Collections Schema

```javascript
// users collection
{
  id: "user-id",
  email: "admin@example.com",
  name: "Salon Owner",
  role: "admin", // or "stylist"
  salonId: "salon-id",
  createdAt: timestamp
}

// salons collection
{
  id: "salon-id",
  name: "Elegance Hair Salon",
  address: "...",
  phone: "...",
  ownerId: "user-id",
  createdAt: timestamp
}

// stylists collection
{
  id: "stylist-id",
  userId: "user-id", // reference to users
  salonId: "salon-id",
  name: "Emma Johnson",
  email: "emma@salon.com",
  phone: "+1234567890",
  status: "Active",
  totalSales: 12450.00,
  unitsSold: 156,
  createdAt: timestamp,
  updatedAt: timestamp
}

// products collection
{
  id: "product-id",
  salonId: "salon-id",
  name: "Hydrating Shampoo",
  brand: "Salon Pro",
  category: "Shampoo",
  price: 24.99,
  sku: "SP-SH-001",
  description: "...",
  inventory: 45,
  active: true,
  imageUrl: "...",
  tags: ["dry hair", "hydrating"],
  aiEnabled: true,
  preSelected: true,
  createdAt: timestamp,
  updatedAt: timestamp
}

// sales collection
{
  id: "sale-id",
  salonId: "salon-id",
  stylistId: "stylist-id",
  sessionId: "session-id",
  products: [
    {
      productId: "product-id",
      productName: "...",
      quantity: 2,
      price: 24.99
    }
  ],
  totalAmount: 94.98,
  createdAt: timestamp
}

// aiRecommendations collection
{
  id: "recommendation-id",
  salonId: "salon-id",
  sessionId: "session-id",
  stylistId: "stylist-id",
  clientId: "client-id",
  clientName: "Jane Doe",
  hairAnalysis: {
    type: "Dry, damaged",
    condition: "Needs hydration"
  },
  suggestedProducts: [
    {
      productId: "product-id",
      productName: "...",
      score: 0.95,
      sold: true
    }
  ],
  createdAt: timestamp
}
```

### Firebase Authentication
- Replace static login with Firebase Auth
- Implement email/password authentication
- Store user role in Firestore
- Implement role-based access control

### Real-time Updates
- Use Firestore real-time listeners for dashboard stats
- Auto-update when data changes

## 🌐 Phase 3 Plan: RESTful APIs

### Firebase Cloud Functions Setup
```bash
npm install -g firebase-tools
firebase init functions
```

### API Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

#### Products
```
GET    /api/products              # List all products
GET    /api/products/:id          # Get product by ID
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
```

#### Sales
```
GET    /api/sales                 # List sales (with filters)
GET    /api/sales/:id             # Get sale by ID
POST   /api/sales                 # Record sale
```

#### AI Recommendations
```
GET    /api/recommendations       # List recommendations
GET    /api/recommendations/:id   # Get recommendation by ID
POST   /api/recommendations       # Create recommendation
PUT    /api/recommendations/:id   # Update (mark products as sold)
```

#### Stylists
```
GET    /api/stylists              # List stylists
GET    /api/stylists/:id          # Get stylist by ID
POST   /api/stylists              # Create stylist
PUT    /api/stylists/:id          # Update stylist
DELETE /api/stylists/:id          # Deactivate stylist
```

### API Security
- Require Firebase Auth token in headers
- Validate user role and salon access
- Implement rate limiting
- CORS configuration for Flutter app

### Sample API Request/Response

**POST /api/sales**
```json
// Request
{
  "stylistId": "stylist-1",
  "sessionId": "session-101",
  "products": [
    {
      "productId": "prod-1",
      "quantity": 2
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": "sale-123",
    "totalAmount": 49.98,
    "createdAt": "2026-01-19T10:30:00Z"
  }
}
```

## 🔒 Security Rules (Phase 2)

Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Salon owners can access their salon data
    match /salons/{salonId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.salonId == salonId;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Similar rules for stylists, products, sales, recommendations
    // All scoped to salonId to ensure multi-tenant isolation
  }
}
```

## 📱 Flutter Integration Notes (Phase 3)

1. Use Firebase Auth for authentication
2. Call Cloud Functions APIs with auth token
3. Handle offline mode with local caching
4. Implement real-time listeners for live updates

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with correct/incorrect credentials
- [ ] Navigate through all pages
- [ ] Test all filters and search
- [ ] Add/Edit/Delete operations
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Logout functionality

## 📝 Development Notes

### Custom Tailwind Classes
- `btn-primary`: Brown button
- `btn-secondary`: Tea tan button
- `card`: White card with shadow
- `input-field`: Standard input styling
- `sidebar-link`: Sidebar navigation link
- `sidebar-link-active`: Active sidebar link

### State Management
- Currently using React Context for auth
- Phase 2 will add Firebase real-time listeners
- Consider Redux/Zustand if state becomes complex

## 🚧 Known Limitations (Phase 1)

- Static data only (no persistence)
- No real authentication
- No image upload functionality
- No data validation beyond basic form validation
- No error handling for network requests (will be added in Phase 2)

## 📄 License

This project is proprietary and confidential.

## 👥 Contributors

- Development Team: Full-stack development
- Design Team: UI/UX design with tea theme
- Product Team: Requirements and specifications
