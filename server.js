import nodemailer from 'nodemailer';

const PORT = Number(process.env.PORT) || 5005;

// Helper to set standard CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Create email transporter dynamically from current environment
const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders,
            });
        }

        // Health Check Route
        if (url.pathname === '/' || url.pathname === '/api/health') {
            const hasCreds = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
            return new Response(
                JSON.stringify({
                    status: 'online',
                    service: 'Saloon Admin SMTP Server (Bun)',
                    smtpConfigured: hasCreds,
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: Number(process.env.SMTP_PORT) || 587,
                    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'not-set',
                    fromName: process.env.SMTP_FROM_NAME || 'Salon Profit Bar',
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                }
            );
        }

        // Send Email Route
        if (url.pathname === '/api/send-email' && req.method === 'POST') {
            try {
                const body = await req.json();
                const { to, subject, html, text } = body;

                if (!to || !subject || !html) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'Missing required parameters: to, subject, and html are required.',
                        }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders,
                            },
                        }
                    );
                }

                const transporter = createTransporter();
                if (!transporter) {
                    console.error('[SMTP Error] Credentials missing in environment.');
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in your .env file.',
                        }),
                        {
                            status: 500,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders,
                            },
                        }
                    );
                }

                const fromName = process.env.SMTP_FROM_NAME || 'Salon Profit Bar';
                const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

                console.log(`[SMTP] Sending email to: ${Array.isArray(to) ? to.join(', ') : to} | Subject: "${subject}"`);

                const info = await transporter.sendMail({
                    from: `"${fromName}" <${fromEmail}>`,
                    to: Array.isArray(to) ? to.join(', ') : to,
                    subject,
                    html,
                    text: text || html.replace(/<[^>]*>?/gm, ''),
                });

                console.log(`[SMTP Success] Message sent. ID: ${info.messageId}`);

                return new Response(
                    JSON.stringify({
                        success: true,
                        messageId: info.messageId,
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    }
                );
            } catch (err) {
                console.error('[SMTP Failure]:', err);
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: err.message || 'Failed to dispatch email via SMTP',
                    }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders,
                        },
                    }
                );
            }
        }

        // 404 for unknown endpoints
        return new Response(
            JSON.stringify({ error: 'Endpoint not found' }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            }
        );
    },
});

console.log(`🚀 Saloon SMTP Server running on http://localhost:${PORT}`);
console.log(`📧 SMTP Config: Host=${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || 587}, User=${process.env.SMTP_USER || 'NOT CONFIGURED'}`);
