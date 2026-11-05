# Prime Tacos

Prime Tacos restaurant website, built with Next.js, React, TypeScript, and Tailwind CSS. Uses `public/newlogo.png`, the original cream and dark green theme, an animated homepage logo, mobile bottom navigation, direct Toast menu links, and shared pickup/delivery options. Menu links follow the selected shop and default to Mission Valley. The Instagram profile embed and Google Maps load when optional cookies are enabled. Accessibility options are available from the header, footer, and floating button, with saved display preferences and reduced-motion support.

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
