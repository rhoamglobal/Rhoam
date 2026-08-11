import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Rhoam",
};

// Static content page, same shape as refund-policy/page.tsx. Public route
// (no auth) since this needs to be a plain reachable URL for Google's
// OAuth consent screen setup, Meta's app review, etc. — anywhere a
// third-party asks for a Privacy Policy link.
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition mb-8"
        >
          <ChevronLeft size={16} />
          Back to Rhoam
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: this is a draft — have it reviewed against Nigeria's
          NDPR before publishing, and replace the placeholders in brackets
          with your real details.
        </p>

        <div className="mt-8 space-y-7 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What this covers
            </h2>
            <p>
              This policy explains what information Rhoam collects when you
              use the app to search for student housing, unlock a listing's
              contact details, or list a property as a landlord or
              caretaker, and what we do with it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Information we collect
            </h2>
            <p className="mb-2">
              <strong>Account information.</strong> When you sign up or sign
              in with Google or Apple, we receive your name, email address,
              and profile photo from that provider. We don't receive or
              store your Google/Apple password.
            </p>
            <p className="mb-2">
              <strong>Payment information.</strong> When you unlock a
              listing, your payment is processed by Paystack. We receive
              confirmation that a payment succeeded and a transaction
              reference — we don't receive or store your card number, PIN,
              or OTP; Paystack handles that directly.
            </p>
            <p className="mb-2">
              <strong>Location.</strong> If you allow it, we use your
              device's approximate location to show nearby listings on the
              map. You can browse without granting this — you'll just need
              to search by school or area instead.
            </p>
            <p className="mb-2">
              <strong>Listing and contact information.</strong> If you list
              a property with us, we collect the landlord's and/or
              caretaker's name, phone number, and WhatsApp number so
              students who unlock the listing can reach them, and so we can
              follow up on availability.
            </p>
            <p>
              <strong>Usage information.</strong> We keep a record of which
              listings you've unlocked (so you don't pay twice for the same
              one), and, if you use the "Ask if available" feature, that a
              request was made and when it was resolved.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              How we use this information
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To create and maintain your account</li>
              <li>To process unlock payments and prevent duplicate charges</li>
              <li>
                To connect you with a landlord or caretaker once you've paid
                to unlock a listing
              </li>
              <li>
                To follow up with caretakers about whether a listing is
                still available, on your behalf
              </li>
              <li>To investigate reported issues with a listing or contact</li>
              <li>
                To improve which areas and schools we prioritize for new
                listings
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Who we share information with
            </h2>
            <p className="mb-2">
              We don't sell your information. We share it only where the
              service genuinely requires it:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Paystack</strong>, to process payments
              </li>
              <li>
                <strong>Supabase</strong>, our database and authentication
                provider, which stores your account and listing data
              </li>
              <li>
                <strong>Resend</strong>, to deliver account emails and
                availability notifications
              </li>
              <li>
                <strong>Google and Apple</strong>, if you choose to sign in
                using those providers
              </li>
              <li>
                The <strong>landlord or caretaker</strong> of a listing you
                unlock, who can see that you unlocked their contact — we
                don't share your phone number or email with them unless you
                choose to reach out yourself
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              How long we keep your information
            </h2>
            <p>
              We keep your account and unlock history for as long as your
              account is active, so your unlocked contacts stay accessible
              without paying again. If you delete your account, we remove
              your personal information within a reasonable period, except
              where we're required to keep transaction records for
              accounting or legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Your rights
            </h2>
            <p>
              Under Nigeria's Data Protection Act/NDPR, you can ask us what
              personal information we hold about you, ask us to correct it
              if it's wrong, or ask us to delete your account and associated
              data. To do any of this, contact us at [privacy@yourdomain.com].
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Children's privacy
            </h2>
            <p>
              Rhoam isn't directed at children, and we don't knowingly
              collect information from anyone under 18.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Changes to this policy
            </h2>
            <p>
              If we make material changes to this policy, we'll update the
              date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Contact us
            </h2>
            <p>
              Questions about this policy or your data can be sent to
              [privacy@yourdomain.com].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
