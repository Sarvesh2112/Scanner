# Card Wallet

A digital wallet for business cards, inspired by COVVE Scan. Capture a card photo,
auto-extract the fields, tag it, and save it to your iPhone Contacts with one tap.

- **100% client-side** — no backend, no login.
- **On-device OCR** via [tesseract.js](https://github.com/naptha/tesseract.js).
- **Local storage** in IndexedDB (private to your device/browser).
- **Add to Contacts** generates a `.vcf` vCard that opens the iOS Add Contact sheet.
- Installable PWA — "Add to Home Screen" on iPhone for an app-like icon.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL in a desktop browser to test.

## Use on your iPhone

1. Make sure your Mac and iPhone are on the **same Wi-Fi**.
2. Run `npm run dev` (the dev server is already exposed on the LAN).
3. On the iPhone, open the **Network** URL Vite prints, e.g. `http://192.168.x.x:5173`.
4. Tap **+ Scan card** → the camera opens → take the photo → **Scan card**.
5. Review/fix fields, add a **category tag**, **Save to wallet**.
6. On a saved card tap **+ Add to Contacts** → the iOS Add Contact sheet opens.
7. Optional: Share ▸ **Add to Home Screen** to install it as an app.

## Build

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

## How field extraction works

OCR returns raw text, then `src/parseCard.ts` applies heuristics (regex for email /
phone / website, keyword matching for company / designation, position for name,
remaining digit/address lines for the address). OCR is imperfect, so the **review
form is editable** — fix anything before saving.

## Notes / limitations

- Camera capture uses a file input (`capture="environment"`), which works without
  HTTPS. A full live-preview camera would require HTTPS and is out of scope.
- tesseract.js downloads its language model on first scan, so the first scan needs
  an internet connection and is a bit slower.
