document.addEventListener("DOMContentLoaded", () => {
  const SAVED_KEY = "quickserve_saved_providers";
  const grid = document.getElementById("savedGrid");
  const emptyState = document.getElementById("savedEmptyState");

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

  function removeSaved(id) {
    const updated = getSavedIds().filter(x => x !== id);
    setSavedIds(updated);
    render();
  }

  function render() {
    const savedIds = getSavedIds();
    const providers = (window.PROVIDERS_DATA || []).filter(p => savedIds.includes(p.id));

    grid.innerHTML = "";

    if (providers.length === 0) {
      emptyState.classList.remove("d-none");
      grid.classList.add("d-none");
      return;
    }

    emptyState.classList.add("d-none");
    grid.classList.remove("d-none");

    providers.forEach(p => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-provider bg-white position-relative">
          <div class="position-relative">
            <img src="${p.img}" alt="${p.name}" class="w-100 object-fit-cover" style="height: 220px;">
            <span class="position-absolute top-0 start-0 m-3 badge bg-dark text-white px-2.5 py-1.5 rounded-pill fw-bold shadow-sm">★ ${p.rating}</span>
            <button type="button" class="position-absolute top-0 end-0 m-3 btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm wishlist-btn wishlist-active border-0 remove-saved-btn" style="width: 38px; height: 38px;" data-id="${p.id}" title="Remove from saved">
              <i class="fa-solid fa-heart text-danger fs-6"></i>
            </button>
          </div>
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title fw-bold text-dark mb-1">${p.name}</h5>
              <span class="text-success fw-medium fs-7 d-block mb-2">${p.category}</span>
              <p class="text-secondary fs-8 mb-1"><i class="fa-solid fa-location-dot me-1 text-muted"></i> ${p.location}</p>
              <p class="text-secondary fs-8 mb-3"><i class="fa-solid fa-briefcase me-1 text-muted"></i> ${p.experience}</p>
            </div>
            <div class="pt-3 border-top border-light-subtle d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted d-block fs-9 text-uppercase tracking-wider fw-semibold">Starting Price</small>
                <strong class="text-dark fs-5">${p.price}</strong>
              </div>
              <a href="providers-details.html?id=${p.id}" class="text-dark text-decoration-none fw-bold fs-7 d-flex align-items-center gap-1 hover-warning">
                View Profile <i class="fa-solid fa-arrow-right fs-8"></i>
              </a>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
    });

    document.querySelectorAll(".remove-saved-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        removeSaved(id);
      });
    });
  }

  render();
});
