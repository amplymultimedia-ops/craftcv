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

export async function sendVerificationCodeEmail(
  email: string,
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"
) {
  const safeOtp = escapeHtml(otp);
  const heading = type === "sign-in" ? "Your sign-in code" : "Your verification code";
  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: `Your CraftCV verification code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">CraftCV</h1>
        <p style="color: #666; margin-bottom: 32px;">Your professional CV builder</p>
        <h2 style="font-size: 18px; color: #1a1a2e; margin-bottom: 16px;">${heading}</h2>
        <div style="background: #f5f3ef; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #9a6c1f;">${safeOtp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Unable to send verification email: ${error.message}`);
}
