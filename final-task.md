# Salon Admin Dashboard - Comprehensive Implementation Prompt

## Project Overview
Develop a **React.js Admin Panel** with **Firebase** backend for a Salon Management System. The system features two distinct access levels: **Super Admin** and **Salon Manager**.

## 1. Super Admin Role
The Super Admin is the highest level authority, responsible for onboarding Salon Managers and overseeing the entire platform.

### A. Create Salon Manager
*   **Input**: Email and Password.
*   **Automatic Data Seeding**: Upon creation, the following default data **MUST** be generated for the new Salon Manager:
    *   **Profile**:
        *   **Support Contact**: Default Email (`saloon@manager.com`) and Phone (`+0123456789`).
    *   **Inventory (Default Products)**:
        1.  Product Name: `Argan Oil Elixir`
        2.  Product Name: `Silver Bright Shampoo`
    *   **Questionnaire**: Default "Flutter App Questionnaire" data.
    *   **Hair Data**:
        *   Default "Hair Types"
        *   Default "Hair Conditions"
        *   Default "Hair Scan Metrics"
    *   **Visuals**: Existing default "Visual Hair Colors".

### B. Global Management & Analytics
*   **Dashboard**: View all Salon Managers.
*   **Drill-Down**: Select a specific Salon Manager to view:
    *   Profile details (Bio, Name, Contact, etc.).
    *   **Performance Metrics**:
        *   Total Stylists count.
        *   Total Clients per Stylist.
        *   Product Sales & Revenue.
        *   Questions and Hair Types added.
    *   **Management**: Ability to update any aspect of the Salon Manager's data.

---

## 2. Salon Manager Role
The Salon Manager manages their specific salon operations, stylists, and products.

### A. Stylist Management
*   **Create Stylist**:
    *   Manager generates Login Credentials (Email/Password) for the stylist.
    *   *Note*: Stylists use these credentials to log in to the mobile app (no signup UI in the app).
*   **Stylist List & Details**:
    *   **Table View**: Columns for Name, Email, Phone, Active Status, Stylist ID.
    *   **Detailed View** (Click to expand):
        *   Profile Editing (Name, Bio, Skills, Contact, Password).
        *   Toggle Active/Inactive status.
        *   **Analytics**: Charts for Clients, Products Sold, and Scans.
        *   **Clients Table**: granular data on clients under this stylist (Products Sold, Quantity, Date/Time, Amount, Session ID).
        *   **AI Recommendations**: View/Manage AI recommendations linked to the stylist/client.

### B. Sales & Analytics (Salon Manager Dashboard)
*   **Overview Cards**: Visually appealing "Box Cards" displaying:
    *   Total Sales & Revenue.
    *   Total Products Sold.
    *   Total Clients.
    *   Stylist Performance ranking.
*   **Detailed Sales Table**:
    *   List of Client Names (linked to Stylist).
    *   Products Purchased (Quantity).
    *   Transaction details (Date, Time, Amount, Session ID).
    *   *Interactivity*: Clicking a Stylist name navigates to that Stylist's specific analytics.

### C. Profile & Settings
*   **Profile**: Update Name, Bio, Email, Phone, Password.
*   **Company Info**:
    *   Update **Privacy Policy** and **Terms & Conditions** (unique to each salon).
    *   **Support Contact**: Update Email/Phone (defaults provided on creation).
*   **Sidebar**: dedicated "Profile" button for easy access.

---

## 3. Data Structure & Migration
**File**: `src/data-migration/data-migration.mockData.js`

*   **Requirement**: This file must contain all default data structures for the migration.
*   **Structure**: Organize data by Firebase Collections and Documents (e.g., `products`, `questionnaires`, `hairMetrics`, `visualColors`).
*   **Usage**: ensuring when a Super Admin creates a manager, this structured data is what gets pushed to the database.

## 4. UI/UX Guidelines
*   **Aesthetics**: Modern, clean design with valid visual hierarchy.
*   **Components**:
    *   **Box Cards**: For high-level statistics.
    *   **Interactive Tables**: For lists (Stylists, Clients, Sales) with sort/filter capabilities.
    *   **Charts**: For visual analytics (Sales trends, Stylist performance).
*   **Navigation**: intuitive Sidebar with clear separation of sections.

---

**Implementation Note**:
Refer to `@salon_dashboard_sow.xlsx - Sheet 1 (1).pdf` for any missing granular details regarding the data schema or flow.
