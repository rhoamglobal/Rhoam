import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "placeholder-key");

const FROM = process.env.RESEND_FROM_EMAIL || "Rhoam <notifications@rhoam.app>";

// Single narrow wrapper rather than scattering resend.emails.send calls
// across API routes — if the provider ever changes, or a from-address
// needs updating, there's exactly one place to touch.
export async function sendCaretakerAvailabilityPing({
  to,
  propertyTitle,
  statusUrl,
}: {
  to: string;
  propertyTitle: string;
  statusUrl: string;
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Is "${propertyTitle}" still available?`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <p style="font-size: 15px; color: #111;">Hi,</p>
        <p style="font-size: 15px; color: #333; line-height: 1.5;">
          A student on Rhoam is checking whether <strong>${propertyTitle}</strong>
          is still available. Could you confirm its status? It only takes one tap —
          no login needed.
        </p>
        <a href="${statusUrl}"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px;
                  background: #ff5a5f; color: #fff; text-decoration: none;
                  border-radius: 999px; font-weight: 600; font-size: 14px;">
          Confirm status
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 24px;">
          This link is unique to your listing — you can also bookmark it to
          update availability any time, not just when someone asks.
        </p>
      </div>
    `,
  });
}
