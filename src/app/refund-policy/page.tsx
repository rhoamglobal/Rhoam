import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UNLOCK_FEE_NGN } from "@/lib/config";

export const metadata = {
  title: "Refund & Dispute Policy — Rhoam",
};

// Static content page — no client interactivity needed, so this is a
// plain server component. Linked from UnlockModal (before payment) and
// ReportIssueModal (after a bad unlock), so this text should hold up in
// both contexts: as a reassurance before paying, and as the actual
// process someone follows after something's gone wrong.
export default function RefundPolicyPage() {
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

        <h1 className="text-2xl font-bold text-gray-900">
          Refund & Dispute Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: this page is a placeholder — replace with your
          actual reviewed policy text before launch.
        </p>

        <div className="mt-8 space-y-7 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What unlocking a contact gets you
            </h2>
            <p>
              A one-time fee of ₦{UNLOCK_FEE_NGN.toLocaleString()} gives you
              permanent access to a listing's landlord and/or caretaker
              contact details. Once unlocked, that contact stays visible
              on your account for as long as you have one — you never pay
              twice for the same listing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              When you can request a refund
            </h2>
            <p className="mb-2">
              If, after unlocking, you find that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>the number provided is wrong, disconnected, or unreachable, or</li>
              <li>the unit was already rented out before you unlocked it,</li>
            </ul>
            <p className="mt-2">
              use the <strong>Report an issue</strong> option from the
              contact details screen. We review every report — this isn't
              an automated refund, it's a real person looking into what
              happened.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What happens after you report something
            </h2>
            <p>
              We aim to review reports and follow up within a few business
              days. Depending on what we find, this may mean a refund, a
              correction to the listing, or removing the listing entirely
              if it turns out to be inaccurate or no longer legitimate.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              What isn't covered
            </h2>
            <p>
              We can't guarantee a landlord or caretaker will respond
              quickly, or that a room will still be available by the time
              you reach out — availability can change fast. If a contact
              is valid and reachable but the room simply isn't available
              anymore by the time you called, that's a timing issue we'll
              look at case by case rather than an automatic refund.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
