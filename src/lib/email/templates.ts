import { formatDate } from "@/lib/format";

function wrapHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f4f6f5;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1f1c;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e3e8e4;">
      <p style="font-weight:700;font-size:16px;color:#15803d;margin:0 0 20px;">AssetTracker KE</p>
      ${bodyHtml}
      <p style="font-size:12px;color:#8a938d;margin-top:28px;">This is an automated message from AssetTracker KE's account safety net feature.</p>
    </div>
  </body>
</html>`;
}

export function checkinRequestEmail({
  userName,
  confirmUrl,
  deadline,
}: {
  userName: string;
  confirmUrl: string;
  deadline: Date;
}) {
  const subject = "Please confirm you're still there — AssetTracker KE";
  const text = `Hi ${userName},\n\nWe haven't seen you log in to AssetTracker KE for a while. To make sure your account stays secure and your beneficiaries aren't contacted unnecessarily, please confirm you're still active by ${formatDate(deadline)}:\n\n${confirmUrl}\n\nIf we don't hear from you by then, we'll start reaching out to the beneficiaries you've listed on your account.\n\nIf this wasn't expected, simply log in to AssetTracker KE, which also confirms you're active.`;
  const html = wrapHtml(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(userName)},</p>
    <p style="margin:0 0 16px;">We haven't seen you log in to AssetTracker KE for a while. Please confirm you're still active by <strong>${formatDate(deadline)}</strong>:</p>
    <p style="margin:0 0 24px;"><a href="${confirmUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">I'm still here</a></p>
    <p style="margin:0 0 8px;color:#4b544e;font-size:14px;">If we don't hear from you by then, we'll start reaching out to the beneficiaries you've listed on your account.</p>
    <p style="margin:0;color:#4b544e;font-size:14px;">Logging in to AssetTracker KE also confirms you're active.</p>
  `);
  return { subject, text, html };
}

export function beneficiaryNotificationEmail({
  userName,
  contactName,
  confirmUrl,
  deadline,
}: {
  userName: string;
  contactName: string;
  confirmUrl: string;
  deadline: Date;
}) {
  const subject = `${userName} may need you to check in — AssetTracker KE`;
  const text = `Hi ${contactName},\n\n${userName} listed you as a trusted contact on their AssetTracker KE account. They haven't been active on the app for an extended period, and haven't responded to our check-in request.\n\nPlease reach out to ${userName} directly to make sure everything is okay.\n\nOnce you've seen this message, please let us know by ${formatDate(deadline)} so we don't need to contact anyone else:\n\n${confirmUrl}\n\nThis only confirms you received this notice — it does not give you access to ${userName}'s account or data.`;
  const html = wrapHtml(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(contactName)},</p>
    <p style="margin:0 0 16px;"><strong>${escapeHtml(userName)}</strong> listed you as a trusted contact on their AssetTracker KE account. They haven't been active on the app for an extended period, and haven't responded to our check-in request.</p>
    <p style="margin:0 0 16px;">Please reach out to ${escapeHtml(userName)} directly to make sure everything is okay.</p>
    <p style="margin:0 0 24px;"><a href="${confirmUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">I've seen this, confirm receipt</a></p>
    <p style="margin:0;color:#4b544e;font-size:14px;">Please confirm by <strong>${formatDate(deadline)}</strong> so we don't need to contact anyone else. This only confirms receipt — it does not grant access to ${escapeHtml(userName)}'s account or data.</p>
  `);
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
