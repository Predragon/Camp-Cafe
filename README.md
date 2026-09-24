# Camp Cafe Menu

Installable, offline-capable menu PWA for Camp Cafe — casual · gourmet · whole food dining.

**Live:** https://camp-cafe.pages.dev

- Full menu with photos, sticky section tabs
- "My order" list with running total (saved on the device)
- Share sheet with on-screen QR code, native share, and copy link
- Works offline via service worker; installable to the home screen

## Files

| Path | What |
|------|------|
| `index.html`, `styles.css`, `app.js` | The app. Menu items and prices live in `MENU` at the top of `app.js`. |
| `sw.js` | Service worker (cache-first). **Bump `VERSION` on every change** so installed phones update. |
| `manifest.webmanifest`, `icons/` | PWA manifest and app icons |
| `img/` | Dish photos cropped from `menu.jpg`, plus `qr.svg` for the share sheet |
| `qr/` | Printable QR table card and standalone QR codes |
| `menu.jpg` | Original printed menu (source, not deployed) |

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (Cloudflare Pages, project `camp-cafe`)

```bash
D=$(mktemp -d)
cp -r index.html styles.css app.js sw.js manifest.webmanifest img icons "$D"/
wrangler pages deploy "$D" --project-name camp-cafe --branch main
```

If the URL changes, regenerate `img/qr.svg` and the files in `qr/`, and update `SHARE_URL` in `app.js`.
