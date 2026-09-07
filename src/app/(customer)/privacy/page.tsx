export const metadata = { title: "Privacy Policy — AG Fresh Eggs" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed text-foreground-muted">
      <h1 className="font-display text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-1 text-xs">Last updated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
      <p className="mt-4">
        This Privacy Policy explains how AG Enterprises (&quot;we&quot;, &quot;us&quot;) collects,
        uses, and protects information when you use the AG Fresh Eggs app or website
        (together, the &quot;Service&quot;).
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Information we collect</h2>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>Name and phone number, provided when you place an order or contact support</li>
        <li>Delivery address and, with your permission, device location, used to confirm you&apos;re within our delivery zone and to deliver your order</li>
        <li>Order details — items, quantities, amounts, and status</li>
        <li>Payment confirmation status from Razorpay (we never receive or store your card, UPI, or bank account details ourselves)</li>
        <li>Messages you send our AG Assistant chatbot, to answer your question and improve the assistant</li>
      </ul>

      <h2 className="mt-6 font-semibold text-foreground">How we use it</h2>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li>To take, confirm, deliver, and track your orders</li>
        <li>To verify your address is inside our 3&nbsp;KM delivery zone</li>
        <li>To run the AG Rewards loyalty and referral programs</li>
        <li>To respond to support requests and answer questions via WhatsApp or the AG Assistant</li>
        <li>To improve the Service and fix problems</li>
      </ul>

      <h2 className="mt-6 font-semibold text-foreground">Who we share it with</h2>
      <p className="mt-1">
        We share only what&apos;s necessary to run the Service, with:
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        <li><strong>Supabase</strong> — our database and authentication provider, which stores your account and order data</li>
        <li><strong>Razorpay</strong> — our payment processor, which handles your payment directly; we receive only a success/failure confirmation</li>
        <li><strong>Google (Gemini API)</strong> — powers the AG Assistant chatbot; messages you send it are processed by Google to generate a reply</li>
        <li><strong>WhatsApp</strong> — if you tap &quot;Confirm on WhatsApp&quot;, your order details are included in a message you choose to send yourself</li>
      </ul>
      <p className="mt-1">We do not sell your personal information to anyone.</p>

      <h2 className="mt-6 font-semibold text-foreground">Location data</h2>
      <p className="mt-1">
        We request device location only to check whether you&apos;re within our 3&nbsp;KM
        delivery zone and to pre-fill your delivery address. You can decline location access
        and enter your address manually instead.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Data retention</h2>
      <p className="mt-1">
        We keep order and account records for as long as your account is active and as needed
        to meet our legal, accounting, and business obligations. You can ask us to delete your
        data at any time via WhatsApp — see Contact below.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Your rights</h2>
      <p className="mt-1">
        You can ask us to access, correct, or delete the personal information we hold about
        you at any time by messaging AG Enterprises on WhatsApp.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Children&apos;s privacy</h2>
      <p className="mt-1">
        The Service is intended for adults placing food delivery orders and is not directed
        at children. We do not knowingly collect data from children.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Security</h2>
      <p className="mt-1">
        We use industry-standard measures (encrypted connections, access-controlled
        databases, row-level security) to protect your data, but no method of transmission
        or storage is 100% secure.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Changes to this policy</h2>
      <p className="mt-1">
        We may update this policy as the Service changes. Continued use of the Service after
        an update means you accept the revised policy.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Contact</h2>
      <p className="mt-1">
        For any privacy question or request, message AG Enterprises on WhatsApp at
        {" "}+91&nbsp;98358&nbsp;98736.
      </p>
    </div>
  );
}
