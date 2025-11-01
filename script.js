/* script.js - E-Millenial Store Capstone
   Replace PAYSTACK_PUBLIC_KEY with your Paystack test public key (pk_test_...).
*/

const PAYSTACK_PUBLIC_KEY = 'pk_test_7a2f497ca64bf7427a269a9a53a133d67766d3b5'; // <-- put your test public key here

/* ---------------------------
   PRODUCTS DATA (id must be stable)
   --------------------------- */
const products = [
  { id: 'p1', title: 'SAMSUNG TV', price: 120000, img: 'img/product1.png' },
  { id: 'p2', title: 'PIXEL 4a', price: 150000, img: 'img/product2.png' },
  { id: 'p3', title: 'PS 5', price: 300000, img: 'img/product3.png' },
  { id: 'p4', title: 'MACBOOK AIR', price: 280000, img: 'img/product4.png' },
  { id: 'p5', title: 'APPLE WATCH', price: 90000, img: 'img/product5.png' },
  { id: 'p6', title: 'AIR PODS', price: 35000, img: 'img/product6.png' },
  { id: 'p7', title: 'IPHONE 13 PRO MAX', price: 100000, img: 'img/product7.jpg' },
  { id: 'p8', title: 'APPLE IPAD AIR', price: 150000, img: 'img/product8.jpg' },
];

/* ---------------------------
   Application State
   cart: array of { id, qty }
   --------------------------- */
let cart = [];

/* DOM references */
const productGrid = document.getElementById('productGrid');
const cartCountEl = document.getElementById('cartCount');
const cartModalOverlay = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const continueBtn = document.getElementById('continueBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartItemsEl = document.getElementById('cartItems');
const summaryCountEl = document.getElementById('summaryCount');
const summaryTotalEl = document.getElementById('summaryTotal');

const userForm = document.getElementById('userForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

const summaryModalOverlay = document.getElementById('summaryModal');
const summaryContent = document.getElementById('summaryContent');
const summaryOkBtn = document.getElementById('summaryOk');

/* ---------------------------
   Helpers
   --------------------------- */
function findProduct(id) {
  return products.find(p => p.id === id);
}

function isInCart(id) {
  return cart.some(item => item.id === id);
}

function getCartItem(id) {
  return cart.find(item => item.id === id);
}

function updateCartCount() {
  cartCountEl.textContent = cart.length;
  summaryCountEl.textContent = cart.length;
}

/* compute total (sum price * qty) */
function computeTotal() {
  return cart.reduce((sum, item) => {
    const prod = findProduct(item.id);
    return sum + (prod.price * item.qty);
  }, 0);
}

/* format number as Naira with two decimals */
function formatN(amount) {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------------------------
   Render products
   --------------------------- */
function renderProducts() {
  productGrid.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.title}">
      <h3>${prod.title}</h3>
      <div>₦${formatN(prod.price)}</div>
      <button class="add-btn" data-id="${prod.id}">${isInCart(prod.id) ? 'Remove from Cart' : 'Add to Cart'}</button>
    `;
    productGrid.appendChild(card);
  });
}

/* ---------------------------
   Add / Remove from cart (toggle)
   --------------------------- */
function toggleCartItem(id) {
  const existing = getCartItem(id);
  if (existing) {
    // remove
    cart = cart.filter(i => i.id !== id);
  } else {
    cart.push({ id, qty: 1 });
  }
  updateCartUI();
}

/* ---------------------------
   Update UI after cart change
   --------------------------- */
function updateCartUI() {
  renderProducts();
  updateCartCount();
  renderCartItems();
  summaryTotalEl.textContent = formatN(computeTotal());
}

/* ---------------------------
   Render cart items inside modal
   --------------------------- */
function renderCartItems() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p>Your cart is empty. Add some cool gadgets to your cart.</p>`;
    return;
  }

  cartItemsEl.innerHTML = '';
  cart.forEach(item => {
    const prod = findProduct(item.id);
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${prod.img}" alt="${prod.title}">
      <div class="meta">
        <h5>${prod.title}</h5>
        <small>Unit: ₦${formatN(prod.price)}</small>
        <div style="margin-top:8px;">Subtotal: ₦<span class="line-sub">${formatN(prod.price * item.qty)}</span></div>
      </div>
      <div>
        <div class="qty-controls">
          <button class="dec-btn" data-id="${item.id}">-</button>
          <div style="min-width:28px; text-align:center;">${item.qty}</div>
          <button class="inc-btn" data-id="${item.id}">+</button>
        </div>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(el);
  });
}

/* ---------------------------
   Quantity controls & remove
   --------------------------- */
function changeQty(id, delta) {
  const item = getCartItem(id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

/* ---------------------------
   Open / Close Modals
   --------------------------- */
function openCartModal() {
  renderCartItems();
  summaryTotalEl.textContent = formatN(computeTotal());
  cartModalOverlay.classList.remove('hidden');
}
function closeCartModal() {
  cartModalOverlay.classList.add('hidden');
}

function openSummaryModal(name, items) {
  summaryContent.innerHTML = `
    <p>Thank you <strong>${escapeHtml(name)}</strong>! Your purchase was successful.</p>
    <h4>Order Summary</h4>
    <ul>
      ${items.map(it => {
        const p = findProduct(it.id);
        return `<li>${escapeHtml(p.title)} &times; ${it.qty} — ₦${formatN(p.price * it.qty)}</li>`;
      }).join('')}
    </ul>
    <p><strong>Total paid:</strong> ₦${formatN(computeTotal())}</p>
  `;
  summaryModalOverlay.classList.remove('hidden');
}
function closeSummaryModal() {
  summaryModalOverlay.classList.add('hidden');
}

/* small utility to avoid accidental XSS in generated content */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------------------------
   Form validation
   --------------------------- */
function showError(field, msg) {
  const el = document.querySelector(`small.error[data-for="${field}"]`);
  if (el) el.textContent = msg || '';
}
function validateName() {
  const v = nameInput.value.trim();
  if (!v) { showError('name', 'Name is required'); return false; }
  showError('name', '');
  return true;
}
function validateEmail() {
  const v = emailInput.value.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!v) { showError('email', 'Email is required'); return false; }
  if (!re.test(v)) { showError('email', 'Enter a valid email'); return false; }
  showError('email', '');
  return true;
}
function validatePhone() {
  const v = phoneInput.value.trim();
  // Basic Nigerian phone format check: allow digits + optional + or spaces
  const digits = v.replace(/\D/g, '');
  if (!v) { showError('phone', 'Phone is required'); return false; }
  if (digits.length < 9) { showError('phone', 'Enter a valid phone number'); return false; }
  showError('phone', '');
  return true;
}
nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
phoneInput.addEventListener('blur', validatePhone);

/* ---------------------------
   Checkout flow (Paystack inline)
   --------------------------- */
function doCheckout() {
  // validate form and ensure cart not empty
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  const okName = validateName();
  const okEmail = validateEmail();
  const okPhone = validatePhone();
  if (!okName || !okEmail || !okPhone) {
    alert('Please fix errors in the form before proceeding.');
    return;
  }

  // prepare payment
  const email = emailInput.value.trim();
  const amountKobo = Math.round(computeTotal() * 100); // Paystack expects kobo (Naira *100)
  const ref = `EMSCAP_${Date.now()}`;

  // close cart modal before opening Paystack
  closeCartModal();

  // If Paystack script available and key provided, use Paystack. Otherwise simulate.
  if (window.PaystackPop && PAYSTACK_PUBLIC_KEY && !PAYSTACK_PUBLIC_KEY.includes('pk_test_x')) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountKobo,
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: nameInput.value.trim() },
          { display_name: 'Phone', variable_name: 'phone', value: phoneInput.value.trim() }
        ]
      },
      callback: function(response) {
        // payment success
        // response.reference contains Paystack reference
        onPaymentSuccess(response.reference);
      },
      onClose: function() {
        // user closed paystack modal
        alert('Payment window closed.');
      }
    });
    handler.openIframe();
  } else {
    // fallback: simulate successful payment for testing (useful offline)
    console.warn('Paystack not available or placeholder key used — running simulated payment flow.');
    setTimeout(() => {
      onPaymentSuccess('SIMULATED_REF_' + Date.now());
    }, 900);
  }
}

/* After successful payment */
function onPaymentSuccess(reference) {
  // reference param received from Paystack or simulated
  // show summary modal with dynamic content and clear cart afterwards
  openSummaryModal(nameInput.value.trim(), cart);

  // clear cart and form data in memory
  cart = [];
  updateCartUI();

  // optionally log / store transaction details (not required)
  console.log('Payment success reference:', reference);
}

/* ---------------------------
   Event listeners & delegation
   --------------------------- */
document.addEventListener('click', function (e) {
  // Add / Remove buttons on product cards
  if (e.target.matches('.add-btn')) {
    const id = e.target.dataset.id;
    toggleCartItem(id);
    return;
  }

  // open cart
  if (e.target === cartBtn || e.target.closest('#cartBtn')) {
    openCartModal();
    return;
  }

  // modal close by clicking overlay
  if (e.target === cartModalOverlay) closeCartModal();
  if (e.target === summaryModalOverlay) closeSummaryModal();

  // Continue shopping button
  if (e.target === continueBtn) {
    closeCartModal();
    return;
  }

  // Checkout button
  if (e.target === checkoutBtn) {
    doCheckout();
    return;
  }

  // summary OK
  if (e.target === summaryOkBtn) {
    // hide summary and refresh page to ensure clean state
    closeSummaryModal();
    location.reload();
    return;
  }

  // cart quantity buttons and remove buttons (delegation on cartItemsEl)
  if (e.target.closest('.inc-btn')) {
    const id = e.target.dataset.id;
    changeQty(id, +1);
    return;
  }
  if (e.target.closest('.dec-btn')) {
    const id = e.target.dataset.id;
    changeQty(id, -1);
    return;
  }
  if (e.target.closest('.remove-btn')) {
    const id = e.target.dataset.id;
    removeFromCart(id);
    return;
  }
});

/* close cart modal with escape key */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCartModal();
    closeSummaryModal();
  }
});

/* ---------------------------
   Initialize
   --------------------------- */
renderProducts();
updateCartUI();


