// ── Firebase setup (do this once, takes about 3 minutes) ──────────────────
//
// 1. Go to https://console.firebase.google.com on your phone or computer
// 2. Tap "Add project" — give it any name (e.g. "wasif-gold-rate"), you can
//    skip Google Analytics.
// 3. Once created, in the left menu go to Build > Realtime Database >
//    Create Database > choose any location > start in "test mode".
// 4. Go to Project settings (gear icon, top left) > scroll down to
//    "Your apps" > click the </> (web) icon > register the app (nickname
//    only, no hosting needed) > it will show you a `firebaseConfig` object.
// 5. Copy those values into the object below, replacing the placeholders.
// 6. Back in Realtime Database > "Rules" tab, replace the rules with this
//    (so it doesn't expire after 30 days like default test mode does) and
//    click "Publish":
//
//    {
//      "rules": {
//        "rates": {
//          ".read": true,
//          ".write": true
//        }
//      }
//    }
//
// That's it — the app will then sync the gold rate live across every
// device that opens it.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
