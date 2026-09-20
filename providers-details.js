/* ==========================================
   QuickServe - Provider Details Page Population
   Plain script (NOT a module, NO Firebase dependency).
   This guarantees the profile (name, image, price, etc.)
   always renders correctly and instantly from PROVIDERS_DATA,
   even if Firebase is slow to load or briefly unreachable.
   Login-gated booking logic lives separately in booking.js.
   ========================================== */
(function () {
  const params = new URLSearchParams(window.location.search);
  const providerId = Number(params.get("id")) || 1; // fallback to provider #1 if missing/invalid

  const providers = window.PROVIDERS_DATA || [];
  const provider = providers.find(p => p.id === providerId) || providers[0];

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function populateProvider(p) {
    if (!p) return;

    const pImg = document.getElementById("p-img");
    if (pImg) pImg.src = p.img;

    setText("p-name", p.name);
    setText("p-category", p.category);
    setText("p-rating", p.rating);
    setText("p-exp", p.experience);
    setText("p-location", p.location);
    setText("p-price", p.price);
    setText("p-desc", p.desc);

    const badgesBox = document.getElementById("p-badges");
    if (badgesBox && p.badges) {
      badgesBox.innerHTML = p.badges
        .map(b => `<span class="badge bg-slate text-warning border border-warning border-opacity-50 px-3 py-2 rounded-pill fs-7">${b}</span>`)
        .join("");
    }

    if (p.review) {
      setText("review-name", p.review.name);
      setText("review-time", p.review.time);
      setText("review-text", `"${p.review.text}"`);
      const reviewImg = document.getElementById("review-img");
      if (reviewImg) reviewImg.src = p.review.img;
    }

    document.title = `${p.name} - QuickServe`;

    // Save-heart button on this page ke liye correct provider id set karo
    const detailHeart = document.getElementById("detailWishlistBtn");
    if (detailHeart) {
      detailHeart.dataset.providerId = p.id;
      try {
        const saved = JSON.parse(localStorage.getItem("quickserve_saved_providers")) || [];
        const icon = detailHeart.querySelector("i");
        if (saved.includes(p.id) && icon) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
          detailHeart.classList.add("wishlist-active");
        }
      } catch (e) { /* ignore */ }

      detailHeart.addEventListener("click", () => {
        if (window.toggleWishlist) window.toggleWishlist(detailHeart, p.id);
      });
    }
  }

  // Expose the resolved provider globally so booking.js (module, loads after)
  // can reuse the exact same object without re-parsing the URL.
  window.CURRENT_PROVIDER = provider;

  populateProvider(provider);
})();
