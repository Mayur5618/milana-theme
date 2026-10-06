/**
 * Milana Interactive Engine (Quick View, Add to Cart, Cart Drawer, Wishlist, Quantity Controls)
 */
(function () {

  function getRootRel(target) {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/blogs/news/')) {
      return '../../' + target;
    }
    if (p.includes('/products/') || p.includes('/collections/') || p.includes('/pages/') || p.includes('/blogs/')) {
      return '../' + target;
    }
    return target;
  }

  // In-memory cart store with localStorage persistence
  let cart = [];
  try {
    const saved = localStorage.getItem('milana_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) {}

  let wishlist = [];
  try {
    const savedWish = localStorage.getItem('milana_wishlist');
    if (savedWish) wishlist = JSON.parse(savedWish);
  } catch (e) {}

  function saveCart() {
    try {
      localStorage.setItem('milana_cart', JSON.stringify(cart));
    } catch (e) {}
    updateHeaderBadges();
    renderCartDrawer();
  }

  function saveWishlist() {
    try {
      localStorage.setItem('milana_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
    updateWishlistBadges();
  }

  function updateHeaderBadges() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.CartCount, .cart-count span, .site-header__cart-count span').forEach(el => {
      el.textContent = totalCount;
      el.classList.add('cart-bump');
      setTimeout(() => el.classList.remove('cart-bump'), 300);
    });
  }

  function updateWishlistBadges() {
    const count = wishlist.length;
    document.querySelectorAll('.header--wishlist .count, .header-wishlist-icon .count').forEach(el => {
      el.textContent = count;
    });
  }

  function showToast(msg) {
    let toast = document.querySelector('.milana-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'milana-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="zmdi zmdi-check-circle" style="color:#52c41a;font-size:18px;"></i> ${msg}`;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
  }

  // Build QuickView DOM
  function createQuickViewModal() {
    if (document.querySelector('.milana-qv-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'milana-qv-overlay';
    overlay.innerHTML = `
      <div class="milana-qv-modal">
        <button type="button" class="milana-qv-close" aria-label="Close">&times;</button>
        <div class="milana-qv-grid">
          <div class="milana-qv-image-wrap">
            <img src="" alt="" class="milana-qv-img">
          </div>
          <div class="milana-qv-details">
            <div class="milana-qv-stock"><i class="zmdi zmdi-check"></i> In Stock (Ships in 24h)</div>
            <h3 class="milana-qv-title">Product Title</h3>
            <div class="milana-qv-rating">
              <i class="zmdi zmdi-star"></i>
              <i class="zmdi zmdi-star"></i>
              <i class="zmdi zmdi-star"></i>
              <i class="zmdi zmdi-star"></i>
              <i class="zmdi zmdi-star-half"></i>
              <span style="color:#666;font-size:12px;margin-left:5px;">(18 reviews)</span>
            </div>
            <div class="milana-qv-price">
              <span class="price-current">$38.00</span>
              <span class="compare-price">$48.00</span>
              <span class="badge-sale">-20%</span>
            </div>
            
            <div class="milana-qv-swatches">
              <span class="milana-qv-label">Color: <strong class="selected-color">Burgundy</strong></span>
              <span class="swatch-opt active" style="background:#5a0f1a;" data-color="Burgundy"></span>
              <span class="swatch-opt" style="background:#1d1b1a;" data-color="Black"></span>
              <span class="swatch-opt" style="background:#c9a26b;" data-color="Gold"></span>
              <span class="swatch-opt" style="background:#d8b6a7;" data-color="Rose Beige"></span>
            </div>

            <div class="milana-qv-sizes">
              <span class="milana-qv-label">Size: <strong class="selected-size">S</strong></span>
              <span class="size-opt" data-size="XS">XS</span>
              <span class="size-opt active" data-size="S">S</span>
              <span class="size-opt" data-size="M">M</span>
              <span class="size-opt" data-size="L">L</span>
              <span class="size-opt" data-size="XL">XL</span>
            </div>

            <div class="milana-qv-actions">
              <div class="milana-qty-box">
                <button type="button" class="milana-qty-btn qv-minus">&minus;</button>
                <input type="text" class="milana-qty-input qv-qty" value="1" readonly>
                <button type="button" class="milana-qty-btn qv-plus">&plus;</button>
              </div>
              <button type="button" class="milana-btn-add-cart qv-add-to-cart">Add to Bag</button>
              <button type="button" class="milana-btn-add-cart qv-buy-now" style="background:#5a0f1a; border-color:#5a0f1a;">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Event listeners
    overlay.querySelector('.milana-qv-close').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });

    overlay.querySelectorAll('.swatch-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        overlay.querySelectorAll('.swatch-opt').forEach(s => s.classList.remove('active'));
        opt.classList.add('active');
        overlay.querySelector('.selected-color').textContent = opt.dataset.color;
      });
    });

    overlay.querySelectorAll('.size-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        overlay.querySelectorAll('.size-opt').forEach(s => s.classList.remove('active'));
        opt.classList.add('active');
        overlay.querySelector('.selected-size').textContent = opt.dataset.size;
      });
    });

    const qtyInput = overlay.querySelector('.qv-qty');
    overlay.querySelector('.qv-minus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    overlay.querySelector('.qv-plus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });

    overlay.querySelector('.qv-add-to-cart').addEventListener('click', () => {
      const title = overlay.querySelector('.milana-qv-title').textContent;
      const priceText = overlay.querySelector('.price-current').textContent;
      const imgSrc = overlay.querySelector('.milana-qv-img').src;
      const color = overlay.querySelector('.selected-color').textContent;
      const size = overlay.querySelector('.selected-size').textContent;
      const qty = parseInt(qtyInput.value) || 1;

      addToCart({ title, price: priceText, img: imgSrc, variant: `${color} / ${size}`, qty });
      overlay.classList.remove('active');
      openCartDrawer();
      showToast(`Added "${title}" to your cart!`);
    });

    overlay.querySelector('.qv-buy-now').addEventListener('click', () => {
      const title = overlay.querySelector('.milana-qv-title').textContent;
      const priceText = overlay.querySelector('.price-current').textContent;
      const imgSrc = overlay.querySelector('.milana-qv-img').src;
      const color = overlay.querySelector('.selected-color').textContent;
      const size = overlay.querySelector('.selected-size').textContent;
      const qty = parseInt(qtyInput.value) || 1;

      addToCart({ title, price: priceText, img: imgSrc, variant: `${color} / ${size}`, qty });
      overlay.classList.remove('active');
      window.location.href = getRootRel('checkout.html');
    });
  }

  // Build Cart Drawer DOM
  function createCartDrawer() {
    if (document.querySelector('.milana-cart-drawer')) return;
    const overlay = document.createElement('div');
    overlay.className = 'milana-cart-drawer-overlay';
    
    const drawer = document.createElement('div');
    drawer.className = 'milana-cart-drawer';
    drawer.innerHTML = `
      <div class="milana-cart-drawer-header">
        <h4><i class="zmdi zmdi-shopping-basket"></i> Your Shopping Bag</h4>
        <button type="button" class="milana-cart-drawer-close">&times;</button>
      </div>
      <div class="milana-cart-free-shipping">
        <span>🎉 You unlocked <strong>Free Standard Shipping</strong>!</span>
        <div class="bar"><div class="bar-fill"></div></div>
      </div>
      <div class="milana-cart-drawer-items"></div>
      <div class="milana-cart-drawer-footer">
        <div class="milana-cart-subtotal">
          <span>Subtotal</span>
          <span class="milana-drawer-total">$0.00</span>
        </div>
        <div class="milana-cart-actions">
          <a href="${getRootRel('cart.html')}" class="milana-btn-cart-view">View & Edit Bag</a>
          <a href="${getRootRel('checkout.html')}" class="milana-btn-checkout">Proceed to Checkout</a>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    overlay.addEventListener('click', closeCartDrawer);
    drawer.querySelector('.milana-cart-drawer-close').addEventListener('click', closeCartDrawer);
  }

  function openCartDrawer() {
    createCartDrawer();
    renderCartDrawer();
    document.querySelector('.milana-cart-drawer-overlay').classList.add('active');
    document.querySelector('.milana-cart-drawer').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const overlay = document.querySelector('.milana-cart-drawer-overlay');
    const drawer = document.querySelector('.milana-cart-drawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCartDrawer() {
    const container = document.querySelector('.milana-cart-drawer-items');
    const totalEl = document.querySelector('.milana-drawer-total');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 10px;color:#888;">
          <i class="zmdi zmdi-shopping-cart" style="font-size:48px;color:#ccc;display:block;margin-bottom:15px;"></i>
          <p style="font-size:16px;font-weight:600;color:#333;">Your bag is empty</p>
          <p style="font-size:13px;">Looks like you haven't added any items yet.</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
      const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 35.00;
      const itemTotal = priceNum * item.qty;
      subtotal += itemTotal;

      return `
        <div class="milana-cart-item" data-idx="${idx}">
          <img src="${item.img}" alt="${item.title}">
          <div class="milana-cart-item-info">
            <div class="milana-cart-item-title">${item.title}</div>
            <div style="font-size:12px;color:#777;margin-bottom:4px;">${item.variant || 'Default'}</div>
            <div class="milana-cart-item-price">${item.price} &times; ${item.qty}</div>
            <button type="button" class="milana-cart-item-remove" data-idx="${idx}">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;

    container.querySelectorAll('.milana-cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        cart.splice(idx, 1);
        saveCart();
      });
    });
  }

  function addToCart(item) {
    const existing = cart.find(i => i.title === item.title && i.variant === item.variant);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart();
  }

  // Extract product details from a card
  function getProductDetailsFromCard(card) {
    const titleEl = card.querySelector('.product-title, .product__title, h3, h4, .title, .item-product__title');
    const title = titleEl ? titleEl.textContent.trim() : 'Premium Fashion Item';

    const imgEl = card.querySelector('img');
    const img = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : 'assets/bk141.jpg';

    const priceEl = card.querySelector('.price-regular, .price, .money, .special-price');
    const price = priceEl ? priceEl.textContent.trim() : '$38.00';

    const compareEl = card.querySelector('.price-compare, .old-price, s');
    const comparePrice = compareEl ? compareEl.textContent.trim() : '';

    return { title, img, price, comparePrice };
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    createQuickViewModal();
    createCartDrawer();
    updateHeaderBadges();
    updateWishlistBadges();

    // 1. Quick View Click Handler
    document.addEventListener('click', (e) => {
      const qvBtn = e.target.closest('.btnProductQuickview, .btn-quickview, .quick-view, [data-view-quickview], .btn-action-quickview');
      if (qvBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = qvBtn.closest('.item-product, .product-item, .product-card, .col, .product-grid-item') || document.body;
        const details = getProductDetailsFromCard(card);

        const overlay = document.querySelector('.milana-qv-overlay');
        if (overlay) {
          overlay.querySelector('.milana-qv-img').src = details.img;
          overlay.querySelector('.milana-qv-title').textContent = details.title;
          overlay.querySelector('.price-current').textContent = details.price;
          if (details.comparePrice) {
            overlay.querySelector('.compare-price').textContent = details.comparePrice;
            overlay.querySelector('.compare-price').style.display = 'inline';
            overlay.querySelector('.badge-sale').style.display = 'inline';
          } else {
            overlay.querySelector('.compare-price').style.display = 'none';
            overlay.querySelector('.badge-sale').style.display = 'none';
          }
          overlay.querySelector('.qv-qty').value = '1';
          overlay.classList.add('active');
        }
      }
    });

    // 2. Add to Cart Button Click Handler
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.btnAddToCart, .btn-add-to-cart, .btn-add-cart, form[action*="cart/add"] button[type="submit"]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();

        const card = addBtn.closest('.item-product, .product-item, .product-card, .product-single, .product-form') || document.body;
        const details = getProductDetailsFromCard(card);

        addToCart({
          title: details.title,
          price: details.price,
          img: details.img,
          variant: 'Default',
          qty: 1
        });

        openCartDrawer();
        showToast(`Added "${details.title}" to bag!`);
      }
    });

    // 3. Wishlist Click Handler
    document.addEventListener('click', (e) => {
      const wishBtn = e.target.closest('.btnProductWishlist, .item-product__wishlist, [data-icon-wishlist], .btn-wishlist');
      if (wishBtn) {
        e.preventDefault();
        e.stopPropagation();

        const card = wishBtn.closest('.item-product, .product-item, .product-card') || document.body;
        const details = getProductDetailsFromCard(card);

        const idx = wishlist.indexOf(details.title);
        if (idx > -1) {
          wishlist.splice(idx, 1);
          wishBtn.classList.remove('active');
          showToast(`Removed from wishlist`);
        } else {
          wishlist.push(details.title);
          wishBtn.classList.add('active');
          showToast(`Added "${details.title}" to wishlist!`);
        }
        saveWishlist();
      }
    });

    // 4. Cart Icon in Header Click Handler
    document.addEventListener('click', (e) => {
      const cartTrigger = e.target.closest('#cart_block, .site-header__cart, .header-cart a, .mobile_cart .site-header__cart');
      if (cartTrigger) {
        // If not on cart.html, open cart drawer
        if (!window.location.pathname.endsWith('cart.html')) {
          e.preventDefault();
          openCartDrawer();
        }
      }
    });
  });
})();
