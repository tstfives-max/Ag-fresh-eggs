# Mobile number login (SMS OTP)

## What's already built

Customers can now sign in with just their mobile number — enter the number,
get a 6-digit code by SMS, enter the code, they're in. This is a **real
verified identity** (Supabase Auth), not the old "type any number and see
orders" trick — that free-text lookup still exists as a fallback option, but
OTP sign-in is now the recommended path.

| Piece | File |
|---|---|
| Two-step phone/OTP form (reusable) | [`src/components/auth/PhoneSignInForm.tsx`](src/components/auth/PhoneSignInForm.tsx) |
| Wired into Profile (alongside Google) | [`src/app/(customer)/profile/page.tsx`](src/app/(customer)/profile/page.tsx) |
| Wired into Orders (the actual history screen) | [`src/app/(customer)/orders/page.tsx`](src/app/(customer)/orders/page.tsx) |
| Auth hook now also exposes the verified phone | [`src/lib/hooks/useAuthUser.ts`](src/lib/hooks/useAuthUser.ts) |

**How "see past history" actually works once signed in:** verifying the OTP
links that phone to the Supabase Auth account (reusing the same
`customers.auth_user_id` linkage built for Google sign-in) and remembers it
locally, so the Orders page finds it immediately — same mechanism as before,
just with a cryptographically verified phone instead of a typed one.

**This can't send real OTPs yet — it needs an SMS provider connected to
Supabase, which only you can set up** (it's a paid third-party account, like
Firebase/Razorpay before it). Here's the remaining setup.

---

## Set up an SMS provider (~10–15 min)

Supabase Auth's Phone provider needs an SMS gateway behind it. **Twilio** is
the most common, has the best docs, and is what Supabase's dashboard is built
around — that's the path below.

1. Go to https://www.twilio.com/try-twilio and create an account (free trial
   credit included, no charge to start)
2. In the Twilio Console, buy a phone number capable of sending SMS
   (**Phone Numbers → Buy a number** — pick one, ~$1/month) — *or* set up
   **Twilio Verify** instead (Console → Verify → Services → Create a
   Service), which is often simpler since Twilio manages the OTP codes
   itself rather than you sending raw SMS
3. Note down:
   - **Account SID**
   - **Auth Token**
   - Either your **Twilio phone number** (SMS route) or your **Verify
     Service SID** (Verify route)

## Connect it to Supabase (~5 min)

1. Supabase Dashboard → your project → **Authentication → Providers**
2. Find **Phone** → toggle it on
3. Pick **Twilio** (or **Twilio Verify**, if you set that up instead) from
   the SMS provider dropdown
4. Paste in the Account SID, Auth Token, and phone number/Verify Service SID
   from above
5. Save

## Test it

1. Go to https://ag-fresh-eggs.vercel.app/orders (or Profile)
2. Enter your own mobile number → **Send OTP**
3. You should get a real SMS with a 6-digit code within a few seconds
4. Enter it → **Verify & sign in** → you should land signed in

If nothing arrives: check **Supabase → Authentication → Logs** for the
specific Twilio error (most common: number not verified yet on a Twilio
trial account — Twilio trial accounts can only text pre-verified numbers
until you upgrade to a paid account, which is worth doing before real
customers use this).

---

## A practical note on India SMS delivery

Indian telecom regulation (TRAI) requires SMS sent to Indian numbers to be
registered under the **DLT (Distributed Ledger Technology)** framework.
Twilio can deliver to India but you may need to complete DLT registration
for reliable delivery at scale — Twilio's docs walk through this
(search "Twilio India DLT" in their help center). If OTPs are landing
unreliably once you're past trial testing, this registration is almost
always why, and it's a compliance step only you can complete (it needs your
business PAN/GST details).

An alternative many Indian apps use instead of Twilio is **MSG91**, which
handles DLT registration natively and is significantly cheaper per SMS for
Indian numbers — but it isn't one of Supabase's built-in provider options,
so wiring it up would need a custom Supabase Auth Hook (a small Edge
Function that calls MSG91's API). Only worth doing if Twilio's India
deliverability or DLT process becomes a real blocker — tell me if you hit
that and I'll build the custom hook.

---

## Summary of what only you can do here

- Create a Twilio account and either buy an SMS number or set up Twilio Verify
- Paste those credentials into Supabase's Phone provider settings
- Test one real OTP end-to-end
- (Eventually, for reliable India delivery at scale) complete Twilio's DLT
  registration, or tell me to switch to MSG91 via a custom Auth Hook instead
