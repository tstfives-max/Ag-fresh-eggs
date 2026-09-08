# Google Sign-In / Sign-Up

## What's already built

An **optional** convenience login, on top of the existing guest checkout — nothing
about guest checkout (name + phone, no account) changes or breaks.

| Piece | File |
|---|---|
| "Sign in with Google" button (reusable) | [`src/components/auth/GoogleSignInButton.tsx`](src/components/auth/GoogleSignInButton.tsx) |
| OAuth callback that finishes the sign-in | [`src/app/auth/callback/route.ts`](src/app/auth/callback/route.ts) |
| Reactive "am I signed in" hook | [`src/lib/hooks/useAuthUser.ts`](src/lib/hooks/useAuthUser.ts) |
| Profile page: shows Google identity, sign in/out | [`src/app/(customer)/profile/page.tsx`](src/app/(customer)/profile/page.tsx) |
| Checkout step 1: "Sign in with Google to autofill your details" | [`src/app/(customer)/checkout/page.tsx`](src/app/(customer)/checkout/page.tsx) |
| Links a signed-in account to the phone number it's ordered with | [`src/app/api/account/link/route.ts`](src/app/api/account/link/route.ts) |
| Looks up the phone linked to a signed-in account (order history across devices) | [`src/app/api/account/phone/route.ts`](src/app/api/account/phone/route.ts) |

**How the "saved order history" part actually works:** guest orders are still looked
up by phone number (unchanged). Signing in with Google links that phone to the
Google account behind the scenes, so on a *new* device, signing in alone is enough
to pull the phone back and show past orders — no re-typing a phone number.

None of this can go live without a Google OAuth client, which (like Firebase) is
tied to your Google account. Here's the remaining setup.

---

## 1. Run this SQL in Supabase (SQL Editor)

```sql
alter table customers
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create index if not exists customers_auth_user_id_idx on customers (auth_user_id);
```

## 2. Create a Google OAuth client (~5 min)

You can reuse the **same Google Cloud project as Firebase** (`ag-egg-app`) — it's
the same underlying project, no need to create a new one.

1. Go to https://console.cloud.google.com/apis/credentials?project=ag-egg-app
2. If prompted, click **Configure consent screen** first:
   - User type: **External**
   - App name: `AG Fresh Eggs`, support email: your email, developer contact: your email
   - Skip scopes/test users (default is fine) → **Save and continue** through to done
3. Back on the **Credentials** page → **Create credentials → OAuth client ID**
4. Application type: **Web application**
5. Name: `AG Fresh Eggs — Supabase Auth`
6. **Authorized JavaScript origins** → add:
   ```
   https://ag-fresh-eggs.vercel.app
   ```
7. **Authorized redirect URIs** → add (this is Supabase's own callback, not the app's):
   ```
   https://slwfxipcbeagjqnlbnyg.supabase.co/auth/v1/callback
   ```
8. **Create** → you'll get a **Client ID** and **Client secret**. Copy both.

## 3. Enable Google in Supabase Auth

1. Supabase Dashboard → your project → **Authentication → Providers**
2. Find **Google** → toggle it on
3. Paste the **Client ID** and **Client Secret** from step 2 → **Save**
4. Still in Authentication, go to **URL Configuration**:
   - **Site URL:** `https://ag-fresh-eggs.vercel.app`
   - **Redirect URLs** → add: `https://ag-fresh-eggs.vercel.app/auth/callback`

That's it — no Vercel env vars needed for this part, Supabase handles the OAuth
exchange server-side using the anon key the app already has.

## 4. Test it

1. Go to https://ag-fresh-eggs.vercel.app/profile → **Sign in with Google**
2. You should land back on Profile, signed in, with your Google name/photo showing
3. Place a guest order on the same phone number if you haven't already, then check
   the phone got linked (Supabase → Table Editor → `customers` → your row should now
   have `auth_user_id` filled in)

---

## ⚠️ One real risk, specific to the packaged Android app

Google actively **blocks its own sign-in flow inside plain embedded WebViews**
(shows a "This browser or app may not be secure" error) — a security measure
against exactly the kind of WebView wrapper this app is. It works fine on the
actual **website** in any real browser; whether it works inside the **installed
Android app** depends on how Google's WebView-detection reacts to Capacitor's
WebView in practice.

**Test this specifically** once the setup above is done — install the app, try
Google sign-in from inside it. If it's blocked, the standard fix is routing the
OAuth flow through `@capacitor/browser` (an in-app Chrome tab, not the main
WebView) with a deep link back into the app — a moderate follow-up, not a small
tweak. Tell me if you hit this and I'll build that flow.

---

## Status: fully configured ✅

Done, end to end, on 2026-09-08:
- SQL migration run (`customers.auth_user_id` column exists, verified in Table Editor)
- Google OAuth client created in Google Cloud Console (`ag-egg-app` project),
  with the Supabase callback URL registered
- Client ID/Secret pasted into Supabase's Google provider, provider enabled
- Supabase Site URL set to `https://ag-fresh-eggs.vercel.app`
- Redirect URL `https://ag-fresh-eggs.vercel.app/auth/callback` added
- Verified live: `/profile` shows the "Sign in with Google" button

**Remaining:** test an actual sign-in on https://ag-fresh-eggs.vercel.app/profile,
and separately test it from inside the installed Android app — see the WebView
risk noted above. Tell me what happens on either and I'll fix anything that
comes up.
