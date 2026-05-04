/**
 * Apex Peptides — Cart + Checkout Embed
 * Paste the contents of this file into a Custom Code (Body) block in GHL AI Studio.
 * Replace CHECKOUT_API with your deployed Vercel URL before pasting.
 */
(function () {
  "use strict";

  // ── CONFIG ────────────────────────────────────────────────────────────────────
  const TEST_MODE    = false;
  const CHECKOUT_API = "https://accountability-app-rust.vercel.app/api/apex-checkout";

  // Product catalog — keyed by the exact name shown on the card
  const CATALOG = {
    "BPC-157":          { sku: "APX-001", price: 49.99,  desc: "5mg vial · 99.2% purity · lyophilized" },
    "TB-500":           { sku: "APX-002", price: 59.99,  desc: "5mg vial · 99.0% purity · lyophilized" },
    "WOLVERINE":        { sku: "APX-003", price: 89.99,  desc: "5mg/5mg vial · 99.0% purity · lyophilized" },
    "CJC-1295 DAC":     { sku: "APX-004", price: 54.99,  desc: "5mg vial · 99.1% purity · lyophilized" },
    "IPAMORELIN":       { sku: "APX-005", price: 44.99,  desc: "5mg vial · 99.3% purity · lyophilized" },
    "IGF-1 LR3":        { sku: "APX-006", price: 74.99,  desc: "1mg vial · 98.8% purity · lyophilized" },
    "TESAMORELIN 5MG":  { sku: "APX-007", price: 64.99,  desc: "5mg vial · 99.0% purity · lyophilized" },
    "TESAMORELIN 10MG": { sku: "APX-008", price: 109.99, desc: "10mg vial · 99.0% purity · lyophilized" },
    "FOLLISTATIN 344":  { sku: "APX-009", price: 149.99, desc: "1mg vial · 98.5% purity · lyophilized" },
    "SEMAGLUTIDE 5MG":  { sku: "APX-010", price: 89.99,  desc: "5mg vial · 99.2% purity · lyophilized" },
    "SEMAGLUTIDE 10MG": { sku: "APX-011", price: 149.99, desc: "10mg vial · 99.2% purity · lyophilized" },
    "TIRZEPATIDE 5MG":  { sku: "APX-012", price: 109.99, desc: "5mg vial · 99.1% purity · lyophilized" },
    "TIRZEPATIDE 10MG": { sku: "APX-013", price: 179.99, desc: "10mg vial · 99.1% purity · lyophilized" },
    "RETATRUTIDE":      { sku: "APX-014", price: 199.99, desc: "10mg vial · 98.9% purity · lyophilized" },
    "MAZTUTIDE":        { sku: "APX-015", price: 129.99, desc: "5mg vial · 99.6% purity · lyophilized" },
    // ── ADD remaining APX-016 through APX-027 here once you send screenshots ──
  };

  // ── STATE ─────────────────────────────────────────────────────────────────────
  let cart = {}; // { [sku]: { name, price, desc, qty } }

  // ── STYLES ───────────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #apx-cart-drawer {
      position: fixed; top: 0; right: -420px; width: 420px; max-width: 100vw;
      height: 100vh; background: #0d0d0d; border-left: 1px solid #c8f500;
      z-index: 99999; display: flex; flex-direction: column;
      transition: right 0.3s ease; font-family: 'Courier New', monospace;
      box-shadow: -8px 0 40px rgba(0,0,0,0.8);
    }
    #apx-cart-drawer.open { right: 0; }
    #apx-cart-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.6); z-index: 99998;
    }
    #apx-cart-overlay.open { display: block; }
    #apx-cart-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #222;
    }
    #apx-cart-header span {
      color: #c8f500; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    }
    #apx-cart-close {
      background: none; border: 1px solid #333; color: #999; cursor: pointer;
      padding: 4px 10px; font-size: 18px; border-radius: 4px;
    }
    #apx-cart-close:hover { border-color: #c8f500; color: #c8f500; }
    #apx-cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
    #apx-cart-empty { color: #555; font-size: 13px; text-align: center; margin-top: 60px; }
    .apx-cart-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid #1a1a1a;
    }
    .apx-cart-item-info { flex: 1; }
    .apx-cart-item-name { color: #fff; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    .apx-cart-item-desc { color: #555; font-size: 11px; margin-top: 2px; }
    .apx-cart-item-price { color: #c8f500; font-size: 13px; font-weight: 700; margin-top: 4px; }
    .apx-cart-item-controls { display: flex; align-items: center; gap: 8px; }
    .apx-qty-btn {
      background: #1a1a1a; border: 1px solid #333; color: #fff;
      width: 26px; height: 26px; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center; border-radius: 4px;
    }
    .apx-qty-btn:hover { border-color: #c8f500; color: #c8f500; }
    .apx-qty-val { color: #fff; font-size: 13px; min-width: 20px; text-align: center; }
    .apx-remove-btn {
      background: none; border: none; color: #444; cursor: pointer; font-size: 16px; padding: 0 4px;
    }
    .apx-remove-btn:hover { color: #ff4444; }
    #apx-cart-footer { padding: 20px 24px; border-top: 1px solid #222; }
    #apx-cart-total {
      display: flex; justify-content: space-between;
      color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 16px;
    }
    #apx-cart-total span:last-child { color: #c8f500; }
    #apx-checkout-btn {
      width: 100%; padding: 14px; background: #c8f500; color: #000;
      font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em;
      border: none; cursor: pointer; border-radius: 4px;
    }
    #apx-checkout-btn:hover { background: #d4ff00; }
    #apx-checkout-btn:disabled { background: #444; color: #777; cursor: not-allowed; }

    /* Checkout form modal */
    #apx-checkout-modal {
      display: none; position: fixed; inset: 0; z-index: 100001;
      background: rgba(0,0,0,0.85); align-items: center; justify-content: center;
    }
    #apx-checkout-modal.open { display: flex; }
    #apx-checkout-form {
      background: #0d0d0d; border: 1px solid #c8f500; border-radius: 8px;
      padding: 32px; width: 440px; max-width: 95vw;
      font-family: 'Courier New', monospace;
    }
    #apx-checkout-form h3 {
      color: #c8f500; font-size: 14px; text-transform: uppercase;
      letter-spacing: 0.1em; margin: 0 0 24px;
    }
    .apx-field { margin-bottom: 16px; }
    .apx-field label { display: block; color: #777; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .apx-field input {
      width: 100%; padding: 10px 12px; background: #111; border: 1px solid #333;
      color: #fff; font-family: 'Courier New', monospace; font-size: 13px;
      border-radius: 4px; box-sizing: border-box;
    }
    .apx-field input:focus { outline: none; border-color: #c8f500; }
    .apx-form-btns { display: flex; gap: 10px; margin-top: 24px; }
    .apx-form-btns button {
      flex: 1; padding: 12px; font-family: 'Courier New', monospace;
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; border-radius: 4px; cursor: pointer;
    }
    #apx-form-cancel { background: none; border: 1px solid #333; color: #777; }
    #apx-form-cancel:hover { border-color: #555; color: #fff; }
    #apx-form-submit { background: #c8f500; border: none; color: #000; }
    #apx-form-submit:hover { background: #d4ff00; }
    #apx-form-submit:disabled { background: #444; color: #777; cursor: not-allowed; }
    #apx-form-error { color: #ff6b6b; font-size: 12px; margin-top: 12px; display: none; }
    #apx-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #c8f500; color: #000; padding: 10px 20px;
      font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700;
      text-transform: uppercase; border-radius: 4px; z-index: 100002;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    #apx-toast.show { opacity: 1; }
  `;
  document.head.appendChild(style);

  // ── BUILD DOM ─────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML("beforeend", `
    <div id="apx-cart-overlay"></div>
    <div id="apx-cart-drawer">
      <div id="apx-cart-header">
        <span>&#9632; Cart (<span id="apx-cart-count">0</span>)</span>
        <button id="apx-cart-close">&times;</button>
      </div>
      <div id="apx-cart-items">
        <div id="apx-cart-empty">Your cart is empty.</div>
      </div>
      <div id="apx-cart-footer">
        <div id="apx-cart-total"><span>Total</span><span id="apx-total-val">$0.00</span></div>
        <button id="apx-checkout-btn">Proceed to Checkout &rarr;</button>
      </div>
    </div>

    <div id="apx-checkout-modal">
      <div id="apx-checkout-form">
        <h3>&#9632; Your Details</h3>
        <div class="apx-field">
          <label>Full Name *</label>
          <input type="text" id="apx-name" placeholder="John Doe" />
        </div>
        <div class="apx-field">
          <label>Email *</label>
          <input type="email" id="apx-email" placeholder="john@example.com" />
        </div>
        <div class="apx-field">
          <label>Phone</label>
          <input type="tel" id="apx-phone" placeholder="+1 (555) 000-0000" />
        </div>
        <div id="apx-form-error"></div>
        <div class="apx-form-btns">
          <button id="apx-form-cancel">Cancel</button>
          <button id="apx-form-submit">Place Order &rarr;</button>
        </div>
      </div>
    </div>

    <div id="apx-toast"></div>
  `);

  // ── HELPERS ───────────────────────────────────────────────────────────────────
  function toast(msg) {
    const el = document.getElementById("apx-toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  function cartCount() {
    return Object.values(cart).reduce((s, i) => s + i.qty, 0);
  }

  function cartTotal() {
    return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
  }

  function openCart() {
    document.getElementById("apx-cart-drawer").classList.add("open");
    document.getElementById("apx-cart-overlay").classList.add("open");
  }

  function closeCart() {
    document.getElementById("apx-cart-drawer").classList.remove("open");
    document.getElementById("apx-cart-overlay").classList.remove("open");
  }

  function renderCart() {
    const itemsEl = document.getElementById("apx-cart-items");
    const countEl = document.getElementById("apx-cart-count");
    const totalEl = document.getElementById("apx-total-val");
    const emptyEl = document.getElementById("apx-cart-empty");

    const count = cartCount();
    countEl.textContent = count;
    totalEl.textContent = "$" + cartTotal().toFixed(2);

    const items = Object.entries(cart);
    if (!items.length) {
      itemsEl.innerHTML = '<div id="apx-cart-empty">Your cart is empty.</div>';
      return;
    }

    itemsEl.innerHTML = items.map(([sku, item]) => `
      <div class="apx-cart-item" data-sku="${sku}">
        <div class="apx-cart-item-info">
          <div class="apx-cart-item-name">${item.name}</div>
          <div class="apx-cart-item-desc">${item.desc}</div>
          <div class="apx-cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="apx-cart-item-controls">
          <button class="apx-qty-btn apx-minus" data-sku="${sku}">-</button>
          <span class="apx-qty-val">${item.qty}</span>
          <button class="apx-qty-btn apx-plus" data-sku="${sku}">+</button>
          <button class="apx-remove-btn" data-sku="${sku}">&times;</button>
        </div>
      </div>
    `).join("");

    // update native cart button badge if one exists
    const nativeCartBtn = document.querySelector("[data-cart], .cart-count, #cart-count");
    if (nativeCartBtn) nativeCartBtn.textContent = count;
  }

  function addToCart(name) {
    const product = CATALOG[name];
    if (!product) { toast("Product not found: " + name); return; }
    const { sku, price, desc } = product;
    if (cart[sku]) {
      cart[sku].qty += 1;
    } else {
      cart[sku] = { name, price, desc, qty: 1 };
    }
    renderCart();
    toast("+ " + name + " added");
    openCart();
  }

  function changeQty(sku, delta) {
    if (!cart[sku]) return;
    cart[sku].qty += delta;
    if (cart[sku].qty <= 0) delete cart[sku];
    renderCart();
  }

  function removeItem(sku) {
    delete cart[sku];
    renderCart();
  }

  // ── EVENTS ────────────────────────────────────────────────────────────────────
  document.getElementById("apx-cart-close").addEventListener("click", closeCart);
  document.getElementById("apx-cart-overlay").addEventListener("click", closeCart);

  document.getElementById("apx-cart-items").addEventListener("click", (e) => {
    const sku = e.target.dataset.sku;
    if (!sku) return;
    if (e.target.classList.contains("apx-plus"))    changeQty(sku, 1);
    if (e.target.classList.contains("apx-minus"))   changeQty(sku, -1);
    if (e.target.classList.contains("apx-remove-btn")) removeItem(sku);
  });

  // Wire native CART button in top nav to open drawer
  document.querySelectorAll("a, button").forEach((el) => {
    if (/cart/i.test(el.textContent) && !el.closest("#apx-cart-drawer")) {
      el.addEventListener("click", (e) => { e.preventDefault(); openCart(); });
    }
  });

  // Checkout button opens form modal
  document.getElementById("apx-checkout-btn").addEventListener("click", () => {
    if (!cartCount()) return;
    closeCart();
    document.getElementById("apx-checkout-modal").classList.add("open");
  });

  document.getElementById("apx-form-cancel").addEventListener("click", () => {
    document.getElementById("apx-checkout-modal").classList.remove("open");
    openCart();
  });

  document.getElementById("apx-form-submit").addEventListener("click", async () => {
    const name  = document.getElementById("apx-name").value.trim();
    const email = document.getElementById("apx-email").value.trim();
    const phone = document.getElementById("apx-phone").value.trim();
    const errEl = document.getElementById("apx-form-error");
    const btn   = document.getElementById("apx-form-submit");

    errEl.style.display = "none";
    if (!name || !email) { errEl.textContent = "Name and email are required."; errEl.style.display = "block"; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = "Please enter a valid email."; errEl.style.display = "block"; return; }

    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
      if (TEST_MODE) {
        // Simulate success — no backend needed
        await new Promise(r => setTimeout(r, 1000));
        const summary = Object.values(cart).map(i => `${i.qty}x ${i.name}`).join(", ");
        cart = {};
        renderCart();
        document.getElementById("apx-checkout-modal").classList.remove("open");
        alert("✅ TEST MODE\n\nOrder received for " + name + " (" + email + ")\n\nItems: " + summary + "\n\nIn production this redirects to the GHL payment page.");
        btn.disabled = false;
        btn.textContent = "Place Order →";
        return;
      }

      const cartItems = Object.entries(cart).map(([sku, item]) => ({
        sku, name: item.name, price: item.price, qty: item.qty, desc: item.desc,
      }));

      const res = await fetch(CHECKOUT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, cart: cartItems }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || "Checkout failed. Please try again.");
      }

      // Clear cart and redirect to GHL invoice payment page
      cart = {};
      renderCart();
      document.getElementById("apx-checkout-modal").classList.remove("open");
      window.location.href = data.paymentUrl;

    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Place Order →";
    }
  });

  // ── WIRE "+ ADD" BUTTONS ──────────────────────────────────────────────────────
  // Runs once on load + re-runs on DOM changes (for lazy-rendered cards)
  function wireAddButtons() {
    document.querySelectorAll("button, a").forEach((btn) => {
      if (btn.dataset.apxWired) return;
      if (!/\+\s*add/i.test(btn.textContent)) return;

      // Walk up the DOM to find the product card, then find the product name
      let card = btn.closest("[class*='card'], [class*='product'], [class*='item'], section, article, div");
      let productName = null;

      if (card) {
        // Look for a heading or strong text inside the card
        const heading = card.querySelector("h1, h2, h3, h4, h5, strong, [class*='name'], [class*='title']");
        if (heading) {
          const text = heading.textContent.trim().toUpperCase();
          // Match against catalog keys
          productName = Object.keys(CATALOG).find((k) => text.includes(k));
        }
      }

      // Fallback: search siblings and parents
      if (!productName) {
        const allText = btn.closest("div")?.textContent ?? "";
        productName = Object.keys(CATALOG).find((k) => allText.toUpperCase().includes(k));
      }

      btn.dataset.apxWired = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (productName) {
          addToCart(productName);
        } else {
          toast("Could not identify product — check console");
          console.warn("[Apex Cart] Could not map button to product:", btn);
        }
      });
    });
  }

  // Initial wire
  wireAddButtons();

  // Re-wire on DOM changes (handles GHL lazy rendering)
  new MutationObserver(wireAddButtons).observe(document.body, {
    childList: true, subtree: true,
  });

})();
