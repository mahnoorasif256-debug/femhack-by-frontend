import { auth, db } from "../firebase.config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


let bookings = [];
let activeFilter = "all";

const statusClass = {
  "Pending": "status-pending",
  "Accepted": "status-accepted",
  "In Progress": "status-progress",
  "Completed": "status-completed",
  "Rejected": "status-rejected"
};

// 1. Real-time Firestore Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    const greetingEl = document.getElementById("userGreeting");
    const avatarEl = document.getElementById("userAvatar");
    if (greetingEl) greetingEl.textContent = `Hi, ${name}`;
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

    // Fetch all bookings from Firestore
    const q = collection(db, "bookings");
    onSnapshot(q, (snapshot) => {
      bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      render();
    }, (err) => {
      console.error("Firestore error:", err);
    });
  } else {
    window.location.href = "../login.html";
  }
});

// 2. Render Cards & Update Counters
function render() {
  const list = document.getElementById("bookingsList");
  const empty = document.getElementById("emptyState");
  if (!list) return;

  const filtered = activeFilter === "all" 
    ? bookings 
    : bookings.filter(b => (b.status || "").toLowerCase() === activeFilter.toLowerCase());

  list.innerHTML = "";
  if (empty) empty.classList.toggle("d-none", filtered.length > 0);

  filtered.forEach(b => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6";
    col.innerHTML = `
      <div class="booking-card p-3 h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-bold text-white">${b.providerName || "Service Provider"}</div>
            <div class="small text-white-50">${b.serviceCategory || b.service || "General Service"}</div>
          </div>
          <span class="badge-status ${statusClass[b.status] || 'status-pending'}">${b.status || 'Pending'}</span>
        </div>
        <div class="small text-white-50 mb-2">
          <i class="bi bi-calendar3 me-1"></i>${b.date || 'N/A'} &nbsp; <i class="bi bi-tag me-1"></i>${b.price || ''}
        </div>
        <div class="booking-id mb-3">Booking ID: ${b.bookingId || b.id}</div>
      </div>`;
    list.appendChild(col);
  });

  // Counters Update
  const getCount = (st) => bookings.filter(b => (b.status || "").toLowerCase() === st.toLowerCase()).length;
  
  if (document.getElementById("countPending")) document.getElementById("countPending").textContent = getCount("pending");
  if (document.getElementById("countProgress")) document.getElementById("countProgress").textContent = getCount("in progress");
  if (document.getElementById("countCompleted")) document.getElementById("countCompleted").textContent = getCount("completed");
  if (document.getElementById("countTotal")) document.getElementById("countTotal").textContent = bookings.length;
}

// 3. Filter Buttons Handler
document.getElementById("filterBar")?.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-pill")) {
    document.querySelectorAll(".filter-pill").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    activeFilter = e.target.getAttribute("data-filter");
    render();
  }
});

// 4. Logout Event
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../login.html";
});