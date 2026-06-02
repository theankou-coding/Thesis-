# JOB CV - Next.js Version

This is a clean Next.js App Router project.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Main changes

- Frontend routing was moved to `src/app` using the Next.js App Router.
- React page components are stored in `src/views` and rendered through `src/app` routes.
- Shared UI, hooks, context, and lib files were moved under `src/`.
- Global CSS was moved to `src/app/globals.css`.
- tRPC is now exposed through `src/app/api/trpc/[trpc]/route.ts`.
- OAuth callback is now exposed through `src/app/api/oauth/callback/route.ts`.
- Storage proxy route is now exposed through `src/app/manus-storage/[...key]/route.ts`.

## Useful scripts

```bash
pnpm dev      # start Next.js development server
pnpm build    # production build
pnpm start    # start production server after build
pnpm check    # TypeScript check
```

## Environment variables

The converted project accepts these variables:

```env
DATABASE_URL=
JWT_SECRET=
OAUTH_SERVER_URL=
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_OAUTH_PORTAL_URL=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
NEXT_PUBLIC_FRONTEND_FORGE_API_KEY=
NEXT_PUBLIC_FRONTEND_FORGE_API_URL=
OWNER_OPEN_ID=
```

Only Next.js-style environment variables are used.
