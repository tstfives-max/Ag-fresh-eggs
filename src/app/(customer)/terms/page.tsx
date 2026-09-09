export const metadata = { title: "Terms & Privacy — AG Fresh Eggs" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed text-foreground-muted">
      <h1 className="font-display text-2xl font-bold text-foreground">Terms &amp; Privacy</h1>

      <h2 className="mt-6 font-semibold text-foreground">Service area</h2>
      <p className="mt-1">
        AG Fresh Eggs (by AG Enterprises) delivers only within a limited radius of Danapur,
        Patna – 801503. Orders outside this zone cannot be placed.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Payments</h2>
      <p className="mt-1">
        Payments are processed securely via Razorpay. AG Enterprises does not store your card,
        UPI, or bank details.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Cancellations &amp; refunds</h2>
      <p className="mt-1">
        Message us on WhatsApp within 30 minutes of ordering for a cancellation, refund, or
        replacement.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Data we collect</h2>
      <p className="mt-1">
        We store your name, phone number, delivery address, and order history to fulfil and
        track your orders.
      </p>

      <h2 className="mt-6 font-semibold text-foreground">Contact</h2>
      <p className="mt-1">For any questions, message AG Enterprises on WhatsApp.</p>
    </div>
  );
}
