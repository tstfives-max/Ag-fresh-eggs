# Deploying AG Fresh Eggs to the Google Play Store

This is the exact, step-by-step path from the signed app file you already have to a
live Play Store listing. No coding knowledge needed from here — every remaining
step is clicking through the Play Console.

Everything technical (the app, its permissions, the signed release file, the
listing copy, the screenshots) is already done. What's left is entirely on
Google's side of the process, and only you can do it because it needs your
Google account, your payment for the one-time developer fee, and your
identity/business details.

---

## 0. What's already built and ready

| Item | Status | Where |
|---|---|---|
| Signed release app bundle (.aab) | ✅ Done | `android/app/build/outputs/bundle/release/app-release.aab` |
| Signing keystore (needed for every future update) | ✅ Done | `android/app/ag-fresh-eggs-release.keystore` |
| App icon (512×512) | ✅ Done | `public/brand/play-store-icon-512.png` |
| Feature graphic (1024×500) | ✅ Done | `public/brand/play-store-feature-graphic.jpg` |
| Phone screenshots (5) | ✅ Done | `brand-source/screenshots/shot-*.png` |
| Store listing copy (title, description, etc.) | ✅ Done | `PLAY_STORE_LISTING.md` |
| Privacy Policy page (required by Play Store) | ✅ Live | https://ag-fresh-eggs.vercel.app/privacy |
| Data Safety form answers | ✅ Drafted | `PLAY_STORE_LISTING.md` |
| Content rating pointers | ✅ Drafted | `PLAY_STORE_LISTING.md` |
| Location permissions declared correctly | ✅ Done | `android/app/src/main/AndroidManifest.xml` |
| Target API level (Play Store requires recent) | ✅ Compliant | API 36 (`android/variables.gradle`) |
| Real support email for the listing | ✅ Done | agenterprises626@gmail.com, in `PLAY_STORE_LISTING.md` |

**⚠️ Before you do anything else: back up the keystore.**
`android/app/ag-fresh-eggs-release.keystore` and `android/keystore.properties`
are the only copies of your app's signing identity. If you ever lose them, you
can **never publish an update to this app again** under the same listing — you'd
have to publish it as a brand new app and every existing user would need to
manually reinstall. Copy both files to a password manager, encrypted USB drive,
or private cloud folder right now, before you forget. They are intentionally
excluded from git (never commit a signing key), so nowhere else has a copy.

---

## 1. Create your Google Play Console developer account (one-time, ~15–30 min)

1. Go to https://play.google.com/console/signup
2. Sign in with the Google account you want to own this app forever (you can't
   easily transfer ownership later, so pick your main/business Google account).
3. Pay the **one-time $25 USD registration fee** (your own card — I cannot and
   will not do this step for you).
4. Fill in your developer identity:
   - If publishing as **yourself**: your legal name, address, phone.
   - If publishing as **AG Enterprises** (a business): you'll need to verify
     it as an "Organization" account, which requires a D-U-N-S number or
     equivalent business registration proof. If you don't have that yet,
     publish as an individual first — you can convert later.
5. Complete identity verification if Google asks for it (photo ID / a short
   video, done entirely inside the Play Console — this can take 1–2 days to
   clear).

---

## 2. Create the app listing

1. In Play Console, click **Create app**.
2. Fill in:
   - **App name:** `AG Fresh Eggs`
   - **Default language:** English (India) — or Hindi if you prefer that as primary
   - **App or game:** App
   - **Free or paid:** Free
3. Accept the declarations (US export laws, content guidelines).
4. Click **Create app**. You'll land on the app's dashboard with a checklist —
   that checklist is basically the rest of this guide.

---

## 3. Fill in the store listing

Go to **Grow → Store presence → Main store listing**. Copy everything straight
from `PLAY_STORE_LISTING.md` in this project:

- **App name**
- **Short description**
- **Full description**
- **App icon** — upload `public/brand/play-store-icon-512.png`
- **Feature graphic** — 1024×500; not made yet, ask me to generate one if you
  want it before you submit (it's optional at draft time but required to publish)
- **Phone screenshots** — upload the 5 files in `brand-source/screenshots/`
  (`shot-01-home.png` through `shot-05-shop.png`)
- **Contact details** — email `agenterprises626@gmail.com`, phone (see
  `PLAY_STORE_LISTING.md`)
- **Privacy Policy URL:** `https://ag-fresh-eggs.vercel.app/privacy`

Click **Save**.

---

## 4. Complete the required questionnaires

Still on the app dashboard, under **Grow → Store presence** / **Policy → App content**:

### App content
- **Privacy Policy:** paste `https://ag-fresh-eggs.vercel.app/privacy`
- **App access:** select "All functionality is available without special
  access" (no login required to browse; checkout only needs name + phone, no
  password) — matches the "App access" section in `PLAY_STORE_LISTING.md`
- **Ads:** No, this app shows no ads
- **Content rating questionnaire:** Category = Shopping/Food ordering. Answer
  honestly — see the pointer notes in `PLAY_STORE_LISTING.md`, it should land
  in the lowest rating tier (everyone/3+ in most regions)
- **Target audience and content:** Adults ordering food; not designed for or
  directed at children — do not select any child age range
- **Data safety form:** Use the table in `PLAY_STORE_LISTING.md` under
  "Data safety form — what to declare." Declare: name, phone number, address,
  precise location (optional/user-initiated), purchase history, and chat
  messages sent to the AI assistant. Mark all of it as encrypted in transit
  (HTTPS) and note users can request deletion via WhatsApp.
- **Government apps, Financial features, Health:** No to all — this is a food
  delivery app, Razorpay handles all payment data directly, the app never
  touches card/bank details.

### Store settings
- **App category:** Food & Drink
- **Store listing contact details:** same email/phone as above

---

## 5. Upload the signed app bundle

1. Go to **Release → Production** (or **Testing → Internal testing** first if
   you want to try it privately before going public — recommended for a first
   release).
2. Click **Create new release**.
3. Under **App integrity**, Google will ask about **Play App Signing** — accept
   the default (Google manages the final signing key; you keep your upload
   key, which is the keystore you already have). This is standard and Google
   requires it for new apps.
4. Upload the file: `android/app/build/outputs/bundle/release/app-release.aab`
5. Fill in the **Release name** (e.g. `1.0 (1)`) and **Release notes**
   (e.g. "Initial release of AG Fresh Eggs.")
6. Click **Save**, then **Review release**.

---

## 6. Set up pricing & distribution

Go to **Grow → Store presence → Pricing & distribution** (or it may appear as
a required checklist item):
- Confirm the app is **Free**
- Select **India** as the country (add more countries only if you plan to
  deliver there — there's no reason to list this in countries you don't serve)
- Confirm it contains no ads, complies with US export laws, etc. (checkboxes)

---

## 7. Submit for review

1. Back on **Release → Production**, click **Start rollout to Production**
   (or "Start rollout to Internal testing" if you chose that track first).
2. Confirm the rollout.
3. Google reviews new apps typically within **a few hours to 3 days**. You'll
   get an email when it's approved (or if something needs fixing — the most
   common first-time rejections are a missing/incomplete Data Safety form or
   Privacy Policy link, both of which are already handled above).

Once approved, your app goes live at:
`https://play.google.com/store/apps/details?id=com.agenterprises.freshegs`

---

## 8. After it's live — updating the app later

Whenever the web app changes, you generally **don't need a new Play Store
release** — the Android app is a thin shell that loads your live website, so
UI/product/content changes appear automatically for existing users.

You only need a new Play Store release when something in the **native shell**
changes — e.g. a new permission, the app icon, or the splash screen. To do that:

```bash
npx cap sync android
```

```bash
cd android
./gradlew bundleRelease
```

(On this machine, `JAVA_HOME` must point at the Android Studio JBR first —
ask me to run this for you, I already know the exact commands.)

Then bump `versionCode` and `versionName` in `android/app/build.gradle`,
upload the new `app-release.aab` the same way as step 5, using the **same
keystore** (this is why backing it up matters — Google will reject an update
signed with a different key).

---

## Reference: permissions this app requests and why

| Permission | Why |
|---|---|
| `INTERNET` | Loads the live AG Fresh Eggs web app — required for the app to function at all |
| `ACCESS_NETWORK_STATE` | Lets the app detect connectivity issues gracefully |
| `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` | Only used when the customer taps "Use my current location" on the delivery-zone checker — never requested on launch, never used in the background |

No camera, microphone, contacts, storage, or SMS permissions are requested.

---

## Things only you can do (summary)

- Pay the $25 Google Play developer registration fee
- Verify your identity/business with Google
- Click through and approve each Play Console form (I've drafted every answer)
- Click the final "Start rollout to Production" button

Everything else — the app itself, its permissions, the signed bundle, the
listing copy, the screenshots, the privacy policy — is already built and
sitting in this repo, ready to paste in.
