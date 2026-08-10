// Brevo (Sendinblue) email client — used for verification codes & password resets
// Uses the Brevo v3 REST API directly. Get an API key at https://brevo.com
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Sender address — verify an email in Brevo and set BREVO_FROM_EMAIL
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@example.com';
const FROM_NAME = process.env.BREVO_FROM_NAME || 'NaiLand';
const APP_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // If no API key configured, log instead of failing (dev fallback)
  if (!process.env.BREVO_API_KEY) {
    console.log(`\n📧 [DEV] Email would be sent to ${to}:\nSubject: ${subject}\n${text || ''}\n`);
    return { success: true };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      let message = `Brevo error (${res.status})`;
      try {
        const parsed = JSON.parse(body);
        message = parsed.message || message;
      } catch {
        message = body || message;
      }
      console.error('Brevo email error:', body);
      return { success: false, error: message };
    }

    return { success: true };
  } catch (error) {
    console.error('Brevo send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Email sending failed' };
  }
}

// Generate a numeric verification code
export function generateCode(length = 4): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// Verification email
export async function sendVerificationCode(to: string, code: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'NaiLand — Your verification code',
    text: `Your NaiLand verification code is: ${code}\n\nEnter this code to verify your account. It expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #fdfcf9; border-radius: 16px; border: 1px solid #e5e5e5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-family: Georgia, serif; color: #111; margin: 0; letter-spacing: -0.5px;">Nai<span style="color: #f8c21a;">Land</span></h1>
        </div>
        <h2 style="color: #111; font-size: 18px; margin: 0 0 8px;">Your verification code</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">Use the code below to verify your account. It expires in <strong>15 minutes</strong>.</p>
        <div style="background: #f8c21a; border-radius: 12px; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111;">${code}</div>
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

// Password reset email
export async function sendPasswordResetCode(to: string, code: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'NaiLand — Reset your password',
    text: `Your NaiLand password reset code is: ${code}\n\nEnter this code on the reset page to choose a new password. It expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #fdfcf9; border-radius: 16px; border: 1px solid #e5e5e5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-family: Georgia, serif; color: #111; margin: 0; letter-spacing: -0.5px;">Nai<span style="color: #f8c21a;">Land</span></h1>
        </div>
        <h2 style="color: #111; font-size: 18px; margin: 0 0 8px;">Reset your password</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">Use the code below to set a new password. It expires in <strong>15 minutes</strong>.</p>
        <div style="background: #f8c21a; border-radius: 12px; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111;">${code}</div>
        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export { APP_URL };
