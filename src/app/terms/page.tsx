import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UNLOCK_FEE_NGN } from "@/lib/config";

export const metadata = {
  title: "Terms of Service — Rhoam",
};

// Static content page, same shape as refund-policy/page.tsx. Public route
// (no auth) — needed as a plain reachable URL for Google's OAuth consent
// screen setup and similar third-party app-review requirements.
export default function TermsOfServicePage() {
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

        <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: this is a draft — have it reviewed by a lawyer
          before publishing, and replace the placeholders in brackets with
          your real details.
        </p>

        <div className="mt-8 space-y-7 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What Rhoam is
            </h2>
            <p>
              Rhoam is a marketplace that helps students find student
              housing near their school. We list properties, and charge a
              one-time fee of ₦{UNLOCK_FEE_NGN.toLocaleString()} to reveal a
              listing's landlord and/or caretaker contact details. By using
              Rhoam, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What we do — and don't — guarantee
            </h2>
            <p className="mb-2">
              We personally visit and verify properties before they're
              listed, and we follow up with caretakers when someone asks
              whether a unit is still available. Even so, availability can
              change quickly, and we can't guarantee that a landlord or
              caretaker will respond, or that a unit will still be
              available by the time you reach out.
            </p>
            <p>
              Rhoam is a platform connecting students with housing
              contacts — we are not a party to any rental agreement between
              you and a landlord, and we're not responsible for the
              condition of a property, the terms a landlord offers, or
              disputes that arise once you've made contact.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Payments and refunds
            </h2>
            <p>
              Unlock payments are processed by Paystack and are generally
              non-refundable, except as described in our{" "}
              <Link
                href="/refund-policy"
                className="text-[#ff5a5f] font-medium underline"
              >
                Refund & Dispute Policy
              </Link>
              — for example, if the contact details you unlock turn out to
              be wrong or disconnected, or the unit was already taken
              before you unlocked it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Your responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate information when creating your account</li>
              <li>
                Use contact details you unlock only to inquire about that
                listing — not for unrelated marketing or spam
              </li>
              <li>
                Don't attempt to circumvent the unlock fee, for example by
                sharing unlocked contact details publicly or reselling them
              </li>
              <li>
                Report inaccurate, fraudulent, or unavailable listings using
                the in-app reporting tool, so we can look into them
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Landlords and caretakers
            </h2>
            <p>
              If you list a property or act as a caretaker, you agree to
              keep your contact details accurate and to respond honestly
              when we follow up about a listing's availability on a
              student's behalf. We may remove a listing at our discretion
              if it's found to be inaccurate, fraudulent, or no longer
              legitimate.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Account termination
            </h2>
            <p>
              We may suspend or terminate an account that violates these
              terms — for example, by submitting fraudulent listings,
              abusing the unlock or reporting system, or harassing a
              landlord or caretaker.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by law, Rhoam isn't liable
              for indirect or consequential losses arising from your use of
              the platform, including losses related to a property's
              condition, a landlord's conduct, or a listing's availability
              once contact details have been unlocked.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Changes to these terms
            </h2>
            <p>
              If we make material changes to these terms, we'll update the
              date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Governing law
            </h2>
            <p>
              These terms are governed by the laws of the Federal Republic
              of Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Contact us
            </h2>
            <p>
              Questions about these terms can be sent to
              [support@yourdomain.com].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
