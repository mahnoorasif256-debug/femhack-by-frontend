import { auth, db } from "../firebase.config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

let bookings = [];
let activeFilter = "all";
let providerCategory = "";

const statusClass = {
  "Pending": "status-pending",
  "Accepted": "status-accepted",
  "In Progress": "status-progress",
  "Completed": "status-completed",
  "Rejected": "status-rejected"
};

// 1. Real-time Auth & Provider Data Fetching
// 1. Real-time Auth & Provider Data Fetching
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let providerName = user.displayName || user.email.split("@")[0];
      let providerCity = "Karachi, Pakistan";
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        providerCategory = userData.category || userData.serviceCategory || "";
        providerName = userData.fullName || userData.name || providerName;
        providerCity = userData.location || providerCity;
      }

      // Dashboard par name aur profile details set karna
      const greetingEl = document.getElementById("providerName") || document.getElementById("userGreeting");
      if (greetingEl) greetingEl.textContent = providerName;

      const businessNameEl = document.getElementById("profileBusinessName");
      if (businessNameEl) businessNameEl.textContent = providerName;

      const avatarEl = document.getElementById("profileAvatar");
      if (avatarEl) avatarEl.textContent = providerName.charAt(0).toUpperCase();

      const locationEl = document.getElementById("profileLocationLine");
      if (locationEl) locationEl.innerHTML = `<i class="bi bi-geo-alt me-1"></i>${providerCity}`;

    } catch (e) {
      console.error("Error fetching provider data:", e);
    }

    const q = collection(db, "bookings");
    onSnapshot(q, (snapshot) => {
      let allBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (providerCategory) {
        bookings = allBookings.filter(b => 
          (b.category && b.category.toLowerCase() === providerCategory.toLowerCase()) ||
          (b.serviceCategory && b.serviceCategory.toLowerCase() === providerCategory.toLowerCase())
        );
      } else {
        bookings = allBookings;
      }

      render();
    }, (err) => {
      console.error("Firestore error:", err);
    });
  } else {
    window.location.href = "../login.html";
  }
});

// 2. Render Cards, Counters & Action Buttons
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
    const currentStatus = b.status || "Pending";
    
    let actionButtons = "";
    if (currentStatus === "Pending") {
      actionButtons = `
        <button class="btn btn-success btn-sm rounded-pill px-3 me-1" onclick="changeStatus('${b.id}', 'Accepted')"><i class="bi bi-check-lg"></i> Accept</button>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="changeStatus('${b.id}', 'Rejected')"><i class="bi bi-x-lg"></i> Reject</button>
      `;
    } else if (currentStatus === "Accepted") {
      actionButtons = `
        <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="changeStatus('${b.id}', 'In Progress')"><i class="bi bi-play-fill"></i> Start Work</button>
      `;
    } else if (currentStatus === "In Progress") {
      actionButtons = `
        <button class="btn btn-info btn-sm rounded-pill px-3 text-dark fw-bold" onclick="changeStatus('${b.id}', 'Completed')"><i class="bi bi-check-circle"></i> Mark Complete</button>
      `;
    } else {
      actionButtons = `<span class="small text-white-50 fst-italic">No further action</span>`;
    }

    const col = document.createElement("div");
    col.className = "col-12 mb-3";
    col.innerHTML = `
      <article class="booking-item booking-row p-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-bold text-white fs-5">${b.serviceName || b.category || "Service"}</div>
            <div class="small text-white-50 mt-1">
              <i class="bi bi-calendar3 me-1"></i>${b.date || 'N/A'} &nbsp;•&nbsp; 
              <i class="bi bi-clock me-1"></i>${b.time || 'N/A'} &nbsp;•&nbsp; 
              <i class="bi bi-geo-alt me-1"></i>${b.location || 'N/A'}
            </div>
          </div>
          <span class="badge-status ${statusClass[currentStatus] || 'status-pending'}">${currentStatus}</span>
        </div>
        <p class="text-white-50 small mb-3 fst-italic">${b.description || ''}</p>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top border-secondary">
          <div class="booking-id">ID: ${b.bookingId || b.id}</div>
          <div class="d-flex gap-1">${actionButtons}</div>
        </div>
      </article>`;
    list.appendChild(col);
  });

  // Counters Update
  const getCount = (st) => bookings.filter(b => (b.status || "").toLowerCase() === st.toLowerCase()).length;
  
  if (document.getElementById("countPending")) document.getElementById("countPending").textContent = getCount("pending");
  if (document.getElementById("countAccepted")) document.getElementById("countAccepted").textContent = getCount("accepted");
  if (document.getElementById("countProgress")) document.getElementById("countProgress").textContent = getCount("in progress");
  if (document.getElementById("countCompleted")) document.getElementById("countCompleted").textContent = getCount("completed");
}

// 3. Status Change Global Function
window.changeStatus = async function (bookingId, newStatus) {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Status update karne mein masla aya hai.");
  }
};

// 4. Filter Tabs Handler
document.getElementById("tabBar")?.addEventListener("click", (e) => {
  const pill = e.target.closest(".tab-pill");
  if (pill) {
    document.querySelectorAll(".tab-pill").forEach(btn => btn.classList.remove("active"));
    pill.classList.add("active");
    activeFilter = pill.getAttribute("data-filter").toLowerCase();
    render();
  }
});

// Logout Event (Customer & Provider dono ke liye)
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem('user'); // Session clear
  window.location.href = "../login.html"; // Foran login page par redirect
});




// Edit Profile Modal Trigger & Save Logic
document.getElementById("editProfileBtn")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  // Pehle current values input fields mein load karlein
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById("editNameInput").value = data.fullName || data.name || "";
      document.getElementById("editLocationInput").value = data.location || "";
    }
  } catch (err) {
    console.error("Error loading profile data:", err);
  }

  // Bootstrap Modal open karein
  const modalElement = document.getElementById('editProfileModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
});

// Save Changes Button Click Logic
document.getElementById("saveProfileBtn")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const newName = document.getElementById("editNameInput").value.trim();
  const newLocation = document.getElementById("editLocationInput").value.trim();

  if (!newName) {
    alert("Naam khali nahi ho sakta!");
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      fullName: newName,
      location: newLocation
    });

    // UI par foran update kar dein
    document.getElementById("profileBusinessName").textContent = newName;
    document.getElementById("profileLocationLine").innerHTML = `<i class="bi bi-geo-alt me-1"></i>${newLocation}`;
    document.getElementById("providerName").textContent = newName;

    // Modal close kardein
    const modalElement = document.getElementById('editProfileModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();

    alert("Profile kamiyabi se update ho gayi hai!");
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Profilehas been updated.");
  }
});