# AG Fresh Eggs — Play Store listing draft

Fill in / adjust anything below, then paste into Play Console → your app → Grow → Store presence → Main store listing.

## App details

**App name:** AG Fresh Eggs
**Package name (application ID):** com.agenterprises.freshegs
**Category:** Food & Drink
**Contact email:** (add a real support email — Play Console requires one)
**Contact phone:** +91 98358 98736
**Website:** https://ag-fresh-eggs.vercel.app
**Privacy Policy URL:** https://ag-fresh-eggs.vercel.app/privacy

## Short description (max 80 characters)

Farm-fresh eggs delivered near Danapur, Patna — order in a few taps.

## Full description (max 4000 characters)

AG Fresh Eggs by AG Enterprises brings farm-fresh eggs straight to your door — fast, simple, and hyperlocal.

🥚 SIMPLE PACKS
Choose from 6, 12, or 30-piece packs, or a full box of 100 — pricing and stock update live, so what you see is always current.

📍 HYPERLOCAL DELIVERY
We currently deliver within 3 KM of Danapur, Patna – 801503. The app checks your exact location before checkout so you always know if you're in our zone.

🛒 EASY ORDERING
Browse, add to cart, and check out in a few taps. Pay securely via UPI, cards, net banking, or wallets through Razorpay.

💬 WHATSAPP CONFIRMATION
Every order can be confirmed instantly over WhatsApp — no waiting on hold.

📦 LIVE ORDER TRACKING
Follow your order from placed → confirmed → packed → out for delivery → delivered, right in the app.

🤖 AG ASSISTANT
Have a question about packs, prices, delivery, or your order? Ask our AI shopping assistant — it always pulls real, current answers, never guesses.

🎁 AG REWARDS
Every 5th order earns a free 6-pack. Refer a neighbour and you both get ₹20 off.

🏢 BULK & BUSINESS ORDERS
Running a hostel, PG, restaurant, or shop? Message us for bulk pricing.

Have a question? Reach AG Enterprises directly on WhatsApp from inside the app.

## Graphics checklist

- [ ] App icon — 512×512 PNG, 32-bit with alpha (Play Console hi-res icon)
- [ ] Feature graphic — 1024×500 PNG or JPEG
- [ ] Phone screenshots — at least 2, recommend 4–8 (min 320px, max 3840px on the long side)
  Suggested screens: Home, Shop, Cart, Checkout, Order Tracking, AG Assistant
- [ ] (Optional) Tablet screenshots if you want tablet listing support

## Content rating questionnaire — expected answers

Category: **Shopping / Food ordering**. No violence, no user-generated content beyond chat with an AI assistant (not user-to-user), no gambling. Should qualify for the lowest rating tier in most regions — answer the actual questionnaire honestly, this is just a pointer to the likely category.

## Data safety form — what to declare

Based on what the app actually collects (see `src/app/(customer)/privacy/page.tsx` for the full policy):

| Data type | Collected? | Purpose | Shared with |
|---|---|---|---|
| Name | Yes | Account management, order fulfillment | Not shared beyond processors below |
| Phone number | Yes | Account management, order fulfillment, order communication | — |
| Precise location | Yes (optional, user-initiated) | App functionality (delivery zone check) | — |
| Address | Yes | Order fulfillment | — |
| Purchase history | Yes | App functionality, analytics | — |
| Payment info | Handled by Razorpay directly — app never stores card/UPI/bank details | — | Razorpay |
| User-generated content (chat messages to AG Assistant) | Yes | App functionality | Google (Gemini API) |

Data is transmitted over HTTPS/TLS. Users can request deletion via WhatsApp (see Privacy Policy).

## Target audience

Adults ordering food for delivery. Not designed for or directed at children.

## App access

The app requires no login for browsing; checkout requires a name and phone number (no password). No special reviewer instructions needed unless you gate a feature behind login later — if the admin dashboard is ever included in this same app listing (it should NOT be; keep it as an internal-only tool, not the public app), reviewer credentials would need to be provided separately.

## Permissions used (Android)

- **Location (fine/coarse, optional):** to check delivery-zone eligibility and prefill address. Requested at the moment the customer taps "Use my current location," never on app launch.
- **Internet:** required — the app loads live data from the server for every screen.

No camera, contacts, storage, microphone, or SMS permissions are used.
