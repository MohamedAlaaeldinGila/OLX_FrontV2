document.addEventListener('DOMContentLoaded', async() => {
  
  const token = localStorage.getItem('access');

  // Redirect if not logged in
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

  // ========== IMAGE PREVIEW ==========
  document.querySelectorAll('.image-upload-box').forEach((box) => {
    const fileInput = box.querySelector("input[type='file']");
    const uploadContent = box.querySelector(".upload-content");

    box.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadContent.innerHTML = `<img src="${e.target.result}" alt="Preview" class="preview">`;
        };
        reader.readAsDataURL(file);
      }
    });
  });

  // ========== CATEGORY FETCH ==========
  const categorySearch = document.getElementById('category-search');
  const categoryList = document.getElementById('category-list');
  const selectedContainer = document.getElementById('selected-categories');
  let selectedCategories = [];

  async function fetchCategories(query = '') {
    const res = await fetch(`http://127.0.0.1:8001/products/categories/?search=${query}`);
    const data = await res.json();
    categoryList.innerHTML = '';

    if (data.length === 0) {
      categoryList.innerHTML = '<div class="p-2 text-muted">No categories found</div>';
      categoryList.style.display = 'block';
      return;
    }

    data.forEach(cat => {
      const div = document.createElement('div');
      div.classList.add('category-item');
      div.textContent = cat.name;
      div.onclick = () => selectCategory(cat);
      categoryList.appendChild(div);
    });
    categoryList.style.display = 'block';
  }

  function selectCategory(cat) {
    if (selectedCategories.length >= 5) {
      alert('You can select up to 5 categories.');
      return;
    }
    if (selectedCategories.find(c => c.id === cat.id)) return;
    selectedCategories.push(cat);
    renderSelected();

    categoryList.style.display = 'none';
  }

  function renderSelected() {
    selectedContainer.innerHTML = '';
    selectedCategories.forEach(cat => {
      const div = document.createElement('div');
      div.classList.add('selected-category');
      div.innerHTML = `${cat.name} <span>&times;</span>`;
      div.querySelector('span').onclick = () => {
        selectedCategories = selectedCategories.filter(c => c.id !== cat.id);
        renderSelected();
      };
      selectedContainer.appendChild(div);
    });
  }

  categorySearch.addEventListener('focus', () => fetchCategories());
  categorySearch.addEventListener('input', e => fetchCategories(e.target.value));

  document.addEventListener('click', (e) => {
    if (!categoryList.contains(e.target) && e.target !== categorySearch) {
      categoryList.style.display = 'none';
    }
  });

  // ========== PRODUCT SUBMISSION ==========
  const addProductBtn = document.getElementById('addProductBtn');
  addProductBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const form = document.getElementById('addProductForm');
    const formData = new FormData();

    // Collect fields manually since you didn’t set name="" attributes
    formData.append('title', document.getElementById('product-title').value);
    formData.append('description', document.querySelector('#product-description').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('stock_quantity', document.getElementById('stock-quantity').value);
    formData.append('is_active', true);

    selectedCategories.forEach(cat => formData.append('categories', cat.id));

    const token = localStorage.getItem('access');
    if (!token) {
      window.location.href = loginurl;
      return;
    }

    // Step 1: Create the product
    const res = await fetch('http://127.0.0.1:8001/products/create/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Product creation error:', err);
      alert('❌ Failed to add product.');
      return;
    }

    const product = await res.json();
    const productId = product.id;
    console.log('✅ Product created with ID:', productId);

    // Step 2: Upload product images
    const imageBoxes = document.querySelectorAll('.image-upload-box input[type="file"]');
    for (let i = 0; i < imageBoxes.length; i++) {
      const fileInput = imageBoxes[i];
      if (fileInput.files.length === 0) continue;

      const imgForm = new FormData();
      imgForm.append('image', fileInput.files[0]);
      imgForm.append('order', i);
      imgForm.append('is_primary', i === 0); // First one is primary

      const imgRes = await fetch(`http://127.0.0.1:8001/products/${productId}/images/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: imgForm
      });

      if (!imgRes.ok) {
        const imgErr = await imgRes.json();
        console.error('❌ Image upload error:', imgErr);
      } else {
        console.log(`✅ Image ${i + 1} uploaded`);
      }
    }

    alert('✅ Product and images added successfully!');
    form.reset();
    selectedCategories = [];
    renderSelected();
    document.querySelectorAll('.upload-content').forEach(c => c.innerHTML = `
      <img src="/static/core/icons/image-icon.svg" alt="upload icon" class="upload-icon mb-2">
      <p class="text-muted small">Click here or drop files</p>
    `);
  });

  // ===== QUANTITY CONTROL =====
  document.querySelectorAll('.quantity-control').forEach(control => {
    const input = control.querySelector('input[type="number"]');
    const btnMinus = control.querySelector('button:first-child');
    const btnPlus = control.querySelector('button:last-child');

    btnMinus.addEventListener('click', () => {
      let value = parseInt(input.value) || 0;
      value = Math.max(0, value - 1); // prevent below 0
      input.value = value;
    });

    btnPlus.addEventListener('click', () => {
      let value = parseInt(input.value) || 0;
      input.value = value + 1;
    });
  });

});
