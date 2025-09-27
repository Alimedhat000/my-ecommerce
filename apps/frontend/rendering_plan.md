# Rendering

## ✅ SSR (good for SEO, sharable URLs, initial load speed)

* `/` (Home / landing page) → Marketing content, featured collections/products → SSR/SSG
* `/collections` → Product collections listing → SSR
* `/collections/[handle]` → Specific collection → SSR
* `/products` → Product listing (grid) → SSR with filters from query params (can hydrate with client-side updates after)
* `/products/[handle]` → Product detail page → SSR (critical for SEO and sharable product pages)

---

## ✅ CSR (good for user-specific, dynamic, cart-like features)

* `/cart` → CSR (cart state is user-specific, not indexed, better handled client-side with context/localStorage)
* Checkout flow (if you add `/checkout`) → CSR (user data, payment info, secure flow)
* Any **dashboard/account** routes (future) → CSR

---

## 🔄 Hybrid (SSR shell + CSR enhancements)

* **Filters, sorting, infinite scroll** on `/products` and `/collections/[handle]`:

  * Base page rendered with SSR for SEO
  * Client-side hydration to update grid without full page reload
* **Cart drawer** in header: CSR (state from context), but product data inside cart items can be pre-fetched on the server if needed.
