# Prime Tacos

Prime Tacos restaurant website, built with Next.js, React, TypeScript, and Tailwind CSS. Uses `public/newlogo.png`, the original cream and dark green theme, an animated logo that moves from the hero into the header on scroll, mobile pickup/delivery navigation, direct Toast menu links, and shared pickup/delivery options. The homepage opens with a food slideshow, a short headline, and one ordering action; all nine food photos move in a seamless looping belt with pause, swipe, arrow, and keyboard controls. Belt autoplay uses a native transform animation; manual interaction returns to native scrolling without changing the visible position. The hero uses four real food photos with crossfades, swipe/keyboard navigation, and photo selectors. Rotation pauses for interaction, offscreen/hidden pages, and reduced-motion preferences. The header has three navigation links, one ordering button, and a compact store picker; its navigation drawer appears on smaller screens. The homepage shops form a two-by-two grid; selecting a card highlights the shop and updates the shared location. Pickup and delivery have separate icon buttons. Menu links follow the selected shop and default to Mission Valley. The Instagram profile embed and Google Maps load when optional cookies are enabled. Accessibility options are available from the header and footer, the leftmost mobile bottom-bar button, and a floating button on larger screens, with saved display preferences and reduced-motion support.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The business domain, social accounts, map links, and ordering providers are configured in `src/data/site-content.ts` and `src/data/locations.ts`. Update those destinations when replacement URLs are available. Legacy `/menu` and location menu URLs redirect to Toast; historical menu data remains in `src/data/menu.ts`.

The locations page uses a wide map beside a scrolling shop list on desktop. Phones show the map first, with a locations disclosure and a selected-shop card for hours, ordering, directions, and calls. Selecting a shop synchronizes the map and header picker. Google Maps retains its optional-cookie gate.

After the store grid and food belt, the homepage features catering with a real takeout-spread photo and a link to `/catering`. The location selector and pickup/delivery controls remain on `/order-online`.

The original Instagram profile card is followed by an eight-reel preview carousel from the Prime account, showing three cards at a time on desktop with previous/next arrows and native swipe scrolling on phones. Their official public links, local posters, and same-origin MP4 files are configured in `src/data/instagram-reels.ts`. The tap-to-play dialog follows the viewer pattern in the local `jbarbaro` project, with swipe, mouse drag, previous/next controls, and keyboard navigation through all eight videos. Only the opened clip loads; playback requests sound by default and preserves the viewer’s mute choice across clips, with native video controls and a sound toggle. Browsers that block sound can fall back to muted playback. The original Instagram profile retains its optional-cookie gate. An external Instagram link is always available for each reel. The desktop hero supports mouse/pen dragging, with bounded food photography and a larger logo above the headline on wide screens. It serves the existing native-size WebPs directly to avoid a second compression pass and uses crossfades without zoom. The hero has photo selectors without a play/pause button; focusing or selecting a photo stops automatic rotation.

Food photos are configured in `src/data/food-photos.ts`. Optimized WebP assets live in `public/images/food/`; original uploads in `public/new-/` stay local and are gitignored. Run `node scripts/optimize-food-photos.mjs` to rebuild the direct photo conversions when the originals are present. The quesadilla image was separately retouched to remove its story text and phone controls. The taco-and-salsas image was separately retouched to replace its purple tabletop with light sage green, using the built-in image tool and the prompt in `scripts/prompts/taco-three-salsas-background.txt`; both retouched images are excluded from direct regeneration. The site uses the `taco-three-salsas-sage.webp` copy to refresh optimized-image caches; the original `taco-three-salsas.webp` path retains the same edit. Screenshot frames are cropped in CSS to keep phone controls out of view. The unused generated hero asset is preserved as `hero-tacos-elegant.webp`, with its prompt in `scripts/prompts/hero-tacos-elegant.txt`.

## Careers Form Email Setup

The site includes a `/careers` application form that submits to `/api/careers` and sends email.

1. Copy `.env.example` to `.env.local`.
2. Set SMTP values for your provider (Brevo example uses `SMTP_HOST=smtp-relay.brevo.com`):
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Set careers email routing:
   - `CAREERS_TO` (recipient inbox, easy to switch later)
4. Optional sender override:
   - `CAREERS_FROM` or `SMTP_FROM` (must be validated by your SMTP provider)

Default recipient fallback is `anthony@barbaro.tech`, and changing recipients later only requires updating `CAREERS_TO`.
