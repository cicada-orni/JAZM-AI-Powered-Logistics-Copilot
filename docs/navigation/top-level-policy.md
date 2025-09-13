# Top-level Navigation Policy

When leaving the iframe (billing, Admin pages, etc.), use top-level navigation:

- Prefer `shopify://admin/...` with `target="_top"` or the programmatic equivalent:

```html
<a href="shopify://admin/products" target="_top">Products</a>
```
