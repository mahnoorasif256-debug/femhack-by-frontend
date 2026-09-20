import {
  auth,
  db,
  onAuthStateChanged,
  serverTimestamp
} from "./firebase.config.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

/* ============================
   NOTE: Provider profile display (name, image, price etc.) is
   handled separately in providers-details.js (plain script, no
   Firebase dependency) so the page always shows correct info even
   if Firebase is slow/unreachable. This file ONLY handles the
   login-gated booking flow.
   ============================ */
const params = new URLSearchParams(window.location.search);
const providerId = Number(params.get("id")) || 1;
const providers = window.PROVIDERS_DATA || [];
const provider = window.CURRENT_PROVIDER || providers.find(p => p.id === providerId) || providers[0];

/* ============================
   1. Login gate on "Book Service Now"
   ============================ */
let currentUser = null;

const bookServiceBtn = document.getElementById("bookServiceBtn");
const bookingModalEl = document.getElementById("bookingModal");

// Auth state resolve hone tak button ko disable rakhte hain, taake
// "logged-in hone ke bawajood login page par bhej diya" wala race condition na ho.
if (bookServiceBtn) {
  bookServiceBtn.disabled = true;
  bookServiceBtn.textContent = "Checking login...";
}

let authResolved = false;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authResolved = true;
  if (bookServiceBtn) {
    bookServiceBtn.disabled = false;
    bookServiceBtn.textContent = "Book Service Now";
  }
});

// Safety net: agar kisi wajah se Firebase auth check atak jaye (slow network waghera),
// to button hamesha ke liye disabled na reh jaye - 4 second baad khud enable ho jayega.
setTimeout(() => {
  if (!authResolved && bookServiceBtn) {
    bookServiceBtn.disabled = false;
    bookServiceBtn.textContent = "Book Service Now";
  }
}, 4000);

if (bookServiceBtn && bookingModalEl) {
  bookServiceBtn.addEventListener("click", () => {
    if (!currentUser) {
      // Login ke baad wapas isi provider page par le aane ke liye current URL save kar lete hain
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "./login.html";
      return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(bookingModalEl);
    modal.show();
  });
}

/* ============================
   3. Booking form submit -> Firestore
   ============================ */
const bookingForm = document.getElementById("bookingForm");
const bookingSuccessBox = document.getElementById("bookingSuccessBox");
const bookingFormError = document.getElementById("bookingFormError");
const bookingSubmitBtn = document.getElementById("bookingSubmitBtn");

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      // Extra safety, agar kisi tarah session expire ho gaya ho
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "./login.html";
      return;
    }

    const date = document.getElementById("bookDate").value;
    const time = document.getElementById("bookTime").value;
    const location = document.getElementById("bookLocation").value.trim();
    const description = document.getElementById("bookDesc").value.trim();

    if (!date || !time || !location) {
      if (bookingFormError) {
        bookingFormError.textContent = "Please fill in date, time and location.";
        bookingFormError.style.display = "block";
      }
      return;
    }
    if (bookingFormError) bookingFormError.style.display = "none";

    const bookingId = "QS-" + Date.now().toString().slice(-8);

    const bookingData = {
      bookingId,
      providerId: provider.id,
      providerName: provider.name,
      category: provider.category,
      serviceCategory: provider.category,
      serviceName: provider.category,
      price: provider.price,
      date,
      time,
      location,
      description,
      status: "Pending",
      customerId: currentUser.uid,
      customerName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Customer"),
      customerEmail: currentUser.email || "",
      createdAt: serverTimestamp()
    };

    try {
      if (bookingSubmitBtn) {
        bookingSubmitBtn.disabled = true;
        bookingSubmitBtn.textContent = "Sending...";
      }

      await addDoc(collection(db, "bookings"), bookingData);

      // Success state dikhao, form chhupa do
      bookingForm.style.display = "none";
      if (bookingSuccessBox) bookingSuccessBox.style.display = "block";

      setTimeout(() => {
        const modal = bootstrap.Modal.getOrCreateInstance(bookingModalEl);
        modal.hide();

        // Modal band hone ke thodi der baad form wapas reset/reveal kar dete hain
        setTimeout(() => {
          bookingForm.reset();
          bookingForm.style.display = "block";
          if (bookingSuccessBox) bookingSuccessBox.style.display = "none";
          if (bookingSubmitBtn) {
            bookingSubmitBtn.disabled = false;
            bookingSubmitBtn.textContent = "Confirm & Send Booking";
          }
        }, 400);
      }, 1800);

    } catch (error) {
      console.error("Booking error:", error);
      if (bookingFormError) {
        bookingFormError.textContent = "Something went wrong while sending your booking. Please try again.";
        bookingFormError.style.display = "block";
      }
      if (bookingSubmitBtn) {
        bookingSubmitBtn.disabled = false;
        bookingSubmitBtn.textContent = "Confirm & Send Booking";
      }
    }
  });
}
