# Saloon Admin Panel - Quick Reference

## 🚀 Quick Start

```bash
cd /Users/mac/Documents/react/saloon
npm run dev
```

**Login**: admin@example.com / password123  
**URL**: http://localhost:5173

---

## 📁 Project Structure

```
saloon/
├── src/
│   ├── components/       # Reusable components
│   ├── contexts/         # React Context (Auth)
│   ├── data/            # Mock data
│   ├── lib/             # Utilities
│   ├── pages/           # Page components
│   ├── App.jsx          # Main app + routing
│   └── index.css        # Tailwind styles
├── README.md            # Full documentation
├── IMPLEMENTATION_PLAN.md  # 3-phase plan
└── PHASE_1_SUMMARY.md   # Phase 1 completion
```

---

## 🎨 Color Palette

```javascript
// Tea colors (browns/tans)
tea-50:  #faf8f5
tea-300: #d2b48c  // Backgrounds
tea-700: #8B4513  // Primary buttons/Active state
tea-900: #4a250b

// Brown colors
brown-100: #f2e8e5
brown-600: #a67c69
```

---

## 🧩 Key Components

### Pages
- `Login.jsx` - Static login
- `Dashboard.jsx` - Stats + charts
- `Stylists.jsx` - Stylist management
- `Products.jsx` - Product catalog
- `Sales.jsx` - Sales tracking
- `AIRecommendations.jsx` - AI history

### Components
- `DashboardLayout.jsx` - Sidebar + layout
- `ProtectedRoute.jsx` - Auth guard

### Context
- `AuthContext.jsx` - Auth state

---

## 📊 Mock Data

Located in `src/data/mockData.js`:

- `mockAdmin` - Admin credentials
- `mockStylists` - 5 stylists
- `mockProducts` - 6 products
- `mockSales` - 5 transactions
- `mockAIRecommendations` - 4 sessions
- `mockDashboardStats` - Aggregated stats

---

## 🛠️ Common Tasks

### Add a new page
1. Create `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add sidebar link in `DashboardLayout.jsx`

### Modify colors
Edit `tailwind.config.js` → `theme.extend.colors`

### Add mock data
Edit `src/data/mockData.js`

### Update navigation
Edit `DashboardLayout.jsx` → `navItems` array

---

## 🔧 Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📋 Phase Status

### ✅ Phase 1: UI (COMPLETE)
- Static UI with mock data
- All admin features
- Responsive design

### 🔜 Phase 2: Firebase
- Real authentication
- Firestore database
- Image upload
- Real-time updates

### 🔜 Phase 3: APIs
- Cloud Functions
- RESTful endpoints
- Flutter integration

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind not working
Check `tailwind.config.js` content paths are correct

---

## 📚 Documentation

- **README.md** - Full project documentation
- **IMPLEMENTATION_PLAN.md** - Detailed 3-phase guide
- **PHASE_1_SUMMARY.md** - Phase 1 completion report

---

## 🎯 Key Features

1. **Dashboard** - Period selector, stats, charts
2. **Stylists** - Search, filter, CRUD operations
3. **Products** - Grid view, tags, AI toggles
4. **Sales** - Filtering, detailed table
5. **AI Recs** - Session history, conversion tracking

---

## 🔐 Security (Phase 2)

Will implement:
- Firebase Authentication
- Firestore Security Rules
- Role-based access control
- Salon data isolation

---

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 🎨 Custom Tailwind Classes

```css
.btn-primary      /* Olive button */
.btn-secondary    /* Tea button */
.card             /* White card */
.input-field      /* Standard input */
.sidebar-link     /* Nav link */
.sidebar-link-active  /* Active nav */
```

---

## 💡 Tips

1. Use `cn()` utility for conditional classes
2. All dates use ISO 8601 format
3. Mock data resets on refresh
4. Check browser console for errors
5. Use React DevTools for debugging

---

**Last Updated**: January 19, 2026  
**Version**: 1.0.0 (Phase 1)
