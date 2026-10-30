# fuzen-web-test - fuzentra.com website (v2)

Website for fuzentra (Pvt) Ltd, built with the Tailwind CSS v4 CLI (no CDN) and a small Markdown blog builder.

**Test site:** https://fuzentra.github.io/fuzen-web-test/ (GitHub Pages, served from the root of `main`; updates a minute or two after each push).

## Pages
- `index.html` - home page (hero, What We Do, self-check, How We Engage, Who We Are, founders, Insights, Start a Conversation)
- `privacy.html` - Privacy Statement (also shown as a pop-up on the home page)
- `insights/` - blog: the Insights list page and one page per article (generated - do not edit by hand)

## Adding a blog article (works from the iPad)
1. In GitHub, open the `posts` folder and copy `_template.md` (Add file → Create new file).
2. Name the new file after the article, e.g. `posts/when-the-sky-becomes-the-network.md`.
   The name becomes the address: `/insights/when-the-sky-becomes-the-network/`.
3. Fill in the details between the `---` lines (`title`, `date` as YYYY-MM-DD, `author`, `summary`, optional `linkedin`)
   and write the article underneath in Markdown. Remove `draft: true` to publish.
4. Commit to `main`. The **Build site** GitHub Action builds the article page, updates the Insights list,
   the three latest-article cards on the home page and `sitemap.xml`, and commits them. The site updates a minute or two later.

Files starting with `_` and posts marked `draft: true` are never published.

## Build (on a computer)
    npm install
    npm run build    # builds the blog, then styles.css (minified)
    npm run dev      # rebuilds styles.css on every change

Re-run `npm run build` after changing classes in any page or the blog builder, and commit the generated files.

## Files to upload to fuzentra.com (site root)
- `index.html`, `privacy.html`, `styles.css`
- `insights/` (whole folder)
- `og-image.jpg`, `favicon.ico`, `apple-touch-icon.png`, `sitemap.xml`, `robots.txt`
- `assets/` (logo, favicons, service, step and social icons)

All links are relative, so the same files work on GitHub Pages and on fuzentra.com.

## Testing notes
- The contact form sends from the live site (GitHub Pages or fuzentra.com). If sending fails, visitors see an inline message with the email address and a WhatsApp link.
- Search and social previews (canonical links, `og:image`, `sitemap.xml`) point to fuzentra.com, so they only work fully once the site is live there.

## Settings to fill in
- **Google Analytics:** in `index.html` set `window.GA_ID = 'G-XXXXXXX'` (blank = off).
  Events: `generate_lead` (form sent), `contact_click` (whatsapp / phone / email).
  Add a cookie consent banner before switching it on (promised in the Privacy Statement for EU/UK visitors).
- **Contact form:** Web3Forms (https://web3forms.com, account fuzentra.lk@gmail.com, form "fuzentra-web-contact").
  The access key is in `index.html` (`access_key`); it is public by design. Enquiries are delivered to hello@fuzentra.com (set on that form in Web3Forms).
  If Web3Forms domain restriction is turned on, allow both `fuzentra.com` and `fuzentra.github.io`.
- **WhatsApp:** number 94766841742 in the floating button link.

## Source
- `src/input.css` - Tailwind entry: brand tokens (`brand` #1A9E8F, `brand-deep`, `ink` #1E2D2B, `mist`, `line`, `night`), components and article styles.
- `scripts/build-blog.mjs` - turns `posts/*.md` into the Insights pages and home-page cards.
- `.github/workflows/build.yml` - runs the build on GitHub when posts or sources change.
- `assets/fuzentra-logo-large.png`, `assets/fuzentra-logo-white.png` - transparent logos for decks and documents.

## Before go-live
- Review the three launch articles (converted from LinkedIn with UK spelling and hyphens to match the site).
- Have the Privacy Statement reviewed by a lawyer.
