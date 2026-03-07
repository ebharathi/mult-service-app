import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInvitationEmail(
  to: string,
  workspaceName: string,
  inviterName: string,
  token: string
) {
  const acceptUrl = `${process.env.BASE_URL}/invite/accept?token=${token}`;

  await transporter.sendMail({
    from: `"${workspaceName}" <${process.env.SMTP_USER}>`,
    to,
    subject: `You've been invited to join ${workspaceName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Workspace Invitation</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong>.</p>
        <a href="${acceptUrl}"
           style="display: inline-block; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Accept Invitation
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Or copy this link: ${acceptUrl}
        </p>
      </div>
    `,
  });
}
