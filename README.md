# fuzen-web-test - fuzentra.com website (v2)

Single-page site for fuzentra (Pvt) Ltd, built with the Tailwind CSS v4 CLI (no CDN).

## Build
    npm install
    npm run build    # writes styles.css (minified)
    npm run dev      # rebuilds styles.css on every change

Re-run `npm run build` after changing classes in `index.html` or `privacy.html`, and commit the updated `styles.css`.

## Files to upload (site root)
- `index.html`, `privacy.html`, `styles.css`
- `og-image.jpg`, `favicon.ico`, `apple-touch-icon.png`
- `assets/` (logo, favicons, service, step and social icons)

## Settings to fill in
- **Google Analytics:** in `index.html` set `window.GA_ID = 'G-XXXXXXX'` (blank = off).
  Events: `generate_lead` (form sent), `contact_click` (whatsapp / phone / email).
  Add a cookie consent banner before switching it on (promised in the Privacy Statement for EU/UK visitors).
- **Contact form:** FormSubmit to hello@fuzentra.com. The first live submission sends an activation
  email; click it once. Optionally swap the address in `FORM_ENDPOINT` for FormSubmit's random alias.
- **WhatsApp:** number 94766841742 in the floating button link.

## Source
- `src/input.css` - Tailwind entry: brand tokens (`brand` #1A9E8F, `brand-deep`, `ink` #1E2D2B, `mist`, `line`, `night`) and components.
- `assets/fuzentra-logo-large.png`, `assets/fuzentra-logo-white.png` - transparent logos for decks and documents.

## Before go-live
- Insights cards are placeholders (blog page to come).
- Have the Privacy Statement reviewed by a lawyer.
