// Sends the "is this still available?" ping over WhatsApp instead of
// email, via Meta's WhatsApp Business Cloud API — same idea as
// sendCaretakerAvailabilityPing in mailer.ts, different channel. This is
// server-side only (uses a long-lived access token), so it belongs behind
// an API route, never called from the client.
//
// IMPORTANT — this requires setup outside this codebase before it'll work:
//   1. A WhatsApp Business Account + phone number in Meta Business Manager.
//   2. A message TEMPLATE approved by Meta, because Cloud API only allows
//      free-form messages inside a 24h window after the *other* person
//      messaged you first. Since this is business-initiated (caretaker
//      hasn't messaged Rhoam), the first message MUST be a pre-approved
//      template — a plain fetch() call with arbitrary text will be
//      rejected by the API.
//   3. The template needs exactly 2 body variables, in this order:
//        {{1}} -> property title
//        {{2}} -> the confirmation link (statusUrl)
//      e.g. template body text in Meta's editor:
//        "A student on Rhoam is checking whether {{1}} is still
//         available. Tap to confirm — no login needed: {{2}}"
//      If the approved template's variable count/order differs, update
//      the `parameters` array below to match.

const WHATSAPP_API_VERSION = "v20.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_TEMPLATE_NAME =
  process.env.WHATSAPP_TEMPLATE_NAME || "availability_check";
const WHATSAPP_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en";

export async function sendCaretakerWhatsAppPing({
  to,
  propertyTitle,
  statusUrl,
}: {
  to: string;
  propertyTitle: string;
  statusUrl: string;
}) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error(
      "WhatsApp isn't configured (missing WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN)."
    );
  }

  // Cloud API expects digits only, full international format, no leading
  // "+", no spaces/dashes — same normalization already used for the
  // wa.me links elsewhere in the app (see PropertyClient.tsx,
  // profile/unlocked/page.tsx), so a number stored correctly for those
  // already works here with no extra formatting step needed.
  const normalizedTo = to.replace(/\D/g, "");

  const res = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedTo,
        type: "template",
        template: {
          name: WHATSAPP_TEMPLATE_NAME,
          language: { code: WHATSAPP_TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: propertyTitle },
                { type: "text", text: statusUrl },
              ],
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WhatsApp API error (${res.status}): ${body}`);
  }

  return res.json();
}
