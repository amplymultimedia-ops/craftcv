import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '\"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export async function sendMagicLinkEmail(email: string, url: string) {
  const safeUrl = escapeHtml(url);
  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Your CraftCV sign-in link",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">CraftCV</h1>
        <p style="color: #666; margin-bottom: 32px;">Your professional CV builder</p>
        <h2 style="font-size: 18px; color: #1a1a2e; margin-bottom: 16px;">Verify your email and sign in</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Use the secure link below to access your account. It expires in 10 minutes.</p>
        <a href="${safeUrl}" style="display: inline-block; background: #9a6c1f; border-radius: 6px; padding: 14px 24px; color: #fff; font-weight: 700; text-decoration: none;">Verify email and sign in</a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Unable to send sign-in email: ${error.message}`);
}
