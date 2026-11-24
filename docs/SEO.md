# Nayacura SEO setup

## What is already implemented in the project

| Item | File |
|---|---|
| Static title, description, robots, canonical, Open Graph, Twitter cards | `index.html` |
| Organisation + MedicalBusiness + WebSite JSON-LD | `index.html` |
| `noscript` fallback content and internal links | `index.html` |
| Per-route titles, descriptions, canonicals and OG tags (applied at runtime) | `src/lib/seo.js` (wired in `src/App.jsx`) |
| MedicalWebPage + MedicalCondition schema for condition guides | `src/lib/seo.js` |
| BreadcrumbList schema for public pages | `src/lib/seo.js` |
| `noindex` for patient, doctor, admin and auth pages | `src/lib/seo.js` + `public/robots.txt` |
| Crawl rules | `public/robots.txt` |
| Sitemap for public pages and all condition guides | `public/sitemap.xml` |
| PWA manifest (name, theme colour, icons) | `public/site.webmanifest` |
| 1200×630 social share image | `public/og/nayacura-og.png` |

## Before going live

1. Replace `https://naya-syft.onrender.com` in these files with the final production domain (when a custom domain is added):
   - `index.html` (canonical + OG/Twitter URLs + JSON-LD)
   - `public/robots.txt` (sitemap URL)
   - `public/sitemap.xml` (all `<loc>` values)
2. Add the Google Search Console verification meta tag to `index.html` `<head>`.
3. Deploy, then in Google Search Console:
   - Add the property and verify.
   - Submit `https://<domain>/sitemap.xml`.
   - Use URL Inspection → Request indexing for the home page and key service pages.
4. In Bing Webmaster Tools / Microsoft:
   - Add the site, verify (import from Google Search Console is supported).
   - Submit the same sitemap.
5. Keep `robots.txt` blocking private dashboards so clinical data pages are never indexed.

## Important limitation (CSR)

Nayacura is a client-rendered React app. Google renders JavaScript, but Bing and other crawlers render it less reliably, and social previews use the static tags in `index.html`. For the strongest rankings:

- Prerender the public routes at build time (e.g. `vite-plugin-prerender`, `react-snap` or a small SSR/prerender step), so each URL ships its own HTML `<title>`, description and body copy.
- Or serve the marketing pages from a framework/SSR layer while keeping the portal as a SPA.

## Ongoing SEO work (not code)

- Publish clinic-grade, clinician-reviewed content on the condition pages and health feed.
- Earn backlinks from medical directories, health publications and clinician profiles.
- Keep NAP (name, address, phone) consistent and create/optimise a Google Business Profile for the Chennai clinic.
- Track Core Web Vitals in Search Console after each deployment.
- Never publish YMYL health claims without a named reviewer and evidence.
