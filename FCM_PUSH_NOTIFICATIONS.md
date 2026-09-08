# Push notifications after checkout (Firebase Cloud Messaging)

## What's already built

When a customer's payment is verified (either the client returning from Razorpay's
checkout, or the Razorpay webhook as a backstop), the app now sends a push notification —
**"Order confirmed! 🥚 — Order #N is confirmed — ₹Total. We'll notify you as it moves."**
— to that customer's phone, on any device where they have the app installed and granted
notification permission.

| Piece | File |
|---|---|
| Device registers for push + gets an FCM token on app launch (native app only — no-op on the website) | [`src/lib/push-notifications.ts`](src/lib/push-notifications.ts), [`src/components/push/PushNotificationsInit.tsx`](src/components/push/PushNotificationsInit.tsx) |
| Token gets tied to the customer's phone right when checkout succeeds | [`src/app/(customer)/checkout/page.tsx`](src/app/(customer)/checkout/page.tsx) |
| Standalone endpoint to (re-)register a token against a phone | [`src/app/api/push/register/route.ts`](src/app/api/push/register/route.ts) |
| Sends the actual push via Firebase Admin SDK, prunes dead tokens | [`src/lib/services/push.ts`](src/lib/services/push.ts) |
| Wired into both payment-confirmation paths | [`src/app/api/payments/verify/route.ts`](src/app/api/payments/verify/route.ts), [`src/app/api/payments/webhook/route.ts`](src/app/api/payments/webhook/route.ts) |
| Android manifest permission + FCM service registration | `android/app/src/main/AndroidManifest.xml`, `@capacitor/push-notifications` (auto-merged) |

This is built to extend cleanly — `sendPushToPhone(phone, notification, data)` in
`src/lib/services/push.ts` is generic, so wiring up "order packed" / "out for delivery"
pushes from the admin dashboard later is a small addition, not a new system.

**None of this can go live yet — it needs a Firebase project, which only you can create**
(it's tied to a Google account). Everything below is the remaining setup, in order.

---

## 1. Run this SQL in Supabase (SQL Editor)

Stores one row per device token, keyed to the phone that owns it:

```sql
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  fcm_token text not null unique,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_phone_idx on push_tokens (phone);

-- Locked down like every other table here: only the server (service role key) touches
-- this table directly. No public read/write policies needed.
alter table push_tokens enable row level security;
```

## 2. Create the Firebase project (~10 min)

1. Go to https://console.firebase.google.com → **Add project**
2. Name it something like `ag-fresh-eggs` → follow the prompts (Google Analytics is
   optional, skip it, not needed here) → **Create project**
3. Once created, click **Add app → Android** (the Android icon)
4. **Android package name:** `com.agenterprises.freshegs` — must match exactly
5. App nickname: `AG Fresh Eggs` (optional, just a label)
6. Skip the SHA-1 field for now (only needed for Google Sign-In, not push)
7. Click **Register app**, then **Download google-services.json**
8. Save that file to: `android/app/google-services.json` in this project
   (it's gitignored — same treatment as the release keystore, never commit it)
9. Skip the remaining "add SDK" steps in the Firebase wizard — Capacitor's
   `@capacitor/push-notifications` plugin already handles that; just click through to
   finish.

## 3. Generate a server (Admin SDK) key

This is what lets your Vercel backend actually *send* pushes (separate from the
Android app's own config above):

1. In Firebase Console → the gear icon → **Project settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key** → confirms → downloads a JSON file
4. Open that JSON file. You need three values from it:
   - `project_id`
   - `client_email`
   - `private_key`

## 4. Set these on Vercel (Settings → Environment Variables → Production)

| Variable | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | the `project_id` from the service account JSON |
| `FIREBASE_CLIENT_EMAIL` | the `client_email` from the same file |
| `FIREBASE_PRIVATE_KEY` | the `private_key` value — **paste it exactly as-is**, including the `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` lines and the `\n` sequences in the middle. Vercel's env var UI accepts multi-line values fine; don't try to manually convert the `\n`s into real line breaks. |

Redeploy after saving (Vercel usually prompts you to).

## 5. Rebuild the Android app

Adding `google-services.json` changes the native build (it's what activates the
`com.google.gms.google-services` Gradle plugin that's already conditionally wired into
`android/app/build.gradle`), so the app needs a fresh signed build to pick it up:

```bash
npx cap sync android
```

```bash
cd android
./gradlew bundleRelease
```

(Ask me to run this — I already know the exact `JAVA_HOME` setup this machine needs.)
This produces a new `app-release.aab` signed with the same keystore as before. If the
app is already on the Play Store by then, this becomes a normal version-bump update
(see the "updating the app later" section in `PLAY_STORE_DEPLOYMENT.md`); if not, it
just replaces the file you'll eventually upload.

## 6. Test it

1. Install the freshly-built APK/AAB on a real Android device (emulators can be flaky
   for FCM — a real device is more reliable for this specific test)
2. Open the app, allow the notification permission prompt when it appears
3. Place a real order and pay (Razorpay test mode is fine for this — see the
   Razorpay setup conversation for test card numbers) all the way through checkout
4. You should get a push notification within a few seconds of payment succeeding

If nothing arrives: check Vercel's runtime logs for the `/api/payments/verify` request —
`sendOrderConfirmedPush` logs any Firebase error rather than throwing, so a
misconfigured key shows up there as `"FCM send failed"` or a Firebase Admin init error.

---

## Summary of what only you can do here

- Create the Firebase project and Android app registration (Google account required)
- Download `google-services.json` and place it in `android/app/`
- Generate the service account key and paste 3 values into Vercel
- Approve a rebuild of the app once google-services.json is in place
