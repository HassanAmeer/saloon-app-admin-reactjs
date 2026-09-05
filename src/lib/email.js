import { themeColors } from '../config.js';

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:5005';

// Helper to wrap content in a unified responsive email layout matching the dashboard theme
const wrapEmailLayout = ({ headerSubtitle, contentHtml }) => {
    const primary = themeColors.primary || '#F89963';
    const primaryHover = themeColors.primaryHover || '#E27E49';
    const accent50 = themeColors.accent50 || '#FFFBF9';
    const accent100 = themeColors.accent100 || '#FFF2EB';
    const accent200 = themeColors.accent200 || '#FFE5D6';
    const textMain = themeColors.textMain || '#1A1A1A';
    const textMuted = themeColors.textMuted || '#666666';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Salon Profit Bar</title>
</head>
<body style="margin:0;padding:0;background-color:${accent50};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${accent50};padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(248,153,99,0.12);border:1px solid ${accent200};">
          
          <!-- Header Banner with Brand Gradient -->
          <tr>
            <td style="background:linear-gradient(135deg, ${primary} 0%, ${primaryHover} 100%);padding:36px 30px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                      SALON PROFIT BAR
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.92);font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                      ${headerSubtitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding:36px 32px;background-color:#ffffff;color:${textMain};">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${accent100};padding:24px 30px;text-align:center;border-top:1px solid ${accent200};">
              <p style="margin:0 0 6px;color:${textMuted};font-size:12px;line-height:1.5;">
                This is an automated notification from <strong>Salon Profit Bar</strong> platform.
              </p>
              <p style="margin:0;color:${textMuted};font-size:11px;">
                &copy; ${new Date().getFullYear()} Salon Profit Bar. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ----------------------------------------------------------------------
// TEMPLATE 1: Manager Account Created
// ----------------------------------------------------------------------
const buildManagerCreatedTemplate = ({ managerName, email, password, salonName, loginUrl }) => {
    const primary = themeColors.primary || '#F89963';
    const primaryHover = themeColors.primaryHover || '#E27E49';
    const accent100 = themeColors.accent100 || '#FFF2EB';
    const accent300 = themeColors.accent300 || '#FFD8C2';
    const textMain = themeColors.textMain || '#1A1A1A';
    const textMuted = themeColors.textMuted || '#666666';

    const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://salonprofitbar.com';
    const targetUrl = loginUrl || `${fallbackOrigin}/manager/login`;
    const targetSalon = salonName || 'Salon Branch';

    const contentHtml = `
      <h2 style="margin:0 0 12px;color:${textMain};font-size:22px;font-weight:800;">
        Welcome aboard, ${managerName || 'Partner'}! 🎉
      </h2>
      <p style="margin:0 0 24px;color:${textMuted};font-size:15px;line-height:1.6;">
        A new <strong>Salon Manager</strong> account has been created for you on the <strong>Salon Profit Bar</strong> platform for <strong>${targetSalon}</strong>. Below are your login credentials to access your business management dashboard:
      </p>

      <!-- Credentials Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${accent100};border:1.5px solid ${accent300};border-radius:14px;margin-bottom:28px;">
        <tr>
          <td style="padding:22px 24px;">
            <p style="margin:0 0 14px;color:${primaryHover};font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              Manager Access Credentials
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;width:110px;">Salon / Brand:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${targetSalon}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Role:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">Salon Manager</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Login Email:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${email}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Password:</td>
                <td style="padding:6px 0;">
                  <span style="background-color:#ffffff;color:${textMain};font-weight:800;padding:4px 12px;border-radius:6px;border:1px solid ${accent300};font-family:monospace;font-size:15px;letter-spacing:1px;display:inline-block;">
                    ${password}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${targetUrl}" style="display:inline-block;background:linear-gradient(135deg, ${primary} 0%, ${primaryHover} 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 16px rgba(248,153,99,0.35);">
              Login to Business Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;color:${textMuted};font-size:13px;line-height:1.6;text-align:center;">
        Please change your password after your first login for optimal security. If you did not expect this email, please contact the platform administrator immediately.
      </p>
    `;

    return wrapEmailLayout({
        headerSubtitle: 'Manager Account Created',
        contentHtml
    });
};

// ----------------------------------------------------------------------
// TEMPLATE 2: Manager Profile Updated
// ----------------------------------------------------------------------
const buildManagerUpdatedTemplate = ({ managerName, email, salonName, phone, passwordUpdated, loginUrl }) => {
    const primary = themeColors.primary || '#F89963';
    const primaryHover = themeColors.primaryHover || '#E27E49';
    const accent100 = themeColors.accent100 || '#FFF2EB';
    const accent300 = themeColors.accent300 || '#FFD8C2';
    const textMain = themeColors.textMain || '#1A1A1A';
    const textMuted = themeColors.textMuted || '#666666';

    const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://salonprofitbar.com';
    const targetUrl = loginUrl || `${fallbackOrigin}/manager`;
    const targetSalon = salonName || 'Salon Branch';

    const contentHtml = `
      <h2 style="margin:0 0 12px;color:${textMain};font-size:22px;font-weight:800;">
        Profile Updated Successfully 📝
      </h2>
      <p style="margin:0 0 24px;color:${textMuted};font-size:15px;line-height:1.6;">
        Hello <strong>${managerName || 'Manager'}</strong>, your Salon Manager account details for <strong>${targetSalon}</strong> have been recently updated on <strong>Salon Profit Bar</strong>.
      </p>

      <!-- Updated Summary Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${accent100};border:1.5px solid ${accent300};border-radius:14px;margin-bottom:28px;">
        <tr>
          <td style="padding:22px 24px;">
            <p style="margin:0 0 14px;color:${primaryHover};font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              Current Account Information
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;width:120px;">Manager Name:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${managerName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Salon:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${targetSalon}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Email Address:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Phone:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Password Status:</td>
                <td style="padding:6px 0;">
                  ${passwordUpdated
            ? `<span style="background-color:#dcfce7;color:#166534;font-size:12px;font-weight:800;padding:3px 10px;border-radius:6px;display:inline-block;">New Password Set</span>`
            : `<span style="background-color:#f3f4f6;color:#4b5563;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px;display:inline-block;">Unchanged</span>`
        }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td align="center">
            <a href="${targetUrl}" style="display:inline-block;background:linear-gradient(135deg, ${primary} 0%, ${primaryHover} 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 16px rgba(248,153,99,0.35);">
              Open Manager Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;color:${textMuted};font-size:13px;line-height:1.6;text-align:center;">
        <strong>Security Notice:</strong> If you did not make or authorize these changes, please contact the platform administrator immediately to secure your account.
      </p>
    `;

    return wrapEmailLayout({
        headerSubtitle: 'Profile Information Updated',
        contentHtml
    });
};

// ----------------------------------------------------------------------
// TEMPLATE 3: Stylist Account Created
// ----------------------------------------------------------------------
const buildStylistCreatedTemplate = ({ stylistName, email, password, phone, salonName, skills }) => {
    const primary = themeColors.primary || '#F89963';
    const primaryHover = themeColors.primaryHover || '#E27E49';
    const accent100 = themeColors.accent100 || '#FFF2EB';
    const accent300 = themeColors.accent300 || '#FFD8C2';
    const textMain = themeColors.textMain || '#1A1A1A';
    const textMuted = themeColors.textMuted || '#666666';

    const targetSalon = salonName || 'Salon Profit Bar';

    const contentHtml = `
      <h2 style="margin:0 0 12px;color:${textMain};font-size:22px;font-weight:800;">
        Welcome to the Team, ${stylistName || 'Stylist'}! ✂️
      </h2>
      <p style="margin:0 0 24px;color:${textMuted};font-size:15px;line-height:1.6;">
        Your <strong>Stylist</strong> account has been registered for <strong>${targetSalon}</strong> on the <strong>Salon Profit Bar</strong> platform. You can now log into the <strong>Stylist Mobile App</strong> to manage clients, perform AI hair scans, and record sales.
      </p>

      <!-- Credentials Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${accent100};border:1.5px solid ${accent300};border-radius:14px;margin-bottom:28px;">
        <tr>
          <td style="padding:22px 24px;">
            <p style="margin:0 0 14px;color:${primaryHover};font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              Your App Login Credentials
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;width:110px;">Salon:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${targetSalon}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Role:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">Stylist / Team Member</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Login Email:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${email}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Password:</td>
                <td style="padding:6px 0;">
                  <span style="background-color:#ffffff;color:${textMain};font-weight:800;padding:4px 12px;border-radius:6px;border:1px solid ${accent300};font-family:monospace;font-size:15px;letter-spacing:1px;display:inline-block;">
                    ${password}
                  </span>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Phone:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${phone}</td>
              </tr>` : ''}
              ${skills ? `
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Skills:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:600;">${skills}</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>
      </table>

      <!-- Mobile App Guide Note -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px dashed ${accent300};border-radius:12px;margin-bottom:24px;">
        <tr>
          <td style="padding:18px 20px;text-align:center;">
            <p style="margin:0 0 6px;color:${textMain};font-size:13px;font-weight:700;">
              📱 How to Log In:
            </p>
            <p style="margin:0;color:${textMuted};font-size:13px;line-height:1.5;">
              Open the <strong>Stylist Mobile App</strong> on your phone and enter your email and password shown above to start your sessions.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0;color:${textMuted};font-size:13px;line-height:1.6;text-align:center;">
        Please keep your login credentials secure. If you have questions about your account, please consult your Salon Manager.
      </p>
    `;

    return wrapEmailLayout({
        headerSubtitle: 'Stylist Account Ready',
        contentHtml
    });
};

// ----------------------------------------------------------------------
// TEMPLATE 4: Stylist Profile Updated
// ----------------------------------------------------------------------
const buildStylistUpdatedTemplate = ({ stylistName, email, phone, salonName, status, passwordUpdated }) => {
    const primaryHover = themeColors.primaryHover || '#E27E49';
    const accent100 = themeColors.accent100 || '#FFF2EB';
    const accent300 = themeColors.accent300 || '#FFD8C2';
    const textMain = themeColors.textMain || '#1A1A1A';
    const textMuted = themeColors.textMuted || '#666666';

    const targetSalon = salonName || 'Salon Profit Bar';

    const contentHtml = `
      <h2 style="margin:0 0 12px;color:${textMain};font-size:22px;font-weight:800;">
        Stylist Profile Updated 🔄
      </h2>
      <p style="margin:0 0 24px;color:${textMuted};font-size:15px;line-height:1.6;">
        Hello <strong>${stylistName || 'Stylist'}</strong>, your stylist profile information for <strong>${targetSalon}</strong> was recently updated by your Salon Manager.
      </p>

      <!-- Updated Summary Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${accent100};border:1.5px solid ${accent300};border-radius:14px;margin-bottom:28px;">
        <tr>
          <td style="padding:22px 24px;">
            <p style="margin:0 0 14px;color:${primaryHover};font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              Updated Profile Details
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;width:120px;">Stylist Name:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${stylistName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Salon:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${targetSalon}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Email:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Phone:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Status:</td>
                <td style="padding:6px 0;color:${textMain};font-weight:700;">${status || 'Active'}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:${textMuted};font-weight:600;">Password:</td>
                <td style="padding:6px 0;">
                  ${passwordUpdated
            ? `<span style="background-color:#dcfce7;color:#166534;font-size:12px;font-weight:800;padding:3px 10px;border-radius:6px;display:inline-block;">New Password Set</span>`
            : `<span style="background-color:#f3f4f6;color:#4b5563;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px;display:inline-block;">Unchanged</span>`
        }
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0;color:${textMuted};font-size:13px;line-height:1.6;text-align:center;">
        If you notice any inaccuracies or did not expect this change, please consult your Salon Manager.
      </p>
    `;

    return wrapEmailLayout({
        headerSubtitle: 'Stylist Profile Updated',
        contentHtml
    });
};

// ----------------------------------------------------------------------
// SMTP Email Dispatcher (Calls PHP / Hostinger cPanel SMTP Backend)
// ----------------------------------------------------------------------
const resolveEmailEndpoint = (overrideUrl) => {
    let base = (overrideUrl || import.meta.env.VITE_EMAIL_API_URL || '').trim().replace(/\/+$/, '');

    // If in production and URL is empty or still pointing to localhost, auto-route to /php-smtp on the same domain
    if (import.meta.env.PROD && (!base || base.includes('localhost') || base.includes('127.0.0.1'))) {
        base = '/php-smtp';
    }

    if (!base) {
        base = 'http://localhost:5005';
    }

    // Auto-prepend https:// if domain provided without protocol (e.g. salonprofitbar.com)
    if (!base.startsWith('http://') && !base.startsWith('https://') && !base.startsWith('/')) {
        base = `https://${base}`;
    }

    // If pointing to base domain without /php-smtp, append it
    if (base === 'https://salonprofitbar.com' || base === 'http://salonprofitbar.com') {
        base = `${base}/php-smtp`;
    }

    if (base.endsWith('.php') || base.endsWith('/send-email')) {
        return base;
    }
    // Direct PHP endpoint for Hostinger cPanel compatibility
    return `${base}/send-email.php`;
};

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!to) {
            console.warn('Email dispatch skipped: No recipient email provided.');
            return { success: false, error: 'Recipient email is missing' };
        }

        const endpoint = resolveEmailEndpoint(EMAIL_API_URL);

        let response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: Array.isArray(to) ? to : [to],
                subject,
                html
            })
        });

        // Graceful fallback: If direct .php returns 404, retry via /api/send-email (e.g. Bun or custom rewrite)
        if (response.status === 404 && endpoint.endsWith('/send-email.php')) {
            const fallbackEndpoint = endpoint.replace(/\/send-email\.php$/, '/api/send-email');
            try {
                const fallbackResponse = await fetch(fallbackEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: Array.isArray(to) ? to : [to],
                        subject,
                        html
                    })
                });
                if (fallbackResponse.ok || fallbackResponse.status !== 404) {
                    response = fallbackResponse;
                }
            } catch {
                // Fallback attempt failed, proceed with original response
            }
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error('SMTP email dispatch failed:', data);
            return { success: false, error: data.error || 'Failed to send email via SMTP' };
        }

        console.log('SMTP email sent successfully:', data);
        return { success: true, id: data.messageId };
    } catch (error) {
        console.error('SMTP dispatch network error:', error);
        return { success: false, error: error.message };
    }
};

// ----------------------------------------------------------------------
// EXPORTED FUNCTIONS FOR THE 4 SCENARIOS
// ----------------------------------------------------------------------

/**
 * 1. Send Email when Super Admin creates a Salon Manager
 */
export const sendManagerCreatedEmail = async ({ email, name, password, salonName, loginUrl }) => {
    const html = buildManagerCreatedTemplate({
        managerName: name,
        email,
        password,
        salonName,
        loginUrl
    });
    return await sendEmail({
        to: email,
        subject: `Welcome to Salon Profit Bar - Your Manager Account is Ready!`,
        html
    });
};

// Backward-compatible alias for existing code
export const sendAccountCreatedEmail = async (managerEmail, managerName, managerPassword, salonName) => {
    return await sendManagerCreatedEmail({
        email: managerEmail,
        name: managerName,
        password: managerPassword,
        salonName
    });
};

/**
 * 2. Send Email when Salon Manager profile is updated
 */
export const sendManagerUpdatedEmail = async ({ email, name, salonName, phone, passwordUpdated, loginUrl }) => {
    const html = buildManagerUpdatedTemplate({
        managerName: name,
        email,
        salonName,
        phone,
        passwordUpdated,
        loginUrl
    });
    return await sendEmail({
        to: email,
        subject: `Security Notice: Your Salon Manager Profile Was Updated`,
        html
    });
};

/**
 * 3. Send Email when Salon Manager adds a new Stylist
 */
export const sendStylistCreatedEmail = async ({ email, name, password, phone, salonName, skills }) => {
    const html = buildStylistCreatedTemplate({
        stylistName: name,
        email,
        password,
        phone,
        salonName,
        skills
    });
    return await sendEmail({
        to: email,
        subject: `Welcome to the Team! Your Stylist Account is Ready`,
        html
    });
};

/**
 * 4. Send Email when Stylist information is updated
 */
export const sendStylistUpdatedEmail = async ({ email, name, phone, salonName, status, passwordUpdated }) => {
    const html = buildStylistUpdatedTemplate({
        stylistName: name,
        email,
        phone,
        salonName,
        status,
        passwordUpdated
    });
    return await sendEmail({
        to: email,
        subject: `Update Notice: Your Stylist Profile Has Been Updated`,
        html
    });
};
