import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  await resend.emails.send({
    from: "CraftCV <onboarding@resend.dev>",
    to: email,
    subject: `Your CraftCV sign-in code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">CraftCV</h1>
        <p style="color: #666; margin-bottom: 32px;">Your professional CV builder</p>
        <h2 style="font-size: 18px; color: #1a1a2e; margin-bottom: 16px;">Your sign-in code</h2>
        <div style="background: #f5f3ef; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #9a6c1f;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
