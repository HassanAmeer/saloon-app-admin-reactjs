# Saloon App Admin - Developer Setup & Documentation

Assalam-o-Alaikum! This document provides a complete overview of the Saloon App Admin project for new developers.

---

## 🛠 1. Basic Setup & Installation

Follow these steps to get the admin panel running locally:

1.  **Install Dependencies**:
    Requires [Node.js](https://nodejs.org/).
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will usually be at `http://localhost:5173`.

---

## 🚀 2. Build & Deployment (Live)

To deploy the admin panel to Firebase:

1.  **Build the Project**:
    ```bash
    npm run build
    ```
2.  **Deploy**:
    Ensure you have `firebase-tools` installed and are logged in.
    ```bash
    firebase deploy
    ```

---

## 📂 3. Tech Stack & Infrastructure

*   **Frontend**: React.js with Vite.
*   **Styling**: Tailwind CSS.
*   **Database**: **Firebase Firestore** (NoSQL).
*   **Storage**: livedb Storage. third party
*   **Server**: Firebase Hosting.
*   **Authentication**: Custom logic integrated with Firestore (super_admin_setting).

---

## 🛡 4. Admin Panel & Credentials

The system has two layers of administration:

### 1. Super Admin (Global Control)
Used to manage all salons, salon managers, and platform-wide settings.
*   **URL**: `/super` (Login page)
*   **Default Email**: `admin@gmail.com`
*   **Default Password**: `12345678`

### 2. Salon Manager (Branch Control)
Used to manage a specific salon's products, stylists, clients, and branch-specific app configuration.
*   **URL**: `/manager` (Login page)
*   **Default Email**: `salon1@manager.com`
*   **Default Password**: `12345678`

---

## 📊 5. How to Upload Demo Data

The project includes a built-in seeding tool to populate your Firestore database with dummy/demo data instantly.

1.  Log in as **Super Admin**.
2.  Navigate to the **Developer Center** (sidebar).
3.  Click on **"Go to Seeding Page"** or visit the URL `/seeding`.
4.  Run the **Migration/Seed process**. This will populate collections like `salons`, `products`, `stylists`, and `clients`.

---

## ⚙️ 6. Database Collections Structure

*   `super_admin_setting`: Stores global admin credentials and settings.
*   `salons`: Data for each salon branch.
*   `salon_managers`: Users who manage specific branches.
*   `products`: Hair care products listed for sale in salons.
*   `stylists`: Professional hair stylists/staff.
*   `clients`: Customer database.
*   `sales`: Transaction history.
*   `app_configs`: Branding and configuration for the mobile/user app.

---

**Note:** Verify your `src/lib/firebase.js` configuration before going live to ensure it points to your correct Firebase project.
