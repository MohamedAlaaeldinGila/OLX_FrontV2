document.addEventListener("DOMContentLoaded", async () => {
  await window.getApiRoot();

  const sidebar = document.getElementById("sidebar-categories");
  const grid = document.getElementById("grid-categories");
  const flashContainer = document.getElementById("flash-sales-container");
  const homeUrl = document.getElementById("home-link");

  homeUrl.classList.add("active-link");

  console.log("🌍 API Root:", api_root);

  const categoriesUrl = `${api_root}/products/categories/`;
  const flashSalesUrl = `${api_root}/products/flash-sales/`;

  try {
    // === 🧩 Fetch Categories ===
    const response = await fetch(categoriesUrl);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const categories = await response.json();
    const limited = categories.slice(0, 10);

    // --- Sidebar ---
    if (sidebar) {
      sidebar.innerHTML = "";
      limited.forEach(cat => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="#">
            ${cat.name}
          </a>`;
        sidebar.appendChild(li);
      });
    }

    // --- Grid ---
    if (grid) {
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
    }

    // === ⚡ Fetch Flash Sales ===
    if (flashContainer) {
      const flashResponse = await fetch(flashSalesUrl);
      console.log("⚡ Flash response status:", flashResponse.status);
      if (!flashResponse.ok) throw new Error(`Flash Sales HTTP ${flashResponse.status}`);

      const flashData = await flashResponse.json();
      const flashSales = flashData.flash_sales || [];

      flashContainer.innerHTML = "";

      flashSales.forEach(product => {
        const primaryImage = product.primary_image?.image_url
          ? `${api_root}${product.primary_image.image_url}`
          : "/static/core/img/placeholder.jpg";

        const card = document.createElement("div");
        card.classList.add("flash-card", "card", "mx-2");

        card.innerHTML = `
          <div class="position-relative">
            <!-- 🔴 Sale Badge -->
            <div class="sale-badge position-absolute top-0 start-0 m-2 bg-danger text-white fw-bold">
              12%
            </div>

            <!-- Wishlist button -->
            <button class="wishlist-btn position-absolute top-0 end-0 m-2 btn btn-light rounded-circle shadow-sm">
              <i class="bi bi-heart"></i>
            </button>

            <!-- Product image -->
            <a href="/products/${product.id}/" class="text-decoration-none text-dark">
              <img src="${primaryImage}" class="flash-img" alt="${product.title}">
            </a>

            <!-- Add to Cart overlay -->
            <div class="add-to-cart-overlay" data-product-id="${product.id}">
              Add to Cart
            </div>
          </div>

          <div class="card-body p-2">
            <h6 class="card-title mb-1">${product.title}</h6>

            <!-- Price -->
            <div class="price mb-1">
              <span class="text-danger fw-bold">$${product.price}</span>
              <span class="text-muted text-decoration-line-through small ms-2">
                $${(product.price * 1.1).toFixed(2)}
              </span>
            </div>

            <!-- Rating -->
            <div class="rating text-warning">
              ${"★".repeat(Math.round(product.average_rating || 0))}
              ${"☆".repeat(5 - Math.round(product.average_rating || 0))}
              <span class="text-muted small">(${product.review_count || 0})</span>
            </div>
          </div>
        `;

        flashContainer.appendChild(card);
      });
    }

  } catch (error) {
    console.error("🚨 Data load error:", error);
    if (sidebar) sidebar.innerHTML = `<li class="text-danger">Failed to load categories.</li>`;
    if (grid) grid.innerHTML = `<p class="text-danger">Failed to load categories.</p>`;
    if (flashContainer) flashContainer.innerHTML = `<p class="text-danger">Failed to load flash sales.</p>`;
  }

  // === 🛒 ADD TO CART EVENT LISTENER ===
  if (flashContainer) {
    flashContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("add-to-cart-overlay")) {
        const button = e.target;
        if (button.dataset.loading === "true") return;
        
        const originalText = button.textContent;
        button.dataset.loading = "true";
        button.textContent = "Adding...";
        const productId = e.target.dataset.productId;

        const token = localStorage.getItem("access");

        // 🔐 Check if user is signed in
        if (!token) {
          window.location.href = "/users/login/";
          return;
        }

        const cartUrl = `${api_root}/orders/`;
        const body = {
          shipping_address: "N/A",
          shipping_city: "N/A",
          shipping_state: "N/A",
          shipping_zipcode: "N/A",
          shipping_country: "N/A",
          items: [{  
            product: parseInt(productId),
            quantity: 1,
            price: parseFloat(e.target.closest(".card").querySelector(".text-danger").textContent.replace("$", "")) || 0
          }]
        };

        try {
          // ✅ CHANGE 2: use authFetch() instead of plain fetch()
          const response = await authFetch(cartUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });

          if (response.status === 401) {
            console.warn("⚠️ JWT token invalid or expired. Redirecting to login...");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/users/login/";
            return;
          }

          if (response.ok) {
            console.log("✅ Product added to cart successfully!");
            button.textContent = "Added!";
          }else {

            const errorText = await response.text();
            console.error(`❌ Add to cart failed. Status: ${response.status}`, errorText);
            button.textContent = "Failed to Add";

          }

        

        } catch (error) {
          console.error("🚨 Network or server error while adding to cart:", error);
          alert("⚠️ Something went wrong while adding to cart. Please check your connection and try again.");
        }finally {
          setTimeout(() => {
            button.dataset.loading = "false";
            button.textContent = originalText;
          }, timeout = 1500);

        }
      }
    });
  }
});
