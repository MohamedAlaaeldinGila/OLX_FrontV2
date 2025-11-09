// ==================== Product Details Loader ====================

// Base API root
const api_root = "http://127.0.0.1:8001";

// Extract product ID from URL (e.g., /productDetails/12/)
const pathParts = window.location.pathname.split("/");
const productId = pathParts[pathParts.length - 2];

// Fetch product details
fetch(`${api_root}/products/${productId}/`)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(product => {
    console.log("Loaded product:", product);

    // === Product main details ===
    document.getElementById("product-title").innerText = product.title || "Untitled";
    document.getElementById("product-price").innerText = product.price ? `$${product.price}` : "N/A";
    document.getElementById("product-description").innerText = product.description || "No description";

    // === Rating & Stock info ===
    document.getElementById("product-rating").innerText = "⭐".repeat(Math.round(product.average_rating || 0));
    document.getElementById("review-count").innerText = `(${product.review_count || 0} reviews)`;

    const stockEl = document.getElementById("stock-status");
    if (product.is_in_stock || product.stock_quantity > 0) {
      stockEl.innerText = "In Stock";
      stockEl.className = "ms-auto text-success";
    } else {
      stockEl.innerText = "Out of Stock";
      stockEl.className = "ms-auto text-danger";
    }

    // === Handle images ===
    const primaryImageEl = document.getElementById("primary-image");
    const thumbnails = document.querySelectorAll(".thumbnail-img");

    // Fallback if no images exist
    if (!product.images || product.images.length === 0) {
      primaryImageEl.src = "/static/core/img/placeholder.jpg";
      thumbnails.forEach(img => (img.src = "/static/core/img/placeholder.jpg"));
      return;
    }

    // Set the main (primary) image
    const primaryImg = product.images.find(img => img.is_primary) || product.images[0];
    primaryImageEl.src = `${api_root}${primaryImg.image_url}`;

    // Populate thumbnails
    product.images.forEach((img, i) => {
      if (thumbnails[i]) {
        thumbnails[i].src = `${api_root}${img.image_url}`;
        thumbnails[i].classList.add("clickable");
      }
    });

    // Thumbnail click → change main image
    document.querySelectorAll(".thumbnail-img.clickable").forEach((imgEl) => {
      imgEl.addEventListener("click", () => {
        primaryImageEl.src = imgEl.src;
      });
    });
  })
  .catch(err => {
    console.error("❌ Failed to load product:", err);
    document.getElementById("product-title").innerText = "Error loading product.";
  });
