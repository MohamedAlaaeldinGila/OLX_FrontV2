document.addEventListener("DOMContentLoaded", async () => {
  await window.getApiRoot();

  const container = document.getElementById("all-products-container");
  const productsUrl = `http://127.0.0.1:8001/products/all-products/`; // adjust endpoint if needed

  try {
    const response = await fetch(productsUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    container.innerHTML = "";

    // Loop through all products
    data.forEach(product => {
      const primaryImage = product.primary_image?.image_url
        ? `${api_root}${product.primary_image.image_url}`
        : "/static/core/img/placeholder.jpg";

      const col = document.createElement("div");
      col.classList.add("col-6", "col-md-2", "mb-4"); // 6 per row on desktop

      const card = document.createElement("div");
      card.classList.add("flash-card", "card", "h-100");

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
          <div class="price mb-1">
            <span class="text-danger fw-bold">$${product.price}</span>
            <span class="text-muted text-decoration-line-through small ms-2">
              $${(product.price * 1.1).toFixed(2)}
            </span>
          </div>
          <div class="rating text-warning">
            ${"★".repeat(Math.round(product.average_rating || 0))}
            ${"☆".repeat(5 - Math.round(product.average_rating || 0))}
            <span class="text-muted small">(${product.review_count || 0})</span>
          </div>
        </div>
      `;

      col.appendChild(card);
      container.appendChild(col);
    });

  } catch (error) {
    console.error("🚨 Failed to load products:", error);
    container.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
  }

  // === 🛒 ADD TO CART EVENT LISTENER ===
  container.addEventListener("click", async (e) => {
    if (e.target.classList.contains("add-to-cart-overlay")) {
      const button = e.target;
      if (button.dataset.loading === "true") return;
      const originalText = button.textContent;
      button.dataset.loading = "true";
      button.textContent = "Adding...";
      const productId = e.target.dataset.productId;

      const token = localStorage.getItem("access");

      // 🔐 Redirect if not logged in
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
          price: parseFloat(
            e.target.closest(".card").querySelector(".text-danger").textContent.replace("$", "")
          ) || 0
        }]
      };

      try {
        // ✅ Use authFetch helper
        const response = await authFetch(cartUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        if (response.status === 401) {
          console.warn("⚠️ JWT expired or invalid, redirecting...");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/users/login/";
          return;
        }

        if (response.ok) {
          console.log("✅ Added to cart successfully!");
          button.textContent = "Added!";
        } else {
          const errorText = await response.text();
          console.error(`❌ Add to cart failed. Status: ${response.status}`, errorText);
          button.textContent = "Failed to Add";
        }
      } catch (error) {
        console.error("🚨 Network/server error while adding to cart:", error);
        alert("⚠️ Something went wrong while adding to cart.");
      } finally {
        setTimeout(() => {
          button.dataset.loading = "false";
          button.textContent = originalText;
        }, 1500);
      }
    }
  });

});
