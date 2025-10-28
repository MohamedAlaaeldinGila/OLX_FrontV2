document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("sidebar-categories");
  const grid = document.getElementById("grid-categories");
  const apiUrl = "http://127.0.0.1:8001/products/categories/";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const categories = await response.json();
    const limited = categories.slice(0, 10);

    // --- Sidebar ---
    sidebar.innerHTML = "";
    limited.forEach(cat => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="/products/category/${cat.id}/" class="text-dark text-decoration-none">
          ${cat.name}
        </a>`;
      sidebar.appendChild(li);
    });

    // --- Grid ---
    grid.innerHTML = "";
    limited.forEach(cat => {
      const div = document.createElement("div");
      div.classList.add("col-6", "col-md-2", "mb-4");
      div.innerHTML = `
        <div class="category-card p-3 shadow-sm">
          <img src="${cat.image || '/static/core/img/default-cat.png'}" 
               alt="${cat.name}" class="img-fluid rounded-circle mb-2">
          <h6>${cat.name}</h6>
        </div>`;
      grid.appendChild(div);
    });

  } catch (error) {
    console.error("Category load error:", error);
    sidebar.innerHTML = `<li class="text-danger">Failed to load categories.</li>`;
    grid.innerHTML = `<p class="text-danger">Failed to load categories.</p>`;
  }


// === ⏰ Countdown Timer ===
  const timerElement = document.getElementById("flash-timer");
  const endTime = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours from now

  function updateTimer() {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance < 0) {
      timerElement.innerText = "Expired";
      return;
    }

    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    timerElement.innerText = `${hours}h ${minutes}m ${seconds}s`;
  }

  setInterval(updateTimer, 1000);

  // === 🎡 Carousel Logic ===
  const carousel = document.querySelector(".flash-carousel");
  const prevBtn = document.getElementById("flash-prev");
  const nextBtn = document.getElementById("flash-next");

  let scrollAmount = 0;
  const scrollStep = 250;

  nextBtn.addEventListener("click", () => {
    scrollAmount += scrollStep;
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) scrollAmount = 0;
    carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });
});
