document.addEventListener("DOMContentLoaded", async () => {

  const ordersContainer = document.querySelector(".shadow-sm.p-4.bg-white.rounded-3");
  const totalsCard = document.querySelector(".card.shadow-sm.p-4");
  const token = localStorage.getItem("access");
  
  const profileUrl = "http://127.0.0.1:8001/users/profile/"; // endpoint to check if user is logged in

  console.log("Login JS loaded");

  // --- Check if user is already logged in ---
  if (!token) {
        window.location.href = "http://127.0.0.1:8000/users/login/";
        return;
    }

    try {
        const resp = await fetch(profileUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resp.ok) {
            // Invalid or expired token → redirect to login
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = loginUrl;
        }
        // else: token valid → do nothing, page will load
    } catch (err) {
        console.error("Error checking auth:", err);
        window.location.href = loginUrl; // fallback redirect
    }

  let currentOrder = null;

  async function fetchOrders() {
    try {
      const response = await fetch("http://127.0.0.1:8001/orders/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to load orders");
      const data = await response.json();
      // Assuming only 1 cart per user
      currentOrder = data.orders.find(order => order.status_code === "cart") || null;
      return currentOrder ? currentOrder.items : [];
    } catch (err) {
      console.error(err);
      ordersContainer.innerHTML = `<p class="text-danger mt-3">Failed to load orders. Please try again later.</p>`;
      return [];
    }
  }

  function renderTotals() {
    const subtotals = Array.from(document.querySelectorAll(".subtotal")).map(el =>
      parseFloat(el.innerText.replace("$", ""))
    );
    const subtotal = subtotals.reduce((acc, val) => acc + val, 0);
    const shipping = 10; // replace with backend value if needed
    const tax = 0.1 * subtotal;
    const total = subtotal + shipping + tax;

    totalsCard.innerHTML = `
      <h5 class="fw-bold mb-3">Cart Total</h5>
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>Subtotal:</span> <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>Shipping:</span> <span>$${shipping.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between border-bottom py-2">
        <span>Tax:</span> <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between fw-bold py-2">
        <span>Total:</span> <span>$${total.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary w-100 mt-3">Proceed to Checkout</button>
    `;
  }

  function renderCart(items) {
    ordersContainer.innerHTML = `
      <div class="row fw-bold border-bottom pb-2 mb-3">
        <div class="col-md-5">Product</div>
        <div class="col-md-2 text-center">Price</div>
        <div class="col-md-2 text-center">Quantity</div>
        <div class="col-md-2 text-end">Subtotal</div>
        <div class="col-md-1 text-center">Delete</div>
      </div>
    `;

    items.forEach(item => {
      const price = parseFloat(item.price);
      const total = parseFloat(item.total);

      const row = document.createElement("div");
      row.className = "row align-items-center mb-3 cart-item";
      row.dataset.itemId = item.id;
      row.dataset.stock = item.product_stock;
      console.log(`row stock: ${row.dataset.stock}`);
      const backendBase = "http://127.0.0.1:8001";
      row.innerHTML = `
        <div class="col-md-5 d-flex align-items-center gap-3">
          <img src="${item.primary_image ? backendBase + item.primary_image.image : '/static/images/placeholder.jpg'}" alt="Product" class="cart-img">
          <span>${item.product_name}</span>
        </div>
        <div class="col-md-2 text-center price">$${price.toFixed(2)}</div>
        <div class="col-md-2 text-center">
          <div class="quantity-box">
            <button class="qty-btn up">▲</button>
            <input type="text" value="${item.quantity}" class="qty-input">
            <button class="qty-btn down">▼</button>
          </div>
        </div>
        <div class="col-md-2 text-end subtotal">$${total.toFixed(2)}</div>
        <div class="col-md-1 text-center">
          <button class="delete-btn">×</button>
        </div>
      `;

      ordersContainer.appendChild(row);
    });

    renderTotals();
  }

  async function updateCartItemBackend(itemId, quantity) {
    try {
      const res = await fetch(`http://127.0.0.1:8001/orders/cart/item/${itemId}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart item");
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCartItemBackend(itemId) {
    try {
      const res = await fetch(`http://127.0.0.1:8001/orders/cart/item/${itemId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete cart item");
    } catch (err) {
      console.error(err);
    }
  }

  // Initial load
  const items = await fetchOrders();
  renderCart(items);

  // Event delegation for quantity and delete
  ordersContainer.addEventListener("click", async (e) => {
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const itemId = row.dataset.itemId;
    const input = row.querySelector(".qty-input");
    let quantity = parseInt(input.value);

    // Quantity buttons
    if (e.target.classList.contains("up")) quantity++;
    if (e.target.classList.contains("down") && quantity > 1) quantity--;

    if (e.target.classList.contains("up") || e.target.classList.contains("down")) {
      const stock = parseInt(row.dataset.stock);
      console.log(`Current stock: ${stock}`);
      if (quantity > stock) {
        alert(`Only ${stock} items available in stock.`);
        return; // 🚫 Stop if exceeds stock
      }

      input.value = quantity;

      // Update subtotal visually
      const price = parseFloat(row.querySelector(".price").innerText.replace("$", ""));
      row.querySelector(".subtotal").innerText = `$${(price * quantity).toFixed(2)}`;

      // Update backend
      await updateCartItemBackend(itemId, quantity);
      renderTotals();
    }

    // Delete button
    if (e.target.classList.contains("delete-btn")) {
      await deleteCartItemBackend(itemId);
      row.remove();
      renderTotals();
    }
  });
});
