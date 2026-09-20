# femhack-by-frontend

### 🔑 provider Login Credentials
* **provider Email:** `rsoftwares00@gmail.com`
* **provider Password:** `1234567A`

---

## ✅ Update Log (latest revision)

### Bugs fixed
1. **"Describe the problem" auto-scroll bug** — clicking "Find My Service" used to jump the page straight to the services grid. It now shows the recommended category, urgency and reason inline (like the reference site), and only scrolls when the user explicitly clicks "Browse ... professionals".
2. **Heart / Wishlist button was broken** — `toggleWishlist()` was called in the HTML but never defined anywhere, so clicking a heart did nothing (silent console error). It's now fully implemented with localStorage persistence.
3. **"View Profile" always showed the same static provider ("Ali Khan")** regardless of which card was clicked — `providers-details.html` is now fully dynamic and reads the correct provider from `providers-data.js` based on the `?id=` in the URL.
4. **Booking button had no login check** — guests could open the booking modal and submit without being logged in. It now checks auth state first; if not logged in, it redirects to `login.html` and returns the user to the same provider page after they log in.
5. **Booking form reload bug** — submitting the booking form previously caused a native page reload (no JS was attached to the form), which lost the `?id=` from the URL and showed no confirmation. It now submits via JS, saves the booking to Firestore (`bookings` collection — same schema your Customer/Provider dashboards already read from), and shows a success message.
6. **File name mismatch** — `firebase_config.js` was renamed to `firebase.config.js` to match what `login.js`, `signup.js`, `customer.js` and `provider.js` actually import. This import was silently broken before.
7. **Dead `#how-it-works` link** — the header nav and hero link pointed to a section that didn't exist on the page.
8. **`provider.html` had a duplicate `</body>` tag** and a duplicate `id="logoutBtn"` used on both the real Logout button and the "Edit Profile" button (now `id="editProfileBtn"`).

### New features
- **Saved / Wishlist page** (`saved.html`) — "How It Works" in the header was replaced with "Saved". Clicking the heart on any provider card (or on the provider detail page) saves it here; click again to remove it.
- Provider detail page now has its own save-heart button next to the profile photo.

### Known limitation (not fixed yet, flagging for awareness)
- The Provider Dashboard currently shows **all** bookings from every customer, not just bookings made for that specific provider — because providers in `providers-data.js` aren't linked to real Firebase provider accounts yet. Fixing this properly would need each provider to have a real account whose UID matches their listing.
- "Edit Profile" button on the provider dashboard is currently a placeholder (no functionality wired up yet).

