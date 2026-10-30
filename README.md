# fuzen-web-test - fuzentra.com website (v2)

Single-page site for fuzentra (Pvt) Ltd, built with the Tailwind CSS v4 CLI (no CDN).

**Test site:** https://fuzentra.github.io/fuzen-web-test/ (GitHub Pages, served from the root of `main`; updates a minute or two after each push).

## Pages
- `index.html` - home page (hero, What We Do, self-check, How We Engage, Who We Are, founders, Insights, Start a Conversation)
- `privacy.html` - Privacy Statement (also shown as a pop-up on the home page)

## Build
    npm install
    npm run build    # writes styles.css (minified)
    npm run dev      # rebuilds styles.css on every change

Re-run `npm run build` after changing classes in `index.html` or `privacy.html`, and commit the updated `styles.css`.

## Files to upload to fuzentra.com (site root)
- `index.html`, `privacy.html`, `styles.css`
- `og-image.jpg`, `favicon.ico`, `apple-touch-icon.png`
- `assets/` (logo, favicons, service, step and social icons)

All links to these files are relative, so the same files work on GitHub Pages and on fuzentra.com.

## Testing notes
- The contact form sends from the live site (GitHub Pages or fuzentra.com). If sending fails, visitors see an inline message with the email address and a WhatsApp link.
- Search and social previews (canonical link, `og:image`) point to fuzentra.com, so link previews only show correctly once the site is live there.

## Settings to fill in
- **Google Analytics:** in `index.html` set `window.GA_ID = 'G-XXXXXXX'` (blank = off).
  Events: `generate_lead` (form sent), `contact_click` (whatsapp / phone / email).
  Add a cookie consent banner before switching it on (promised in the Privacy Statement for EU/UK visitors).
- **Contact form:** Web3Forms (https://web3forms.com, account fuzentra.lk@gmail.com, form "fuzentra-web-contact").
  The access key is in `index.html` (`access_key`); it is public by design. Enquiries go to the email set on that form in Web3Forms.
  If Web3Forms domain restriction is turned on, allow both `fuzentra.com` and `fuzentra.github.io`.
- **WhatsApp:** number 94766841742 in the floating button link.

## Source
- `src/input.css` - Tailwind entry: brand tokens (`brand` #1A9E8F, `brand-deep`, `ink` #1E2D2B, `mist`, `line`, `night`) and components.
- `assets/fuzentra-logo-large.png`, `assets/fuzentra-logo-white.png` - transparent logos for decks and documents.

## Before go-live
- Insights cards are placeholders (blog page to come).
- Have the Privacy Statement reviewed by a lawyer.
