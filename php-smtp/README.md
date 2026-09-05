# Salon Profit Bar - PHP SMTP Backend

A standalone, cPanel-compatible PHP SMTP service designed specifically for deployment on **Hostinger cPanel** (or any standard Apache/PHP hosting).

This service is completely independent from the Vite frontend build.

---

## 📁 Directory Structure

```
php-smtp/
├── vendor/               # Bundled PHPMailer (ready-to-deploy, no composer needed on server)
├── .htaccess             # Apache rewrite rules and CORS headers for Hostinger
├── .env.example          # Environment variable template
├── config.php            # Config loader, .env parser, and helper utilities
├── send-email.php        # Main API endpoint: POST /send-email.php
├── health.php            # Health check & diagnostics: GET /health.php
├── index.php             # Router supporting /api/send-email and local dev server
├── test-email.php        # Diagnostic test script
└── composer.json         # Dependency manifest
```

---

## 🚀 1. Running Locally (Development)

You can run the PHP SMTP server locally using npm/bun scripts or directly with PHP:

```bash
# Option A: Run PHP server only on port 5005
npm run php:server

# Option B: Run both PHP server and Vite frontend concurrently
npm run dev:php
```

Or run directly via PHP CLI:
```bash
php -S 0.0.0.0:5005 -t php-smtp php-smtp/index.php
```

### Health Check (Local)
Visit in your browser or run:
```bash
curl http://localhost:5005/api/health
# or
curl http://localhost:5005/health.php
```

---

## 🌐 2. Deploying to Hostinger cPanel

### Step 1: Upload `dist/` (Frontend)
1. Run `npm run build` in the main project.
2. Upload the contents of `dist/` to your Hostinger `public_html/` folder.

### Step 2: Upload `php-smtp/` (Backend)
1. In `public_html/`, create a folder named `php-smtp` (or upload the entire `php-smtp` folder as-is).
2. The path on your server will look like:
   ```
   public_html/
   ├── index.html        (from dist)
   ├── assets/           (from dist)
   ├── .htaccess         (from dist)
   └── php-smtp/         (standalone PHP backend)
       ├── vendor/
       ├── .htaccess
       ├── config.php
       ├── send-email.php
       ├── health.php
       ├── index.php
       └── .env
   ```

### Step 3: Configure SMTP Credentials
You have two easy options on Hostinger:

**Option A (Recommended): Create a `.env` file inside `php-smtp/`**
Create `public_html/php-smtp/.env` with your credentials:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
SMTP_FROM_EMAIL=welcome@salonprofitbar.com
SMTP_FROM_NAME=Salon Profit Bar
```

*(Or use Hostinger Webmail: `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER=your_email@yourdomain.com`, `SMTP_PASS=your_password`)*

**Option B: Edit `php-smtp/config.php` directly**
You can also hardcode the default values directly in the `getSmtpConfig()` function in `config.php`.

### Step 4: Point Frontend to the PHP API
In your root `.env` before running `npm run build`:
```env
VITE_EMAIL_API_URL=https://yourdomain.com/php-smtp
```
Or if uploaded to a subdomain:
```env
VITE_EMAIL_API_URL=https://api.yourdomain.com
```

---

## 📬 3. API Endpoints

### 1. Send Email Endpoint
- **URL**: `POST /php-smtp/send-email.php` (or `POST /php-smtp/api/send-email`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "to": "client@example.com",
    "subject": "Welcome to Salon Profit Bar",
    "html": "<h1>Hello!</h1><p>Your account is ready.</p>",
    "text": "Optional plain text fallback"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "messageId": "<...>",
    "message": "Email successfully dispatched via SMTP."
  }
  ```
- **Error Response (400 / 500)**:
  ```json
  {
    "success": false,
    "error": "Error description"
  }
  ```

### 2. Health Check Endpoint
- **URL**: `GET /php-smtp/health.php` (or `GET /php-smtp/api/health`)
- **Response**:
  ```json
  {
    "status": "online",
    "service": "Saloon Admin SMTP Server (PHP)",
    "php_version": "8.2.12",
    "smtpConfigured": true,
    "host": "smtp.resend.com",
    "port": 465,
    "secure": "ssl",
    "fromEmail": "welcome@salonprofitbar.com",
    "fromName": "Salon Profit Bar"
  }
  ```

---

## 🧪 4. Testing Email Sending

You can test email sending directly from your terminal or browser:

```bash
# Local test:
php php-smtp/test-email.php your-email@example.com

# Browser test:
https://yourdomain.com/php-smtp/test-email.php?to=your-email@example.com
```
