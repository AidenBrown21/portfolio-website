This is a [Next.js](https://nextjs.org) portfolio that includes a desktop-style UI with Finder windows, app windows, and server-side API integrations.

## Local Development

Run the app UI:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Private Finder AI App Configuration

The Finder includes a private `AI Model` application that:
- is visible in Finder,
- is hidden from the Dock,
- requires a password before use,
- calls Purdue GenAI (`llama4:latest`) through a server-side API proxy.

Copy `.env.example` and set values:

```bash
cp .env.example .env.local
```

Required values:
- `AI_APP_ACCESS_PASSWORD` 
- `PURDUE_GENAI_API_KEY`
- `PURDUE_GENAI_MODEL` (default: `llama4:latest`)
- `PURDUE_GENAI_BASE_URL` (base URL or full `/chat/completions` URL)

### Cloudflare Pages Functions Note

This repo uses `functions/api/*` routes (Cloudflare Pages Functions) for production API handling.
Set production secrets/vars for your Pages project with Wrangler:

```bash
npx wrangler pages secret put YOUTUBE_API_KEY --project-name=portfolio
npx wrangler pages secret put AI_APP_ACCESS_PASSWORD --project-name=portfolio
npx wrangler pages secret put PURDUE_GENAI_API_KEY --project-name=portfolio
npx wrangler pages secret put PURDUE_GENAI_BASE_URL --project-name=portfolio
```

`PURDUE_GENAI_MODEL` is set in `wrangler.toml` as `llama4:latest` by default.

When locally testing those function routes with Wrangler, set the same secrets in `.dev.vars` and run:

```bash
npm run build
npx wrangler pages dev ./out
```

Then test API endpoints through the Wrangler-served URL.

## Desktop Weather Widget

The desktop weather card now fetches live data:
- It first requests browser geolocation in the frontend.
- If location permission is denied/unavailable (or current-location lookup fails), it falls back to West Lafayette coordinates.
- The client calls Open-Meteo directly from the browser for forecast data.

Open-Meteo currently does not require an API key for this usage, so no additional weather secret is needed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
