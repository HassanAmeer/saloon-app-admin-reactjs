# Salon App Firestore Architecture (Multi-Tenant Guide)

This guide outlines the recommended **Nested Subcollection Structure** for the Salon Management Platform. This structure ensures strict data isolation, simplified security rules, and clear ownership.

## 📁 Hierarchy Overview

### 1. `super_admins` (Top-Level Collection)
*Global platform owners.*
- `{adminId}` (Doc)
  - `email`: string
  - `role`: "super"

---

### 2. `salons` (Top-Level Collection)
*The primary tenant container. The `salonId` is the unique identifier for both the Salon Entity and its Manager.*

#### `salons/{salonId}` (Document)
Contains the core identity of the business.
- **Fields (Profile):**
  - `name`: string
  - `email`: string (manager login)
  - `phone`: string
  - `bio`: string
  - `logoUrl`: string
  - `managerId`: string (references the manager UID)
  - `createdAt`: timestamp

#### 🛠️ Subcollections under `salons/{salonId}/`

| Subcollection | Document ID | Description |
| :--- | :--- | :--- |
| `stylists` | `{stylistId}` | All specialists working at this specific salon. |
| `products` | `{productId}` | Catalog of items available for sale in this salon. |
| `sales` | `{saleId}` | Transaction history (linked to stylists and products). |
| `clients` | `{clientId}` | Customer profiles registered at this salon. |
| `settings` | `app_config` | Specific Flutter app configuration (questionnaires, colors). |

---

## 👤 Specialist Depth: `stylists/{stylistId}`

Stylists are nested under salons but have their own relational depth for mobile app functionality.

#### `stylists/{stylistId}` (Document)
- **Fields:** `name`, `email`, `active`, `skills`, `bio`, `photoUrl`, `stats` (count of clients, scans, sales).

#### 🛠️ Deep Subcollections under `stylists/{stylistId}/`
- `clients_assigned`: Reference mapping or subcollection for private client notes.
- `recommendations`: `{recId}` -> History of AI hair analysis and product suggestions made by this stylist.

---

## 🔒 Security Rules Strategy (The "Power" of Nesting)

With this structure, your Firestore rules become incredibly clean:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check if user is Super Admin
    function isSuper() {
      return get(/databases/$(database)/documents/super_admins/$(request.auth.uid)).data.role == 'super';
    }

    // Check if user is the specific Salon Manager
    function isSalonOwner(salonId) {
      return request.auth.uid == salonId;
    }

    match /salons/{salonId}/{allPaths=**} {
      // Super Admin or the specific Salon Manager can do everything
      allow read, write: if isSuper() || isSalonOwner(salonId);
      
      // Stylists logging in via mobile app
      match /stylists/{stylistId}/{stylistStore=**} {
        allow read: if request.auth.uid == stylistId;
        // Allow stylists to write their recommendations and client updates
        allow write: if request.auth.uid == stylistId; 
      }
    }
  }
}
```

## 🚀 Migration Path
Currently, the prototype uses a **Flat Scoped Pattern** (where items like `sales` have a `salonId` field). To migrate to the **Nested Pattern**:
1. Update `createDocument` to accept a path array: `['salons', salonId, 'stylists']`.
2. Use `collectionGroup` for Super Admin global analytics (e.g., total sales across all tenants).
