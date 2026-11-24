# Deployment checklist

StickScope is a static export (`out/`). Nothing here has been done yet; these are the owner's steps.

1. **GitHub**: create the public repository `stickscope` (licence MIT, see `LICENSE`). Push `main`. `prototype/`, `prototypes/` and `docs/drafts/` are gitignored and stay local.
2. **Vercel**: create a new project from that repository.
   - Framework preset: **Other**
   - Build command: `npm test && npm run build` (also set in `vercel.json`)
   - Output directory: `out`
   - Install command: default (`npm install`). Node 24 (as in CI).
   - No environment variables are needed.
3. **Headers**: `vercel.json` carries the Content-Security-Policy and the other security headers. They are `'self'` only: no external host is used. If a host is ever added, add it to the CSP and describe it on a privacy page. Check `https://<domain>/` with a header checker after the first deploy.
4. **Language URLs**: `/` is English and `/de` is German; the rewrite in `vercel.json` maps `/de` to `de.html`. Open both after the first deploy.
5. **Domain**: add the domain in the Vercel project settings and set its DNS.
6. **Imprint and privacy:** `/legal` (English) and `/de/legal` (German, binding) with the operator details from `src/legal/contact.ts`; the footer links to it. Check the privacy text whenever a service is added.
7. **Link previews and search:** `src/seo/` holds the site address, page texts (`site.ts`), the metadata of every page (`meta.ts`) and the preview image (`og.tsx`, served as `/og-en.png` and `/og-de.png`, 1200×630 with the content in the centre square so square crops still work). The sitemap, robots file, manifest and app icons are generated from it. The FAQ texts are in `faq.items` of `en.json` / `de.json`; a new question needs its id in `FAQ_IDS` in `src/seo/site.ts`. Check the previews with the Facebook Sharing Debugger after a deploy; the platforms cache images.
8. Every push to `main` builds automatically. Review before pushing.
