import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const { to, subject, html, from = 'Heat Risk Alert <alerts@send.heatguard>' } = options;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data?.id);
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string,
  baseUrl: string
): Promise<void> {
  const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Heat Risk Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">🌡️ Heat Risk Alert</h1>
                    <p style="margin: 10px 0 0; color: #666; font-size: 14px;">Stay Safe in Extreme Heat</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome, ${firstName}! 👋</h2>
                    
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                      Thank you for joining Heat Risk Alert. To complete your registration and access personalized heat safety features, please verify your email address.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333; font-size: 16px; line-height: 1.6;">
                      Click the button below to verify your account:
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; color: #2563eb; font-size: 14px; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
                        This link will expire in 24 hours for security reasons.
                      </p>
                      <p style="margin: 10px 0 0; color: #999; font-size: 13px; line-height: 1.6;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                      Heat Risk Alert - Keeping you safe in extreme heat conditions
                    </p>
                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                      Powered by Open-Meteo & NOAA
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Heat Risk Alert',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string,
  baseUrl: string
): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Heat Risk Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">🌡️ Heat Risk Alert</h1>
                    <p style="margin: 10px 0 0; color: #666; font-size: 14px;">Password Reset Request</p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hi ${firstName},</h2>
                    
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                      We received a request to reset your password for your Heat Risk Alert account.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333; font-size: 16px; line-height: 1.6;">
                      Click the button below to create a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(220,38,38,0.2);">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; color: #dc2626; font-size: 14px; word-break: break-all;">
                      ${resetUrl}
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
                        ⚠️ This link will expire in 1 hour for security reasons.
                      </p>
                      <p style="margin: 10px 0 0; color: #999; font-size: 13px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                      Heat Risk Alert - Keeping you safe in extreme heat conditions
                    </p>
                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                      Powered by Open-Meteo & NOAA
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Heat Risk Alert',
    html,
  });
}

export async function sendHeatAlertEmail(
  email: string,
  firstName: string,
  locationName: string,
  heatIndex: number,
  riskLevel: string,
  date: string
): Promise<void> {
  const riskColors: Record<string, string> = {
    'Normal': '#22c55e',
    'Caution': '#eab308',
    'Extreme Caution': '#f97316',
    'Danger': '#dc2626',
    'Extreme Danger': '#991b1b',
  };

  const riskColor = riskColors[riskLevel] || '#666';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Heat Alert - ${locationName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">🌡️ Heat Risk Alert</h1>
                    <p style="margin: 10px 0 0; color: #666; font-size: 14px;">${date}</p>
                  </td>
                </tr>
                
                <!-- Alert Badge -->
                <tr>
                  <td style="padding: 30px 40px 0;">
                    <div style="background-color: ${riskColor}; color: #ffffff; padding: 16px; border-radius: 6px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${riskLevel}
                      </p>
                      <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700;">
                        ${heatIndex}°F
                      </p>
                      <p style="margin: 4px 0 0; font-size: 14px;">
                        Heat Index
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 30px 40px 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 22px; font-weight: 600;">Hi ${firstName},</h2>
                    
                    <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                      A heat alert has been issued for <strong>${locationName}</strong>. The heat index is expected to reach <strong>${heatIndex}°F</strong>, which falls under the <strong>${riskLevel}</strong> category.
                    </p>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ Safety Recommendations:</p>
                      <ul style="margin: 10px 0 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <li>Stay hydrated - drink water frequently</li>
                        <li>Limit outdoor activities during peak heat hours</li>
                        <li>Stay in air-conditioned spaces when possible</li>
                        <li>Check on vulnerable family members and neighbors</li>
                        <li>Never leave children or pets in vehicles</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333; font-size: 14px; line-height: 1.6;">
                      For detailed forecasts and hourly updates, visit your dashboard.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${process.env.REPLIT_DEPLOYMENT ? 'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : 'http://localhost:5000'}" style="display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                            View Full Forecast
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">
                      You're receiving this because you enabled heat alerts for ${locationName}
                    </p>
                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                      Powered by Open-Meteo & NOAA
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `🌡️ Heat Alert: ${riskLevel} - ${locationName}`,
    html,
  });
}
