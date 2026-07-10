# Wasif Jewellers — Gold Rate Today

A live, shareable gold rate poster. Wasif updates the rate from a
password-protected admin page; anyone who opens the link sees the current
rate instantly — and it updates live on their screen if he changes it while
they're looking, no refresh needed.

## What's inside

- Public poster view — big rate number, date, shop branding, jewelry photo,
  Urdu toggle, "Share on WhatsApp" and "Download Poster" buttons.
- Password-protected admin view — enter 24K/22K/21K rates per tola
  (per-gram is calculated automatically), pick which one shows on the
  poster.
- Default admin password: `wasif786` — change it in `src/App.jsx`
  (search for `ADMIN_PASSWORD`).

## One-time setup: Firebase (free, ~3 minutes)

The app needs somewhere to store today's rate so every visitor sees the
same number. Follow the instructions inside `src/firebaseConfig.js` —
they walk through creating a free Firebase project and pasting in your
config. You only have to do this once.

## Deploying (phone-friendly)

1. **Create a GitHub repo** — easiest from the GitHub app: New repo →
   name it (e.g. `wasif-gold-rate`) → Create.
2. **Upload these files to it.** If you're comfortable with `git` on a
   computer:
   ```
   git init
   git add .
   git commit -m "Gold rate app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/wasif-gold-rate.git
   git push -u origin main
   ```
   If you're doing this from your phone only, the GitHub app lets you
   create files one by one, or you can use a tool like Working Copy (iOS)
   or the GitHub mobile web upload option.
3. **Deploy on Vercel** — go to vercel.com → New Project → Import the
   `wasif-gold-rate` GitHub repo → it auto-detects Vite → Deploy.
4. Vercel gives you a live `.vercel.app` link — that's the one to share
   with your friend and his customers.

Every time you push a change to GitHub, Vercel redeploys automatically.

## Changing shop details

Shop name, address, and phone are near the top of `src/App.jsx` in the
`SHOP` object. The jewelry photo is `public/necklace.jpg` — replace that
file (keep the same filename) to swap the image.
