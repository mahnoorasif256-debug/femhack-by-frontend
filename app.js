document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const providersGrid = document.getElementById("providersGrid");
  const categoryButtons = document.querySelectorAll("#categoryButtonsGroup button");
  const heroSearchForm = document.getElementById("heroSearchForm");
  const heroSearchInput = document.getElementById("heroSearchInput");
  
  // Not Sure Section Elements
  const problemInput = document.getElementById("problemInput");
  const findMyServiceBtn = document.getElementById("findMyServiceBtn");

  // Global function for Hero Strip items click (Scroll + Filter)
  window.filterAndScroll = function(categoryName) {
    if (categoryFilter) {
      categoryFilter.value = categoryName;
    }

    // Update Category Pills Active State
    categoryButtons.forEach(btn => {
      if (btn.dataset.category.toLowerCase() === categoryName.toLowerCase()) {
        btn.className = "btn btn-sm btn-warning fw-semibold px-3 rounded-pill";
      } else {
        btn.className = "btn btn-sm btn-outline-secondary fw-semibold px-3 rounded-pill";
      }
    });

    filterProviders();

    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // "Not Sure What You Need" Keyword Matcher Logic
  // Fix: pehle sirf result box ko update/reveal karte hain (jaise reference site mein hota hai),
  // page ko turant #services par jump/scroll NAHI karte. Scroll sirf tab hota hai jab
  // user khud "Browse ... professionals" button par click kare.
  const problemError = document.getElementById("problemError");
  const assistantResultBox = document.getElementById("assistantResultBox");
  const resCategory = document.getElementById("resCategory");
  const resUrgency = document.getElementById("resUrgency");
  const resReason = document.getElementById("resReason");
  const browseAllBtn = document.getElementById("browseAllBtn");
  const browseAllText = document.getElementById("browseAllText");
  let lastMatchedCategory = "all";

  function matchCategory(text) {
    if (text.includes("ac") || text.includes("hawa") || text.includes("cooling") || text.includes("gas") || text.includes("split")) {
      return "AC Technician";
    } else if (text.includes("light") || text.includes("fan") || text.includes("wire") || text.includes("trip") || text.includes("current") || text.includes("electric") || text.includes("switch")) {
      return "Electrician";
    } else if (text.includes("pipe") || text.includes("tap") || text.includes("leak") || text.includes("water") || text.includes("drain") || text.includes("tank")) {
      return "Plumber";
    } else if (text.includes("door") || text.includes("wood") || text.includes("lock") || text.includes("chair") || text.includes("table") || text.includes("furniture")) {
      return "Carpenter";
    } else if (text.includes("paint") || text.includes("wall") || text.includes("color") || text.includes("damp")) {
      return "Painter";
    } else if (text.includes("clean") || text.includes("dust") || text.includes("wash") || text.includes("sofa") || text.includes("carpet")) {
      return "Cleaner";
    }
    return "all";
  }

  function matchUrgency(text) {
    const high = ["fire", "smoke", "flood", "danger", "emergency", "spark", "shock"];
    const medium = ["not working", "stopped", "broken", "leak", "no water", "no power", "trip"];
    if (high.some(w => text.includes(w))) return "High";
    if (medium.some(w => text.includes(w))) return "Medium";
    return "Normal";
  }

  if (findMyServiceBtn && problemInput) {
    findMyServiceBtn.addEventListener("click", () => {
      const text = problemInput.value.toLowerCase().trim();

      if (text.length < 8) {
        if (problemError) {
          problemError.textContent = "Please describe the problem in a little more detail (at least 8 characters).";
          problemError.style.display = "block";
        }
        if (assistantResultBox) assistantResultBox.style.display = "none";
        return;
      }

      if (problemError) problemError.style.display = "none";

      const matchedCategory = matchCategory(text);
      const urgency = matchUrgency(text);
      lastMatchedCategory = matchedCategory;

      if (resCategory) resCategory.textContent = matchedCategory === "all" ? "Browse all" : matchedCategory;
      if (resUrgency) resUrgency.textContent = urgency;
      if (resReason) {
        resReason.innerHTML = matchedCategory === "all"
          ? '<strong>Why?</strong> Because we couldn\'t match your description to a single service, so browsing all professionals is the safest next step.'
          : `<strong>Why?</strong> Because your description points to a ${matchedCategory.toLowerCase()} issue.`;
      }
      if (browseAllText) {
        browseAllText.textContent = matchedCategory === "all"
          ? "Browse all professionals"
          : `Browse ${matchedCategory} professionals`;
      }

      // Sirf result box reveal karo, isi jagah par -- page ko jump mat karo.
      if (assistantResultBox) assistantResultBox.style.display = "block";
    });
  }

  // "Browse ... professionals" button - yahan explicitly click karne par filter + scroll hota hai
  if (browseAllBtn) {
    browseAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.filterAndScroll(lastMatchedCategory);
    });
  }

  /* ============================
     Saved / Wishlist Functionality
     ============================ */
  const SAVED_KEY = "quickserve_saved_providers";

  function getSavedIds() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function setSavedIds(ids) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  }

  function setHeartState(btn, isSaved) {
    const icon = btn.querySelector("i");
    if (!icon) return;
    if (isSaved) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      btn.classList.add("wishlist-active");
    } else {
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      btn.classList.remove("wishlist-active");
    }
  }

  // Global function used by heart buttons: onclick="toggleWishlist(this, providerId)"
  window.toggleWishlist = function (btn, providerId) {
    const id = Number(providerId);
    let saved = getSavedIds();

    if (saved.includes(id)) {
      saved = saved.filter(x => x !== id);
      setHeartState(btn, false);
    } else {
      saved.push(id);
      setHeartState(btn, true);
    }
    setSavedIds(saved);
  };

  // Page load par pehle se saved providers ke hearts ko fill karke dikhana
  (function initSavedHearts() {
    const saved = getSavedIds();
    document.querySelectorAll(".wishlist-btn[data-provider-id]").forEach(btn => {
      const id = Number(btn.dataset.providerId);
      setHeartState(btn, saved.includes(id));
    });
  })();

  // Filter & Sort Logic Function
  function filterProviders() {
    if (!providersGrid) return;
    
    const cards = Array.from(providersGrid.children);
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";
    const sortBy = sortFilter ? sortFilter.value : "rating";

    cards.forEach(card => {
      // Card ke andar jo elements hain unhi se text lein (null hone par crash na ho)
      const title = (card.querySelector(".card-title")?.textContent || "").toLowerCase();
      // Category ka text "span.d-block" mein hai (".badge" to rating "★ 4.9" ka hai)
      const category = (card.querySelector(".card-body span.d-block")?.textContent || "").toLowerCase();
      // Pehla <p> location hai (jaise "Gulshan-e-Iqbal, Karachi")
      const location = (card.querySelector(".card-body p")?.textContent || "").toLowerCase();

      const matchesSearch = title.includes(searchTerm) || category.includes(searchTerm) || location.includes(searchTerm);
      const matchesCategory = selectedCategory === "all" || category.includes(selectedCategory.toLowerCase());

      card.style.display = (matchesSearch && matchesCategory) ? "" : "none";
    });

    const visibleCards = cards.filter(card => card.style.display !== "none");

    visibleCards.sort((a, b) => {
      const ratingA = parseFloat(a.dataset.rating);
      const ratingB = parseFloat(b.dataset.rating);
      const priceA = parseInt(a.dataset.price);
      const priceB = parseInt(b.dataset.price);

      if (sortBy === "rating") {
        return ratingB - ratingA;
      } else if (sortBy === "price-low") {
        return priceA - priceB;
      } else if (sortBy === "price-high") {
        return priceB - priceA;
      }
      return 0;
    });

    visibleCards.forEach(card => providersGrid.appendChild(card));
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener("input", filterProviders);
  if (categoryFilter) categoryFilter.addEventListener("change", (e) => {
    const val = e.target.value;
    categoryButtons.forEach(btn => {
      if (btn.dataset.category.toLowerCase() === val.toLowerCase()) {
        btn.className = "btn btn-sm btn-warning fw-semibold px-3 rounded-pill";
      } else {
        btn.className = "btn btn-sm btn-outline-secondary fw-semibold px-3 rounded-pill";
      }
    });
    filterProviders();
  });

  if (sortFilter) sortFilter.addEventListener("change", filterProviders);

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => {
        btn.className = "btn btn-sm btn-outline-secondary fw-semibold px-3 rounded-pill";
      });
      button.className = "btn btn-sm btn-warning fw-semibold px-3 rounded-pill";

      const cat = button.dataset.category;
      if (categoryFilter) categoryFilter.value = cat;
      filterProviders();
    });
  });

  if (heroSearchForm && heroSearchInput) {
    heroSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = heroSearchInput.value.trim();
      if (searchInput) searchInput.value = query;
      
      filterProviders();

      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});
