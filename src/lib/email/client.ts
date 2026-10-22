/**
 * Minimal email-sending client, built the same way src/lib/ai/client.ts
 * handles the Anthropic API: it works with zero configuration (logging
 * instead of sending), and sends real email the moment a provider key is
 * added to .env — no code changes required either way.
 *
 * Uses Resend's plain HTTP API directly rather than their SDK, so this adds
 * no new dependency. Swap sendEmail()'s body for another provider's API if
 * you'd rather not use Resend.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    console.log(`[email:not-configured] Would send "${subject}" to ${to}.`);
    console.log(`[email:not-configured] ---\n${text}\n---`);
    return { sent: false, error: "Email is not configured (no RESEND_API_KEY)." };
  }

  const from = process.env.EMAIL_FROM || "AssetTracker KE <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[email] Resend API responded ${response.status}: ${body}`);
      return { sent: false, error: `Email provider error (${response.status}).` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return { sent: false, error: "Failed to reach the email provider." };
  }
}
