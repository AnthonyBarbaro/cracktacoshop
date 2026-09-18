# Prime Tacos

Prime Tacos restaurant website, built with Next.js, React, TypeScript, and Tailwind CSS. Uses `public/newlogo.png` and a white, red, green, and black theme, with a compact mobile header and fixed quick actions.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The existing business domain, social accounts, map links, and ordering providers are retained in `src/data/site-content.ts` and `src/data/locations.ts`. Update those destinations when replacement URLs are available. Location menus live in `src/data/menu.ts`.

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
